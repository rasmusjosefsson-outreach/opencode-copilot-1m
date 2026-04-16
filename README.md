# opencode-copilot-1m

OpenCode plugin that adds 1M context window variants for Claude models on GitHub Copilot.

Without this plugin, Copilot's API reports ~200K context for Claude models. This plugin creates separate `(1M)` model entries with the limit overridden to 1M tokens. The original models remain available.

## Supported models

- Claude Opus 4.6
- Claude Opus 4.7
- Claude Sonnet 4.6

## Install

Add to your `opencode.json`:

```json
{
  "plugin": ["opencode-copilot-1m"]
}
```

Restart OpenCode. You'll see new model entries like "Claude Opus 4.7 (1M)" alongside the originals.

## Optional: set reasoning effort

The plugin can't control reasoning effort (that's a per-user config setting). If you want to change it on a 1M variant, add it to your model config. For example, Opus 4.7 defaults to something other than medium:

```json
{
  "plugin": ["opencode-copilot-1m"],
  "provider": {
    "github-copilot": {
      "models": {
        "claude-opus-4.7-1m": {
          "reasoningEffort": "medium",
          "variants": {
            "medium": { "reasoningEffort": "medium" }
          }
        }
      }
    }
  }
}
```

## How it works

The plugin hooks into the `github-copilot` provider's model list and clones each supported model into a `-1m` variant with `limit.context` set to 1M. For Opus 4.6, it uses the real Copilot model ID `claude-opus-4.6-1m`. For others, it keeps the original API model ID but overrides the client-side context limit.

It also sets the `Copilot-Integration-Id: copilot-developer-cli` header on all Copilot requests.

## Related

- [opencode-anthropic-context-1m](https://github.com/DusKing1/opencode-anthropic-context-1m) -- same thing for Anthropic direct API and Amazon Bedrock
- [OpenCode issue #12338](https://github.com/anomalyco/opencode/issues/12338) -- background on the problem

## License

MIT
