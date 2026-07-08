import { FileKind } from '@osf/shared/enums/file-kind.enum';
import { FileModel } from '@osf/shared/models/files/file.model';

export const FileModelMock = {
  simple(overrides: Partial<FileModel> = {}): FileModel {
    return {
      id: 'file-id',
      guid: null,
      name: 'test-file',
      kind: FileKind.File,
      path: '/test-file',
      size: 0,
      materializedPath: '/test-file',
      dateModified: '',
      extra: {
        hashes: { md5: '', sha256: '' },
        downloads: 0,
      },
      links: {
        info: '',
        move: 'move',
        upload: '',
        delete: '',
        download: '',
        render: '',
        html: '',
        self: '',
      },
      filesLink: null,
      previousFolder: false,
      provider: 'osfstorage',
      ...overrides,
    };
  },
};
