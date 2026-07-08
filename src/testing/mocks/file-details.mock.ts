import { FileKind } from '@osf/shared/enums/file-kind.enum';
import { FileDetailsModel } from '@osf/shared/models/files/file.model';

import { MOCK_PROJECT_OVERVIEW } from './project-overview.mock';

export const FileDetailsMock = {
  simple(overrides: Partial<FileDetailsModel> = {}): FileDetailsModel {
    return {
      id: 'file-id',
      guid: 'file-guid',
      name: 'file-name.pdf',
      kind: FileKind.File,
      path: '/file-name.pdf',
      size: 100,
      materializedPath: '/file-name.pdf',
      dateModified: '2024-01-05T00:00:00Z',
      extra: {
        hashes: {
          md5: 'md5',
          sha256: 'sha256',
        },
        downloads: 1,
      },
      lastTouched: null,
      dateCreated: '2024-01-04T00:00:00Z',
      tags: [],
      currentVersion: 1,
      showAsUnviewed: false,
      links: {
        info: 'info',
        move: 'move',
        upload: 'upload',
        delete: 'delete',
        download: 'download',
        render: 'render',
        html: 'html',
        self: 'self',
      },
      target: MOCK_PROJECT_OVERVIEW,
      ...overrides,
    };
  },
};
