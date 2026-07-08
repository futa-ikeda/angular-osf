import { MockProvider } from 'ng-mocks';

import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideOSFCore } from '@testing/osf.testing.provider';
import { provideDynamicDialogRefMock } from '@testing/providers/dynamic-dialog-ref.mock';

import { OsfFileCustomMetadata } from '../../models/file-custom-metadata.model';

import { EditFileMetadataDialogComponent } from './edit-file-metadata-dialog.component';

describe('EditFileMetadataDialogComponent', () => {
  let component: EditFileMetadataDialogComponent;
  let fixture: ComponentFixture<EditFileMetadataDialogComponent>;
  let dialogRef: DynamicDialogRef;

  const mockFileMetadata: OsfFileCustomMetadata = {
    id: '1',
    title: 'Test File',
    description: 'Test Description',
    resourceTypeGeneral: 'Dataset',
    language: 'en',
  };

  function setup(data?: Partial<OsfFileCustomMetadata>) {
    const dialogConfigMock: Pick<DynamicDialogConfig, 'data'> = { data };

    TestBed.configureTestingModule({
      imports: [EditFileMetadataDialogComponent],
      providers: [provideOSFCore(), provideDynamicDialogRefMock(), MockProvider(DynamicDialogConfig, dialogConfigMock)],
    });

    fixture = TestBed.createComponent(EditFileMetadataDialogComponent);
    component = fixture.componentInstance;
    dialogRef = TestBed.inject(DynamicDialogRef);
    fixture.detectChanges();
  }

  it('should create', () => {
    setup(mockFileMetadata);

    expect(component).toBeTruthy();
  });

  it('should initialize form from dialog data', () => {
    setup(mockFileMetadata);

    expect(component.fileMetadataForm.controls.title.value).toBe('Test File');
    expect(component.fileMetadataForm.controls.description.value).toBe('Test Description');
    expect(component.fileMetadataForm.controls.resourceType.value).toBe('Dataset');
    expect(component.fileMetadataForm.controls.resourceLanguage.value).toBe('en');
  });

  it('should set null for empty resource type and language', () => {
    setup({
      id: '1',
      title: 'Title',
      description: 'Description',
      resourceTypeGeneral: '',
      language: '',
    });

    expect(component.fileMetadataForm.controls.resourceType.value).toBeNull();
    expect(component.fileMetadataForm.controls.resourceLanguage.value).toBeNull();
  });

  it('should initialize safe defaults when dialog data is missing', () => {
    setup();

    expect(component.fileMetadataForm.controls.title.value).toBeNull();
    expect(component.fileMetadataForm.controls.description.value).toBeNull();
    expect(component.fileMetadataForm.controls.resourceType.value).toBeNull();
    expect(component.fileMetadataForm.controls.resourceLanguage.value).toBeNull();
  });

  it('should close dialog with mapped form values when form is valid', () => {
    setup(mockFileMetadata);

    component.setFileMetadata();

    expect(dialogRef.close).toHaveBeenCalledWith({
      title: 'Test File',
      description: 'Test Description',
      resource_type_general: 'Dataset',
      language: 'en',
    });
  });

  it('should map nullable select values to empty strings on submit', () => {
    setup(mockFileMetadata);

    component.fileMetadataForm.patchValue({
      title: null,
      description: null,
      resourceType: null,
      resourceLanguage: null,
    });

    component.setFileMetadata();

    expect(dialogRef.close).toHaveBeenCalledWith({
      title: null,
      description: null,
      resource_type_general: '',
      language: '',
    });
  });

  it('should not close dialog when form is invalid', () => {
    setup(mockFileMetadata);

    component.fileMetadataForm.setErrors({ invalid: true });

    component.setFileMetadata();

    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('should close dialog without payload when cancel is called', () => {
    setup(mockFileMetadata);

    component.cancel();

    expect(dialogRef.close).toHaveBeenCalledWith();
  });
});
