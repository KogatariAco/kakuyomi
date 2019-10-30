import * as path from "path";
import * as fs from "fs";
import * as chevrotain from "chevrotain";
import * as kakuyomi from "./src/index";

const parser = kakuyomi.parser;
const serialized = parser.getSerializedGastProductions();
const html = chevrotain.createSyntaxDiagramsCode(serialized);

const outDir = path.resolve(__dirname, "./");
fs.writeFileSync(outDir + "/diagrams.html", html);
