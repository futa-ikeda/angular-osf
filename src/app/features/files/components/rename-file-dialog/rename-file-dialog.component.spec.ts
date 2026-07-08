import { MockComponent, MockProvider } from 'ng-mocks';

import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextInputComponent } from '@osf/shared/components/text-input/text-input.component';
import { InputLimits } from '@osf/shared/constants/input-limits.const';

import { provideOSFCore } from '@testing/osf.testing.provider';
import { provideDynamicDialogRefMock } from '@testing/providers/dynamic-dialog-ref.mock';

import { RenameFileDialogComponent } from './rename-file-dialog.component';

describe('RenameFileDialogComponent', () => {
  let component: RenameFileDialogComponent;
  let fixture: ComponentFixture<RenameFileDialogComponent>;
  let dialogRef: DynamicDialogRef;
  let dialogConfig: DynamicDialogConfig;

  beforeEach(() => {
    const dialogConfigMock = {
      data: { currentName: 'test-file.txt' },
    };

    TestBed.configureTestingModule({
      imports: [RenameFileDialogComponent, MockComponent(TextInputComponent)],
      providers: [provideOSFCore(), provideDynamicDialogRefMock(), MockProvider(DynamicDialogConfig, dialogConfigMock)],
    });

    fixture = TestBed.createComponent(RenameFileDialogComponent);
    component = fixture.componentInstance;
    dialogRef = TestBed.inject(DynamicDialogRef);
    dialogConfig = TestBed.inject(DynamicDialogConfig);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with correct properties', () => {
    expect(component.nameMaxLength).toBe(InputLimits.title.maxLength);
    expect(component.nameMinLength).toBe(InputLimits.title.minLength);
    expect(component.renameForm).toBeDefined();
  });

  it('should initialize form with current name from config', () => {
    expect(component.renameForm.controls.name.value).toBe('test-file.txt');
  });

  it('should be invalid when name is empty', () => {
    component.renameForm.controls.name.setValue('');
    expect(component.renameForm.controls.name.hasError('required')).toBe(true);
    expect(component.renameForm.invalid).toBe(true);
  });

  it('should be invalid when name contains forbidden characters', () => {
    component.renameForm.controls.name.setValue('file/name');
    expect(component.renameForm.controls.name.hasError('forbiddenCharacters')).toBe(true);
  });

  it('should be invalid when name ends with period', () => {
    component.renameForm.controls.name.setValue('filename.');
    expect(component.renameForm.controls.name.hasError('periodAtEnd')).toBe(true);
  });

  it('should be invalid when name is shorter than min length', () => {
    component.renameForm.controls.name.setValue('A'.repeat(InputLimits.title.minLength - 1));

    expect(component.renameForm.controls.name.hasError('minlength')).toBe(true);
  });

  it('should be invalid when name exceeds max length', () => {
    component.renameForm.controls.name.setValue('A'.repeat(InputLimits.title.maxLength + 1));

    expect(component.renameForm.controls.name.hasError('maxlength')).toBe(true);
  });

  it('should be valid when name passes all validations', () => {
    component.renameForm.controls.name.setValue('valid-filename');
    expect(component.renameForm.valid).toBe(true);
  });

  it('should close dialog with trimmed name when onSubmit is called with valid form', () => {
    component.renameForm.controls.name.setValue('  new-filename.txt  ');

    component.onSubmit();

    expect(dialogRef.close).toHaveBeenCalledWith('new-filename.txt');
  });

  it('should not close dialog when onSubmit is called with invalid form', () => {
    component.renameForm.controls.name.setValue('');

    component.onSubmit();

    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('should close dialog without result when onCancel is called', () => {
    component.onCancel();

    expect(dialogRef.close).toHaveBeenCalledWith();
  });

  it('should handle empty config data', () => {
    dialogConfig.data = undefined;
    fixture = TestBed.createComponent(RenameFileDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.renameForm.controls.name.value).toBe('');
  });
});
