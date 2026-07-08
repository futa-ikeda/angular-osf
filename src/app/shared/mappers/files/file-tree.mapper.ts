import { FileModel } from '@shared/models/files/file.model';
import { FileTreeNode } from '@shared/models/files/file-tree-node.model';

export class FileTreeMapper {
  static toTreeNode(file: FileModel): FileTreeNode {
    return {
      key: file.id,
      label: file.name,
      data: file,
    };
  }

  static toTreeNodes(files: FileModel[]): FileTreeNode[] {
    return files.map((file) => this.toTreeNode(file));
  }
}
