import {Page} from "@playwright/test";
import assert from "assert";
import {FieldMetadata} from "./types";


async function sendPostRequest(page: Page, url: string, data: any) {
    const response = await page.request.post(url, data);
    assert(response.ok());
    return response;
}


function getDateField(FieldsMetadata: Map<string, FieldMetadata>) {
    for (let key in FieldsMetadata) {
        if (FieldsMetadata[key].ShortName === 'Datum') {
            return FieldsMetadata[key];
        }
    }

    return '';
}

function getFields(FieldMetadata: Map<string, FieldMetadata>) {
    let fields = [];
    for (let key in FieldMetadata) {
        fields.push(key);
    }

    return fields;
}

function getDocumentType(FieldMetadata: Map<string, FieldMetadata>) {
    for (let key in FieldMetadata) {
        if (FieldMetadata[key].ShortName === 'Typ') {
            return FieldMetadata[key];
        }
    }

    return '';
}

export {sendPostRequest, getDateField, getFields, getDocumentType};

