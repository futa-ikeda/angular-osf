import { NodeShortInfoModel } from '@osf/shared/models/nodes/node-with-children.model';
import { SelectOption } from '@osf/shared/models/select-option.model';

import { ProjectPathOptionsParams } from '../models/files/project-path-options.model';

export function buildProjectPathOptions({
  nodes = [],
  parentPath = '..',
  rootProjectId,
}: ProjectPathOptionsParams): SelectOption[] {
  return nodes.reduce<SelectOption[]>((acc, node) => {
    const pathParts: string[] = [];

    let current: NodeShortInfoModel | undefined = node;
    while (current) {
      pathParts.unshift(current.title ?? '');
      current = nodes.find((n) => n.id === current?.parentId);
    }

    const isRootProject = !!rootProjectId && node.id === rootProjectId;
    const basePath = isRootProject ? '' : parentPath;
    const fullPath = basePath ? `${basePath}/${pathParts.join('/')}` : pathParts.join('/');

    acc.push({
      value: node.id,
      label: fullPath,
    });

    return acc;
  }, []);
}
