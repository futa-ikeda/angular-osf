import { PaginationLinks } from '@osf/shared/models/common/json-api/links.model';

import { CedarTemplate } from './cedar-template.model';

export interface CedarMetadataTemplateModel {
  id: string;
  schemaName: string;
  isForCollections: boolean;
  active: boolean;
  cedarId: string;
  template: CedarTemplate;
}

export interface PaginatedCedarTemplatesModel {
  data: CedarMetadataTemplateModel[];
  links: PaginationLinks;
}
