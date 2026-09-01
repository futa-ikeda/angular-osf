import { CedarMetadataMapper } from '@osf/features/metadata/mappers';
import { CedarMetadataRecordModel, CedarMetadataTemplateModel } from '@osf/features/metadata/models';

import { CEDAR_METADATA_DATA_TEMPLATE_JSON_API_MOCK } from './cedar-metadata-data-template-json-api.mock';
import { MOCK_CEDAR_METADATA_RECORD_DATA } from './cedar-metadata-record.mock';

export const MOCK_CEDAR_METADATA_TEMPLATE: CedarMetadataTemplateModel = CedarMetadataMapper.fromTemplate(
  CEDAR_METADATA_DATA_TEMPLATE_JSON_API_MOCK
);

export const MOCK_CEDAR_METADATA_RECORD: CedarMetadataRecordModel = CedarMetadataMapper.fromRecord(
  MOCK_CEDAR_METADATA_RECORD_DATA
);
