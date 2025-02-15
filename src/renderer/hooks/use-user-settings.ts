import { useCallback, useEffect, useState } from "react";

import type { UserSettings } from "../persistence/persistent-settings";
import {
  getInitialUserSettings,
  saveUserSettings,
} from "../persistence/persistent-settings";

interface UseUserSettingsResult {
  setUserSettings: (userSettings: Partial<UserSettings>) => void;
  userSettings: UserSettings;
}

export const useUserSettings = (): UseUserSettingsResult => {
  const [internalUserSettings, setInternalUserSettings] = useState(
    getInitialUserSettings()
  );

  const setUserSettings = useCallback(
    (userSettings: Partial<UserSettings>) => {
      setInternalUserSettings({
        ...internalUserSettings,
        ...userSettings,
      });
    },
    [setInternalUserSettings, internalUserSettings]
  );

  useEffect(() => {
    void saveUserSettings(internalUserSettings);
  }, [internalUserSettings, setInternalUserSettings]);

  return {
    setUserSettings,
    userSettings: internalUserSettings,
  };
};
