import type { ElectronApplication, Page } from "@playwright/test";
import { expect, test } from "@playwright/test";
import parseCsv from "csv-parse/lib/sync";
import fs from "fs";
import path from "path";
import { sync as rimrafSync } from "rimraf";

import { createStructure } from "../utils/fs";
import {
  addDescription,
  addTag,
  clickIcicleElement,
  makeExport,
} from "./utils/app";
import { closeApp, startApp } from "./utils/test";

// eslint-disable-next-line @typescript-eslint/unbound-method
const { describe, beforeEach, afterEach, beforeAll, afterAll } = test;
const it = test;

const TEST_TIMEOUT = 20000;

const testFolderPath = path.resolve(__dirname, "../test-folder/");

describe("Export excel", () => {
  test.use({ navigationTimeout: TEST_TIMEOUT });

  beforeAll(async () => {
    await createStructure({
      [testFolderPath]: {
        "child/": {
          "index.csv": `"dez";
`,
          "text.txt": `dedez
`,
        },
      },
    });
  });

  afterAll(() => {
    rimrafSync(testFolderPath);
  });

  let app: ElectronApplication, win: Page;
  beforeEach(async () => {
    [app, win] = await startApp(testFolderPath);
  });

  afterEach(async () => {
    rimrafSync(path.join(testFolderPath, "..","test-folder-excel_*.xlsx"));
    await closeApp(app);
  });

  it("should generate an excel export", async () => {
    test.slow();
    
    const tag0Name = "tag0";
    const tag1Name = "tag1";
    const description = "element description";

    await win.waitForSelector(`[data-test-id="main-icicle"]`);
    await (await win.waitForSelector(".notification-success")).click();

    await clickIcicleElement(win, "/test-folder/child/index.csv");

    await addTag(win, tag0Name);
    await addTag(win, tag1Name);
    await addDescription(win, description);

    await makeExport(win, "EXCEL");

    // Waiting for the CSV file to be created
    await win.waitForSelector(`text=/L'export Excel est terminé/`);

    // Finding the CSV export file
    const exportFolderPath = path.join(__dirname, "..");
    const exportFolder = fs.readdirSync(exportFolderPath);

    const auditExportFilePath = exportFolder.find((folderName) =>
      /test-folder-excel_/i.test(folderName)
    );

    if (auditExportFilePath === undefined) {
      throw new Error("No Excel export file generated");
    }
  });
});
