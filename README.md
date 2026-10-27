# Foreclosure Data Hub documentation

Mintlify documentation for the public REST API, published at https://www.foreclosuredatahub.com/docs.

## Structure

Following Reclip's separate docs repository: docs.json controls branding and navigation; MDX pages hold guides and reference content; openapi/ contains the public API contract; logo/ contains the existing brand assets; scripts/ validates content. The private application remains in foreclosuredatahub/foreclosuredatahub-com.

## Development

Run npm ci and npm run validate. Use npx mint dev for local preview, npx mint validate and npx mint broken-links for platform validation.

After changing navigation or page content, run `npm run generate:indexes`. The custom sitemap and AI indexes use the public canonical domain for subpath hosting. Validation checks that these generated files match the current content.

## Hosting

Connect this repository's main branch, root directory /, in Mintlify. Configure www.foreclosuredatahub.com with the Host at subpath set to docs. The application proxies /docs and Mintlify's supporting asset routes. API endpoints stay at https://www.foreclosuredatahub.com/api/v1. /api-docs redirects permanently to /docs.

Do not switch the application's proxy until the Mintlify origin is healthy at /docs. No DNS change is needed for the existing www domain's Vercel proxy.

## Maintaining the contract

Verify endpoint and allowance changes against apps/web/app/api/v1/[...path]/route.ts, lib/public-api/auth.ts, lib/public-api/v1-serialize.ts, lib/export-policy.ts, and lib/licensing-config.ts in the application. Update the OpenAPI snapshot and matching MDX together. endpoint-examples.json records the migrated examples and parameters. Never include private pipeline runbooks, credentials, or customer records.
