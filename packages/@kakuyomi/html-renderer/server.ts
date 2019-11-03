import * as express from "express";
import {Novel} from "./src/index";

const app = express();

app.set("view engine", "pug");
app.use(express.static("public"));

app.get("/", (_: express.Request, res: express.Response) => {
  const novel: Novel = {
    title: "@kakuyomi HTML Generator",
    writer: "小語アコ",
    text: {
      blocks: [
        {
          sentences: [
            {
              kind: "text",
              text: "　@kakuyomi/html-rendererは解析した文章からHTMLを構築します。"
            }
          ]
        },
        {
          sentences: []
        },
        {
          sentences: [
            {
              kind: "text",
              text: "　ルビを"
            },
            {
              kind: "ruby",
              parent: "表示",
              ruby: "ひょうじ"
            },
            {
              kind: "text",
              text: "できます。"
            },
            {
              kind: "text",
              text: "傍点も"
            },
            {
              kind: "emphasis",
              body: "この通り"
            },
            {
              kind: "text",
              text: "です。"
            }
          ]
        }
      ]
    }
  };
  res.render("template", novel);
});

app.listen(3000, () => {
  console.log("app listening on port 3000");
});
