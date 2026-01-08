# Development Guide - Shopify Theme

## Hoe werkt het theme systeem?

### Themes in Shopify

**Horizon (Live Theme)**
- Dit is je **live theme** - wat bezoekers zien op je website
- URL: `https://by-estelledegeyter.myshopify.com`
- Alle wijzigingen zijn direct zichtbaar voor bezoekers
- Gebruik voor: productie, live website

**Development Theme (#192890601817)**
- Dit is je **development/test theme**
- Alleen jij ziet dit theme (via preview link)
- Veilig testen zonder live site te beïnvloeden
- Gebruik voor: testen, ontwikkelen, experimenteren

### Hoe werkt `shopify theme dev`?

Wanneer je `shopify theme dev` start:

1. **Upload je lokale bestanden** naar het Development theme
2. **Start een localhost server** op `http://localhost:9292`
3. **Live sync**: Wijzigingen in je lokale bestanden worden automatisch geüpload
4. **Preview**: Je kunt je theme bekijken op localhost

**Belangrijk:**
- Localhost toont het **Development theme**, niet Horizon (live)
- Wijzigingen in lokale bestanden worden automatisch gesynced
- Je kunt veilig testen zonder de live site te beïnvloeden

## Localhost Development

### Starten van localhost:

```bash
cd "/Users/bart-jandecroos/Library/Mobile Documents/com~apple~CloudDocs/EDGJewelry"
shopify theme dev --store by-estelledegeyter.myshopify.com
```

### Wat gebeurt er:

1. **Upload**: Je lokale theme bestanden worden geüpload naar Development theme
2. **Localhost**: Server start op `http://localhost:9292`
3. **Live reload**: Wijzigingen worden automatisch gesynced

### URLs:

- **Localhost**: `http://localhost:9292` (of `http://127.0.0.1:9292`)
- **Development preview**: `https://by-estelledegeyter.myshopify.com?preview_theme_id=192890601817`
- **Live site**: `https://by-estelledegeyter.myshopify.com` (Horizon theme)

## Workflow

### Optie 1: Development Theme (Aanbevolen voor testen)

1. Start `shopify theme dev`
2. Werk aan je lokale bestanden
3. Wijzigingen worden automatisch gesynced
4. Test op `http://localhost:9292`
5. Als alles goed is, push naar Horizon (live)

### Optie 2: Direct in Horizon (Live)

1. Push direct naar Horizon: `shopify theme push --theme 192890405209 --allow-live`
2. Wijzigingen zijn direct live
3. **Let op**: Dit is direct zichtbaar voor bezoekers!

## Commands

### Development server starten:
```bash
shopify theme dev --store by-estelledegeyter.myshopify.com
```

### Push naar Development theme:
```bash
shopify theme push --theme 192890601817
```

### Push naar Horizon (live):
```bash
shopify theme push --theme 192890405209 --allow-live
```

### Theme info bekijken:
```bash
shopify theme info
```

### Alle themes bekijken:
```bash
shopify theme list
```

## Samenvatting

- **Horizon** = Live theme (wat bezoekers zien)
- **Development theme** = Test theme (alleen voor jou)
- **Localhost** = Toont Development theme, niet Horizon
- **`shopify theme dev`** = Upload naar Development + start localhost
- **Wijzigingen** = Automatisch gesynced tijdens development

## Veiligheid

✅ **Veilig**: Development theme gebruiken voor testen
✅ **Veilig**: Localhost gebruiken voor development
⚠️ **Voorzichtig**: Direct pushen naar Horizon (is direct live!)

---

## Staging in Shopify - Hoe werkt het?

### Het verschil met traditionele development

**Traditionele workflow (bijv. WordPress, custom sites):**
```
Local → Staging Server → Production Server
       (aparte database)  (aparte database)
```

**Shopify workflow:**
```
Local → Development Theme → Live Theme (Horizon)
       (zelfde database)    (zelfde database)
```

### Waarom geen echte staging?

Shopify heeft **geen aparte staging omgeving** zoals traditionele development omdat:

1. **Gedeelde data**: Producten, orders, klanten zijn altijd live
2. **Theme-based**: Alleen het **design** (theme) kan je testen
3. **Preview system**: Development themes gebruiken preview links

### Hoe doen professionals dit?

**Optie 1: Development Theme als Staging (Aanbevolen)**
```
1. Development Theme = Staging
   - Test alle wijzigingen hier
   - Preview link: ?preview_theme_id=192890601817
   - Alleen jij ziet dit

2. Horizon = Production
   - Live theme
   - Wat bezoekers zien
   - Alleen pushen na testen
```

**Optie 2: Meerdere Development Themes**
```
- Development Theme 1 = Feature testing
- Development Theme 2 = Bug fixes
- Horizon = Production
```

**Optie 3: Development Store (voor teams)**
```
- Development Store = Volledige staging omgeving
- Aparte Shopify store voor testen
- Kan aparte producten/orders hebben
- Live Store = Production
```

### Best Practice Workflow

**Voor kleine wijzigingen:**
```
1. Werk lokaal
2. shopify theme dev (upload naar Development theme)
3. Test op localhost:9292
4. Test op preview link
5. Als goed → push naar Horizon (live)
```

**Voor grote features:**
```
1. Maak Development Store aan
2. Test volledige feature daar
3. Als goed → push naar Development theme op live store
4. Laat klant/team testen
5. Als goed → push naar Horizon (live)
```

### Samenvatting: Staging in Shopify

| Traditioneel | Shopify Equivalent |
|--------------|-------------------|
| Staging Server | Development Theme |
| Staging Database | Zelfde database (geen staging DB) |
| Staging URL | Preview link (?preview_theme_id=...) |
| Production | Live Theme (Horizon) |

**Belangrijk:**
- ✅ Development Theme = Je "staging" omgeving
- ✅ Preview links = Je "staging URL"
- ⚠️ Geen aparte database (producten/orders zijn altijd live)
- ✅ Veilig testen zonder live site te beïnvloeden

