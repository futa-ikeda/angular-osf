import { MockProvider } from 'ng-mocks';

import { of, Subject, throwError } from 'rxjs';

import { TestBed } from '@angular/core/testing';

import { FileModel } from '@osf/shared/models/files/file.model';
import { CustomConfirmationService } from '@osf/shared/services/custom-confirmation.service';
import { CustomDialogService } from '@osf/shared/services/custom-dialog.service';
import { ToastService } from '@osf/shared/services/toast.service';

import { FileModelMock } from '@testing/mocks/file.model.mock';
import {
  CustomConfirmationServiceMock,
  CustomConfirmationServiceMockType,
} from '@testing/providers/custom-confirmation-provider.mock';
import { CustomDialogServiceMock, CustomDialogServiceMockType } from '@testing/providers/custom-dialog-provider.mock';
import { ToastServiceMock, ToastServiceMockType } from '@testing/providers/toast-provider.mock';

import { MoveCopyAction } from '../enums/move-copy-action.enum';

import { FilesActionsService } from './files-actions.service';

describe('FilesActionsService', () => {
  let service: FilesActionsService;
  let customDialogService: CustomDialogServiceMockType;
  let customConfirmationService: CustomConfirmationServiceMockType;
  let toastService: ToastServiceMockType;

  function setup() {
    customDialogService = CustomDialogServiceMock.simple();
    customConfirmationService = CustomConfirmationServiceMock.simple();
    toastService = ToastServiceMock.simple();

    TestBed.configureTestingModule({
      providers: [
        FilesActionsService,
        MockProvider(CustomDialogService, customDialogService),
        MockProvider(CustomConfirmationService, customConfirmationService),
        MockProvider(ToastService, toastService),
      ],
    });

    service = TestBed.inject(FilesActionsService);
  }

  it('should create', () => {
    setup();
    expect(service).toBeTruthy();
  });

  it('should not open delete confirmation when files list is empty', () => {
    setup();

    service.deleteSelected({
      files: [],
      deleteEntry: vi.fn().mockReturnValue(of(true)),
      onSuccess: vi.fn(),
    });

    expect(customConfirmationService.confirmDelete).not.toHaveBeenCalled();
  });

  it('should delete selected files and call success handler', () => {
    setup();
    const onSuccess = vi.fn();
    const deleteEntry = vi.fn().mockReturnValue(of(true));
    const files = [
      FileModelMock.simple({ name: 'a.txt', links: { ...FileModelMock.simple().links, delete: '/delete-a' } }),
      FileModelMock.simple({ name: 'b.txt', links: { ...FileModelMock.simple().links, delete: '/delete-b' } }),
    ];

    service.deleteSelected({ files, deleteEntry, onSuccess });

    const options = customConfirmationService.confirmDelete.mock.calls[0][0];
    expect(options.onConfirm).toBeDefined();
    options.onConfirm?.();

    expect(deleteEntry).toHaveBeenCalledWith('/delete-a');
    expect(deleteEntry).toHaveBeenCalledWith('/delete-b');
    expect(toastService.showSuccess).toHaveBeenCalledWith('files.dialogs.deleteFile.success');
    expect(onSuccess).toHaveBeenCalled();
  });

  it('should continue delete flow when one delete request fails', () => {
    setup();
    const onSuccess = vi.fn();
    const deleteEntry = vi
      .fn()
      .mockReturnValueOnce(of(true))
      .mockReturnValueOnce(throwError(() => new Error('delete failed')));
    const files = [
      FileModelMock.simple({ links: { ...FileModelMock.simple().links, delete: '/delete-a' } }),
      FileModelMock.simple({ links: { ...FileModelMock.simple().links, delete: '/delete-b' } }),
    ];

    service.deleteSelected({ files, deleteEntry, onSuccess });

    const options = customConfirmationService.confirmDelete.mock.calls[0][0];
    expect(options.onConfirm).toBeDefined();
    options.onConfirm?.();

    expect(onSuccess).toHaveBeenCalled();
    expect(toastService.showSuccess).toHaveBeenCalledWith('files.dialogs.deleteFile.success');
  });

  it('should open move dialog and pass move options data', () => {
    setup();
    const onClose$ = new Subject<boolean>();
    customDialogService.open.mockReturnValue(CustomDialogServiceMock.dialogRefWithClose(onClose$));

    const files: FileModel[] = [FileModelMock.simple({ id: 'file-1' })];
    const result: boolean[] = [];
    service
      .openMoveDialog({
        files,
        action: MoveCopyAction.Move,
        resourceId: 'node-1',
        storageProvider: 'osfstorage',
        foldersStack: [],
        initialFolder: null,
      })
      .subscribe((value) => result.push(value as boolean));

    onClose$.next(true);

    expect(customDialogService.open).toHaveBeenCalled();
    expect(result).toEqual([true]);
  });

  it('should open create folder dialog and call createFolder for valid name only', () => {
    setup();
    const onClose$ = new Subject<string>();
    customDialogService.open.mockReturnValue(CustomDialogServiceMock.dialogRefWithClose(onClose$));
    const createFolder = vi.fn().mockReturnValue(of('created'));
    const emitted: unknown[] = [];

    service
      .openCreateFolderDialog({ newFolderLink: '/new-folder', createFolder })
      .subscribe((value) => emitted.push(value));

    onClose$.next('');
    onClose$.next('folder-1');

    expect(createFolder).toHaveBeenCalledWith('/new-folder', 'folder-1');
    expect(emitted).toEqual(['created']);
  });

  it('should open confirm move dialog with multiple header for multiple files', () => {
    setup();
    const onClose$ = new Subject<boolean>();
    customDialogService.open.mockReturnValue(CustomDialogServiceMock.dialogRefWithClose(onClose$));

    service.openConfirmMoveDialog({
      files: [FileModelMock.simple({ id: '1' }), FileModelMock.simple({ id: '2' })],
      destination: FileModelMock.simple({ id: 'dest', name: 'folder' }),
      resourceId: 'node-1',
      storageProvider: 'osfstorage',
    });

    expect(customDialogService.open.mock.calls[0][1]?.header).toBe('files.dialogs.moveFile.dialogTitleMultiple');
  });

  it('should return empty observable when rename link is missing', () => {
    setup();
    const values: unknown[] = [];
    service
      .openRenameFileDialog(FileModelMock.simple({ links: { ...FileModelMock.simple().links, upload: '' } }))
      .subscribe({
        next: (v) => values.push(v),
      });

    expect(customDialogService.open).not.toHaveBeenCalled();
    expect(values).toEqual([]);
  });

  it('should map renamed file result when rename dialog returns valid name', () => {
    setup();
    const onClose$ = new Subject<string>();
    customDialogService.open.mockReturnValue(CustomDialogServiceMock.dialogRefWithClose(onClose$));
    const file = FileModelMock.simple({
      name: 'old.txt',
      links: { ...FileModelMock.simple().links, upload: '/upload' },
    });
    const result: { newName: string; link: string }[] = [];

    service.openRenameFileDialog(file).subscribe((value) => result.push(value));

    onClose$.next('   ');
    onClose$.next('new.txt');

    expect(result).toEqual([{ newName: 'new.txt', link: '/upload' }]);
  });
});
