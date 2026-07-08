import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileKind } from '@osf/shared/enums/file-kind.enum';
import { FileModel } from '@shared/models/files/file.model';

import { FileModelMock } from '@testing/mocks/file.model.mock';
import { provideOSFCore } from '@testing/osf.testing.provider';

import { FilesTreeRowComponent } from './files-tree-row.component';

describe('FilesTreeRowComponent', () => {
  let component: FilesTreeRowComponent;
  let fixture: ComponentFixture<FilesTreeRowComponent>;

  function setup(overrides: { file?: FileModel; hasFoldersStack?: boolean } = {}): void {
    fixture = TestBed.createComponent(FilesTreeRowComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('file', overrides.file ?? FileModelMock.simple());
    fixture.componentRef.setInput('hasFoldersStack', overrides.hasFoldersStack ?? false);
    fixture.detectChanges();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FilesTreeRowComponent],
      providers: [provideOSFCore()],
    });
  });

  it('should create', () => {
    setup();

    expect(component).toBeTruthy();
  });

  it('should set isFolder when kind is folder', () => {
    setup({ file: FileModelMock.simple({ kind: FileKind.Folder }) });

    expect(component.isFolder()).toBe(true);
  });

  it('should set isFolder false when kind is file', () => {
    setup({ file: FileModelMock.simple({ kind: FileKind.File }) });

    expect(component.isFolder()).toBe(false);
  });

  it('should clear downloadsCount for folder', () => {
    setup({
      file: FileModelMock.simple({
        kind: FileKind.Folder,
        extra: { hashes: { md5: 'm', sha256: 's' }, downloads: 99 },
      }),
    });

    expect(component.downloadsCount()).toBe('');
  });

  it('should expose downloadsCount for file with downloads', () => {
    setup({
      file: FileModelMock.simple({
        kind: FileKind.File,
        extra: { hashes: { md5: 'm', sha256: 's' }, downloads: 12 },
      }),
    });

    expect(component.downloadsCount()).toBe(12);
  });

  it('should clear downloadsCount when downloads is zero', () => {
    setup({
      file: FileModelMock.simple({
        kind: FileKind.File,
        extra: { hashes: { md5: 'm', sha256: 's' }, downloads: 0 },
      }),
    });

    expect(component.downloadsCount()).toBe('');
  });

  it('should emit openEntry with current file', () => {
    const file = FileModelMock.simple({ id: 'file-1' });
    setup({ file });
    const openEntryEmit = vi.spyOn(component.openEntry, 'emit');

    component.onOpenEntry();

    expect(openEntryEmit).toHaveBeenCalledWith(file);
  });
});
