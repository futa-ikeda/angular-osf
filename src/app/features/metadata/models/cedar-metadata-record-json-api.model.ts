import { Embed } from '@osf/shared/models/common/json-api/embeds.model';
import { ToOneRelData } from '@osf/shared/models/common/json-api/relationships.model';
import { DataResponse, ListResponse } from '@osf/shared/models/common/json-api/responses.model';

import { CedarMetadataAttributes } from './cedar-metadata-attributes.model';
import { CedarMetadataDataTemplateJsonApi } from './cedar-metadata-template-json-api.model';

export type CedarMetadataRecordJsonApi = ListResponse<CedarMetadataRecordDataJsonApi>;
export type CedarMetadataRecordResponseJsonApi = DataResponse<CedarMetadataRecordDataJsonApi>;

export interface CedarMetadataRecordDataJsonApi {
  id?: string;
  type?: string;
  attributes: CedarMetadataRecordAttributesJsonApi;
  embeds?: {
    template: Embed<CedarMetadataDataTemplateJsonApi>;
  };
  relationships: {
    template: ToOneRelData;
    target: ToOneRelData;
  };
}

interface CedarMetadataRecordAttributesJsonApi {
  metadata: CedarMetadataAttributes;
  is_published: boolean;
}
