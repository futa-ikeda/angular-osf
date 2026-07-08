import { createDispatchMap, select } from '@ngxs/store';

import { TranslatePipe } from '@ngx-translate/core';

import { Button } from 'primeng/button';
import { Chip } from 'primeng/chip';
import { InputText } from 'primeng/inputtext';
import { Skeleton } from 'primeng/skeleton';

import { ChangeDetectionStrategy, Component, computed, DestroyRef, effect, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { InputLimits } from '@osf/shared/constants/input-limits.const';
import { CustomValidators } from '@osf/shared/helpers/custom-form-validators.helper';
import { ViewOnlyLinkHelperService } from '@osf/shared/services/view-only-link-helper.service';

import { FilesSelectors, UpdateTags } from '../../store';

@Component({
  selector: 'osf-file-keywords',
  imports: [Button, Chip, Skeleton, InputText, ReactiveFormsModule, TranslatePipe],
  templateUrl: './file-keywords.component.html',
  styleUrls: ['./file-keywords.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileKeywordsComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly viewOnlyService = inject(ViewOnlyLinkHelperService);

  private readonly actions = createDispatchMap({ updateTags: UpdateTags });

  readonly tags = select(FilesSelectors.getFileTags);
  readonly isTagsLoading = select(FilesSelectors.isFileTagsLoading);
  readonly file = select(FilesSelectors.getOpenedFile);
  readonly hasWriteAccess = select(FilesSelectors.hasWriteAccess);

  readonly canManageTags = computed(() => !this.viewOnlyService.hasViewOnlyParam(this.router) && this.hasWriteAccess());
  readonly canEditTags = computed(() => this.canManageTags() && !this.isTagsLoading());

  keywordControl = new FormControl('', {
    nonNullable: true,
    validators: [CustomValidators.requiredTrimmed(), Validators.maxLength(InputLimits.name.maxLength)],
  });

  constructor() {
    effect(() => {
      if (this.isTagsLoading()) {
        this.keywordControl.disable({ emitEvent: false });
      } else {
        this.keywordControl.enable({ emitEvent: false });
      }
    });
  }

  addTag(): void {
    const fileGuid = this.file()?.guid;

    if (!this.canEditTags() || this.keywordControl.invalid || !fileGuid) {
      return;
    }

    const updatedTags = [...this.tags(), this.keywordControl.value.trim()];
    this.updateTags(updatedTags, fileGuid);
  }

  deleteTag(value: string): void {
    const fileGuid = this.file()?.guid;

    if (!this.canEditTags() || !fileGuid) {
      return;
    }

    const updatedTags = [...this.tags()];
    const tagIndex = updatedTags.indexOf(value);

    if (tagIndex < 0) {
      return;
    }

    updatedTags.splice(tagIndex, 1);
    this.updateTags(updatedTags, fileGuid);
  }

  private updateTags(updatedTags: string[], fileGuid: string) {
    this.actions
      .updateTags(updatedTags, fileGuid)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.keywordControl.reset());
  }
}
