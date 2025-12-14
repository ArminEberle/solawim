# Copilot Instructions

## General
- Follow existing formatting and keep indentation at four spaces.
- Prefer existing helpers such as `getJsonBody` for API calls and `ensureDBInitialized` for database access.
- Use absolute imports that start with `src/` when referencing project modules from TypeScript.
- Keep new files ASCII-only unless an existing file already uses non-ASCII characters.

## TypeScript
- Type definitions live under `src/types`; reuse them instead of redefining shapes inline.
- For network calls, return typed promises and surface server error messages.
- Use `fetch` with proper headers and JSON serialization.
- When creating functions, always use arrow functions whenever possible.

## PHP
- Interact with WordPress data through `$wpdb->prepare` to avoid SQL injection.
- Reuse shared helpers declared in `php/api/api.php` where possible.
- Return Slim responses with appropriate HTTP status codes and JSON bodies.
