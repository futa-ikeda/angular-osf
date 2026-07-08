import { FileModel } from '@osf/shared/models/files/file.model';
import { FileFolderModel } from '@osf/shared/models/files/file-folder.model';

import { MoveCopyAction } from '../enums/move-copy-action.enum';

export interface MoveCopyOptions {
  files: FileModel[];
  destination: FileModel | FileFolderModel | null | undefined;
  resourceId: string;
  storageProvider: string;
  action: MoveCopyAction;
}
