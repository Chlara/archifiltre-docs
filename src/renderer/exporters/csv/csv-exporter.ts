import type { ArchifiltreDocsThunkAction } from "../../reducers/archifiltre-types";
import { translations } from "../../translations/translations";
import { getCsvExportParamsFromStore } from "../../utils/array-export";
import { handleFileExportThunk } from "../../utils/export";
import { notifyInfo } from "../../utils/notifications";
import type { GenerateCsvExportOptions } from "./csv-exporter.controller";
import { generateCsvExport$ } from "./csv-exporter.controller";

/**
 * Thunk that generates the csv array for the CSV export with the first line being
 * the csv header.
 * Each line represents one file or folder.
 */
export const csvExporterThunk =
  (name: string, { withHashes = false } = {}): ArchifiltreDocsThunkAction =>
  (dispatch, getState) => {
    const csvExportStartedMessage = translations.t(
      "export.csvExportStartedMessage"
    );
    const exportNotificationTitle = translations.t("export.csvExportTitle");
    notifyInfo(csvExportStartedMessage, exportNotificationTitle);

    const exportData = getCsvExportParamsFromStore(getState());

    const data: GenerateCsvExportOptions = {
      ...exportData,
    };

    if (!withHashes) {
      delete data.hashes;
    }

    const totalProgress = Object.keys(exportData.filesAndFolders).length + 1;
    const loaderMessage = withHashes
      ? translations.t("export.creatingCsvExportWithHashes")
      : translations.t("export.creatingCsvExport");
    const loadedMessage = withHashes
      ? translations.t("export.createdCsvExportWithHashes")
      : translations.t("export.createdCsvExport");

    const exportSuccessMessage = translations.t(
      "export.csvExportSuccessMessage"
    );
    console.log(data);
    const csvExportData$ = generateCsvExport$(data);

    return dispatch(
      handleFileExportThunk(csvExportData$, {
        exportFileName: name,
        exportNotificationTitle,
        exportSuccessMessage,
        loadedMessage,
        loaderMessage,
        totalProgress,
      })
    );
  };
