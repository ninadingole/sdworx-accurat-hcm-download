export type LastRecordData = {
    LastRecord: number;
};

export interface FieldMetadata {
    readonly FieldId: string;
    readonly FieldName: string;
    readonly FieldType: number;
    readonly ShortName: string;
    readonly FormatString: string;
    readonly Table: string;
    readonly Value: string;
    readonly ValueText: string;
}

export interface SearchResponse {
    Data: {
        Successful: boolean;
        FieldMetadata: Map<string, FieldMetadata>;
        SearchId: string;
        Table: string;
        Criteria: Map<number, CriteriaValue>;
    }
}

export interface CriteriaValue {
    FieldId: string;
    FieldName: string;
    FieldTypeId: number;
    FormatString: string;
    IsHidden: boolean;
    Operator: number;
    Operators: any;
    Table?: string;
    Value: string;
}

export interface FindResponse {
    Data: {
        Available: number;
        Records: Map<number, DataRecord>;
    }
}

export interface DataRecord {
    Fields: Map<string, FieldMetadata>;
    Key: string[];
    Table: string;
}
