import type { Hooks } from "@opencode-ai/plugin";

export default function (): Hooks {
  return {
    provider: {
      id: "github-copilot",
      async models(provider) {
        // Opus 4.6
        const opus46 = provider.models["claude-opus-4.6"];
        if (opus46) {
          provider.models["claude-opus-4.6"] = {
            ...opus46,
            name: opus46.name || "Claude Opus 4.6",
            limit: {
              ...opus46.limit,
              context: 1000000,
              input: 900000,
            },
          };
        }

        // Opus 4.7
        const opus47 = provider.models["claude-opus-4.7"];
        if (opus47) {
          provider.models["claude-opus-4.7"] = {
            ...opus47,
            name: opus47.name || "Claude Opus 4.7",
            limit: {
              ...opus47.limit,
              context: 1000000,
              input: 900000,
            },
          };
        }

        // Sonnet 4.6
        const sonnet46 = provider.models["claude-sonnet-4.6"];
        if (sonnet46) {
          provider.models["claude-sonnet-4.6"] = {
            ...sonnet46,
            name: sonnet46.name || "Claude Sonnet 4.6",
            limit: {
              ...sonnet46.limit,
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
}
