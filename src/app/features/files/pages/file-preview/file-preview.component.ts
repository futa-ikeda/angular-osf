import { createDispatchMap, select } from '@ngxs/store';

import { TranslatePipe } from '@ngx-translate/core';

import { switchMap } from 'rxjs';

import { ChangeDetectionStrategy, Component, computed, DestroyRef, HostBinding, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';

import { LoadingSpinnerComponent } from '@osf/shared/components/loading-spinner/loading-spinner.component';
import { SubHeaderComponent } from '@osf/shared/components/sub-header/sub-header.component';
import { getMfrUrlWithVersion } from '@osf/shared/helpers/mfr-url.helper';
import { ViewOnlyLinkHelperService } from '@osf/shared/services/view-only-link-helper.service';

import { FilesSelectors, GetFile } from '../../store';

@Component({
  selector: 'osf-draft-file-detail',
  imports: [SubHeaderComponent, LoadingSpinnerComponent, TranslatePipe],
  templateUrl: './file-preview.component.html',
  styleUrl: './file-preview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilePreviewComponent {
  @HostBinding('class') classes = 'flex flex-column flex-1 w-full h-full';

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly destroyRef = inject(DestroyRef);
  private readonly viewOnlyService = inject(ViewOnlyLinkHelperService);

  private readonly actions = createDispatchMap({ getFile: GetFile });

  file = select(FilesSelectors.getOpenedFile);
  isFileLoading = select(FilesSelectors.isOpenedFileLoading);

  isIframeLoading = true;
  safeLink: SafeResourceUrl | null = null;

  hasViewOnly = computed(() => this.viewOnlyService.hasViewOnlyParam(this.router));

  constructor() {
    this.route.params
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((params) => this.actions.getFile(params['fileGuid']))
      )
      .subscribe(() => this.getIframeLink());
  }

  getIframeLink() {
    const viewOnlyParam = this.hasViewOnly() ? this.viewOnlyService.getViewOnlyParam() : null;
    const url = getMfrUrlWithVersion(this.file()?.links.render, '', viewOnlyParam);

    if (url) {
      this.safeLink = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
  }
}
