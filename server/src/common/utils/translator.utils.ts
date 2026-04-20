import fs from "fs";
import path from "path";
import type { Request } from "express";

type Dictionary = Record<string, unknown>;

const dictionaries = new Map<string, Dictionary>();
const supportedLocales = ["en", "es"] as const;

type Locale = (typeof supportedLocales)[number];

const getValue = (obj: Dictionary, key: string): string | undefined => {
  return key.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object" && part in (acc as Dictionary)) {
      return (acc as Dictionary)[part];
    }
    return undefined;
  }, obj) as string | undefined;
};

export const initI18n = () => {
  supportedLocales.forEach((locale) => {
    const filePath = path.join(process.cwd(), "locales", `${locale}.json`);
    const raw = fs.readFileSync(filePath, "utf-8");
    dictionaries.set(locale, JSON.parse(raw));
  });
};

export const getLocale = (req: Request): Locale => {
  const header = req.headers["accept-language"];
  if (!header) return "en";
  const lang = header.split(",")[0]?.trim().slice(0, 2);
  return (supportedLocales.includes(lang as Locale) ? lang : "en") as Locale;
};

export const t = (key: string, locale: Locale = "en"): string => {
  const dict = dictionaries.get(locale) || dictionaries.get("en");
  if (!dict) return key;
  return getValue(dict, key) ?? key;
};

export const tFromReq = (req: Request, key: string): string => {
  return t(key, getLocale(req));
};
