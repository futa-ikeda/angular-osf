import { Mock, vi } from 'vitest';

import { StorageService } from '@core/services/storage.service';
import { UserModel } from '@osf/shared/models/user/user.model';

export type StorageServiceMockType = Pick<
  StorageService,
  'getCachedUser' | 'setCachedUser' | 'getCachedActiveFlags' | 'setCachedActiveFlags' | 'clearSession'
> & {
  getCachedUser: Mock<StorageService['getCachedUser']>;
  setCachedUser: Mock<StorageService['setCachedUser']>;
  getCachedActiveFlags: Mock<StorageService['getCachedActiveFlags']>;
  setCachedActiveFlags: Mock<StorageService['setCachedActiveFlags']>;
  clearSession: Mock<StorageService['clearSession']>;
};

export class StorageServiceMockBuilder {
  private getCachedUserMock: Mock<StorageService['getCachedUser']> = vi.fn().mockReturnValue(null);
  private setCachedUserMock: Mock<StorageService['setCachedUser']> = vi.fn();
  private getCachedActiveFlagsMock: Mock<StorageService['getCachedActiveFlags']> = vi.fn().mockReturnValue([]);
  private setCachedActiveFlagsMock: Mock<StorageService['setCachedActiveFlags']> = vi.fn();
  private clearSessionMock: Mock<StorageService['clearSession']> = vi.fn();

  static create(): StorageServiceMockBuilder {
    return new StorageServiceMockBuilder();
  }

  withCachedUser(user: UserModel | null): StorageServiceMockBuilder {
    this.getCachedUserMock.mockReturnValue(user);
    return this;
  }

  withCachedActiveFlags(flags: string[]): StorageServiceMockBuilder {
    this.getCachedActiveFlagsMock.mockReturnValue(flags);
    return this;
  }

  build(): StorageServiceMockType {
    return {
      getCachedUser: this.getCachedUserMock,
      setCachedUser: this.setCachedUserMock,
      getCachedActiveFlags: this.getCachedActiveFlagsMock,
      setCachedActiveFlags: this.setCachedActiveFlagsMock,
      clearSession: this.clearSessionMock,
    };
  }
}

export const StorageServiceMock = {
  create() {
    return StorageServiceMockBuilder.create();
  },
  simple() {
    return StorageServiceMockBuilder.create().build();
  },
};
