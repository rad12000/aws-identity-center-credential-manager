# AWS Credential Manager Extension

## Summary
Chrome extension that refreshes local `~/.aws/credentials` from AWS IAM Identity Center (SSO).
Requires a companion local Node.js HTTP server (port 50173, mapped to 80 in Docker).

## Repo structure (after main sync)
- `extension/` — Chrome extension (was `AwsCredentialsExtension/`)
- `service/` — Node.js backend (was `AwsCredentialsService/`)
- Extension uses `<details>`/`<summary>` for collapsible accounts
- Accounts sorted alphabetically by AccountName
- Port: localhost:50173
- Has icon assets in `extension/assets/`

## UI Redesign (2026-03-06) — Applied to new structure
Files changed: extension/index.html, extension/css/main.css, extension/js/index.js, extension/manifest.json
- Proper HTML5 doctype, charset, viewport
- AWS-branded dark header (#232f3e) using existing icon asset
- Loading spinner (CSS animation) replaces bare "Loading..." text
- Status bar for success (green) / error (red) feedback after refresh
- Error container for init-time failures with helpful message
- Sticky footer with full-width orange CTA button, disabled when 0 profiles checked
- details/summary with custom chevron SVG, hide native marker
- Account name on one line, account ID in monospace below
- Profile rows: grid with role name | alias input | checkbox
- Alias inputs get focus ring in AWS orange
- CSS custom properties for consistent AWS color palette
- Custom scrollbar styling
- Account ID stored as data-account-id attribute (no regex parsing needed)
- Better error messages guiding user to check portal/server
- manifest.json description updated
