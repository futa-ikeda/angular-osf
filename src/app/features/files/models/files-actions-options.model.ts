import { Observable } from 'rxjs';

import { FileModel } from '@shared/models/files/file.model';
import { FileFolderModel } from '@shared/models/files/file-folder.model';

import { MoveCopyAction } from '../enums/move-copy-action.enum';

export interface DeleteSelectedOptions {
  files: FileModel[];
  deleteEntry: (link: string) => Observable<unknown>;
  onSuccess: () => void;
}

export interface MoveFilesOptions {
  files: FileModel[];
  action: MoveCopyAction;
  resourceId: string;
  storageProvider: string;
  foldersStack: FileFolderModel[];
  initialFolder: FileFolderModel | null | undefined;
}

export interface DropMovePayload {
  files: FileModel[];
  destination: FileModel;
}

export interface ConfirmMoveFilesOptions extends DropMovePayload {
  resourceId: string;
  storageProvider: string;
}

export interface CreateFolderOptions {
  newFolderLink: string;
  createFolder: (newFolderLink: string, folderName: string) => Observable<unknown>;
}
