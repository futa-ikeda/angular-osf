import { FileModel } from '@osf/shared/models/files/file.model';

export interface FileMoveLinkModel {
  file: FileModel;
  link: string;
}
