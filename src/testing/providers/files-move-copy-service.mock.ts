import { Observable, of } from 'rxjs';

import { Mock, vi } from 'vitest';

import { MoveCopyOptions } from '@osf/features/files/models/move-copy-options.model';
import { FilesMoveCopyService } from '@osf/features/files/services/files-move-copy.service';

type ExecuteFn = (options: MoveCopyOptions) => Observable<boolean>;

export type FilesMoveCopyServiceMockType = Pick<FilesMoveCopyService, 'execute'> & {
  execute: Mock<ExecuteFn>;
};

export const FilesMoveCopyServiceMock = {
  simple(): FilesMoveCopyServiceMockType {
    return {
      execute: vi.fn().mockReturnValue(of(true)),
    } as FilesMoveCopyServiceMockType;
  },
};
