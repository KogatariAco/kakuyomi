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
