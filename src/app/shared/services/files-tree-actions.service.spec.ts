import { MockProvider } from 'ng-mocks';

import { TestBed } from '@angular/core/testing';

import { FileKind } from '@osf/shared/enums/file-kind.enum';
import { CustomConfirmationService } from '@osf/shared/services/custom-confirmation.service';

import {
  CustomConfirmationServiceMock,
  CustomConfirmationServiceMockType,
} from '@testing/providers/custom-confirmation-provider.mock';

import { FilesTreeActionsService } from './files-tree-actions.service';

describe('FilesTreeActionsService', () => {
  let service: FilesTreeActionsService;
  let confirmationService: CustomConfirmationServiceMockType;

  function setup() {
    confirmationService = CustomConfirmationServiceMock.simple();

    TestBed.configureTestingModule({
      providers: [FilesTreeActionsService, MockProvider(CustomConfirmationService, confirmationService)],
    });

    service = TestBed.inject(FilesTreeActionsService);
  }

  it('should create', () => {
    setup();
    expect(service).toBeTruthy();
  });

  it('should not open upload confirmation when dropped files are empty', () => {
    setup();

    service.confirmDropFiles([], vi.fn());

    expect(confirmationService.confirmAccept).not.toHaveBeenCalled();
  });

  it('should confirm single file upload with file name params', () => {
    setup();
    const onConfirm = vi.fn();
    const file = new File(['body'], 'single.txt');

    service.confirmDropFiles([file], onConfirm);

    expect(confirmationService.confirmAccept).toHaveBeenCalledWith({
      headerKey: 'files.dialogs.uploadFile.title',
      messageParams: { name: 'single.txt' },
      messageKey: 'files.dialogs.uploadFile.message',
      acceptLabelKey: 'common.buttons.upload',
      onConfirm,
    });
  });

  it('should confirm multiple file upload with count params', () => {
    setup();
    const onConfirm = vi.fn();
    const files = [new File(['a'], 'a.txt'), new File(['b'], 'b.txt')];

    service.confirmDropFiles(files, onConfirm);

    expect(confirmationService.confirmAccept).toHaveBeenCalledWith({
      headerKey: 'files.dialogs.uploadFiles.title',
      messageParams: { count: 2 },
      messageKey: 'files.dialogs.uploadFiles.message',
      acceptLabelKey: 'common.buttons.upload',
      onConfirm,
    });
  });

  it('should confirm delete with folder keys for folder kind', () => {
    setup();
    const onConfirm = vi.fn();

    service.confirmDeleteEntry({ kind: FileKind.Folder, name: 'Docs' }, onConfirm);

    expect(confirmationService.confirmDelete).toHaveBeenCalledWith({
      headerKey: 'files.dialogs.deleteFolder.title',
      messageParams: { name: 'Docs' },
      messageKey: 'files.dialogs.deleteFolder.message',
      acceptLabelKey: 'common.buttons.remove',
      onConfirm,
    });
  });

  it('should confirm delete with file keys for file kind', () => {
    setup();
    const onConfirm = vi.fn();

    service.confirmDeleteEntry({ kind: FileKind.File, name: 'report.pdf' }, onConfirm);

    expect(confirmationService.confirmDelete).toHaveBeenCalledWith({
      headerKey: 'files.dialogs.deleteFile.title',
      messageParams: { name: 'report.pdf' },
      messageKey: 'files.dialogs.deleteFile.message',
      acceptLabelKey: 'common.buttons.remove',
      onConfirm,
    });
  });
});
