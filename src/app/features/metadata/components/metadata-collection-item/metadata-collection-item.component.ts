import { TranslatePipe } from '@ngx-translate/core';

import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  CUSTOM_ELEMENTS_SCHEMA,
  input,
  ViewEncapsulation,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { CollectionSubmissionReviewState } from '@osf/shared/enums/collection-submission-review-state.enum';
import { CollectionSubmission } from '@osf/shared/models/collections/collection-submissions.model';
import { CollectionStatusSeverityPipe } from '@osf/shared/pipes/collection-status-severity.pipe';

import { CEDAR_VIEWER_CONFIG } from '../../constants';
import { CedarMetadataRecordModel, CedarMetadataTemplateModel } from '../../models';

@Component({
  selector: 'osf-metadata-collection-item',
  imports: [TranslatePipe, Tag, Button, RouterLink, CollectionStatusSeverityPipe],
  templateUrl: './metadata-collection-item.component.html',
  styleUrl: './metadata-collection-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None,
})
export class MetadataCollectionItemComponent {
  readonly CollectionSubmissionReviewState = CollectionSubmissionReviewState;

  submission = input.required<CollectionSubmission>();
  cedarRecord = input<CedarMetadataRecordModel | null>(null);
  cedarTemplate = input<CedarMetadataTemplateModel | null>(null);

  cedarViewerConfig = CEDAR_VIEWER_CONFIG;

  showSubmissionButton = computed(() => this.submission().reviewsState === CollectionSubmissionReviewState.Accepted);

  submissionButtonLabel = computed(() =>
    this.submission().reviewsState === CollectionSubmissionReviewState.Removed
      ? 'common.buttons.resubmit'
      : 'common.buttons.edit'
  );

  showCedarViewer = computed(
    () =>
      !!this.cedarRecord() &&
      !!this.cedarTemplate()?.template &&
      this.submission().reviewsState !== CollectionSubmissionReviewState.Removed
  );

  cedarMetadata = computed(() => {
    const record = this.cedarRecord();
    return record?.metadata ? (record.metadata as Record<string, unknown>) : {};
  });
}
