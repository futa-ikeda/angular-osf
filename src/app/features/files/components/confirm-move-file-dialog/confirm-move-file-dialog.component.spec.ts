import { MockProvider } from 'ng-mocks';

import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { Subject } from 'rxjs';

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileModel } from '@osf/shared/models/files/file.model';

import { FileModelMock } from '@testing/mocks/file.model.mock';
import { provideOSFCore } from '@testing/osf.testing.provider';
import { provideDynamicDialogRefMock } from '@testing/providers/dynamic-dialog-ref.mock';
import {
  FilesMoveCopyServiceMock,
  FilesMoveCopyServiceMockType,
} from '@testing/providers/files-move-copy-service.mock';

import { MoveCopyAction } from '../../enums/move-copy-action.enum';
import { ConfirmMoveFilesOptions } from '../../models/files-actions-options.model';
import { FilesMoveCopyService } from '../../services/files-move-copy.service';

import { ConfirmMoveFileDialogComponent } from './confirm-move-file-dialog.component';

describe('ConfirmMoveFileDialogComponent', () => {
  let component: ConfirmMoveFileDialogComponent;
  let fixture: ComponentFixture<ConfirmMoveFileDialogComponent>;
  let dialogRefMock: DynamicDialogRef;
  let dialogConfigMock: DynamicDialogConfig & { data: ConfirmMoveFilesOptions };
  let filesMoveCopyService: FilesMoveCopyServiceMockType;

  interface SetupOverrides {
    files?: FileModel[];
    destination?: FileModel;
  }

  function setup(overrides: SetupOverrides = {}) {
    const defaultFile = FileModelMock.simple({ name: 'a.txt' });
    const defaultDestination = FileModelMock.simple({ name: 'folder' });
    const files = overrides.files ?? [defaultFile];
    const destination = overrides.destination ?? defaultDestination;

    const data: ConfirmMoveFilesOptions = {
      files,
      destination,
      resourceId: 'resource-1',
      storageProvider: 'osfstorage',
    };

    filesMoveCopyService = FilesMoveCopyServiceMock.simple();
    dialogConfigMock = { header: 'files.dialogs.moveFile.title', data };

    TestBed.configureTestingModule({
      imports: [ConfirmMoveFileDialogComponent],
      providers: [
        provideOSFCore(),
        provideDynamicDialogRefMock(),
        MockProvider(DynamicDialogConfig, dialogConfigMock),
        MockProvider(FilesMoveCopyService, filesMoveCopyService),
      ],
    });

    fixture = TestBed.createComponent(ConfirmMoveFileDialogComponent);
    component = fixture.componentInstance;
    dialogRefMock = TestBed.inject(DynamicDialogRef);
    fixture.detectChanges();
  }

  it('should create', () => {
    setup();
    expect(component).toBeTruthy();
  });

  it('should read currentFolder from dialog data', () => {
    const dest = FileModelMock.simple({ name: 'target' });
    setup({ destination: dest });
    expect(component.currentFolder).toBe(dest);
  });

  it('should set dragNodeName to the file name when one file is selected', () => {
    setup({ files: [FileModelMock.simple({ name: 'readme.md' })] });
    expect(component.dragNodeName).toBe('readme.md');
  });

  it('should close without a result when cancel is clicked', () => {
    setup();
    const buttons = fixture.nativeElement.querySelectorAll('button');
    buttons[0].click();
    expect(dialogRefMock.close).toHaveBeenCalledWith();
  });

  it('should call move copy service with move action and close with true on success', () => {
    const file = FileModelMock.simple({ name: 'a.txt' });
    const dest = FileModelMock.simple({ name: 'folder' });
    setup({ files: [file], destination: dest });
    component.moveFiles();
    expect(filesMoveCopyService.execute).toHaveBeenCalledWith({
      files: [file],
      destination: dest,
      resourceId: 'resource-1',
      storageProvider: 'osfstorage',
      action: MoveCopyAction.Move,
    });
    expect(dialogRefMock.close).toHaveBeenCalledWith(true);
    expect(component.isLoading()).toBe(false);
  });

  it('should call move copy service with copy action and close with true on success', () => {
    const file = FileModelMock.simple({ name: 'a.txt' });
    const dest = FileModelMock.simple({ name: 'folder' });
    setup({ files: [file], destination: dest });
    component.copyFiles();
    expect(filesMoveCopyService.execute).toHaveBeenCalledWith({
      files: [file],
      destination: dest,
      resourceId: 'resource-1',
      storageProvider: 'osfstorage',
      action: MoveCopyAction.Copy,
    });
    expect(dialogRefMock.close).toHaveBeenCalledWith(true);
    expect(component.isLoading()).toBe(false);
  });

  it('should ignore a second move while the first is in progress', () => {
    setup();
    const pending = new Subject<boolean>();
    filesMoveCopyService.execute.mockReturnValue(pending.asObservable());
    component.moveFiles();
    component.moveFiles();
    expect(filesMoveCopyService.execute).toHaveBeenCalledTimes(1);
    pending.next(true);
    pending.complete();
    fixture.detectChanges();
  });

  it('should keep loading true until move finishes', () => {
    setup();
    const pending = new Subject<boolean>();
    filesMoveCopyService.execute.mockReturnValue(pending.asObservable());
    component.moveFiles();
    expect(component.isLoading()).toBe(true);
    pending.next(true);
    pending.complete();
    fixture.detectChanges();
    expect(component.isLoading()).toBe(false);
  });
});
