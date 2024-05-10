import {Page, test} from '@playwright/test';
import assert from 'assert';
import * as fs from 'fs/promises'
import {getDateField, getFields, sendPostRequest, getDocumentType} from "./utils";
import {FindResponse, LastRecordData, SearchResponse} from "./types";

const BASE_URL = process.env.BASEURL;
const FOLDER = './files';

const DATA = {
    INDEXFILE: `${FOLDER}/index.json`,
    username: process.env.HCMUSERNAME || '',
    password: process.env.HCMPASSWORD || '',
}

const Placeholders = {
    username: 'Benutzername',
    password: 'Passwort',
    logout: 'Abmelden',
    myDocs: 'Meine Dokumente',
    login: 'Anmelden'
}

const PATHS = {
    LOGIN: '/3.0/Portal',
    DOWNLOAD: '/3.0/Archive/Store/Download',
    FIND: '/API-V3/DataRecordServiceApi/Find',
    SEARCH: '/API-V3/SearchApi/GetSearchDefinition'
}

async function loginAndMoveToDocuments(page: Page) {
    await page.goto(toURL(PATHS.LOGIN));

    await page.getByPlaceholder(Placeholders.username).fill(DATA.username);
    await page.getByPlaceholder(Placeholders.password).fill(DATA.password);

    await page.click(`button:has-text("${Placeholders.login}")`);

    await page.waitForSelector(`text="${Placeholders.myDocs}"`);

    await page.click(`text="${Placeholders.myDocs}"`);
}

async function searchDefinition(page: Page, sourceTable: string) {
    const search = await sendPostRequest(page, toURL(PATHS.SEARCH), {
        data: {
            table: sourceTable,
            dateRangeTable: sourceTable,
            useFormularFields: false,
            maxResult: 25,
            dateRangeNotAvailable: false,
        }
    });

    return await search.json() as SearchResponse;
}

test.describe('downloads', () => {
    test.afterEach(async ({page}) => {
        await page.locator('#HCM_APP_HEAD .btn-img').click();
        await page.click(`text=${Placeholders.logout}`);
    })

    test('fetch docs', async ({page, context}) => {
        const lastRecordedData: LastRecordData = JSON.parse(await fs.readFile(DATA.INDEXFILE, 'utf-8')) as LastRecordData;

        await loginAndMoveToDocuments(page);

        const sourceTable: string =  await page.locator(`input[name="SourceTable"]`).first().inputValue();

        const searchResponse = await searchDefinition(page, sourceTable);
        console.log('Search response: ', searchResponse.Data.Table);

        const dateFieldID = getDateField(searchResponse.Data.FieldMetadata).FieldId;
        const nameFieldID = getDocumentType(searchResponse.Data.FieldMetadata).FieldId;
        console.log('nameFieldID: ', nameFieldID);
        console.log('dateFieldID: ', dateFieldID);

        const allRecords = await sendPostRequest(page, toURL(PATHS.FIND), {
                data: {
                    ActivePage: 1,
                    SearchId: searchResponse.Data.SearchId,
                    Table: searchResponse.Data.Table,
                    activePage: 1,
                    ResultOrder: [`${dateFieldID} ASC`],
                    MaxResult: 180,
                    Fields: getFields(searchResponse.Data.FieldMetadata),
                    Criteria: searchResponse.Data.Criteria,
                },
            });

            const data: FindResponse = await allRecords.json() as FindResponse;
            assert(data.Data.Available > 0);

            const totalRecords = data.Data.Available;
            console.log('Total records available: ', totalRecords);
            console.log('Last downloaded record: ', lastRecordedData.LastRecord);
            console.log('New records to download: ', totalRecords - lastRecordedData.LastRecord);

            if (lastRecordedData.LastRecord == totalRecords) {
                console.log('No new records to download');
                return;
            }

            for (let i = lastRecordedData.LastRecord+1; i < totalRecords; i++) {
                const record = data.Data.Records[i];
                console.log('Downloading record: ', record.Key);

                const resp = await sendPostRequest(page, toURL(PATHS.DOWNLOAD), {
                    form: {
                        "model[0].Table": record.Table,
                        "model[0].Key[0]": record.Key[0],
                        "model[0].Key[1]": record.Key[1],
                        "model[0].Key[2]": record.Key[2],
                    },
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
                    },
                });

                const res = await resp.body();

                const name = record.Fields[nameFieldID].ValueText.replace(/\s/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
                const date = new Date(record.Fields[dateFieldID].Value).toLocaleDateString('sv');
                const fileName = `${FOLDER}/${date}-${name}.pdf`;

                await fs.writeFile(fileName, res);

                console.log('Downloaded: ', fileName);
            }

            await fs.writeFile(DATA.INDEXFILE, JSON.stringify({ LastRecord: totalRecords }));
    });
})

function toURL(path: string) {
    return `${BASE_URL}${path}`;
}
