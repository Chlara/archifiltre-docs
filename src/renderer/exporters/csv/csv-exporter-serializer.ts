import { omit } from "lodash";
import { Field, Message, Type } from "protobufjs";
import type { Readable, Writable } from "stream";

import type { FilesAndFolders } from "../../reducers/files-and-folders/files-and-folders-types";
import type { FilesAndFoldersMetadata } from "../../reducers/files-and-folders-metadata/files-and-folders-metadata-types";
import {
  parseSerializedDataFromStream,
  sendStringToStream,
  stringifyObjectToStream,
} from "../../utils/child-process-stream";
import {
  FilesAndFoldersMessage,
  FilesAndFoldersMetadataMessage,
} from "../../utils/child-process-stream/child-process-stream-messages";
import type { OmitProtobuf } from "../../utils/child-process-stream/common-serializer";
import {
  extractFilesAndFolders,
  extractFilesAndFoldersMetadata,
  extractHashes,
  extractKey,
  extractKeysFromFilesAndFolders,
  makeDataExtractor,
} from "../../utils/child-process-stream/common-serializer";
import type { WithLanguage } from "../../utils/language/types";
import { Language } from "../../utils/language/types";
import type { GenerateCsvExportOptions } from "./csv-exporter.controller";

@Type.d("CsvExporterSerializerMessage")
export class CsvExporterSerializerMessage extends Message<CsvExporterSerializerMessage> {
  @Field.d(0, "string")
  key!: string;

  @Field.d(1, FilesAndFoldersMessage)
  filesAndFolders!: FilesAndFolders;

  @Field.d(2, FilesAndFoldersMetadataMessage)
  filesAndFoldersMetadata!: FilesAndFoldersMetadata;

  @Field.d(3, "string", "optional")
  hash!: string | null;
}

const dataSerializer = (
  element: OmitProtobuf<CsvExporterSerializerMessage>
): Uint8Array => {
  const message = CsvExporterSerializerMessage.create(element);
  return CsvExporterSerializerMessage.encode(message).finish();
};

export const stringifyCsvExporterOptionsToStream = (
  stream: Writable,
  options: WithLanguage<GenerateCsvExportOptions>
): void => {
  const base = omit(options, [
    "filesAndFolders",
    "filesAndFoldersMetadata",
    "hashes",
  ]);
  sendStringToStream(stream, JSON.stringify(base));
  stringifyObjectToStream<
    WithLanguage<GenerateCsvExportOptions>,
    OmitProtobuf<CsvExporterSerializerMessage>
  >(stream, options, {
    /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument */
    dataExtractor: makeDataExtractor(
      extractKey,
      extractFilesAndFolders as any,
      extractFilesAndFoldersMetadata as any,
      extractHashes as any
    ) as any,
    /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument */
    dataSerializer,
    keyExtractor: extractKeysFromFilesAndFolders,
  });
  stream.end();
};

const deserializer = (data: Uint8Array) =>
  CsvExporterSerializerMessage.toObject(
    CsvExporterSerializerMessage.decode(data),
    { arrays: true }
  ) as CsvExporterSerializerMessage;

const merger = (
  base: WithLanguage<GenerateCsvExportOptions>,
  deserializedData: CsvExporterSerializerMessage
) => {
  const { key, filesAndFolders, filesAndFoldersMetadata, hash } =
    deserializedData;
  base.filesAndFolders[key] = filesAndFolders;
  base.filesAndFoldersMetadata[key] = filesAndFoldersMetadata;
  if (hash) {
    if (base.hashes) base.hashes[key] = hash;
    else base.hashes = { [key]: hash };
  }
};

export const parseCsvExporterOptionsFromStream = async (
  stream: Readable
): Promise<WithLanguage<GenerateCsvExportOptions>> => {
  const options: WithLanguage<GenerateCsvExportOptions> = {
    aliases: {},
    comments: {},
    elementsToDelete: [],
    filesAndFolders: {},
    filesAndFoldersMetadata: {},
    language: Language.FR,
    tags: {},
  };

  return parseSerializedDataFromStream(stream, options, {
    deserializer,
    merger,
    withJsonInitializing: true,
  });
};
