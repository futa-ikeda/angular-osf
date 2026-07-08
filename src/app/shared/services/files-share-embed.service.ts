import { Clipboard } from '@angular/cdk/clipboard';
import { inject, Injectable } from '@angular/core';

import { embedDynamicJs, embedStaticHtml } from '@shared/constants/file-embed.constants';

import { FileModel } from '../models/files/file.model';
import { FileShareLink } from '../models/files/file-share-link.model';

import { SocialShareService } from './social-share.service';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root',
})
export class FilesShareEmbedService {
  private readonly clipboard = inject(Clipboard);
  private readonly socialShareService = inject(SocialShareService);
  private readonly toastService = inject(ToastService);

  private readonly EMBED_PLACEHOLDER = 'ENCODED_URL';

  getShareLink(file: FileModel, shareType?: string): FileShareLink | null {
    const name = file.name ?? '';
    const url = file.links?.html ?? '';

    if (!url) {
      return null;
    }

    switch (shareType) {
      case 'email':
        return {
          link: this.socialShareService.getEmailLink(name, url),
          target: '_self',
        };
      case 'twitter':
        return {
          link: this.socialShareService.getXLink(name, url),
          target: '_blank',
        };
      case 'facebook':
        return {
          link: this.socialShareService.getFacebookLink(url),
          target: '_blank',
        };
      default:
        return null;
    }
  }

  getEmbedHtml(url: string, embedType?: string): string {
    switch (embedType) {
      case 'dynamic':
        return embedDynamicJs.replace(this.EMBED_PLACEHOLDER, url);
      case 'static':
        return embedStaticHtml.replace(this.EMBED_PLACEHOLDER, url);
      default:
        return '';
    }
  }

  copyEmbedToClipboard(url: string, embedType?: string): boolean {
    const embedHtml = this.getEmbedHtml(url, embedType);

    if (!embedHtml) {
      return false;
    }

    const copied = this.clipboard.copy(embedHtml);

    if (copied) {
      this.toastService.showSuccess('files.detail.toast.copiedToClipboard');
    }

    return copied;
  }
}
