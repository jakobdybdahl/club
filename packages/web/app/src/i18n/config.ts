import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import common_da from "./da/common";
import auth from "./en/auth";
import common from "./en/common";

export const defaultNs = "common";

void i18next.use(initReactI18next).init({
  fallbackLng: "en",
  resources: {
    en: {
      common,
      auth,
    },
    da: {
      common: common_da,
    },
  },
  defaultNS: defaultNs,
});
