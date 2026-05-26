/**
 * Empirika OpenAPI 3.0 specification.
 * Served at GET /v1/openapi.json and rendered via Swagger UI at /docs.
 */

const NICHES = ['Trades', 'Mythology', 'Scouts', 'Neurodivergent', 'Stories'];

const nicheParam = {
  name: 'niche',
  in: 'path',
  required: true,
  description: `Audience niche segment. One of: ${NICHES.join(', ')}`,
  schema: { type: 'string', enum: NICHES },
};

const daysParam = {
  name: 'days',
  in: 'query',
  required: false,
  description: 'Rolling lookback window in days (1–90). Defaults to 30.',
  schema: { type: 'integer', minimum: 1, maximum: 90, default: 30 },
};

const errorSchema = {
  type: 'object',
  properties: {
    error:   { type: 'string' },
    message: { type: 'string' },
  },
};

export const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Empirika Audience Intelligence API',
    version: '1.0.0',
    description: `
The Empirika API gives brand teams and developers programmatic access to YouTube audience
intelligence across five high-value niche segments.

## Authentication

All data endpoints require an API key, passed via one of:
- \`X-API-Key: emp_sandbox_...\`
- \`Authorization: Bearer emp_sandbox_...\`

Get your key at **[/developer](/developer)**.

## Sandbox vs Production

| Key prefix | Data source | Rate limit |
|---|---|---|
| \`emp_sandbox_*\` | Rich deterministic mock data | 60 req/min |
| \`emp_live_*\` | Live BigQuery — real YouTube metrics | 120 req/min |

Sandbox keys are free. Production keys are included in paid plans.

## Rate Limiting

Rate limit headers are returned on every response:
- \`X-RateLimit-Limit\` — requests per minute allowed
- \`X-RateLimit-Remaining\` — requests left in the current window
- \`X-RateLimit-Reset\` — Unix timestamp when the window resets
    `,
    contact: {
      name: 'Empirika Support',
      url: 'https://empirika-dashboard.vercel.app/developer',
    },
  },
  servers: [
    {
      url: process.env.API_BASE_URL || 'http://localhost:5000',
      description: 'Empirika Backend API',
    },
  ],
  components: {
    securitySchemes: {
      ApiKeyHeader: {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key',
        description: 'Pass your Empirika API key in the X-API-Key header.',
      },
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'emp_sandbox_... or emp_live_...',
        description: 'Pass your Empirika API key as a Bearer token.',
      },
    },
    schemas: {
      Error: errorSchema,
      AudienceChannel: {
        type: 'object',
        properties: {
          channel_id:                { type: 'string', example: 'UCsandbox_trades_1' },
          channel_name:              { type: 'string', example: 'Path2Pro Trades' },
          subscriber_count:          { type: 'integer', example: 184200 },
          total_views:               { type: 'integer', example: 2840000 },
          total_watch_hours:         { type: 'number',  example: 94667 },
          avg_view_duration_seconds: { type: 'number',  example: 721 },
          total_subscribers_gained:  { type: 'integer', example: 3410 },
          total_likes:               { type: 'integer', example: 87400 },
          total_comments:            { type: 'integer', example: 12300 },
        },
      },
      AudienceResponse: {
        type: 'object',
        properties: {
          mode:         { type: 'string', enum: ['sandbox', 'production'], example: 'sandbox' },
          niche:        { type: 'string', example: 'Trades' },
          data:         { type: 'array', items: { $ref: '#/components/schemas/AudienceChannel' } },
          generated_at: { type: 'string', format: 'date-time' },
        },
      },
      AffinityItem: {
        type: 'object',
        properties: {
          category:       { type: 'string', example: 'Scouts' },
          description:    { type: 'string', example: 'Outdoor skills & wilderness adventure fans' },
          engagement_pct: { type: 'integer', example: 42 },
          examples:       { type: 'array', items: { type: 'string' } },
        },
      },
      AffinityResponse: {
        type: 'object',
        properties: {
          mode:         { type: 'string', example: 'sandbox' },
          niche:        { type: 'string', example: 'Trades' },
          data:         { type: 'array', items: { $ref: '#/components/schemas/AffinityItem' } },
          generated_at: { type: 'string', format: 'date-time' },
        },
      },
      SentimentResponse: {
        type: 'object',
        properties: {
          mode:  { type: 'string', example: 'sandbox' },
          niche: { type: 'string', example: 'Stories' },
          sentiment: {
            type: 'object',
            properties: {
              score:   { type: 'integer', minimum: 0, maximum: 100, example: 81 },
              label:   { type: 'string', enum: ['Positive', 'Neutral', 'Negative'], example: 'Positive' },
              summary: { type: 'string' },
            },
          },
          keywords: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                keyword:  { type: 'string', example: '1001 nights' },
                mentions: { type: 'integer', example: 3120 },
              },
            },
          },
          generated_at: { type: 'string', format: 'date-time' },
        },
      },
      InsightResponse: {
        type: 'object',
        properties: {
          mode:            { type: 'string', example: 'sandbox' },
          niche:           { type: 'string', example: 'Mythology' },
          title:           { type: 'string', example: 'The Global African Heritage Explorer' },
          summary:         { type: 'string' },
          keyBehaviors:    { type: 'array', items: { type: 'string' } },
          marketingAngles: { type: 'array', items: { type: 'string' } },
          confidence:      { type: 'string', enum: ['high', 'medium', 'low'], example: 'high' },
          generated_at:    { type: 'string', format: 'date-time' },
        },
      },
      Channel: {
        type: 'object',
        properties: {
          channel_id:       { type: 'string' },
          channel_name:     { type: 'string' },
          niche_category:   { type: 'string', enum: NICHES },
          subscriber_count: { type: 'integer' },
          video_count:      { type: 'integer' },
          view_count:       { type: 'integer' },
          thumbnail_url:    { type: 'string', nullable: true },
        },
      },
      ChannelsResponse: {
        type: 'object',
        properties: {
          mode:         { type: 'string', example: 'sandbox' },
          data:         { type: 'array', items: { $ref: '#/components/schemas/Channel' } },
          generated_at: { type: 'string', format: 'date-time' },
        },
      },
      ApiKey: {
        type: 'object',
        properties: {
          id:             { type: 'string', format: 'uuid' },
          key_prefix:     { type: 'string', example: 'emp_sandbox_ab12' },
          name:           { type: 'string', example: 'My Sandbox Key' },
          email:          { type: 'string', format: 'email' },
          environment:    { type: 'string', enum: ['sandbox', 'production'] },
          is_active:      { type: 'boolean' },
          rate_limit_rpm: { type: 'integer', example: 60 },
          created_at:     { type: 'string', format: 'date-time' },
          last_used_at:   { type: 'string', format: 'date-time', nullable: true },
        },
      },
      UsageRecord: {
        type: 'object',
        properties: {
          endpoint:    { type: 'string', example: '/v1/audience/:niche' },
          status_code: { type: 'integer', example: 200 },
          response_ms: { type: 'integer', example: 142 },
          niche:       { type: 'string', nullable: true },
          created_at:  { type: 'string', format: 'date-time' },
        },
      },
    },
  },
  security: [{ ApiKeyHeader: [] }, { BearerAuth: [] }],
  paths: {

    // ── Audience ──────────────────────────────────────────────────────
    '/v1/audience/{niche}': {
      get: {
        tags: ['Audience'],
        summary: 'Get audience metrics for a niche',
        description: 'Returns per-channel YouTube metrics (views, watch hours, subscribers gained, etc.) for all tracked channels in the specified niche over the selected time window.',
        operationId: 'getAudience',
        parameters: [nicheParam, daysParam],
        responses: {
          200: { description: 'Audience metrics', content: { 'application/json': { schema: { $ref: '#/components/schemas/AudienceResponse' } } } },
          400: { description: 'Invalid niche', content: { 'application/json': { schema: errorSchema } } },
          401: { description: 'Missing or invalid API key', content: { 'application/json': { schema: errorSchema } } },
          429: { description: 'Rate limit exceeded', content: { 'application/json': { schema: errorSchema } } },
        },
      },
    },

    // ── Affinity ──────────────────────────────────────────────────────
    '/v1/affinity/{niche}': {
      get: {
        tags: ['Affinity'],
        summary: 'Get cross-niche audience affinity scores',
        description: 'Returns overlap scores showing what percentage of the target niche\'s audience also engages with each other niche. Useful for planning cross-niche sponsorships.',
        operationId: 'getAffinity',
        parameters: [nicheParam],
        responses: {
          200: { description: 'Affinity scores', content: { 'application/json': { schema: { $ref: '#/components/schemas/AffinityResponse' } } } },
          400: { description: 'Invalid niche', content: { 'application/json': { schema: errorSchema } } },
          401: { description: 'Missing or invalid API key', content: { 'application/json': { schema: errorSchema } } },
          429: { description: 'Rate limit exceeded', content: { 'application/json': { schema: errorSchema } } },
        },
      },
    },

    // ── Sentiment ─────────────────────────────────────────────────────
    '/v1/sentiment/{niche}': {
      get: {
        tags: ['Sentiment'],
        summary: 'Get community sentiment and trending keywords',
        description: 'Returns an aggregated sentiment score (0–100), label, and the top trending keywords for the niche community across Reddit and social platforms.',
        operationId: 'getSentiment',
        parameters: [nicheParam, daysParam],
        responses: {
          200: { description: 'Sentiment data', content: { 'application/json': { schema: { $ref: '#/components/schemas/SentimentResponse' } } } },
          400: { description: 'Invalid niche', content: { 'application/json': { schema: errorSchema } } },
          401: { description: 'Missing or invalid API key', content: { 'application/json': { schema: errorSchema } } },
          429: { description: 'Rate limit exceeded', content: { 'application/json': { schema: errorSchema } } },
        },
      },
    },

    // ── Insights ──────────────────────────────────────────────────────
    '/v1/insights/{niche}': {
      get: {
        tags: ['Insights'],
        summary: 'Get AI-generated audience intelligence report',
        description: 'Returns a Claude-powered audience intelligence report: who the audience is, what drives them, key behavioral patterns, and actionable brand marketing angles. Sandbox returns curated reports; production generates live reports from real data.',
        operationId: 'getInsights',
        parameters: [nicheParam],
        responses: {
          200: { description: 'Insight report', content: { 'application/json': { schema: { $ref: '#/components/schemas/InsightResponse' } } } },
          400: { description: 'Invalid niche', content: { 'application/json': { schema: errorSchema } } },
          401: { description: 'Missing or invalid API key', content: { 'application/json': { schema: errorSchema } } },
          429: { description: 'Rate limit exceeded', content: { 'application/json': { schema: errorSchema } } },
        },
      },
    },

    // ── Channels ──────────────────────────────────────────────────────
    '/v1/channels': {
      get: {
        tags: ['Channels'],
        summary: 'List all tracked YouTube channels',
        description: 'Returns metadata for all YouTube channels tracked by Empirika. Filter by niche with the `niche` query parameter.',
        operationId: 'getChannels',
        parameters: [
          {
            name: 'niche',
            in: 'query',
            required: false,
            description: 'Filter channels by niche category.',
            schema: { type: 'string', enum: NICHES },
          },
        ],
        responses: {
          200: { description: 'Channel list', content: { 'application/json': { schema: { $ref: '#/components/schemas/ChannelsResponse' } } } },
          401: { description: 'Missing or invalid API key', content: { 'application/json': { schema: errorSchema } } },
          429: { description: 'Rate limit exceeded', content: { 'application/json': { schema: errorSchema } } },
        },
      },
    },

    // ── Keys ──────────────────────────────────────────────────────────
    '/v1/keys': {
      post: {
        tags: ['API Keys'],
        summary: 'Create a new API key',
        description: 'Creates a new sandbox or production API key. The full key is returned **only once** — store it immediately. Production keys are available on paid plans.',
        operationId: 'createKey',
        security: [],   // No auth required for bootstrapping
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email'],
                properties: {
                  name:        { type: 'string', example: 'My Sandbox Key', description: 'A label for this key (e.g. project name)' },
                  email:       { type: 'string', format: 'email', example: 'you@company.com' },
                  environment: { type: 'string', enum: ['sandbox', 'production'], default: 'sandbox' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Key created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message:        { type: 'string' },
                    key:            { type: 'string', description: 'Full API key — shown once only', example: 'emp_sandbox_a1b2c3d4...' },
                    id:             { type: 'string', format: 'uuid' },
                    key_prefix:     { type: 'string' },
                    environment:    { type: 'string' },
                    rate_limit_rpm: { type: 'integer' },
                    created_at:     { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
          400: { description: 'Validation error', content: { 'application/json': { schema: errorSchema } } },
        },
      },
      get: {
        tags: ['API Keys'],
        summary: 'List your API keys',
        description: 'Returns all API keys associated with the provided email address.',
        operationId: 'listKeys',
        security: [],
        parameters: [
          {
            name: 'email',
            in: 'query',
            required: true,
            description: 'Your email address.',
            schema: { type: 'string', format: 'email' },
          },
        ],
        responses: {
          200: {
            description: 'Key list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    keys: { type: 'array', items: { $ref: '#/components/schemas/ApiKey' } },
                  },
                },
              },
            },
          },
          400: { description: 'Missing email', content: { 'application/json': { schema: errorSchema } } },
        },
      },
    },

    '/v1/keys/{id}': {
      delete: {
        tags: ['API Keys'],
        summary: 'Revoke an API key',
        description: 'Permanently deactivates an API key. All requests using the revoked key will return 401. Requires email confirmation.',
        operationId: 'revokeKey',
        security: [],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'The UUID of the key to revoke.',
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: {
                  email: { type: 'string', format: 'email', description: 'Your email — must match the key owner.' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Key revoked', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' }, id: { type: 'string' } } } } } },
          400: { description: 'Missing email', content: { 'application/json': { schema: errorSchema } } },
          500: { description: 'Server error', content: { 'application/json': { schema: errorSchema } } },
        },
      },
    },

    // ── Usage ─────────────────────────────────────────────────────────
    '/v1/usage': {
      get: {
        tags: ['Usage'],
        summary: 'Get API usage for your key',
        description: 'Returns the last 200 API calls made with the authenticated key, including endpoint, status code, and response time.',
        operationId: 'getUsage',
        responses: {
          200: {
            description: 'Usage records',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    key_prefix:     { type: 'string' },
                    environment:    { type: 'string' },
                    rate_limit_rpm: { type: 'integer' },
                    usage:          { type: 'array', items: { $ref: '#/components/schemas/UsageRecord' } },
                    generated_at:   { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
          401: { description: 'Missing or invalid API key', content: { 'application/json': { schema: errorSchema } } },
        },
      },
    },

    // ── Health ────────────────────────────────────────────────────────
    '/api/health': {
      get: {
        tags: ['System'],
        summary: 'Health check',
        description: 'Returns server health status. No authentication required.',
        operationId: 'healthCheck',
        security: [],
        responses: {
          200: {
            description: 'Server is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status:  { type: 'string', example: 'ok' },
                    service: { type: 'string', example: 'empirika-backend' },
                    ts:      { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  tags: [
    { name: 'Audience',  description: 'YouTube audience metrics per niche' },
    { name: 'Affinity',  description: 'Cross-niche audience overlap analysis' },
    { name: 'Sentiment', description: 'Community sentiment and keyword trends' },
    { name: 'Insights',  description: 'AI-generated audience intelligence reports' },
    { name: 'Channels',  description: 'Tracked YouTube channel catalogue' },
    { name: 'API Keys',  description: 'API key lifecycle management' },
    { name: 'Usage',     description: 'Per-key API usage analytics' },
    { name: 'System',    description: 'Infrastructure and health endpoints' },
  ],
};
