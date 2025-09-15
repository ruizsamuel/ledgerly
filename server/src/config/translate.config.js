import i18n from "i18n";
import path from "path";

export const initTranslate = (app) => {
  i18n.configure({
    locales: ["en", "es"],
    directory: path.join(process.cwd(), "/locales"),
    updateFiles: false,
    objectNotation: true,
  });

  app.use(i18n.init);
}
