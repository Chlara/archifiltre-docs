import { getTrackerProvider } from "@common/modules/tracker";
import { bytesToMegabytes } from "@common/utils/numbers";
import React, { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import { commitAction } from "../../../../../reducers/enhancers/undoable/undoable-actions";
import {
  markAsToDelete,
  unmarkAsToDelete,
} from "../../../../../reducers/files-and-folders/files-and-folders-actions";
import {
  getElementsToDeleteFromStore,
  getFilesAndFoldersFromStore,
  isFolder,
} from "../../../../../reducers/files-and-folders/files-and-folders-selectors";
import type { FilesAndFoldersMap } from "../../../../../reducers/files-and-folders/files-and-folders-types";
import { getFilesAndFoldersMetadataFromStore } from "../../../../../reducers/files-and-folders-metadata/files-and-folders-metadata-selectors";
import type { FilesAndFoldersMetadataMap } from "../../../../../reducers/files-and-folders-metadata/files-and-folders-metadata-types";
import type { StoreState } from "../../../../../reducers/store";
import { addTag, untagFile } from "../../../../../reducers/tags/tags-actions";
import {
  getAllTagIdsForFile,
  getTagsByIds,
  getTagsFromStore,
} from "../../../../../reducers/tags/tags-selectors";
import {
  getHoveredElementIdFromStore,
  getLockedElementIdFromStore,
} from "../../../../../reducers/workspace-metadata/workspace-metadata-selectors";
import { getAllChildren } from "../../../../../utils/file-and-folders";
import type { TagCellProps } from "./tag-cell";
import { TagCell } from "./tag-cell";

const computeTreeSize = (
  filesAndFoldersMetadataMap: FilesAndFoldersMetadataMap,
  filesAndFoldersMap: FilesAndFoldersMap,
  filesAndFoldersId: string
) => {
  const filesAndFolders = filesAndFoldersMap[filesAndFoldersId];
  return isFolder(filesAndFolders)
    ? filesAndFoldersMetadataMap[filesAndFoldersId].childrenTotalSize
    : filesAndFolders.file_size;
};

const handleTracking = (
  isCurrentFileMarkedToDelete: boolean,
  filesAndFoldersMetadataMap: FilesAndFoldersMetadataMap,
  filesAndFoldersMap: FilesAndFoldersMap,
  filesAndFoldersId: string
): void => {
  if (!isCurrentFileMarkedToDelete) {
    const sizeRaw = computeTreeSize(
      filesAndFoldersMetadataMap,
      filesAndFoldersMap,
      filesAndFoldersId
    );
    const fileCount = getAllChildren(
      filesAndFoldersMap,
      filesAndFoldersId
    ).length;

    getTrackerProvider().track("Feat(4.0) Element Marked To Delete", {
      fileCount,
      mode: "enrichment",
      size: bytesToMegabytes(sizeRaw),
      sizeRaw,
    });
  }
};

export const TagCellContainer: React.FC = () => {
  const dispatch = useDispatch();

  const filesAndFoldersMap = useSelector(getFilesAndFoldersFromStore);
  const filesAndFoldersMetadataMap = useSelector(
    getFilesAndFoldersMetadataFromStore
  );

  const allTags = useSelector(getTagsFromStore);

  const hoveredElementId = useSelector(getHoveredElementIdFromStore);
  const lockedElementId = useSelector(getLockedElementIdFromStore);

  const filesAndFoldersId = lockedElementId || hoveredElementId;

  const isFocused = filesAndFoldersId !== "";
  const isLocked = lockedElementId !== "";
  const isActive = isFocused || isLocked;

  const filesToDelete = useSelector(getElementsToDeleteFromStore);
  const isCurrentFileMarkedToDelete = filesToDelete.includes(filesAndFoldersId);

  const nodeId = isActive ? filesAndFoldersId : "";

  const tagIdsForCurrentFile = useSelector((state: StoreState) =>
    getAllTagIdsForFile(getTagsFromStore(state), filesAndFoldersId)
  );

  const tagsForCurrentFile = useSelector((state: StoreState) =>
    getTagsByIds(getTagsFromStore(state), tagIdsForCurrentFile)
  );

  const createTag: TagCellProps["createTag"] = useCallback(
    (tagName, ffId) => {
      dispatch(addTag(tagName, ffId));
      dispatch(commitAction());
    },
    [dispatch]
  );

  const untag: TagCellProps["untag"] = useCallback(
    (tagName, ffId) => {
      dispatch(untagFile(tagName, ffId));
      dispatch(commitAction());
    },
    [dispatch]
  );

  const toggleCurrentFileDeleteState = useCallback(() => {
    handleTracking(
      isCurrentFileMarkedToDelete,
      filesAndFoldersMetadataMap,
      filesAndFoldersMap,
      filesAndFoldersId
    );
    if (isCurrentFileMarkedToDelete)
      dispatch(unmarkAsToDelete(filesAndFoldersId));
    else dispatch(markAsToDelete(filesAndFoldersId));
    dispatch(commitAction());
  }, [
    dispatch,
    isCurrentFileMarkedToDelete,
    filesAndFoldersId,
    filesAndFoldersMetadataMap,
    filesAndFoldersMap,
  ]);

  const availableTags = useMemo(
    () =>
      Object.values(allTags).filter(
        (allTag) =>
          !tagsForCurrentFile.some(
            (tagForCurrentFile) => allTag.name === tagForCurrentFile.name
          )
      ),
    [tagsForCurrentFile, allTags]
  );

  return (
    <TagCell
      isActive={isActive}
      isCurrentFileMarkedToDelete={isCurrentFileMarkedToDelete}
      nodeId={nodeId}
      tagsForCurrentFile={tagsForCurrentFile}
      createTag={createTag}
      untag={untag}
      toggleCurrentFileDeleteState={toggleCurrentFileDeleteState}
      availableTags={availableTags}
    />
  );
};
