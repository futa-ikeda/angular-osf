import { MockProvider } from 'ng-mocks';

import { Mock } from 'vitest';

import { Clipboard } from '@angular/cdk/clipboard';
import { TestBed } from '@angular/core/testing';

import { ToastService } from '@osf/shared/services/toast.service';

import { FileModelMock } from '@testing/mocks/file.model.mock';
import {
  SocialShareServiceMockBuilder,
  SocialShareServiceMockType,
} from '@testing/providers/social-share-provider.mock';
import { ToastServiceMock, ToastServiceMockType } from '@testing/providers/toast-provider.mock';

import { embedDynamicJs, embedStaticHtml } from '../constants/file-embed.constants';

import { FilesShareEmbedService } from './files-share-embed.service';
import { SocialShareService } from './social-share.service';

describe('FilesShareEmbedService', () => {
  let service: FilesShareEmbedService;
  let clipboardMock: Pick<Clipboard, 'copy'>;
  let copyMock: Mock<(text: string) => boolean>;
  let socialShareServiceMock: SocialShareServiceMockType;
  let toastService: ToastServiceMockType;

  function setup() {
    copyMock = vi.fn((_: string) => true);
    clipboardMock = { copy: copyMock };
    socialShareServiceMock = SocialShareServiceMockBuilder.create()
      .withGetEmailLink(vi.fn((_: string, __: string) => 'mailto:test'))
      .withGetXLink(vi.fn((_: string, __: string) => 'https://x.test'))
      .withGetFacebookLink(vi.fn((_: string) => 'https://facebook.test'))
      .build();
    toastService = ToastServiceMock.simple();

    TestBed.configureTestingModule({
      providers: [
        FilesShareEmbedService,
        MockProvider(Clipboard, clipboardMock),
        MockProvider(SocialShareService, socialShareServiceMock),
        MockProvider(ToastService, toastService),
      ],
    });

    service = TestBed.inject(FilesShareEmbedService);
  }

  it('should create', () => {
    setup();
    expect(service).toBeTruthy();
  });

  it('should return null share link when file html link is missing', () => {
    setup();
    const file = FileModelMock.simple({ links: { ...FileModelMock.simple().links, html: '' } });

    const result = service.getShareLink(file, 'email');

    expect(result).toBeNull();
  });

  it('should build email share link', () => {
    setup();
    const file = FileModelMock.simple({ name: 'Report', links: { ...FileModelMock.simple().links, html: '/html' } });

    const result = service.getShareLink(file, 'email');

    expect(socialShareServiceMock.getEmailLink).toHaveBeenCalledWith('Report', '/html');
    expect(result).toEqual({ link: 'mailto:test', target: '_self' });
  });

  it('should build x and facebook links with _blank target', () => {
    setup();
    const file = FileModelMock.simple({ name: 'Report', links: { ...FileModelMock.simple().links, html: '/html' } });

    const xResult = service.getShareLink(file, 'twitter');
    const fbResult = service.getShareLink(file, 'facebook');

    expect(socialShareServiceMock.getXLink).toHaveBeenCalledWith('Report', '/html');
    expect(socialShareServiceMock.getFacebookLink).toHaveBeenCalledWith('/html');
    expect(xResult).toEqual({ link: 'https://x.test', target: '_blank' });
    expect(fbResult).toEqual({ link: 'https://facebook.test', target: '_blank' });
  });

  it('should return null for unknown share type', () => {
    setup();
    const file = FileModelMock.simple({ links: { ...FileModelMock.simple().links, html: '/html' } });

    const result = service.getShareLink(file, 'unknown');

    expect(result).toBeNull();
  });

  it('should generate dynamic and static embed html', () => {
    setup();
    const url = 'https://mfr.osf.io/render?url=abc';

    const dynamic = service.getEmbedHtml(url, 'dynamic');
    const stat = service.getEmbedHtml(url, 'static');
    const empty = service.getEmbedHtml(url, 'unknown');

    expect(dynamic).toBe(embedDynamicJs.replace('ENCODED_URL', url));
    expect(stat).toBe(embedStaticHtml.replace('ENCODED_URL', url));
    expect(empty).toBe('');
  });

  it('should copy embed html and show success toast when clipboard copy succeeds', () => {
    setup();
    copyMock.mockReturnValue(true);

    const result = service.copyEmbedToClipboard('https://mfr.osf.io/render?url=abc', 'dynamic');

    expect(clipboardMock.copy).toHaveBeenCalled();
    expect(toastService.showSuccess).toHaveBeenCalledWith('files.detail.toast.copiedToClipboard');
    expect(result).toBe(true);
  });

  it('should return false and skip toast when embed type is invalid', () => {
    setup();

    const result = service.copyEmbedToClipboard('https://mfr.osf.io/render?url=abc', 'invalid');

    expect(clipboardMock.copy).not.toHaveBeenCalled();
    expect(toastService.showSuccess).not.toHaveBeenCalled();
    expect(result).toBe(false);
  });
});
