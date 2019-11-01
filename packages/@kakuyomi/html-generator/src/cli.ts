import {promisify} from "util";
import * as fs from "fs";
import * as fsx from "fs-extra";
import * as path from "path";
import * as commandpost from "commandpost";
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
  source: string;
}

interface Config {
  outdir: string;
  title: string;
  writer: string;
}

const root = commandpost
  .create<CompileOpts, CompileArgs>("kakuyomi-html-generatorr [source]")
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
      console.log("タイトルを指定指定ください");
    }
    config.title = opts.title[0];
    if (!opts.writer || opts.writer.length <= 0) {
      console.log("著者名を指定指定ください");
    }
    config.writer = opts.writer[0];
    if (!args.source || args.source.length <= 0) {
      console.log("カクヨム記法で書かれたテキストファイルを1つ指定してください");
      process.exit(1);
    }
    const text = await readFile(path.resolve(cwd, args.source), "utf8");
    const result = kakuyomi.parse(text);
    if (result.lexErrors.length > 0) {
      for (const e of result.lexErrors) {
        console.log(e.message);
      }
      process.exit(1);
    }
    if (result.parseErrors.length > 0) {
      for (const e of result.parseErrors) {
        console.log(e.message);
      }
      process.exit(1);
    }
    const outputPath = path.resolve(cwd, config.outdir);
    try {
      await mkdir(outputPath);
    } catch (e) {}
    const template = await readFile(path.resolve(__dirname, "../views/template.pug"), "utf8");
    await writeFile(
      path.join(outputPath, "index.html"),
      render(template, {
        title: config.title,
        writer: config.writer,
        text: result.ast
      })
    );
    await fsx.copy(path.resolve(__dirname, "../public"), outputPath);
  });

commandpost.exec(root, process.argv).then(
  () => {
    process.stdout.write("");
    process.exit(0);
  },
  err => {
    console.error("uncaught error", err);
    process.exit(1);
  }
);
