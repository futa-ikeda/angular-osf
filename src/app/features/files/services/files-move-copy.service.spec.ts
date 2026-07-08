import { MockProvider } from 'ng-mocks';

import { firstValueFrom, of, throwError } from 'rxjs';

import { TestBed } from '@angular/core/testing';

import { CustomConfirmationService } from '@osf/shared/services/custom-confirmation.service';
import { FilesService } from '@osf/shared/services/files.service';
import { ToastService } from '@osf/shared/services/toast.service';

import { FileModelMock } from '@testing/mocks/file.model.mock';
import {
  CustomConfirmationServiceMock,
  CustomConfirmationServiceMockType,
} from '@testing/providers/custom-confirmation-provider.mock';
import { FilesServiceMock, FilesServiceMockType } from '@testing/providers/files-service.mock';
import { ToastServiceMock, ToastServiceMockType } from '@testing/providers/toast-provider.mock';

import { MoveCopyAction } from '../enums/move-copy-action.enum';
import { MoveCopyOptions } from '../models/move-copy-options.model';

import { FilesMoveCopyService } from './files-move-copy.service';

describe('FilesMoveCopyService', () => {
  let service: FilesMoveCopyService;
  let filesService: FilesServiceMockType;
  let toastService: ToastServiceMockType;
  let confirmationService: CustomConfirmationServiceMockType;

  const fileA = FileModelMock.simple({
    id: 'a',
    name: 'a.txt',
    path: '/a.txt',
    links: { ...FileModelMock.simple().links, move: '/move-a' },
  });
  const fileB = FileModelMock.simple({
    id: 'b',
    name: 'b.txt',
    path: '/b.txt',
    links: { ...FileModelMock.simple().links, move: '/move-b' },
  });

  function buildOptions(files = [fileA], action = MoveCopyAction.Move): MoveCopyOptions {
    return {
      files,
      destination: FileModelMock.simple({ path: '/dest' }),
      resourceId: 'node-1',
      storageProvider: 'osfstorage',
      action,
    };
  }

  function setup() {
    filesService = FilesServiceMock.simple();
    toastService = ToastServiceMock.simple();
    confirmationService = CustomConfirmationServiceMock.simple();

    TestBed.configureTestingModule({
      providers: [
        FilesMoveCopyService,
        MockProvider(FilesService, filesService),
        MockProvider(ToastService, toastService),
        MockProvider(CustomConfirmationService, confirmationService),
      ],
    });

    service = TestBed.inject(FilesMoveCopyService);
  }

  it('should create', () => {
    setup();
    expect(service).toBeTruthy();
  });

  it('should error when destination path is missing', async () => {
    setup();

    await expect(
      firstValueFrom(service.execute({ ...buildOptions(), destination: FileModelMock.simple({ path: '' }) }))
    ).rejects.toThrow('files.dialogs.moveFile.pathError');
  });

  it('should return false when files list is empty', async () => {
    setup();

    const result = await firstValueFrom(service.execute(buildOptions([])));

    expect(result).toBe(false);
    expect(filesService.moveFile).not.toHaveBeenCalled();
  });

  it('should show success when all initial moves succeed', async () => {
    setup();

    const result = await firstValueFrom(service.execute(buildOptions([fileA, fileB])));

    expect(result).toBe(true);
    expect(filesService.moveFile).toHaveBeenCalledTimes(2);
    expect(toastService.showSuccess).toHaveBeenCalledWith('files.dialogs.moveFile.success');
  });

  it('should handle conflicts and replace on confirm', async () => {
    setup();
    filesService.moveFile
      .mockReturnValueOnce(throwError(() => ({ status: 409 })))
      .mockReturnValueOnce(of({}))
      .mockReturnValueOnce(of({}));

    const execution = firstValueFrom(service.execute(buildOptions([fileA, fileB])));

    const options = confirmationService.confirmDelete.mock.calls[0][0];
    expect(options.headerKey).toBe('files.dialogs.replaceFile.single');
    expect(options.onConfirm).toBeDefined();
    options.onConfirm();

    const result = await execution;

    expect(result).toBe(true);
    expect(filesService.moveFile).toHaveBeenLastCalledWith(
      '/move-a',
      '/dest',
      'node-1',
      'osfstorage',
      MoveCopyAction.Move,
      true
    );
    expect(toastService.showSuccess).toHaveBeenCalledWith('files.dialogs.moveFile.success');
  });

  it('should return false and show partial error when conflict replace is rejected', async () => {
    setup();
    filesService.moveFile.mockReturnValueOnce(throwError(() => ({ status: 409 }))).mockReturnValueOnce(of({}));

    const execution = firstValueFrom(service.execute(buildOptions([fileA, fileB])));

    const options = confirmationService.confirmDelete.mock.calls[0][0];
    expect(options.onReject).toBeDefined();
    options.onReject?.();

    const result = await execution;

    expect(result).toBe(false);
    expect(toastService.showError).toHaveBeenCalledWith('files.dialogs.moveFile.error');
  });

  it('should show explicit backend error for non conflict failures', async () => {
    setup();
    filesService.moveFile.mockReturnValueOnce(throwError(() => ({ status: 500, error: { message: 'server fail' } })));

    const result = await firstValueFrom(service.execute(buildOptions([fileA])));

    expect(result).toBe(true);
    expect(toastService.showError).toHaveBeenCalledWith('server fail');
    expect(toastService.showSuccess).toHaveBeenCalledWith('files.dialogs.moveFile.success');
  });

  it('should use copy toast keys for copy action', async () => {
    setup();

    const result = await firstValueFrom(service.execute(buildOptions([fileA], MoveCopyAction.Copy)));

    expect(result).toBe(true);
    expect(toastService.showSuccess).toHaveBeenCalledWith('files.dialogs.copyFile.success');
  });
});
