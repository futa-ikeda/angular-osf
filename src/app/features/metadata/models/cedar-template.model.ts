export const CEDAR_TEMPLATE_FIELD_TYPE = 'https://schema.metadatacenter.org/core/TemplateField';
export const CEDAR_PROPERTIES_BASE_IRI = 'https://schema.metadatacenter.org/properties/';

export interface CedarTemplateField {
  '@type': string;
  _valueConstraints?: {
    literals?: { label: string }[];
    multipleChoice?: boolean;
    requiredValue?: boolean;
  };
}

export interface CedarTemplateContextSchema {
  properties: Record<string, { enum?: string[] }>;
}

export interface CedarTemplate {
  '@id': string;
  '@type': string;
  type: string;
  title: string;
  description: string;
  $schema: string;
  '@context': CedarTemplateContext;
  required: string[];
  properties: Record<string, unknown>;
  _ui: {
    order: string[];
    propertyLabels: Record<string, string>;
    propertyDescriptions: Record<string, string>;
  };
}

interface CedarTemplateContext {
  pav: string;
  xsd: string;
  bibo: string;
  oslc: string;
  schema: string;
  'schema:name': {
    '@type': string;
  };
  'pav:createdBy': {
    '@type': string;
  };
  'pav:createdOn': {
    '@type': string;
  };
  'oslc:modifiedBy': {
    '@type': string;
  };
  'pav:lastUpdatedOn': {
    '@type': string;
  };
  'schema:description': {
    '@type': string;
  };
}

export interface FieldSchema {
  type?: string;
  format?: string;
  title?: string;
  description?: string;
  maxLength?: number;
  items?: FieldSchema;
  properties?: Record<string, FieldSchema>;
  required?: string[];
  _ui?: {
    inputType?: string;
    order?: string[];
    propertyLabels?: Record<string, string>;
    propertyDescriptions?: Record<string, string>;
  };
  'schema:name'?: string;
  'schema:description'?: string;
  '@id': string;
}
