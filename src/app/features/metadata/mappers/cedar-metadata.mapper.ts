import { CedarMetadataRecordModel } from '../models/cedar-metadata-record.model';
import { CedarMetadataRecordDataJsonApi } from '../models/cedar-metadata-record-json-api.model';
import { CedarMetadataTemplateModel, PaginatedCedarTemplatesModel } from '../models/cedar-metadata-template.model';
import {
  CedarMetadataDataTemplateJsonApi,
  CedarMetadataTemplateJsonApi,
} from '../models/cedar-metadata-template-json-api.model';

export class CedarMetadataMapper {
  static fromTemplate(data: CedarMetadataDataTemplateJsonApi): CedarMetadataTemplateModel {
    return {
      id: data.id,
      schemaName: data.attributes.schema_name,
      isForCollections: data.attributes.is_for_collections,
      active: data.attributes.active,
      cedarId: data.attributes.cedar_id,
      template: data.attributes.template,
    };
  }

  static fromTemplatesResponse(response: CedarMetadataTemplateJsonApi): PaginatedCedarTemplatesModel {
    return {
      data: response.data.map((item) => this.fromTemplate(item)),
      links: {
        first: response.links?.first,
        next: response.links?.next,
        last: response.links?.last,
      },
    };
  }

  static fromRecord(data: CedarMetadataRecordDataJsonApi): CedarMetadataRecordModel {
    return {
      id: data.id ?? '',
      metadata: data.attributes.metadata,
      isPublished: data.attributes.is_published,
      templateId: data.relationships.template.data.id,
      targetId: data.relationships.target.data.id,
      schemaName: data.embeds?.template?.data?.attributes?.schema_name ?? '',
    };
  }
}
