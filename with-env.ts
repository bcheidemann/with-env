import { resolve } from "https://deno.land/std@0.126.0/path/mod.ts";
import { ensureArray } from "./utils/ensureArray.ts";
import { dotEnvParser } from "https://deno.land/x/dotenv_parser@0.2.0/mod.ts";
import { getOption } from "https://deno.land/x/denoutils@v0.1.1/CommandLineUtils/getOption/getOption.ts";

if (Deno.args.length === 0) {
  console.log("usage: with-env [...files] -- [command] [...args]");
  Deno.exit(1);
}

if (
  ensureArray(
    getOption({
      type: "boolean",
      alias: "h",
      name: "help",
    })
  ).some(Boolean)
) {
  console.log("usage: with-env [...files] -- [command] [...args]");
  Deno.exit(0);
}

const splitIndex = Deno.args.indexOf("--");

const envFiles = splitIndex === -1 ? ".env" : Deno.args.slice(0, splitIndex);
const cmd =
  splitIndex === -1 ? Array.from(Deno.args) : Deno.args.slice(splitIndex + 1);

const env: Record<string, string> = {};

if (envFiles) {
  const cwd = Deno.cwd();
  await Promise.all(
    ensureArray(envFiles)
      .map((value) => value.split(","))
      .flat()
      .map((relativePath) => resolve(cwd, relativePath))
      .map((absolutePath) => Deno.readTextFile(absolutePath))
  ).then((rawEnvs) =>
    rawEnvs
      .map(dotEnvParser)
      .map(Object.entries)
      .flat()
      .forEach(([key, value]) => (env[key] = value))
  );
}

const permissions = await Deno.permissions.request({
  name: "run",
  command: cmd[0],
});

if (permissions.state !== "granted") {
  console.log("Must pass --allow-run");
  Deno.exit(1);
}

const process = Deno.run({
  cmd,
  env,
});

const { code } = await process.status();

Deno.exit(code);
