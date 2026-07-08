import { NodeShortInfoModel } from '../nodes/node-with-children.model';

export interface ProjectPathOptionsParams {
  nodes?: NodeShortInfoModel[];
  parentPath?: string;
  rootProjectId?: string;
}
