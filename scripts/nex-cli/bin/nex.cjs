#!/usr/bin/env node

const { spawn } = require("node:child_process");
const path = require("node:path");

const args = process.argv.slice(2);
const repoRoot = path.resolve(__dirname, "..", "..", "..");

const commandToScript = {
  dev: "dev:next",
  build: "build:single-hosting",
};

const parseCommand = (argv) => {
  if (argv.length === 0) {
    return "dev";
  }

  if (argv[0] === "run" && argv[1]) {
    return argv[1];
  }

  return argv[0];
};

const command = parseCommand(args);

if (command === "-h" || command === "--help") {
  console.log("Usage: npx nex [dev|build]");
  console.log("");
  console.log("Commands:");
  console.log("  dev    Start Next frontend + API backend together (default)");
  console.log("  build  Build Next frontend + API backend together");
  console.log("");
  console.log("Examples:");
  console.log("  npx nex");
  console.log("  npx nex dev");
  console.log("  npx nex run dev");
  process.exit(0);
}

const script = commandToScript[command];
if (!script) {
  console.error(`Unknown command: ${command}`);
  console.error("Use: npx nex [dev|build]");
  process.exit(1);
}

const child = spawn("npm", ["run", script], {
  cwd: repoRoot,
  stdio: "inherit",
  shell: true,
});

child.on("exit", (code) => {
  process.exit(code ?? 1);
});

child.on("error", (error) => {
  console.error(error.message);
  process.exit(1);
});
