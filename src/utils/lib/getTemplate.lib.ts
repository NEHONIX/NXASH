import Handlebars from "handlebars";
import fs from "fs";
import path from "path";

export const getTemplate = (templateName: string) => {
  // Ajouter des helpers Handlebars personnalisés
  Handlebars.registerHelper("currentYear", () => new Date().getFullYear());

  // Lire et compiler le template
  const templatePath = path.join(
    __dirname,
    "..",
    "templates",
    `${templateName}.hbs`
  );
  const template = fs.readFileSync(templatePath, "utf-8");
  return Handlebars.compile(template);
};
