# BitBadges

A pixel art badge generator API. Create 8-bit style badges for your README files!

## Examples

![TypeScript](output/typescript.png)
![Python](output/python.png)
![HTML](output/html.png)
![Tailwind CSS](output/tailwind%20css.png)
![Supabase](output/supabase.png)
![React](output/react.png)

## Usage

### Basic Badge (text only)

```
GET /badge/:text/:color
```

```markdown
![React](https://your-domain.com/badge/React/61DAFB)
```

### Badge with Logo

```
GET /badge/:text/:color?logo=:logoName
```

```markdown
![Python](https://your-domain.com/badge/Python/3776AB?logo=python)
```

### Badge with Logo Color Variant

```
GET /badge/:text/:color?logo=:logoName&logoColor=:color
```

```markdown
![Tailwind](https://your-domain.com/badge/Tailwind%20CSS/38bdf8?logo=tailwind&logoColor=black)
```

## API Reference

### `GET /badge/:text/:color`

Generates a pixel art badge.

| Parameter | Type | Description |
|-----------|------|-------------|
| `text` | path | The text to display |
| `color` | path | Hex color without # (e.g., `3178C6`) |
| `logo` | query | Logo name (e.g., `python`, `tailwind`) |
| `logoColor` | query | Logo variant (e.g., `white`, `black`) |
| `scale` | query | Output scale 1-8 (default: `4`) |

### `GET /logos`

Returns a list of all available logos.

### `GET /`

Returns API documentation.

## Available Logos

| Logo | Variants |
|------|----------|
| `python` | default, white, black |
| `html` | default |
| `tailwind` | default, white, black |
| `supabase` | default, black |

## Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Generate test badges
npm run test:badge
```

## Adding New Logos

1. Create a folder in `assets/logos/` with the logo name
2. Add PNG files (16x16 recommended):
   - `logoname.png` - default version
   - `logoname-white.png` - white variant
   - `logoname-black.png` - black variant

```
assets/logos/
└── mylogo/
    ├── mylogo.png
    ├── mylogo-white.png
    └── mylogo-black.png
```

## Tech Stack

- Node.js + TypeScript
- Express
- Sharp (image processing)
- BMFont (bitmap font rendering)

## License

MIT
