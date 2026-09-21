# Muchi Symbiosis Engine v1.2.1

v1.2.1 adds a shared PC/mobile portrait background for the 相依 UI. Gameplay, MVU state, settlement ownership and API compatibility are unchanged.

## Required asset path

Place the background at:

`Assets/symbiosis_bg.png`

The module resolves the image relative to `import.meta.url`, so a tagged module automatically uses the asset from the same tag; a `main` fallback uses the asset from `main`.

Recommended image: 9:16 portrait. The same file is used on desktop and mobile with `background-size: cover`.
