import assert from "node:assert/strict";
import test from "node:test";

import { plugin } from "../dist/index.js";

const DEFAULT_LIMIT = { context: 200000, input: 180000, output: 20000 };

const clone = (value) => JSON.parse(JSON.stringify(value));

function buildModel(id, overrides = {}) {
  const model = {
    id,
    name: overrides.name ?? id,
    api: overrides.api ?? { id, model: id },
    ...overrides,
  };

  if (!("limit" in overrides)) {
    model.limit = DEFAULT_LIMIT;
  }

  return model;
}

async function runModelHook(models) {
  const hooks = await plugin();
  return hooks.provider.models({ models: clone(models) });
}

async function runHeaderHook(providerID) {
  const hooks = await plugin();
  const output = { headers: {} };
  await hooks["chat.headers"]({ model: { providerID } }, output);
  return output.headers;
}

test("creates gpt-5.4-1m while leaving the returned base entry unchanged", async () => {
  const original = buildModel("gpt-5.4", {
    name: "GPT-5.4",
    api: { id: "gpt-5.4", model: "gpt-5.4" },
    limit: { context: 272000, input: 272000, output: 128000 },
  });

  const models = await runModelHook({ "gpt-5.4": original });

  assert.equal(models["gpt-5.4-1m"].id, "gpt-5.4-1m");
  assert.equal(models["gpt-5.4-1m"].limit.context, 1050000);
  assert.equal(models["gpt-5.4-1m"].limit.input, 922000);
  assert.equal(models["gpt-5.4-1m"].limit.output, 128000);
  assert.deepEqual(models["gpt-5.4-1m"].api, original.api);
  assert.deepEqual(models["gpt-5.4"].limit, original.limit);
  assert.deepEqual(models["gpt-5.4"].api, original.api);
});

test("skips gpt-5.4-1m creation when the base model is missing", async () => {
  const models = await runModelHook({});
  assert.equal(models["gpt-5.4-1m"], undefined);
});

test("preserves an existing gpt-5.4-1m entry", async () => {
  const existing = buildModel("gpt-5.4-1m", {
    name: "GPT-5.4 (Existing)",
    limit: { context: 777, input: 666, output: 55 },
  });

  const models = await runModelHook({
    "gpt-5.4": buildModel("gpt-5.4"),
    "gpt-5.4-1m": existing,
  });

  assert.deepEqual(models["gpt-5.4-1m"], existing);
});

test("rebuilds existing Claude 1M variants from their base models", async () => {
  const models = await runModelHook({
    "claude-opus-4.6": buildModel("claude-opus-4.6", {
      name: "Claude Opus 4.6",
      limit: { context: 222000, input: 200000, output: 22000 },
    }),
    "claude-opus-4.6-1m": buildModel("claude-opus-4.6-1m", {
      name: "Stale Claude Opus 4.6 (1M)",
      limit: { context: 1, input: 2, output: 3 },
    }),
  });

  assert.equal(models["claude-opus-4.6-1m"].name, "Claude Opus 4.6 (1M)");
  assert.equal(models["claude-opus-4.6-1m"].limit.context, 1000000);
  assert.equal(models["claude-opus-4.6-1m"].limit.input, 900000);
  assert.equal(models["claude-opus-4.6-1m"].limit.output, 22000);
});

test("fills in overrides even when the base model has no limit object", async () => {
  const models = await runModelHook({
    "gpt-5.4": buildModel("gpt-5.4", { limit: undefined }),
  });

  assert.equal(models["gpt-5.4-1m"].limit.context, 1050000);
  assert.equal(models["gpt-5.4-1m"].limit.input, 922000);
  assert.equal(models["gpt-5.4-1m"].limit.output, undefined);
});

test("keeps the current Claude 1M variants unchanged", async () => {
  const models = await runModelHook({
    "claude-opus-4.6": buildModel("claude-opus-4.6"),
    "claude-opus-4.7": buildModel("claude-opus-4.7"),
    "claude-sonnet-4.6": buildModel("claude-sonnet-4.6"),
  });

  for (const id of ["claude-opus-4.6", "claude-opus-4.7", "claude-sonnet-4.6"]) {
    assert.equal(models[`${id}-1m`].limit.context, 1000000);
    assert.equal(models[`${id}-1m`].limit.input, 900000);
  }
});

test("sets the Copilot integration header only for Copilot models", async () => {
  assert.equal(
    (await runHeaderHook("github-copilot"))["Copilot-Integration-Id"],
    "copilot-developer-cli",
  );
  assert.deepEqual(await runHeaderHook("openai"), {});
});
