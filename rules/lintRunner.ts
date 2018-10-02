import {Configuration, Linter, } from 'tslint';
import * as ts from "typescript";
import * as fs from 'fs';
import * as path from "path";

const defaultCompilerOptions = ts.getDefaultCompilerOptions();

defaultCompilerOptions.target = ts.ScriptTarget.ES2017;
defaultCompilerOptions.module = ts.ModuleKind.CommonJS;

export const helper = ({src, rule}) => {
    var filename = 'filename.ts';
    
    const compilerHost: ts.CompilerHost = {
        fileExists: (file) => file === filename || fs.existsSync(file),
        getCanonicalFileName: (filename) => filename,
        getCurrentDirectory: () => '/',
        getDefaultLibFileName: () => ts.getDefaultLibFileName(defaultCompilerOptions),
        getDirectories: (dir) => fs.readdirSync(dir),
        getNewLine: () => "\n",
        getSourceFile(filenameToGet, target) {
            if (denormalizeWinPath(filenameToGet) === filename) {
                return ts.createSourceFile(filenameToGet, src, target, true);
            }
            if (path.basename(filenameToGet) === filenameToGet) {
                // resolve path of lib.xxx.d.ts
                filenameToGet = path.join(path.dirname(ts.getDefaultLibFilePath(defaultCompilerOptions)), filenameToGet);
            }
            const text = fs.readFileSync(filenameToGet, "utf8");
            return ts.createSourceFile(filenameToGet, text, target, true);
        },
        readFile: (x) => x,
        useCaseSensitiveFileNames: () => true,
        writeFile: () => null,
    };
    
    const program = ts.createProgram([filename], defaultCompilerOptions, compilerHost);
    const linter = new Linter({ fix: false, formatter: "prose" }, program);
    
    linter.lint(filename, null, Configuration.parseConfigFile({
        "rules": {
            [rule.name || rule]: [true, ...rule.options]
        },
        "rulesDirectory": "rules"
    }));
    
    return linter.getResult();
};

export function denormalizeWinPath(path: string): string {
    return path.replace(/\\/g, "/");
}