import { Mock } from 'vitest';

import { SignpostingService } from '@osf/shared/services/signposting.service';

export type SignpostingServiceMockType = Partial<SignpostingService> & {
  addSignposting: Mock<(guid: string) => void>;
  addMetadataSignposting: Mock<(guid: string) => void>;
  removeSignpostingLinkTags: Mock<() => void>;
};

export class SignpostingServiceMockBuilder {
  private addSignpostingMock: Mock<(guid: string) => void> = vi.fn();
  private addMetadataSignpostingMock: Mock<(guid: string) => void> = vi.fn();
  private removeSignpostingLinkTagsMock: Mock<() => void> = vi.fn();

  static create(): SignpostingServiceMockBuilder {
    return new SignpostingServiceMockBuilder();
  }

  withAddSignposting(mockImpl: Mock<(guid: string) => void>): SignpostingServiceMockBuilder {
    this.addSignpostingMock = mockImpl;
    return this;
  }

  withAddMetadataSignposting(mockImpl: Mock<(guid: string) => void>): SignpostingServiceMockBuilder {
    this.addMetadataSignpostingMock = mockImpl;
    return this;
  }

  withRemoveSignpostingLinkTags(mockImpl: Mock<() => void>): SignpostingServiceMockBuilder {
    this.removeSignpostingLinkTagsMock = mockImpl;
    return this;
  }

  build(): SignpostingServiceMockType {
    return {
      addSignposting: this.addSignpostingMock,
      addMetadataSignposting: this.addMetadataSignpostingMock,
      removeSignpostingLinkTags: this.removeSignpostingLinkTagsMock,
    } as SignpostingServiceMockType;
  }
}

export const SignpostingServiceMock = {
  create() {
    return SignpostingServiceMockBuilder.create();
  },
  simple() {
    return SignpostingServiceMockBuilder.create().build();
  },
};
