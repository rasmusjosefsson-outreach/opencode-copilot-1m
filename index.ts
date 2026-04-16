import type { Plugin } from "@opencode-ai/plugin";

const MODELS = [
  "claude-opus-4.6",
  "claude-opus-4.7",
  "claude-sonnet-4.6",
];

export const plugin: Plugin = async () => {
  return {
    provider: {
      id: "github-copilot",
      async models(provider) {
        for (const id of MODELS) {
          const base = provider.models[id];
          if (!base) continue;

          const name = base.name || id;
          provider.models[`${id}-1m`] = {
            ...base,
            id: `${id}-1m`,
            name: `${name} (1M)`,
            api: { ...base.api },
            limit: {
              ...base.limit,
              context: 1000000,
              input: 900000,
            },
          };
        }

        return provider.models;
      },
    },
    "chat.headers": async (incoming, output) => {
      if (!incoming.model.providerID.includes("github-copilot")) return;
      output.headers["Copilot-Integration-Id"] = "copilot-developer-cli";
    },
  };
};

export default plugin;
