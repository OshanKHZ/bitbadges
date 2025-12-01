# BitBadges

8-bit style badge generator API for README files.

![TypeScript](https://bitbadges.vercel.app/badge/TypeScript/007ACC?scale=sm)
![Python](https://bitbadges.vercel.app/badge/Python/3776AB?logo=python&scale=sm)
![Tailwind CSS](https://bitbadges.vercel.app/badge/Tailwind%20CSS/06B6D4?logo=tailwind&logoColor=black&scale=sm)
![HTML5](https://bitbadges.vercel.app/badge/HTML5/E34F26?logo=html&scale=sm)
![Supabase](https://bitbadges.vercel.app/badge/Supabase/3ECF8E?logo=supabase&logoColor=black&scale=sm)

## Usage

```
https://bitbadges.vercel.app/badge/:text/:color
```

### Basic

```markdown
![React](https://bitbadges.vercel.app/badge/React/61DAFB)
```

### With Logo

```markdown
![Python](https://bitbadges.vercel.app/badge/Python/3776AB?logo=python)
```

### With Logo Color

```markdown
![Tailwind](https://bitbadges.vercel.app/badge/Tailwind%20CSS/06B6D4?logo=tailwind&logoColor=black)
```

### With Text Color

```markdown
![TypeScript](https://bitbadges.vercel.app/badge/TypeScript/007ACC?textColor=black)
```

### With Scale

```markdown
![React](https://bitbadges.vercel.app/badge/React/61DAFB?scale=md)
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `text` | path | Badge text |
| `color` | path | Hex color without `#` |
| `logo` | query | Logo name |
| `logoColor` | query | Logo variant (`white`, `black`) |
| `textColor` | query | Text color (`white`, `black`, `auto`) |
| `scale` | query | Size preset or number |

### Scale Presets

| Preset | Scale |
|--------|-------|
| `xs` | 1x |
| `sm` | 1.5x |
| `md` | 2x |
| `lg` | 2.5x |
| `xl` | 3x |
| `xxl` | 4x |

## Available Logos

| Logo | Variants |
|------|----------|
| `python` | default |
| `html` | default |
| `tailwind` | white, black |
| `supabase` | default, black |

## Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /badge/:text/:color` | Generate badge |
| `GET /logos` | List available logos |
| `GET /` | API info |

## Running Locally

```bash
npm install
npm run dev
```

## Adding Logos

1. Create folder in `assets/logos/` with logo name
2. Add 16x16 PNG files:
   - `logoname.png` - default
   - `logoname-white.png` - white variant
   - `logoname-black.png` - black variant

## License

MIT
