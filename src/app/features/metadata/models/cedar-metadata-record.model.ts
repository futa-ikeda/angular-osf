import { CedarMetadataAttributes } from './cedar-metadata-attributes.model';

export interface CedarMetadataRecordModel {
  id: string;
  metadata: CedarMetadataAttributes;
  isPublished: boolean;
  templateId: string;
  targetId: string;
  schemaName: string;
}

export interface CedarRecordDataBinding {
  id: string;
  data: CedarMetadataAttributes;
  isPublished: boolean;
}
