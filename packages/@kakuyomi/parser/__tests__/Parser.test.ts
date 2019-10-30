import * as parser from "../src/index";
import {Text} from "@kakuyomi/core";

describe("Parser", () => {
  const expectParse = (text: string, expected: Text) => {
    const result = parser.parse(text);
    if (result.lexErrors.length > 0) {
      throw new Error(result.lexErrors[0].message);
    }
    if (result.parseErrors.length > 0) {
      throw new Error(result.parseErrors[0].message);
    }
    expect(result.ast).toStrictEqual(expected);
  };

  it("空のテキスト", () => {
    expectParse("", {blocks: []});
  });
  it("1文", () => {
    expectParse("テキスト", {
      blocks: [
        {
          sentences: [
            {
              kind: "text",
              text: "テキスト"
            }
          ]
        }
      ]
    });
  });
  it("改行のみも1ブロックとして扱う", () => {
    expectParse("テキスト\n\n次のテキスト", {
      blocks: [
        {
          sentences: [
            {
              kind: "text",
              text: "テキスト"
            }
          ]
        },
        {sentences: []},
        {
          sentences: [
            {
              kind: "text",
              text: "次のテキスト"
            }
          ]
        }
      ]
    });
  });
  it("ルビ:漢字", () => {
    expectParse("彼女《ヒロイン》", {
      blocks: [
        {
          sentences: [
            {
              kind: "ruby",
              parent: "彼女",
              ruby: "ヒロイン"
            }
          ]
        }
      ]
    });
  });
  it("ルビ", () => {
    expectParse("｜etc《えとせとら》", {
      blocks: [
        {
          sentences: [
            {
              kind: "ruby",
              parent: "etc",
              ruby: "えとせとら"
            }
          ]
        }
      ]
    });
  });
  it("傍点", () => {
    expectParse("《《傍点》》", {
      blocks: [
        {
          sentences: [
            {
              kind: "emphasis",
              body: "傍点"
            }
          ]
        }
      ]
    });
  });
  it("not ルビ", () => {
    expectParse("ルビでない《ルビでない》", {
      blocks: [
        {
          sentences: [
            {
              kind: "text",
              text: "ルビでない《ルビでない》"
            }
          ]
        }
      ]
    });
  });
});
