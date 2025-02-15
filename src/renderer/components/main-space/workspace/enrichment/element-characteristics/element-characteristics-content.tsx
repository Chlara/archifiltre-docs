import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import React from "react";
import { useTranslation } from "react-i18next";

import { useStyles } from "../../../../../hooks/use-styles";
import { bytes2HumanReadableFormat } from "../../../../../utils/file-system/file-sys-util";
import { openExternalElement } from "../../../../../utils/file-system/file-system-util";
import { ClickableIcon } from "../../../../common/clickable-icon";
import { EditableField } from "../../../../common/editable-field";
import { HelpTooltip } from "../../../../common/help-tooltip";
import { FOLDER_ICON, PAGE_ICON } from "../../../../common/icon";
import { LastModifiedDate } from "../../general/session-info/last-modified-date";
import { ElementCharacteristic } from "./element-characteristic";
import { HashInfo } from "./hash-info";

export interface ElementCharacteristicsContentProps {
  elementAlias: string;
  elementName: string;
  elementPath: string;
  elementSize: number;
  hash: string;
  isFolder: boolean;
  lastModified: number;
  maxLastModifiedTimestamp: number;
  medianLastModifiedTimestamp: number;
  minLastModifiedTimestamp: number;
  onElementNameChange: (name: string) => void;
  onLastModifiedChange: (timestamp: number) => void;
  type: string;
}

export const ElementCharacteristicsContent: React.FC<
  ElementCharacteristicsContentProps
> = ({
  elementName,
  elementAlias,
  elementSize,
  elementPath,
  hash,
  isFolder,
  minLastModifiedTimestamp,
  maxLastModifiedTimestamp,
  medianLastModifiedTimestamp,
  lastModified,
  onLastModifiedChange,
  onElementNameChange,
  type,
}) => {
  const { t } = useTranslation();
  const { body2Box } = useStyles();

  const openElement = async () => openExternalElement(elementPath);

  return (
    <Box display="flex" flexDirection="column" justifyContent="space-between">
      <Box marginY={0.5}>
        <Box display="flex">
          <Box marginRight={2}>
            <Box className={body2Box}>
              {isFolder ? (
                <ClickableIcon
                  onClick={openElement}
                  icon={FOLDER_ICON}
                  color="black"
                />
              ) : (
                <ClickableIcon
                  onClick={openElement}
                  icon={PAGE_ICON}
                  color="black"
                />
              )}
            </Box>
          </Box>
          {elementName !== "" && (
            <Box width="100%">
              <Box>
                <EditableField
                  trimValue={true}
                  selectTextOnFocus={true}
                  value={elementAlias || elementName}
                  onChange={onElementNameChange}
                />
              </Box>
              <Box>
                <Typography variant="subtitle2">
                  ({elementAlias ? elementName : t("report.initialName")})
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
      <Box display="flex">
        <Box marginY={0.5} flex={1}>
          <ElementCharacteristic
            name={t("report.size")}
            value={bytes2HumanReadableFormat(elementSize)}
          />
          <ElementCharacteristic
            name={
              <>
                {t("report.hash")}&nbsp;
                <HelpTooltip
                  tooltipText={
                    isFolder
                      ? t("report.folderHashExplanation")
                      : t("report.fileHashExplanation")
                  }
                />
              </>
            }
            value={<HashInfo hash={hash} />}
          />
        </Box>
        <Box marginY={0.5} flex={1}>
          <ElementCharacteristic name={t("report.type")} value={type} />
        </Box>
      </Box>
      <Box marginY={0.5}>
        <Box>
          <Typography variant="h5">{t("report.lastModifications")}</Typography>
        </Box>
        <LastModifiedDate
          isFile={!isFolder}
          lastModified={lastModified}
          onDateChange={onLastModifiedChange}
          minLastModifiedTimestamp={minLastModifiedTimestamp}
          medianLastModifiedTimestamp={medianLastModifiedTimestamp}
          maxLastModifiedTimestamp={maxLastModifiedTimestamp}
        />
      </Box>
    </Box>
  );
};
