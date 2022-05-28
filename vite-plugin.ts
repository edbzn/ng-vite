import {
  AngularComponents,
  AngularImportCompilerComponents,
  AngularInjector,
  FileSystem
} from "@nxext/angular-swc";
import { plugins, Program, transform } from "@swc/core";
import { Plugin } from "vite";

const FILE_EXTENSION_REG = /\.[^/\s?]+$/;

export function AngularVitePlugin(): Plugin {
  let fileSystem: FileSystem | null = null;

  return {
    name: "angular-vite-plugin",

    enforce: "pre",

    buildStart: async () => {
      fileSystem = new FileSystem();
    },

    transform: (code, id) => {
      if (id.includes("node_modules")) {
        return code;
      }

      if (!/\.(js|ts?)$/.test(getFileExtension(id))) {
        return code;
      }

      return transform(code, {
        sourceMaps: false,
        jsc: {
          target: "es2020",
          parser: {
            syntax: "typescript",
            tsx: false,
            decorators: true,
            dynamicImport: true,
          },
          transform: {
            decoratorMetadata: true,
            legacyDecorator: true,
          },
        },
        module: {
          type: "es6",
          lazy: true,
        },
        plugin: plugins([
          (p: Program) => new AngularComponents({
            sourceUrl: id,
            fileSystem,
          }).visitProgram(p),
          (p: Program) => new AngularInjector().visitProgram(p),
          (p: Program) => new AngularImportCompilerComponents().visitProgram(p),
        ]),
      });
    },
  };
}

function getFileExtension(id: string): string {
  const [filepath, querystring = ""] = id.split("?");
  const [extension = ""] =
    querystring.match(FILE_EXTENSION_REG) ??
    filepath.match(FILE_EXTENSION_REG) ??
    [];

  return extension;
}
