import test from "node:test";
import assert from "node:assert/strict";
import { listCommands } from "../src/commands.js";
import { config } from "../src/config.js";

test("runtime defaults are safe and predictable", () => {
  assert.equal(config.name, "LACZEK MD");
  assert.equal(config.prefix, ".");
  assert.ok(Number.isInteger(config.port) && config.port > 0 && config.port < 65536);
});

test("foundation commands are registered exactly once", () => {
  const commands = listCommands();
  assert.deepEqual(commands.map(({ name }) => name).sort(), ["alive", "menu", "ping"]);
  assert.ok(commands.every(({ description }) => typeof description === "string" && description.length > 0));
});
