import { Store } from '@ngxs/store';

import { MockComponents, MockProvider } from 'ng-mocks';

import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { Subject } from 'rxjs';

import { Mock } from 'vitest';

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingSpinnerComponent } from '@osf/shared/components/loading-spinner/loading-spinner.component';
import { SupportedFeature } from '@osf/shared/enums/addon-supported-features.enum';
import { FileKind } from '@osf/shared/enums/file-kind.enum';
import { ResourceType } from '@osf/shared/enums/resource-type.enum';
import { FileModel } from '@osf/shared/models/files/file.model';
import { FileFolderModel } from '@osf/shared/models/files/file-folder.model';
import { CurrentResourceSelectors, GetResourceWithChildren } from '@osf/shared/stores/current-resource';

import { FileModelMock } from '@testing/mocks/file.model.mock';
import { OSF_FILE_MOCK } from '@testing/mocks/osf-file.mock';
import { provideOSFCore } from '@testing/osf.testing.provider';
import { provideDynamicDialogRefMock } from '@testing/providers/dynamic-dialog-ref.mock';
import {
  FilesMoveCopyServiceMock,
  FilesMoveCopyServiceMockType,
} from '@testing/providers/files-move-copy-service.mock';
import {
  BaseSetupOverrides,
  mergeSignalOverrides,
  provideMockStore,
  SignalOverride,
} from '@testing/providers/store-provider.mock';

import { FileProvider } from '../../constants';
import { MoveCopyAction } from '../../enums/move-copy-action.enum';
import { MoveFilesOptions } from '../../models/files-actions-options.model';
import { FilesMoveCopyService } from '../../services/files-move-copy.service';
import { FilesSelectors, GetMoveDialogFiles, SetFilesCurrentFolder, SetMoveDialogCurrentFolder } from '../../store';
import { FileSelectDestinationComponent } from '../file-select-destination/file-select-destination.component';
import { MoveFileRowComponent } from '../move-file-row/move-file-row.component';

import { MoveFileDialogComponent } from './move-file-dialog.component';

