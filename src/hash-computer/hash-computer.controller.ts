import { bufferCount, map } from "rxjs/operators";

import { FilesAndFoldersMap } from "reducers/files-and-folders/files-and-folders-types";
import { HashesMap } from "reducers/hashes/hashes-types";
import { Observable } from "rxjs";
import { computeFolderHashes } from "../util/files-and-folders/file-and-folders-utils";

type ComputeFolderHashesOptions = {
  filesAndFolders: FilesAndFoldersMap;
  hashes: HashesMap;
};

/**
 * Returns an observable that will dispatch computed hashes every second
 * @param filesAndFolders - The filesAndFolders
 * @param hashes - The precomputed folder hashes
 * @returns {Observable<{}>}
 */
export const computeFolderHashes$ = ({
  filesAndFolders,
  hashes,
}: ComputeFolderHashesOptions): Observable<HashesMap> => {
  return new Observable<HashesMap>((subscriber) => {
    computeFolderHashes(filesAndFolders, hashes, (hashesMap) => {
      subscriber.next(hashesMap);
    }).then(() => {
      subscriber.complete()
    });
  }).pipe(
    bufferCount(2000),
    map((values) => Object.assign({}, ...values)),
  )
};
