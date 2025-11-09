import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import ts from "typescript";

const projectRoot = process.cwd();
const srcRoot = path.resolve(projectRoot, "src");

const COMPILER_OPTIONS = {
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.NodeNext,
  target: ts.ScriptTarget.ES2022,
  esModuleInterop: true,
  jsx: ts.JsxEmit.ReactJSX,
};

const TS_EXTENSIONS = ["", ".ts", ".tsx", ".js", ".jsx"];

export async function resolve(specifier, context, defaultResolve) {
  if (specifier.startsWith("@/")) {
    const relativePath = specifier.slice(2);

    for (const ext of TS_EXTENSIONS) {
      const candidatePath = path.resolve(srcRoot, relativePath + ext);
      try {
        await stat(candidatePath);
        return {
          url: pathToFileURL(candidatePath).href,
          shortCircuit: true,
        };
      } catch (error) {
        if (error.code !== "ENOENT") {
          throw error;
        }
      }
    }
  }

  return defaultResolve(specifier, context, defaultResolve);
}

export async function load(url, context, defaultLoad) {
  if (url.endsWith(".ts") || url.endsWith(".tsx")) {
    const filePath = fileURLToPath(url);
    const source = await readFile(filePath, "utf-8");
    const { outputText } = ts.transpileModule(source, {
      compilerOptions: COMPILER_OPTIONS,
      fileName: filePath,
    });

    return {
      format: "module",
      source: outputText,
      shortCircuit: true,
    };
  }

  return defaultLoad(url, context, defaultLoad);
}