describe('MoveFileDialogComponent', () => {
  let component: MoveFileDialogComponent;
  let fixture: ComponentFixture<MoveFileDialogComponent>;
  let store: Store;
  let dialogRef: DynamicDialogRef;
  let filesMoveCopyService: FilesMoveCopyServiceMockType;
  let dialogConfig: DynamicDialogConfig & { data: MoveFilesOptions };

  const initialFolder: FileFolderModel = {
    ...OSF_FILE_MOCK,
    id: 'folder-1',
    name: 'Folder 1',
    node: 'node-1',
    path: '/folder-1',
    provider: FileProvider.OsfStorage,
    links: {
      ...OSF_FILE_MOCK.links,
      filesLink: '/files-folder-1',
    },
  };

  const nestedFolder: FileFolderModel = {
    ...OSF_FILE_MOCK,
    id: 'folder-2',
    name: 'Folder 2',
    node: 'node-1',
    path: '/folder-2',
    provider: FileProvider.OsfStorage,
    links: {
      ...OSF_FILE_MOCK.links,
      filesLink: '/files-folder-2',
    },
  };

  const project = {
    id: 'project-1',
    rootResourceId: 'root-1',
  };

  interface SetupOverrides extends BaseSetupOverrides {
    configData?: Partial<MoveFilesOptions>;
  }

  function setup(overrides: SetupOverrides = {}) {
    const file = FileModelMock.simple({ id: 'file-1', name: 'file-1.txt' });
    filesMoveCopyService = FilesMoveCopyServiceMock.simple();
    const defaultSignals: SignalOverride[] = [
      { selector: FilesSelectors.getMoveDialogFiles, value: [] },
      { selector: FilesSelectors.getMoveDialogFilesTotalCount, value: 0 },
      { selector: FilesSelectors.isMoveDialogFilesLoading, value: false },
      { selector: FilesSelectors.getMoveDialogCurrentFolder, value: initialFolder },
      { selector: FilesSelectors.getProvider, value: FileProvider.OsfStorage },
      {
        selector: FilesSelectors.getStorageSupportedFeatures,
        value: { [FileProvider.OsfStorage]: [SupportedFeature.AddUpdateFiles] },
      },
      { selector: FilesSelectors.isMoveDialogConfiguredStorageAddonsLoading, value: false },
      { selector: FilesSelectors.isMoveDialogRootFoldersLoading, value: false },
      { selector: CurrentResourceSelectors.getCurrentResource, value: project },
      { selector: CurrentResourceSelectors.getResourceWithChildren, value: [] },
      { selector: CurrentResourceSelectors.isResourceWithChildrenLoading, value: false },
    ];

    dialogConfig = {
      header: 'files.dialogs.moveFile.title',
      data: {
        files: [file],
        action: MoveCopyAction.Move,
        resourceId: 'project-1',
        storageProvider: FileProvider.OsfStorage,
        foldersStack: [initialFolder],
        initialFolder,
        ...overrides.configData,
      },
    };

    TestBed.configureTestingModule({
      imports: [
        MoveFileDialogComponent,
        ...MockComponents(LoadingSpinnerComponent, FileSelectDestinationComponent, MoveFileRowComponent),
      ],
      providers: [
        provideOSFCore(),
        provideDynamicDialogRefMock(),
        MockProvider(DynamicDialogConfig, dialogConfig),
        MockProvider(FilesMoveCopyService, filesMoveCopyService),
        provideMockStore({
          signals: mergeSignalOverrides(defaultSignals, overrides.selectorOverrides),
        }),
      ],
    });

    store = TestBed.inject(Store);
    fixture = TestBed.createComponent(MoveFileDialogComponent);
    component = fixture.componentInstance;
    dialogRef = TestBed.inject(DynamicDialogRef);
    fixture.detectChanges();
  }

  it('should create', () => {
    setup();
    expect(component).toBeTruthy();
  });

  it('should initialize previous folder from stack', () => {
    setup({
      configData: {
        foldersStack: [initialFolder, nestedFolder],
      },
    });
    expect(component.previousFolder()).toEqual(nestedFolder);
  });

  it('should open selected folder and update stack', () => {
    setup();
    (store.dispatch as Mock).mockClear();
    const folderFile = FileModelMock.simple({
      id: 'folder-3',
      name: 'Folder 3',
      kind: FileKind.Folder,
      path: '/folder-3',
      filesLink: '/files-folder-3',
      provider: FileProvider.OsfStorage,
      links: {
        info: '',
        move: '',
        upload: '/upload',
        delete: '',
        download: '',
        render: '',
        html: '',
        self: '',
      },
    });

    component.openFolder(folderFile);

    expect(component.foldersStack()).toEqual([initialFolder, initialFolder]);
    expect(component.previousFolder()).toEqual(initialFolder);
    expect(store.dispatch).toHaveBeenCalledWith(
      new SetMoveDialogCurrentFolder({
        id: 'folder-3',
        kind: FileKind.Folder,
        name: 'Folder 3',
        node: '',
        path: '/folder-3',
        provider: FileProvider.OsfStorage,
        links: {
          newFolder: '/upload?kind=folder',
          storageAddons: '',
          upload: '/upload',
          filesLink: '/files-folder-3',
          download: '/upload',
        },
      })
    );
  });

  it('should open parent folder and dispatch previous folder', () => {
    setup({
      configData: {
        foldersStack: [initialFolder, nestedFolder],
      },
      selectorOverrides: [{ selector: FilesSelectors.getMoveDialogCurrentFolder, value: nestedFolder }],
    });
    (store.dispatch as Mock).mockClear();

    component.openParentFolder();

    expect(component.foldersStack()).toEqual([initialFolder]);
    expect(component.previousFolder()).toEqual(initialFolder);
    expect(store.dispatch).toHaveBeenCalledWith(new SetMoveDialogCurrentFolder(nestedFolder));
  });

  it('should load next page on list end scroll', () => {
    const files: FileModel[] = Array.from({ length: 10 }).map((_, index) =>
      FileModelMock.simple({ id: `file-${index + 1}`, name: `file-${index + 1}.txt` })
    );

    setup({
      selectorOverrides: [
        { selector: FilesSelectors.getMoveDialogFiles, value: files },
        { selector: FilesSelectors.getMoveDialogFilesTotalCount, value: 25 },
      ],
    });
    (store.dispatch as Mock).mockClear();

    component.onScrollIndexChange({ first: 0, last: 9 });

    expect(component.isLoadingMore()).toBe(true);
    expect(store.dispatch).toHaveBeenCalledWith(new GetMoveDialogFiles('/files-folder-1', 2));
  });

  it('should change project and reset folder state', () => {
    setup({
      configData: {
        foldersStack: [initialFolder, nestedFolder],
      },
    });

    component.onProjectChange('project-2');

    expect(component.foldersStack()).toEqual([]);
    expect(component.previousFolder()).toBeNull();
  });

  it('should execute move and close dialog on success', () => {
    setup();
    (store.dispatch as Mock).mockClear();

    component.moveFiles();

    expect(filesMoveCopyService.execute).toHaveBeenCalledWith({
      files: dialogConfig.data.files,
      destination: initialFolder,
      resourceId: 'project-1',
      storageProvider: FileProvider.OsfStorage,
      action: MoveCopyAction.Move,
    });
    expect(store.dispatch).toHaveBeenCalledWith(new SetFilesCurrentFolder(initialFolder));
    expect(store.dispatch).toHaveBeenCalledWith(new SetMoveDialogCurrentFolder(null));
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });

  it('should keep updating state true until move request completes', () => {
    setup();
    const pending = new Subject<boolean>();
    filesMoveCopyService.execute.mockReturnValue(pending.asObservable());

    component.moveFiles();

    expect(component.isFilesUpdating()).toBe(true);

    pending.next(true);
    pending.complete();

    expect(component.isFilesUpdating()).toBe(false);
    expect(dialogConfig.header).toBe('files.dialogs.moveFile.title');
  });

  it('should request components tree on init', () => {
    setup();
    expect(store.dispatch).toHaveBeenCalledWith(
      new GetResourceWithChildren('root-1', 'project-1', ResourceType.Project, true)
    );
  });
});
