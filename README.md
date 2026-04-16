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

## Recommended: set reasoning effort

The plugin can't control reasoning effort (that's a per-user config setting). Recommended settings for the 1M variants:

```json
{
  "plugin": ["opencode-copilot-1m"],
  "provider": {
    "github-copilot": {
      "models": {
        "claude-opus-4.6-1m": {
          "reasoningEffort": "high"
        },
        "claude-opus-4.7-1m": {
          "reasoningEffort": "medium"
        }
      }
    }
  }
}
```

> `high` is the max for Opus 4.6. `medium` is currently the highest available for Opus 4.7.

## How it works

The plugin hooks into the `github-copilot` provider's model list and clones each supported model into a `-1m` variant with `limit.context` set to 1M. It keeps the original API model ID but overrides the client-side context limit.

It also sets the `Copilot-Integration-Id: copilot-developer-cli` header on all Copilot requests.

## Related

- [opencode-anthropic-context-1m](https://github.com/DusKing1/opencode-anthropic-context-1m) -- same thing for Anthropic direct API and Amazon Bedrock
- [OpenCode issue #12338](https://github.com/anomalyco/opencode/issues/12338) -- background on the problem

## License

MIT
