import * as kakuyomi from "../src/index";

test("サンプル", () => {
  const text = `@kakuyomi/parserを使うとカクヨム記法で書かれた文章を構文解析できます。

ルビを記述《きじゅつ》してみます。あるいは|縦線を使った《こういう》書き方もあります。

傍点は《《こんな風に》》書きます。`;

  const result = kakuyomi.parse(text);
  expect(result.ast).toStrictEqual({
    blocks: [
      {
        sentences: [
          {
            kind: "text",
            text: "@kakuyomi/parserを使うとカクヨム記法で書かれた文章を構文解析できます。"
          }
        ]
      },
      {sentences: []},
      {
        sentences: [
          {
            kind: "text",
            text: "ルビを"
          },
          {
            kind: "ruby",
            parent: "記述",
            ruby: "きじゅつ"
          },
          {
            kind: "text",
            text: "してみます。あるいは"
          },
          {
            kind: "ruby",
            parent: "縦線を使った",
            ruby: "こういう"
          },
          {
            kind: "text",
            text: "書き方もあります。"
          }
        ]
      },
      {sentences: []},
      {
        sentences: [
          {
            kind: "text",
            text: "傍点は"
          },
          {
            kind: "emphasis",
            body: "こんな風に"
          },
          {
            kind: "text",
            text: "書きます。"
          }
        ]
      }
    ]
  });
});
