import { countItems } from "@common/utils/array";
import dateFormat from "dateformat";
import { saveAs } from "file-saver";
import fs from "fs";
import path, { dirname } from "path";

import { translations } from "../../translations/translations";

const utf8ByteOrderMark = "\ufeff";

export const UTF8 = "utf-8";

/**
 * Open a dialog to save string data into a file
 * @param name - The default file name
 * @param content - The string content to save
 * @param format - The specific format (ex: UTF8)
 */
export const save = (
  name: string,
  content: string,
  { format = "" } = {}
): void => {
  let fileHead = "";

  if (format === UTF8) {
    fileHead += utf8ByteOrderMark;
  }

  const writtenData = fileHead + content;
  const blob = new Blob([writtenData], { type: "text/plain;charset=utf-8" });
  saveBlob(name, blob);
};

/**
 * Saves a blob into a file
 * @param name - The default file name
 * @param blob - The blob to save into a file
 */
export const saveBlob = (name: string, blob: Blob): void => {
  saveAs(blob, name); // TODO: use electron save
};

// TODO: rename
export const getNameWithExtension = (name: string, extension: string): string =>
  `${name}_${dateFormat(new Date(), "yyyy_mm_dd_HH_MM")}.${extension}`;

export const mkdir = (dirPath: string): void => {
  if (!fs.existsSync(dirPath)) {
    mkdir(path.dirname(dirPath));
    fs.mkdirSync(dirPath);
  }
};

interface ConvertToPosixAbsolutePathOptions {
  separator?: string;
}

/**
 * Path in archifiltre should always start with '/'
 * When we drop a folder which is at the root of a file
 * system (like '/myfFolder' or 'C:\myFolder' path),
 * dirname return '/' or 'C:\', so path parameter may be wrong
 * i.e. : myFolder/my/file instead of /myFolder/my/file
 *     or myFolder\my\file instead of \myFolder\my\file
 *
 * @param filePath
 * @param options
 * @param options.separator
 */
export const convertToPosixAbsolutePath = (
  filePath: string,
  { separator = path.sep }: ConvertToPosixAbsolutePathOptions = {}
): string => {
  const array = filePath.split(separator);
  if (array[0] !== "") {
    array.unshift("");
  }

  return array.join("/");
};

/**
 * Returns true if the file is a JSON, false otherwise
 * @param filePath
 */
export const isJsonFile = (filePath: string): boolean => {
  try {
    const stats = fs.statSync(filePath);
    return stats.isFile() && path.extname(filePath) === ".json";
  } catch (error: unknown) {
    return false;
  }
};

export const readFileSync = fs.readFileSync;

/**
 * Get the number of files with .zip extension
 * @param filePaths - list of strings representing file paths
 */
export const countZipFiles = (filePaths: string[]): number =>
  countItems<string>((filePath) => path.extname(filePath) === ".zip")(
    filePaths
  );

/**
 * Formats a path for the user file system
 * @param formattedPath
 * @returns {string}
 * @example
 * // On windows
 * console.log(formatPathForUserSystem("/folder/file"))
 * // => \folder\file
 */
export const formatPathForUserSystem = (formattedPath: string): string =>
  path.normalize(formattedPath);

export const bytes2HumanReadableFormat = (size: number): string => {
  const unit = translations.t("common.byteChar");
  const To = size / 1000 ** 4;
  if (To > 1) {
    return `${Math.round(To * 10) / 10} T${unit}`;
  }
  const Go = size / 1000 ** 3;
  if (Go > 1) {
    return `${Math.round(Go * 10) / 10} G${unit}`;
  }
  const Mo = size / 1000 ** 2;
  if (Mo > 1) {
    return `${Math.round(Mo * 10) / 10} M${unit}`;
  }
  const ko = size / 1000;
  if (ko > 1) {
    return `${Math.round(ko * 10) / 10} k${unit}`;
  }
  return `${size} ${unit}`;
};

/**
 * Returns the element absolute path based on the partition base path and the element id
 * @param basePath
 * @param relativePath
 */
export const getAbsolutePath = (
  basePath: string,
  relativePath: string
): string => path.join(basePath, "..", relativePath);

/**
 * Checks if the path is a filesystem root (ex: "C:\" pour windows ou "/" pour posix)
 * @param testPath
 */
export const isRootPath = (testPath: string): boolean =>
  path.dirname(testPath) === testPath;

export const isValidFilePath = (filePath: string): boolean => {
  const folderPath = dirname(filePath);

  try {
    return fs.statSync(folderPath).isDirectory();
  } catch (error: unknown) {
    return false;
  }
};

export const isValidFolderPath = (folderPath: string): boolean =>
  fs.existsSync(folderPath);

export const startPathFromOneLevelAbove = (elementPath: string): string =>
  (elementPath.startsWith("/") ? elementPath.slice(1) : elementPath)
    .split("/")
    .slice(1)
    .join("/");
