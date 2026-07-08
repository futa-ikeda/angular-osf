import { Mock } from 'vitest';

import { FileModel } from '@osf/shared/models/files/file.model';
import { FileShareLink } from '@osf/shared/models/files/file-share-link.model';
import { FilesShareEmbedService } from '@osf/shared/services/files-share-embed.service';

export type FilesShareEmbedServiceMockType = Partial<FilesShareEmbedService> & {
  getShareLink: Mock<(file: FileModel, shareType?: string) => FileShareLink | null>;
  getEmbedHtml: Mock<(url: string, embedType?: string) => string>;
  copyEmbedToClipboard: Mock<(url: string, embedType?: string) => boolean>;
};

export class FilesShareEmbedServiceMockBuilder {
  private getShareLinkMock: Mock<(file: FileModel, shareType?: string) => FileShareLink | null> = vi.fn(() => null);
  private getEmbedHtmlMock: Mock<(url: string, embedType?: string) => string> = vi.fn(() => '');
  private copyEmbedToClipboardMock: Mock<(url: string, embedType?: string) => boolean> = vi.fn(() => true);

  static create(): FilesShareEmbedServiceMockBuilder {
    return new FilesShareEmbedServiceMockBuilder();
  }

  withGetShareLink(
    mockImpl: Mock<(file: FileModel, shareType?: string) => FileShareLink | null>
  ): FilesShareEmbedServiceMockBuilder {
    this.getShareLinkMock = mockImpl;
    return this;
  }

  withGetEmbedHtml(mockImpl: Mock<(url: string, embedType?: string) => string>): FilesShareEmbedServiceMockBuilder {
    this.getEmbedHtmlMock = mockImpl;
    return this;
  }

  withCopyEmbedToClipboard(
    mockImpl: Mock<(url: string, embedType?: string) => boolean>
  ): FilesShareEmbedServiceMockBuilder {
    this.copyEmbedToClipboardMock = mockImpl;
    return this;
  }

  build(): FilesShareEmbedServiceMockType {
    return {
      getShareLink: this.getShareLinkMock,
      getEmbedHtml: this.getEmbedHtmlMock,
      copyEmbedToClipboard: this.copyEmbedToClipboardMock,
    } as FilesShareEmbedServiceMockType;
  }
}

export const FilesShareEmbedServiceMock = {
  create() {
    return FilesShareEmbedServiceMockBuilder.create();
  },
  simple() {
    return FilesShareEmbedServiceMockBuilder.create().build();
  },
};
