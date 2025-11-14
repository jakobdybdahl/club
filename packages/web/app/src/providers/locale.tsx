import React, { useMemo } from "react";

type LocaleContextType = {
  locale: string;
  code: string;
};

const LocaleContext = React.createContext<LocaleContextType>(
  {} as LocaleContextType
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const usePreferredLanguageSubscribe = (cb: (...args: any) => any) => {
  window.addEventListener("languagechange", cb);
  return () => window.removeEventListener("languagechange", cb);
};

const getPreferredLanguageSnapshot = () => {
  return navigator.language;
};

function LocaleProvider({ children }: { children: React.ReactNode }) {
  // const { i18n } = useTranslation();

  const locale = React.useSyncExternalStore(
    usePreferredLanguageSubscribe,
    getPreferredLanguageSnapshot
  );

  const code = useMemo(() => locale.split("-").at(0) ?? "en", [locale]);

  // useEffect(() => {
  //   void i18n.changeLanguage(code);
  // }, [i18n, code]);

  return (
    <LocaleContext.Provider value={{ locale, code }}>
      {children}
    </LocaleContext.Provider>
  );
}

function useLocale() {
  const ctx = React.useContext(LocaleContext);
  if (!ctx) throw new Error("LocaleContext not found");
  return ctx;
}

export { LocaleProvider, useLocale };
