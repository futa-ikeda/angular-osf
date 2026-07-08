import { FileModel } from '@osf/shared/models/files/file.model';

import { MoveCopyAction } from '../enums/move-copy-action.enum';

export interface MenuMoveCopyPayload {
  file: FileModel;
  action: MoveCopyAction;
}
