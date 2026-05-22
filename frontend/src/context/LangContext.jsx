// LangContext.jsx — LangCtx, useLang
import { createContext, useContext } from "react";

export const LangCtx = createContext({ lang: "es", t: {}, setLang: () => {} });

export const useLang = () => useContext(LangCtx);