import React from "react";

import { mkTB } from "components/buttons/button";

import TextAlignCenter from "components/common/text-align-center";
import * as ObjectUtil from "util/object-util";

import * as Color from "util/color-util";
import { useTranslation } from "react-i18next";

const Presentational = props => {
  const buttonStyle = {
    margin: 0,
    padding: "0.3em 10%",
    fontSize: "1em",
    fontWeight: "bold",
    borderRadius: "0.4em"
  };
  const { t } = useTranslation();
  return (
    <div className="grid-x align-middle" style={{ minWidth: "25em" }}>
      <div className="cell small-4">
        <TextAlignCenter>{t("workspace.colorCode")}</TextAlignCenter>
      </div>
      <div className="cell small-3">
        <TextAlignCenter>
          {mkTB(
            props.toggleChangeSkin,
            t("workspace.type"),
            props.change_skin,
            Color.parentFolder(),
            buttonStyle
          )}
        </TextAlignCenter>
      </div>
      <div className="cell small-3">
        <TextAlignCenter>
          {mkTB(
            props.toggleChangeSkin,
            t("workspace.dates"),
            !props.change_skin,
            Color.parentFolder(),
            buttonStyle
          )}
        </TextAlignCenter>
      </div>
    </div>
  );
};

export default props => {
  const api = props.api;
  const icicle_state = api.icicle_state;

  props = ObjectUtil.compose(
    {
      change_skin: icicle_state.changeSkin(),
      toggleChangeSkin: icicle_state.toggleChangeSkin
    },
    props
  );

  return <Presentational {...props} />;
};