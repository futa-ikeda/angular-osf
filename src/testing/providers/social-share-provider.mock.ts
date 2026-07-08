import { Mock } from 'vitest';

import { SocialShareContentModel } from '@osf/shared/models/socials/social-share-content.model';
import { SocialShareLinksModel } from '@osf/shared/models/socials/social-share-links.model';
import { SocialsShareActionItem } from '@osf/shared/models/socials/socials-share-action-item.model';
import { SocialShareService } from '@osf/shared/services/social-share.service';

import { SOCIAL_SHARE_LINKS_MOCK } from '@testing/mocks/social-share-links.mock';

export type SocialShareServiceMockType = Partial<SocialShareService> & {
  getEmailLink: Mock<(title: string, url: string) => string>;
  getXLink: Mock<(title: string, url: string) => string>;
  getFacebookLink: Mock<(url: string) => string>;
  getFacebookCustomLink: Mock<(url: string) => string>;
  generateAllSharingLinks: Mock<(content: SocialShareContentModel) => SocialShareLinksModel>;
  createPreprintUrl: Mock<(preprintId: string, providerId: string) => string>;
  createGuidUrl: Mock<(guid: string) => string>;
  createDownloadUrl: Mock<(resourceId: string) => string>;
  generateSocialActionItems: Mock<(content: SocialShareContentModel) => SocialsShareActionItem[]>;
};

export class SocialShareServiceMockBuilder {
  private webUrlValue = 'https://osf.io';
  private getEmailLinkMock: Mock<(title: string, url: string) => string> = vi.fn(
    (_title: string, _url: string) => 'mailto:?subject=&body='
  );
  private getXLinkMock: Mock<(title: string, url: string) => string> = vi.fn(
    (_title: string, _url: string) => 'https://twitter.com/intent/tweet'
  );
  private getFacebookLinkMock: Mock<(url: string) => string> = vi.fn(
    (_url: string) => 'https://www.facebook.com/sharer/sharer.php'
  );
  private getFacebookCustomLinkMock: Mock<(url: string) => string> = vi.fn(
    (_url: string) => 'https://www.facebook.com/dialog/share'
  );
  private generateAllSharingLinksMock: Mock<(content: SocialShareContentModel) => SocialShareLinksModel> = vi.fn(
    () => SOCIAL_SHARE_LINKS_MOCK
  );
  private createPreprintUrlMock: Mock<(preprintId: string, providerId: string) => string> = vi.fn(
    (preprintId: string, providerId: string) => `${this.webUrlValue}/preprints/${providerId}/${preprintId}`
  );
  private createGuidUrlMock: Mock<(guid: string) => string> = vi.fn((guid: string) => `${this.webUrlValue}/${guid}`);
  private createDownloadUrlMock: Mock<(resourceId: string) => string> = vi.fn(
    (resourceId: string) => `${this.webUrlValue}/download/${resourceId}`
  );
  private generateSocialActionItemsMock: Mock<(content: SocialShareContentModel) => SocialsShareActionItem[]> = vi.fn(
    () => []
  );

  static create(): SocialShareServiceMockBuilder {
    return new SocialShareServiceMockBuilder();
  }

  withWebUrl(value: string): SocialShareServiceMockBuilder {
    this.webUrlValue = value;
    return this;
  }

  withGetEmailLink(mockImpl: Mock<(title: string, url: string) => string>): SocialShareServiceMockBuilder {
    this.getEmailLinkMock = mockImpl;
    return this;
  }

  withGetXLink(mockImpl: Mock<(title: string, url: string) => string>): SocialShareServiceMockBuilder {
    this.getXLinkMock = mockImpl;
    return this;
  }

  withGetFacebookLink(mockImpl: Mock<(url: string) => string>): SocialShareServiceMockBuilder {
    this.getFacebookLinkMock = mockImpl;
    return this;
  }

  withGetFacebookCustomLink(mockImpl: Mock<(url: string) => string>): SocialShareServiceMockBuilder {
    this.getFacebookCustomLinkMock = mockImpl;
    return this;
  }

  withGenerateAllSharingLinks(
    mockImpl: Mock<(content: SocialShareContentModel) => SocialShareLinksModel>
  ): SocialShareServiceMockBuilder {
    this.generateAllSharingLinksMock = mockImpl;
    return this;
  }

  withCreatePreprintUrl(
    mockImpl: Mock<(preprintId: string, providerId: string) => string>
  ): SocialShareServiceMockBuilder {
    this.createPreprintUrlMock = mockImpl;
    return this;
  }

  withCreateGuidUrl(mockImpl: Mock<(guid: string) => string>): SocialShareServiceMockBuilder {
    this.createGuidUrlMock = mockImpl;
    return this;
  }

  withCreateDownloadUrl(mockImpl: Mock<(resourceId: string) => string>): SocialShareServiceMockBuilder {
    this.createDownloadUrlMock = mockImpl;
    return this;
  }

  withGenerateSocialActionItems(
    mockImpl: Mock<(content: SocialShareContentModel) => SocialsShareActionItem[]>
  ): SocialShareServiceMockBuilder {
    this.generateSocialActionItemsMock = mockImpl;
    return this;
  }

  build(): SocialShareServiceMockType {
    const webUrl = this.webUrlValue;
    return {
      get webUrl() {
        return webUrl;
      },
      getEmailLink: this.getEmailLinkMock,
      getXLink: this.getXLinkMock,
      getFacebookLink: this.getFacebookLinkMock,
      getFacebookCustomLink: this.getFacebookCustomLinkMock,
      generateAllSharingLinks: this.generateAllSharingLinksMock,
      createPreprintUrl: this.createPreprintUrlMock,
      createGuidUrl: this.createGuidUrlMock,
      createDownloadUrl: this.createDownloadUrlMock,
      generateSocialActionItems: this.generateSocialActionItemsMock,
    } as SocialShareServiceMockType;
  }
}

export const SocialShareServiceMock = {
  create() {
    return SocialShareServiceMockBuilder.create();
  },
  simple() {
    return SocialShareServiceMockBuilder.create().build();
  },
};
