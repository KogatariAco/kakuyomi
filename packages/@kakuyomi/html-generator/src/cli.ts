import {promisify} from "util";
import * as fs from "fs";
import * as fsx from "fs-extra";
import * as path from "path";
import * as commandpost from "commandpost";
import {Text} from "@kakuyomi/core";
import * as kakuyomi from "@kakuyomi/parser";
import {render} from "./index";

const packageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../package.json"), "utf8"));

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

interface CompileOpts {
  outdir: string[];
  title: string[];
  writer: string[];
}

interface CompileArgs {
  sources: string[];
}

interface Config {
  outdir: string;
  title: string;
  writer: string;
}

const filename = (target: string): string => {
  return path.basename(target, path.extname(target));
};

const exit = (messages: string[]) => {
  for (const message of messages) {
    console.error(message);
  }
  process.exit(1);
};

const root = commandpost
  .create<CompileOpts, CompileArgs>("kakuyomi-html-generator <sources...>")
  .version(packageJson.version, "-v, --version")
  .description("kakuyomu text to HTML Generator")
  .option("-o, --outdir <outdir>", "出力フォルダ")
  .option("-t, --title <title>", "タイトル")
  .option("-w, --writer <writer>", "著者名")
  .action(async (opts, args) => {
    const config: Config = {
      outdir: ".",
      title: "",
      writer: ""
    };
    const cwd = process.cwd();
    if (opts.outdir && opts.outdir[0]) {
      config.outdir = opts.outdir[0];
    }
    if (!opts.title || opts.title.length <= 0) {
      exit(["タイトルを指定指定ください"]);
    }
    config.title = opts.title[0];
    if (!opts.writer || opts.writer.length <= 0) {
      exit(["著者名を指定指定ください"]);
    }
    config.writer = opts.writer[0];
    if (!args.sources || args.sources.length <= 0) {
      exit(["カクヨム記法で書かれたテキストファイルを1つ指定してください"]);
    }
    const sources: {[name: string]: Text} = {};
    for (const source of args.sources) {
      const target = path.resolve(cwd, source);
      const text = await readFile(target, "utf8");
      const result = kakuyomi.parse(text);
      if (result.lexErrors.length > 0) {
        exit(result.lexErrors.map(e => e.message));
      }
      if (result.parseErrors.length > 0) {
        exit(result.parseErrors.map(e => e.message));
      }
      const name = filename(target);
      sources[name] = result.ast;
    }
    const outputPath = path.resolve(cwd, config.outdir);
    try {
      await mkdir(outputPath);
    } catch (e) {}
    const template = await readFile(path.resolve(__dirname, "../views/template.pug"), "utf8");
    for (const [name, text] of Object.entries(sources)) {
      await writeFile(
        path.join(outputPath, `${name}.html`),
        render(template, {
          title: config.title,
          writer: config.writer,
          text
        })
      );
    }
    await fsx.copy(path.resolve(__dirname, "../public"), outputPath);
  });

commandpost.exec(root, process.argv).then(
  () => {
    process.stdout.write("");
    process.exit(0);
  },
  error => {
    console.error(error.message);
    process.exit(1);
  }
);
