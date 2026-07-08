import { MockComponents, MockDirective } from 'ng-mocks';

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CopyButtonComponent } from '@osf/shared/components/copy-button/copy-button.component';
import { InfoIconComponent } from '@osf/shared/components/info-icon/info-icon.component';
import { StopPropagationDirective } from '@osf/shared/directives/stop-propagation.directive';

import { provideOSFCore } from '@testing/osf.testing.provider';

import { OsfFileRevision } from '../../models/file-revisions.model';

import { FileRevisionsComponent } from './file-revisions.component';

describe('FileRevisionsComponent', () => {
  let component: FileRevisionsComponent;
  let fixture: ComponentFixture<FileRevisionsComponent>;
  const revisions: OsfFileRevision[] = [
    {
      version: '1',
      dateTime: new Date('2026-01-01T00:00:00Z'),
      downloads: 2,
      hashes: { md5: 'md5-1', sha256: 'sha256-1' },
    },
    {
      version: '2',
      dateTime: new Date('2026-01-02T00:00:00Z'),
      downloads: 4,
      hashes: { md5: 'md5-2', sha256: 'sha256-2' },
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        FileRevisionsComponent,
        ...MockComponents(CopyButtonComponent, InfoIconComponent),
        MockDirective(StopPropagationDirective),
      ],
      providers: [provideOSFCore()],
    });

    fixture = TestBed.createComponent(FileRevisionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default inputs', () => {
    expect(component.fileRevisions()).toBeUndefined();
    expect(component.isLoading()).toBe(false);
  });

  it('should update file revisions input', () => {
    fixture.componentRef.setInput('fileRevisions', revisions);
    fixture.detectChanges();

    expect(component.fileRevisions()).toEqual(revisions);
  });

  it('should support null file revisions input', () => {
    fixture.componentRef.setInput('fileRevisions', null);
    fixture.detectChanges();

    expect(component.fileRevisions()).toBeNull();
  });

  it('should handle loading state changes', () => {
    fixture.componentRef.setInput('isLoading', true);
    fixture.detectChanges();

    expect(component.isLoading()).toBe(true);

    fixture.componentRef.setInput('isLoading', false);
    fixture.detectChanges();

    expect(component.isLoading()).toBe(false);
  });

  it('should emit open revision event', () => {
    const openRevisionSpy = vi.spyOn(component.openRevision, 'emit');

    component.onOpenRevision('1');

    expect(openRevisionSpy).toHaveBeenCalledWith('1');
  });

  it('should emit download revision event', () => {
    const downloadRevisionSpy = vi.spyOn(component.downloadRevision, 'emit');

    component.onDownloadRevision('2');

    expect(downloadRevisionSpy).toHaveBeenCalledWith('2');
  });
});
