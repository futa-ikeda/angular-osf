import { MockComponents, MockProvider } from 'ng-mocks';

import { TreeDragDropService } from 'primeng/api';
import { TreeLazyLoadEvent } from 'primeng/tree';

import { vi } from 'vitest';

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileKind } from '@osf/shared/enums/file-kind.enum';
import { FileModel } from '@shared/models/files/file.model';
import { FileFolderModel } from '@shared/models/files/file-folder.model';
import { FileLabelModel } from '@shared/models/files/file-label.model';

import { FileModelMock } from '@testing/mocks/file.model.mock';
import { OSF_FILE_MOCK } from '@testing/mocks/osf-file.mock';
import { provideOSFCore } from '@testing/osf.testing.provider';

import { FilesDropZoneComponent } from '../files-drop-zone/files-drop-zone.component';
import { FilesTreeRowComponent } from '../files-tree-row/files-tree-row.component';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';

import { FilesTreeComponent } from './files-tree.component';

describe('FilesTreeComponent', () => {
  let component: FilesTreeComponent;
  let fixture: ComponentFixture<FilesTreeComponent>;
  let currentFolder: FileFolderModel;
  let storage: FileLabelModel;
  let files: FileModel[];

  interface SetupOverrides {
    files?: FileModel[];
    currentFolder?: FileFolderModel;
    storage?: FileLabelModel | null;
    totalCount?: number;
    isLoading?: boolean;
  }

  function setup(overrides: SetupOverrides = {}): void {
    files = overrides.files ?? [];
    currentFolder = overrides.currentFolder ?? {
      ...OSF_FILE_MOCK,
      id: 'folder-1',
      name: 'Current folder',
      kind: FileKind.Folder,
    };
    storage = overrides.storage ?? {
      label: 'OSF Storage',
      folder: currentFolder,
    };

    fixture = TestBed.createComponent(FilesTreeComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('files', files);
    fixture.componentRef.setInput('currentFolder', currentFolder);
    fixture.componentRef.setInput('storage', storage);
    fixture.componentRef.setInput('totalCount', overrides.totalCount ?? files.length);
    fixture.componentRef.setInput('isLoading', overrides.isLoading ?? false);
    fixture.detectChanges();
  }

  function createLazyLoadEvent(last: number): TreeLazyLoadEvent {
    return { first: 0, last };
  }

  function createCurrentFolderWithFilesLink(filesLink: string): FileFolderModel {
    return {
      ...OSF_FILE_MOCK,
      id: 'folder-with-files-link',
      name: 'Folder with files link',
      kind: FileKind.Folder,
      links: {
        ...OSF_FILE_MOCK.links,
        filesLink,
      },
    };
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        FilesTreeComponent,
        ...MockComponents(LoadingSpinnerComponent, FilesDropZoneComponent, FilesTreeRowComponent),
      ],
      providers: [provideOSFCore(), MockProvider(TreeDragDropService)],
    });
  });

  it('should create', () => {
    setup();

    expect(component).toBeTruthy();
  });

  it('should expose provided inputs', () => {
    setup();

    expect(component.files()).toEqual(files);
    expect(component.currentFolder()).toEqual(currentFolder);
    expect(component.storage()).toEqual(storage);
  });

  it('should reset folders stack when storage changes', () => {
    setup();
    component.foldersStack.set([currentFolder]);

    fixture.componentRef.setInput('storage', {
      label: 'Another storage',
      folder: { ...currentFolder, id: 'folder-2' },
    });
    fixture.detectChanges();

    expect(component.foldersStack()).toEqual([]);
  });

  it('should stop loading more when loading finishes', () => {
    setup({ isLoading: true });
    component.isLoadingMore.set(true);

    fixture.componentRef.setInput('isLoading', false);
    fixture.detectChanges();

    expect(component.isLoadingMore()).toBe(false);
  });

  it('should include previous folder node when folders stack is not empty', () => {
    const file = FileModelMock.simple({ id: 'file-1', name: 'file-1' });
    const folderFile = FileModelMock.simple({
      id: 'folder-file-1',
      name: 'folder-file-1',
      kind: FileKind.Folder,
      filesLink: '/folder-file-1/files',
      previousFolder: false,
    });
    setup({
      files: [file, folderFile],
      currentFolder: { ...currentFolder, id: 'folder-with-stack' },
    });
    component.foldersStack.set([{ ...currentFolder, id: 'parent-folder' }]);
    fixture.detectChanges();

    const mappedNodes = component.nodes();

    expect(mappedNodes).toHaveLength(3);
    expect(mappedNodes).toEqual([
      expect.objectContaining({
        data: expect.objectContaining({
          id: 'folder-with-stack',
          previousFolder: true,
        }),
      }),
      expect.any(Object),
      expect.any(Object),
    ]);
  });

  it('should emit dropped files', () => {
    setup();
    const uploadFilesEmit = vi.spyOn(component.uploadFiles, 'emit');
    const droppedFiles = [new File(['a'], 'a.txt')];

    component.onDropFiles(droppedFiles);

    expect(uploadFilesEmit).toHaveBeenCalledWith(droppedFiles);
  });

  it('should emit delete file action', () => {
    setup();
    const deleteEmit = vi.spyOn(component.deleteFile, 'emit');
    const file = FileModelMock.simple();

    component.deleteEntry(file);

    expect(deleteEmit).toHaveBeenCalledWith(file);
  });

  it('should emit opened file when entry is a file', () => {
    setup();
    const fileOpenedEmit = vi.spyOn(component.fileOpened, 'emit');
    const folderChangedEmit = vi.spyOn(component.currentFolderChanged, 'emit');
    const file = FileModelMock.simple({ kind: FileKind.File });

    component.openEntry(file);

    expect(fileOpenedEmit).toHaveBeenCalledWith(file);
    expect(folderChangedEmit).not.toHaveBeenCalled();
  });

  it('should open folder and emit current folder change', () => {
    setup();
    const folderChangedEmit = vi.spyOn(component.currentFolderChanged, 'emit');
    const folderFile = FileModelMock.simple({
      id: 'folder-id',
      kind: FileKind.Folder,
      name: 'Folder',
      path: '/folder',
      provider: 'osfstorage',
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
      filesLink: '/folder/files',
    });

    component.openEntry(folderFile);

    expect(component.foldersStack()).toEqual([currentFolder]);
    expect(folderChangedEmit).toHaveBeenCalledWith({
      id: 'folder-id',
      kind: FileKind.Folder,
      name: 'Folder',
      node: '',
      path: '/folder',
      provider: 'osfstorage',
      links: {
        newFolder: '/upload?kind=folder',
        storageAddons: '',
        upload: '/upload',
        filesLink: '/folder/files',
        download: '/upload',
      },
    });
  });

  it('should open parent folder and emit folder change', () => {
    setup();
    const folderChangedEmit = vi.spyOn(component.currentFolderChanged, 'emit');
    const parentFolder = { ...currentFolder, id: 'parent-id' };
    component.foldersStack.set([parentFolder]);

    component.openParentFolder();

    expect(component.foldersStack()).toEqual([]);
    expect(folderChangedEmit).toHaveBeenCalledWith(parentFolder);
  });

  it('should load next page on lazy load end', () => {
    const fileA = FileModelMock.simple({ id: 'file-a' });
    const fileB = FileModelMock.simple({ id: 'file-b' });
    setup({
      files: [fileA, fileB],
      totalCount: 25,
      currentFolder: createCurrentFolderWithFilesLink('/next/files'),
    });
    const loadFilesEmit = vi.spyOn(component.loadFiles, 'emit');

    component.onLazyLoad(createLazyLoadEvent(1));

    expect(loadFilesEmit).toHaveBeenCalledWith({ link: '/next/files', page: 1 });
    expect(component.isLoadingMore()).toBe(true);
  });

  it('should not load next page when all files are loaded', () => {
    const fileA = FileModelMock.simple({ id: 'file-a' });
    setup({
      files: [fileA],
      totalCount: 1,
      currentFolder: createCurrentFolderWithFilesLink('/next/files'),
    });
    const loadFilesEmit = vi.spyOn(component.loadFiles, 'emit');

    component.onLazyLoad(createLazyLoadEvent(0));

    expect(loadFilesEmit).not.toHaveBeenCalled();
  });

  it('should not trigger load next page when lazy load index is before the end', () => {
    const fileA = FileModelMock.simple({ id: 'file-a' });
    const fileB = FileModelMock.simple({ id: 'file-b' });
    setup({
      files: [fileA, fileB],
      totalCount: 20,
      currentFolder: createCurrentFolderWithFilesLink('/next/files'),
    });
    const loadFilesEmit = vi.spyOn(component.loadFiles, 'emit');

    component.onLazyLoad(createLazyLoadEvent(0));

    expect(loadFilesEmit).not.toHaveBeenCalled();
  });

  it('should not load next page while loading more is in progress', () => {
    const fileA = FileModelMock.simple({ id: 'file-a' });
    const fileB = FileModelMock.simple({ id: 'file-b' });
    setup({
      files: [fileA, fileB],
      totalCount: 20,
      currentFolder: createCurrentFolderWithFilesLink('/next/files'),
    });
    const loadFilesEmit = vi.spyOn(component.loadFiles, 'emit');
    component.isLoadingMore.set(true);

    component.onLazyLoad(createLazyLoadEvent(1));

    expect(loadFilesEmit).not.toHaveBeenCalled();
  });

  it('should clear loading more when isLoading becomes false after pagination request', () => {
    const fileA = FileModelMock.simple({ id: 'file-a' });
    const fileB = FileModelMock.simple({ id: 'file-b' });
    setup({
      files: [fileA, fileB],
      totalCount: 20,
      currentFolder: createCurrentFolderWithFilesLink('/next/files'),
      isLoading: true,
    });

    component.onLazyLoad(createLazyLoadEvent(1));
    expect(component.isLoadingMore()).toBe(true);

    fixture.componentRef.setInput('isLoading', false);
    fixture.detectChanges();

    expect(component.isLoadingMore()).toBe(false);
  });

  it('should support multiple page calculation for next request', () => {
    const filesForPage = Array.from({ length: 20 }, (_, index) => FileModelMock.simple({ id: `file-${index}` }));
    setup({
      files: filesForPage,
      totalCount: 50,
      currentFolder: createCurrentFolderWithFilesLink('/next/files'),
    });
    const loadFilesEmit = vi.spyOn(component.loadFiles, 'emit');

    component.onLazyLoad(createLazyLoadEvent(19));

    expect(loadFilesEmit).toHaveBeenCalledWith({ link: '/next/files', page: 3 });
  });
});
