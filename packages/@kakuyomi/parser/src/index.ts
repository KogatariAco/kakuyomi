import * as chevrotain from "chevrotain";
import {Text, Block, Sentence} from "@kakuyomi/core";

// TODO: 異体字セレクター、Standardized Variantsを考慮したい
const Kanji = chevrotain.createToken({
  name: "Kanji",
  // pattern: /([\u{3005}\u{3007}\u{303b}\u{3400}-\u{9FFF}\u{F900}-\u{FAFF}\u{20000}-\u{2FFFF}][\u{E0100}-\u{E01EF}\u{FE00}-\u{FE02}]?)+(?=《)/mu
  pattern: /[一-龠]+(?=《)/
});
const Bar = chevrotain.createToken({name: "Bar", pattern: /\||｜/});
const Lparen = chevrotain.createToken({name: "Lparen", pattern: /《/});
const Rparen = chevrotain.createToken({name: "Rparen", pattern: /》/});
const Body = chevrotain.createToken({name: "Body", pattern: /[^\|｜《》\r\n]+/});
const NewLine = chevrotain.createToken({
  name: "NewLine",
  pattern: /\r?\n/
});

const allTokens = [Kanji, Lparen, Rparen, Bar, Body, NewLine];

const kakuyomuLexer = new chevrotain.Lexer(allTokens);

class KakuyomuParser extends chevrotain.EmbeddedActionsParser {
  constructor() {
    super(allTokens);

    const $ = this;

    $.RULE("text", () => {
      const blocks: Block[] = [];
      $.MANY(() => {
        const block: Block = $.SUBRULE(($ as any).block);
        $.ACTION(() => {
          if (block.sentences.length > 0) {
            blocks.push(block);
          }
        });
        $.OPTION(() => {
          $.CONSUME(NewLine);
          $.ACTION(() => {
            if (block.sentences.length <= 0) {
              blocks.push(block);
            }
          });
        });
      });
      return {
        blocks
      };
    });

    $.RULE("block", () => {
      const sentences: Sentence[] = [];
      $.MANY(() => {
        const sentence: Sentence = $.SUBRULE(($ as any).sentence);
        $.ACTION(() => {
          if (sentences.length > 0) {
            const last = sentences[sentences.length - 1];
            if (last.kind === "text" && sentence.kind === "text") {
              last.text += sentence.text;
            } else {
              sentences.push(sentence);
            }
          } else {
            sentences.push(sentence);
          }
        });
      });
      return {
        sentences
      };
    });

    $.RULE("sentence", () => {
      return $.OR([
        {
          GATE: $.BACKTRACK(($ as any).emphasis),
          ALT: () => $.SUBRULE(($ as any).emphasis)
        },
        {
          GATE: $.BACKTRACK(($ as any).ruby),
          ALT: () => $.SUBRULE(($ as any).ruby)
        },
        {
          GATE: $.BACKTRACK(($ as any).plain),
          ALT: () => $.SUBRULE(($ as any).plain)
        }
      ]);
    });

    $.RULE("ruby", () => {
      return $.OR([
        {
          GATE: $.BACKTRACK(($ as any).barRuby),
          ALT: () => $.SUBRULE(($ as any).barRuby)
        },
        {
          GATE: $.BACKTRACK(($ as any).kanjiRuby),
          ALT: () => $.SUBRULE(($ as any).kanjiRuby)
        }
      ]);
    });

    $.RULE("kanjiRuby", () => {
      const parent = $.CONSUME(Kanji).image;
      $.CONSUME(Lparen);
      const ruby = $.CONSUME(Body).image;
      $.CONSUME(Rparen);
      return {
        kind: "ruby",
        parent,
        ruby
      };
    });

    $.RULE("barRuby", () => {
      $.CONSUME(Bar);
      const parent = $.CONSUME1(Body).image;
      $.CONSUME(Lparen);
      const ruby = $.CONSUME2(Body).image;
      $.CONSUME(Rparen);
      return {
        kind: "ruby",
        parent,
        ruby
      };
    });

    $.RULE("emphasis", () => {
      $.CONSUME(Lparen);
      $.CONSUME2(Lparen);
      const body = $.CONSUME(Body).image;
      $.CONSUME(Rparen);
      $.CONSUME2(Rparen);
      return {
        kind: "emphasis",
        body
      };
    });

    $.RULE("plain", () => {
      // blockで結合するためここではconsumeのみ
      const text = $.OR([
        {ALT: () => $.CONSUME(Body)},
        {ALT: () => $.CONSUME(Lparen)},
        {ALT: () => $.CONSUME(Rparen)},
        {ALT: () => $.CONSUME(Bar)}
      ]).image;
      return {
        kind: "text",
        text
      };
    });

    this.performSelfAnalysis();
  }
}

export const parser = new KakuyomuParser();

export interface ParseResult {
  ast: Text;
  lexErrors: chevrotain.ILexingError[];
  parseErrors: chevrotain.IRecognitionException[];
}

export const parse = (text: string): ParseResult => {
  const lexResult = kakuyomuLexer.tokenize(text);
  parser.input = lexResult.tokens;
  const ast: Text = (parser as any).text();
  return {
    ast,
    lexErrors: lexResult.errors,
    parseErrors: parser.errors
  };
};
