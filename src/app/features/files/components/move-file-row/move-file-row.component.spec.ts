import { MockComponent } from 'ng-mocks';

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconComponent } from '@osf/shared/components/icon/icon.component';
import { FileKind } from '@osf/shared/enums/file-kind.enum';
import { FileModel } from '@osf/shared/models/files/file.model';

import { FileModelMock } from '@testing/mocks/file.model.mock';
import { provideOSFCore } from '@testing/osf.testing.provider';

import { MoveFileRowComponent } from './move-file-row.component';

describe('MoveFileRowComponent', () => {
  let component: MoveFileRowComponent;
  let fixture: ComponentFixture<MoveFileRowComponent>;

  const createFile = (kind: FileKind, name: string): FileModel =>
    FileModelMock.simple({
      id: `${kind}-id`,
      name,
      kind,
      path: `/${name}`,
      materializedPath: `/${name}`,
    });

  function setup(item: FileModel, isBlocked = false, isIndented = false) {
    TestBed.configureTestingModule({
      imports: [MoveFileRowComponent, MockComponent(IconComponent)],
      providers: [provideOSFCore()],
    });

    fixture = TestBed.createComponent(MoveFileRowComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('item', item);
    fixture.componentRef.setInput('isBlocked', isBlocked);
    fixture.componentRef.setInput('isIndented', isIndented);
    fixture.detectChanges();
  }

  it('should render file row as disabled', () => {
    setup(createFile(FileKind.File, 'paper.pdf'));

    expect(component.isFile()).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('paper.pdf');
    expect(fixture.nativeElement.querySelector('.filename-link.disabled')?.textContent?.trim()).toBe('paper.pdf');
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });

  it('should render blocked folder row as disabled', () => {
    setup(createFile(FileKind.Folder, 'docs'), true);

    expect(component.isFile()).toBe(false);
    expect(fixture.nativeElement.textContent).toContain('docs');
    expect(fixture.nativeElement.querySelector('.filename-link.disabled')).toBeNull();
    expect(fixture.nativeElement.querySelector('p-button')).toBeNull();
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });

  it('should emit openFolder when active folder row clicked', () => {
    const folder = createFile(FileKind.Folder, 'images');
    setup(folder);
    const emitSpy = vi.spyOn(component.openFolder, 'emit');

    const button = fixture.nativeElement.querySelector('button');
    button.click();

    expect(emitSpy).toHaveBeenCalledWith(folder);
  });

  it('should apply indented row class when enabled', () => {
    setup(createFile(FileKind.Folder, 'nested'), false, true);

    const row = fixture.nativeElement.querySelector('.files-table-row');
    expect(row.classList.contains('pl-6')).toBe(true);
  });
});
