import { TranslatePipe } from '@ngx-translate/core';

import { Button } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { LANGUAGE_CODES } from '@osf/shared/constants/language.const';
import { resourceTypes } from '@osf/shared/constants/resource-types.const';

import { OsfFileCustomMetadata } from '../../models/file-custom-metadata.model';
import { PatchFileMetadata } from '../../models/patch-file-metadata.model';

@Component({
  selector: 'osf-edit-file-metadata-dialog',
  imports: [Button, InputText, Textarea, Select, ReactiveFormsModule, TranslatePipe],
  templateUrl: './edit-file-metadata-dialog.component.html',
  styleUrl: './edit-file-metadata-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditFileMetadataDialogComponent {
  readonly resourceTypes = resourceTypes;
  readonly languages = LANGUAGE_CODES;

  private readonly dialogRef = inject(DynamicDialogRef);
  readonly config = inject(DynamicDialogConfig);

  readonly fileMetadataForm = new FormGroup({
    title: new FormControl<string | null>(null),
    description: new FormControl<string | null>(null),
    resourceType: new FormControl<string | null>(null),
    resourceLanguage: new FormControl<string | null>(null),
  });

  constructor() {
    this.initializeForm();
  }

  private initializeForm(): void {
    const fileMetadata = this.config.data as Partial<OsfFileCustomMetadata> | undefined;
    const resourceTypeGeneral = fileMetadata?.resourceTypeGeneral ?? '';
    const language = fileMetadata?.language ?? '';

    this.fileMetadataForm.patchValue({
      title: fileMetadata?.title ?? null,
      description: fileMetadata?.description ?? null,
      resourceType: resourceTypeGeneral.length ? resourceTypeGeneral : null,
      resourceLanguage: language.length ? language : null,
    });
  }

  setFileMetadata() {
    if (this.fileMetadataForm.invalid) {
      return;
    }

    const { title, description, resourceType, resourceLanguage } = this.fileMetadataForm.getRawValue();
    const formValues: PatchFileMetadata = {
      title: title ?? null,
      description: description ?? null,
      resource_type_general: resourceType ?? '',
      language: resourceLanguage ?? '',
    };

    this.dialogRef.close(formValues);
  }

  cancel() {
    this.dialogRef.close();
  }
}
