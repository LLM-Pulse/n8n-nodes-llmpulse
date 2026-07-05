# n8n-nodes-llmpulse

This is an n8n community node for [LLM Pulse](https://llmpulse.ai), the AI visibility analytics platform. It lets you read and write LLM Pulse data from your n8n workflows: projects, prompts, competitors, mentions, citations, metrics, GEO Writer tasks and timeline annotations. It also ships a trigger node that starts workflows in real time when new mentions, citations or other events happen in your account.

[n8n](https://n8n.io/) is a fair-code licensed workflow automation platform.

## Prerequisites

- An LLM Pulse account on the Scale plan or above (API keys are available on Scale and Enterprise).
- An API key, generated in the LLM Pulse app under Settings > API Keys. Keys look like `llmpulse_...`.

API reference: [https://llmpulse.ai/api-docs](https://llmpulse.ai/api-docs)

## Installation

### Community nodes panel (recommended)

1. In n8n, go to **Settings > Community Nodes**.
2. Click **Install** and enter `n8n-nodes-llmpulse`.
3. Accept the risks prompt and install.

### Manual install

For self-hosted n8n instances:

```bash
cd ~/.n8n/nodes
npm install n8n-nodes-llmpulse
```

Restart n8n afterwards.

## Credentials

Create a credential of type **LLM Pulse API** and paste your API key. The credential test calls `GET https://api.llmpulse.ai/api/v1/ping` to verify the key.

## LLM Pulse node: operations

| Resource | Operation | Description |
| --- | --- | --- |
| Project | Get Many | List all projects the API key can access |
| Project | Get | Get full details of a single project |
| Prompt | Get Many | List prompts of a project, with filters (model, collection, locale, type, dates) |
| Prompt | Create | Bulk-create prompts (up to 100 per call) |
| Prompt | Assign Tags | Bulk-attach tags to prompts, optionally creating missing tags |
| Competitor | Get Many | List competitors of a project |
| Competitor | Create | Add a competitor (brand name, domain, matching names) |
| Collection | Get Many | List tags/collections of a project |
| Collection | Create | Create a tag/collection, optionally attaching prompts |
| Mention | Get Many | List brand mentions, with filters and pagination |
| Citation | Get Many | List brand citations, with filters and pagination |
| Metric | Get Summary | Aggregated metrics (visibility, mentions, citations, sentiment and more) |
| Metric | Get Timeseries | Time-series metrics by day, week or month |
| Metric | Get Share of Voice | Share of voice of the brand vs competitors |
| Intelligence Task | Get Many | List GEO Writer tasks |
| Intelligence Task | Get | Get a GEO Writer task with its result |
| Intelligence Task | Create | Create a GEO Writer task (brief, article, update, PR insights, custom) |
| Annotation | Create | Create a timeline annotation on the project charts |

Projects, competitors, collections and tags are selectable from dropdowns that load live data from your account. You can always switch to an expression and pass an ID instead.

List operations support `page` and `per_page` (max 100) filters. Responses are unwrapped so each row becomes one n8n item.

## LLM Pulse Trigger node: events

The trigger registers webhook subscriptions via `POST /api/v1/webhooks` when the workflow is activated and removes them when it is deactivated. One subscription is created per selected event.

| Event | Fires when |
| --- | --- |
| Mention Created | Your brand is mentioned in an AI answer |
| Competitor Mention Created | A competitor is mentioned in an AI answer |
| Citation Created | Your domain is cited in an AI answer |
| Prompt Execution Completed | A prompt finishes executing against an AI model |
| Negative Sentiment Detected | A negative or very negative sentiment is detected |
| Recommendation Completed | A recommendations run finishes |
| Intelligence Task Completed | A GEO Writer task finishes |

Each delivery has this envelope:

```json
{
  "event": "mention.created",
  "occurred_at": "2026-06-11T10:30:00Z",
  "project_id": 42,
  "subscription_id": 7,
  "data": { }
}
```

### Signature verification

Deliveries are signed with an HMAC SHA-256 header:

```
X-LLMPulse-Signature: sha256=<hex digest of the raw request body, keyed with the subscription secret>
```

The trigger node verifies this signature by default (the **Verify Signature** option) and rejects non-matching requests with a 401. You can disable verification for local testing, but keep it on in production.

## Compatibility

Tested with n8n 1.x. Requires Node.js 18.10 or newer to build.

## Development

```bash
npm install
npm run build   # tsc + copy icons and metadata to dist
npm run lint    # eslint with eslint-plugin-n8n-nodes-base
```

## Resources

- [LLM Pulse API documentation](https://llmpulse.ai/api-docs)
- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)

## License

MIT
