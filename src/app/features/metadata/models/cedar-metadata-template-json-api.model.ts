import { JsonApiResource } from '@osf/shared/models/common/json-api/resource.model';
import { ListResponse } from '@osf/shared/models/common/json-api/responses.model';

import { CedarTemplate } from './cedar-template.model';

export type CedarMetadataTemplateJsonApi = ListResponse<CedarMetadataDataTemplateJsonApi>;

export type CedarMetadataDataTemplateJsonApi = JsonApiResource<
  'cedar-metadata-templates',
  CedarMetadataTemplateAttributesJsonApi
>;

interface CedarMetadataTemplateAttributesJsonApi {
  active: boolean;
  cedar_id: string;
  schema_name: string;
  template: CedarTemplate;
  is_for_collections: boolean;
}
