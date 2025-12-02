<div align="center">

# BitBadges

**8-bit style badge generator API for your README files**

<p>
  <img alt="React" src="https://bitbadges.vercel.app/badge/React/45b8d8?logo=react&scale=md" />
  <img alt="Python" src="https://bitbadges.vercel.app/badge/Python/3776AB?logo=python&scale=md" />
  <img alt="Docker" src="https://bitbadges.vercel.app/badge/Docker/2496ED?logo=docker&scale=md" />
  <img alt="Tailwind" src="https://bitbadges.vercel.app/badge/Tailwind/06B6D4?logo=tailwind&logoColor=black&scale=md" />
  <img alt="Supabase" src="https://bitbadges.vercel.app/badge/Supabase/3ECF8E?logo=supabase&logoColor=black&scale=md" />
</p>

<p>
  <img alt="HTML" src="https://bitbadges.vercel.app/badge/HTML/E34F26?logo=html&scale=md" />
  <img alt="Redis" src="https://bitbadges.vercel.app/badge/Redis/DC382D?logo=redis&scale=md" />
  <img alt="Claude Code" src="https://bitbadges.vercel.app/badge/Claude%20Code/CC785C?logo=claude-code&logoColor=black&scale=md" />
</p>

[Usage](#usage) • [Parameters](#parameters) • [Logos](#available-logos) • [Self-Host](#running-locally)

</div>

---

## Usage

Generate badges using this URL pattern:

```
https://bitbadges.vercel.app/badge/:text/:color
```

### Examples

#### Basic Badge
```markdown
![TypeScript](https://bitbadges.vercel.app/badge/TypeScript/007ACC)
```
<img alt="TypeScript" src="https://bitbadges.vercel.app/badge/TypeScript/007ACC?scale=md" />

#### With Logo
```markdown
![Python](https://bitbadges.vercel.app/badge/Python/3776AB?logo=python)
```
<img alt="Python" src="https://bitbadges.vercel.app/badge/Python/3776AB?logo=python&scale=md" />

#### With Logo Color Variant
```markdown
![Tailwind](https://bitbadges.vercel.app/badge/Tailwind/06B6D4?logo=tailwind&logoColor=black)
```
<img alt="Tailwind" src="https://bitbadges.vercel.app/badge/Tailwind/06B6D4?logo=tailwind&logoColor=black&scale=md" />

#### With Custom Text Color
```markdown
![Node.js](https://bitbadges.vercel.app/badge/Node.js/43853d?textColor=black)
```
<img alt="Node.js" src="https://bitbadges.vercel.app/badge/Node.js/43853d?textColor=black&scale=md" />

---

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

---

## Available Logos

<p align="center">
  <img src="https://bitbadges.vercel.app/badge/React/61DAFB?logo=react&logoColor=black&textColor=black&scale=md" />
  <img src="https://bitbadges.vercel.app/badge/Python/3776AB?logo=python&scale=md" />
  <img src="https://bitbadges.vercel.app/badge/Docker/2496ED?logo=docker&logoColor=black&textColor=black&scale=md" />
  <img src="https://bitbadges.vercel.app/badge/Tailwind/06B6D4?logo=tailwind&logoColor=black&textColor=black&scale=md" />
  <img src="https://bitbadges.vercel.app/badge/Supabase/3ECF8E?logo=supabase&logoColor=black&textColor=black&scale=md" />
  <img src="https://bitbadges.vercel.app/badge/HTML/E34F26?logo=html&scale=md" />
  <img src="https://bitbadges.vercel.app/badge/Redis/DC382D?logo=redis&scale=md" />
  <img src="https://bitbadges.vercel.app/badge/Claude%20Code/CC785C?logo=claude-code&logoColor=black&textColor=black&scale=md" />
  <img src="https://bitbadges.vercel.app/badge/TypeScript/3178C6?logo=typescript&logoColor=black&textColor=black&scale=md" />
  <img src="https://bitbadges.vercel.app/badge/Node.js/339933?logo=node_js&logoColor=black&textColor=black&scale=md" />
  <img src="https://bitbadges.vercel.app/badge/Next.js/000000?logo=next_js&scale=md" />
  <img src="https://bitbadges.vercel.app/badge/Git/F05032?logo=git&logoColor=black&textColor=black&scale=md" />
  <img src="https://bitbadges.vercel.app/badge/NPM/CB3837?logo=npm&scale=md" />
  <img src="https://bitbadges.vercel.app/badge/Cursor/000000?logo=cursor&scale=md" />
  <img src="https://bitbadges.vercel.app/badge/n8n/EA4B71?logo=n8n&logoColor=black&textColor=black&scale=md" />
  <img src="https://bitbadges.vercel.app/badge/Traefik/24A1C1?logo=traefik&logoColor=black&textColor=black&scale=md" />
  <img src="https://bitbadges.vercel.app/badge/shadcn%2Fui/000000?logo=shadcnui&scale=md" />
  <img src="https://bitbadges.vercel.app/badge/Golang/00ADD8?logo=golang&logoColor=black&textColor=black&scale=md" />
  <img src="https://bitbadges.vercel.app/badge/Prisma/2D3748?logo=prisma&logoColor=white&textColor=white&scale=md" />
  <img src="https://bitbadges.vercel.app/badge/Vercel/000000?logo=vercel&logoColor=white&textColor=white&scale=md" />
</p>

> **Note:** Some logos have `white` and `black` variants. Use `logoColor=black` or `logoColor=white` to switch.

---

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /badge/:text/:color` | Generate a badge |
| `GET /logos` | List all available logos |
| `GET /` | API documentation |

---

## Running Locally

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Generate test badges
npm run test:badge
```

---

## Adding New Logos

1. Create a folder in `assets/logos/` with the logo name
2. Add 16x16 PNG files:

```
assets/logos/
└── mylogo/
    ├── mylogo.png        # default
    ├── mylogo-white.png  # white variant (optional)
    └── mylogo-black.png  # black variant (optional)
```

---

## License

MIT
