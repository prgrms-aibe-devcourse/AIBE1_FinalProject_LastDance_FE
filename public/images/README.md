# Image Asset Rules

This folder is for static image assets served directly by Vite.

## Usage

- Put files here when you want to reference them by URL, for example:
  - `/images/logo.png`
  - `/images/home/hero-banner.webp`
- Use `src/assets/` only when the image should be imported by a component.

## Naming

- Use lowercase only.
- Use kebab-case for file names.
- Prefer descriptive names over generic names like `image1.png`.
- Use the original format when possible:
  - `png` for transparency
  - `jpg` for photos
  - `webp` for optimized web images
  - `svg` for icons and logos when available

## Suggested Structure

- `public/images/common/` for shared UI assets
- `public/images/home/` for landing page assets
- `public/images/community/` for community page assets
- `public/images/game/` for game-related assets
- `public/images/admin/` for admin-only assets

## Example

```text
public/
  images/
    common/
      logo.png
    home/
      hero-banner.webp
```
