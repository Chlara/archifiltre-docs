import React from "react";
import { octet2HumanReadableFormat } from "components/main-space/ruler";

import { RIEInput } from "riek";

import SaveButton from "components/buttons/save-button";
import METSButton from "components/buttons/mets-button";
import ReinitButton from "components/buttons/reinit-button";
import CsvButton from "components/buttons/csv-button";
import TextAlignCenter from "components/common/text-align-center";
import CtrlZ from "components/header/dashboard/ctrl-z";
import { mkB } from "components/buttons/button";
import Bubble from "components/header/dashboard/bubble";
import ResipButton from "../../buttons/resip-button";
import AuditReportButton from "../../buttons/audit-report-button";
import {
  getFileCount,
  getFoldersCount
} from "../../../reducers/files-and-folders/files-and-folders-selectors";
import { useTranslation } from "react-i18next";

const DashBoard = props => {
  let sessionInfoCell = false;
  let ctrlzCell = false;
  let csvButtonCell = false;
  let resipButtonCell = false;
  let metsButtonCell = false;
  let saveButtonCell = false;
  let reinitButtonCell = false;
  let exportMenuCell = false;
  let auditButtonCell = false;
  const { t } = useTranslation();
  const sessionInfoCellStyle = {
    lineHeight: "1em"
  };

  const marginPaddingCompensate = {
    margin: "0.2em -0.8em",
    padding: "0.2em 0.8em"
  };

  const {
    started,
    finished,
    error,
    sessionName,
    onChangeSessionName,
    nb_folders,
    nb_files,
    volume,
    api,
    exportToCsv,
    exportToResip,
    exportToMets,
    exportToAuditReport
  } = props;

  if (started === true && finished === true && error === false) {
    sessionInfoCell = (
      <div style={sessionInfoCellStyle}>
        <span className="edit_hover_container" style={marginPaddingCompensate}>
          <RIEInput
            value={sessionName()}
            change={onChangeSessionName("new_session_name")}
            propName="new_session_name"
            className="session_name editable_text"
            validate={s => s.replace(/\s/g, "").length > 0}
          />
          &ensp;
          <i
            className="fi-pencil edit_hover_pencil"
            style={{ opacity: "0.3" }}
          />
        </span>
        <br />
        <b>
          {nb_folders} <i className="fi-folder" />
          &ensp;&ensp;
          {nb_files} <i className="fi-page" />
          &ensp;&ensp;
          {octet2HumanReadableFormat(volume)}
        </b>
      </div>
    );

    csvButtonCell = (
      <TextAlignCenter>
        <CsvButton api={api} exportToCsv={exportToCsv} />
      </TextAlignCenter>
    );

    resipButtonCell = (
      <TextAlignCenter>
        <ResipButton api={api} exportToResip={exportToResip} />
      </TextAlignCenter>
    );

    metsButtonCell = (
      <TextAlignCenter>
        <METSButton api={api} exportToMets={exportToMets} />
      </TextAlignCenter>
    );

    saveButtonCell = (
      <TextAlignCenter>
        <SaveButton api={api} />
      </TextAlignCenter>
    );

    auditButtonCell = (
      <TextAlignCenter>
        <AuditReportButton
          api={api}
          exportToAuditReport={exportToAuditReport}
        />
      </TextAlignCenter>
    );

    exportMenuCell = (
      <Bubble
        comp={
          <TextAlignCenter>
            {mkB(
              () => {},
              t("header.export"),
              true,
              "#4d9e25",
              { width: "90%", cursor: "default" },
              "export-menu"
            )}
          </TextAlignCenter>
        }
        sub_comp={
          <div className="grid-x">
            <div className="cell small-12">{auditButtonCell}</div>
            <div className="cell small-12">{csvButtonCell}</div>
            <div className="cell small-12">{resipButtonCell}</div>
            <div className="cell small-12">{metsButtonCell}</div>
          </div>
        }
      />
    );
  }

  if (props.started === true && props.finished === true) {
    reinitButtonCell = (
      <TextAlignCenter>
        <ReinitButton api={props.api} />
      </TextAlignCenter>
    );
  }

  if (props.started === props.finished && props.error === false) {
    ctrlzCell = <CtrlZ visible={true} api={props.api} />;
  }

  return (
    <div className="grid-x grid-padding-y align-middle">
      <div className="cell small-2">{ctrlzCell}</div>

      <div className="cell auto" />

      <div className="cell small-3">{sessionInfoCell}</div>

      <div className="cell auto" />

      <div className="cell small-2">{saveButtonCell}</div>

      <div className="cell small-2">{exportMenuCell}</div>

      <div className="cell small-2">{reinitButtonCell}</div>
    </div>
  );
};

export default function DashBoardApiToProps({
  api,
  exportToCsv,
  exportToResip,
  exportToMets,
  exportToAuditReport,
  rootFilesAndFoldersMetadata,
  filesAndFolders
}) {
  const {
    loading_state: { isFinished, isInError, isStarted },
    database
  } = api;
  const finished = isFinished();
  const error = isInError();

  const nbFiles = getFileCount(filesAndFolders);
  const nbFolders = getFoldersCount(filesAndFolders);
  const volume = rootFilesAndFoldersMetadata.childrenTotalSize;

  const onChangeSessionName = propName => n => {
    if (n[propName].length > 0) {
      database.setSessionName(n[propName]);
      api.undo.commit();
    }
  };

  return (
    <DashBoard
      api={api}
      started={isStarted()}
      finished={finished}
      error={error}
      nb_files={nbFiles}
      nb_folders={nbFolders}
      volume={volume}
      sessionName={() => database.getSessionName()}
      onChangeSessionName={onChangeSessionName}
      exportToCsv={exportToCsv}
      exportToResip={exportToResip}
      exportToMets={exportToMets}
      exportToAuditReport={exportToAuditReport}
    />
  );
}