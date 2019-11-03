import * as path from "path";
import {Text} from "@kakuyomi/core";
import * as pug from "pug";

export interface Novel {
  title: string;
  writer: string;
  text: Text;
}

export const render = (template: string, novel: Novel) => {
  return pug.render(template, novel);
};

export namespace Path {
  export const publicDir = path.resolve(__dirname, "../public");
  export const template = path.resolve(__dirname, "../views/template.pug");
}
