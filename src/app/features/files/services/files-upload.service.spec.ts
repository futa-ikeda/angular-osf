import { MockProvider } from 'ng-mocks';

import { concat, of, throwError } from 'rxjs';

import { HttpEventType, HttpResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { CustomConfirmationService } from '@osf/shared/services/custom-confirmation.service';
import { FilesService } from '@osf/shared/services/files.service';

import {
  CustomConfirmationServiceMock,
  CustomConfirmationServiceMockType,
} from '@testing/providers/custom-confirmation-provider.mock';
import { FilesServiceMock, FilesServiceMockType } from '@testing/providers/files-service.mock';

import { FilesUploadService } from './files-upload.service';

describe('FilesUploadService', () => {
  let service: FilesUploadService;
  let filesService: FilesServiceMockType;
  let confirmationService: CustomConfirmationServiceMockType;

  function setup() {
    filesService = FilesServiceMock.simple();
    confirmationService = CustomConfirmationServiceMock.simple();

    TestBed.configureTestingModule({
      providers: [
        FilesUploadService,
        MockProvider(FilesService, filesService),
        MockProvider(CustomConfirmationService, confirmationService),
      ],
    });

    service = TestBed.inject(FilesUploadService);
  }

  it('should create', () => {
    setup();
    expect(service).toBeTruthy();
  });

  it('should return early when no files provided', () => {
    setup();
    const onStart = vi.fn();
    const onProgress = vi.fn();
    const onComplete = vi.fn();

    service.uploadFiles({
      files: [],
      uploadLink: '/upload',
      allowRevisions: false,
      onStart,
      onProgress,
      onComplete,
    });

    expect(onStart).not.toHaveBeenCalled();
    expect(filesService.uploadFile).not.toHaveBeenCalled();
  });

  it('should track single file progress and complete', () => {
    setup();
    const onStart = vi.fn();
    const onProgress = vi.fn();
    const onComplete = vi.fn();
    const file = new File(['test'], 'file-a.txt');
    filesService.uploadFile.mockReturnValue(
      concat(
        of({ type: HttpEventType.UploadProgress, loaded: 50, total: 100 }),
        of(new HttpResponse({ status: 200 }))
      ) as never
    );

    service.uploadFiles({
      files: [file],
      uploadLink: '/upload',
      allowRevisions: false,
      onStart,
      onProgress,
      onComplete,
    });

    expect(onStart).toHaveBeenCalledWith('file-a.txt');
    expect(onProgress).toHaveBeenNthCalledWith(1, 0);
    expect(onProgress).toHaveBeenNthCalledWith(2, 50);
    expect(onComplete).toHaveBeenCalled();
  });

  it('should report aggregate progress for multiple files', () => {
    setup();
    const onProgress = vi.fn();
    const onComplete = vi.fn();
    const fileA = new File(['a'], 'a.txt');
    const fileB = new File(['b'], 'b.txt');
    filesService.uploadFile.mockReturnValue(of(new HttpResponse({ status: 200 })));

    service.uploadFiles({
      files: [fileA, fileB],
      uploadLink: '/upload',
      allowRevisions: false,
      onStart: vi.fn(),
      onProgress,
      onComplete,
    });

    expect(filesService.uploadFile).toHaveBeenCalledTimes(2);
    expect(onProgress).toHaveBeenNthCalledWith(1, 0);
    expect(onProgress).toHaveBeenNthCalledWith(2, 50);
    expect(onProgress).toHaveBeenNthCalledWith(3, 100);
    expect(onComplete).toHaveBeenCalled();
  });

  it('should retry with revision upload link when conflict and revisions are allowed', () => {
    setup();
    const file = new File(['x'], 'conflict.txt');
    filesService.uploadFile
      .mockReturnValueOnce(
        throwError(() => ({ status: 409, error: { data: { links: { upload: '/revision-upload' } } } }))
      )
      .mockReturnValueOnce(of(new HttpResponse({ status: 200 })));

    service.uploadFiles({
      files: [file],
      uploadLink: '/upload',
      allowRevisions: true,
      onStart: vi.fn(),
      onProgress: vi.fn(),
      onComplete: vi.fn(),
    });

    expect(filesService.uploadFile).toHaveBeenNthCalledWith(1, file, '/upload');
    expect(filesService.uploadFile).toHaveBeenNthCalledWith(2, file, '/revision-upload', true);
  });

  it('should open replace dialog for conflicts and replace on confirm', () => {
    setup();
    const onComplete = vi.fn();
    const file = new File(['x'], 'conflict.txt');
    filesService.uploadFile
      .mockReturnValueOnce(
        throwError(() => ({ status: 409, error: { data: { links: { upload: '/replace-upload' } } } }))
      )
      .mockReturnValueOnce(of(new HttpResponse({ status: 200 })));

    service.uploadFiles({
      files: [file],
      uploadLink: '/upload',
      allowRevisions: false,
      onStart: vi.fn(),
      onProgress: vi.fn(),
      onComplete,
    });

    expect(confirmationService.confirmDelete).toHaveBeenCalled();
    const dialogOptions = confirmationService.confirmDelete.mock.calls[0][0];
    expect(dialogOptions.onConfirm).toBeDefined();
    dialogOptions.onConfirm?.();

    expect(filesService.uploadFile).toHaveBeenLastCalledWith(file, '/replace-upload', true);
    expect(onComplete).toHaveBeenCalled();
  });
});
