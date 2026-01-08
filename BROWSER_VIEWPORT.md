# Browser Viewport in Cursor

## Waarom zie ik de mobile versie?

De browser in Cursor heeft een **viewport width kleiner dan 1024px**, waardoor de CSS media queries de mobile versie activeren.

**Dit is normaal responsive gedrag** - de website past zich aan aan de grootte van het scherm.

## CSS Breakpoints

Het theme gebruikt deze breakpoints:

- **Desktop**: > 1024px
- **Tablet**: ≤ 1024px
- **Mobile**: ≤ 768px

Wanneer de viewport smaller is dan 1024px:
- Desktop navigatie wordt verborgen
- Mobile menu toggle wordt getoond
- Layout wordt aangepast voor kleinere schermen

## Oplossingen

### Optie 1: Browser in Cursor Vergroten (Aanbevolen)

1. Sleep de randen van het browser paneel in Cursor
2. Maak het paneel breder dan 1024px
3. De desktop versie verschijnt automatisch

### Optie 2: Externe Browser Gebruiken (Aanbevolen)

Open de localhost URL in je normale browser:

```
http://127.0.0.1:9292
```

of

```
http://localhost:9292
```

In een normale browser kun je:
- De viewport volledig aanpassen
- Developer Tools gebruiken
- Responsive design mode testen

### Optie 3: Force Desktop Mode (Development Only)

Als je tijdens development altijd de desktop versie wilt zien, ongeacht de viewport grootte:

1. Open `layout/theme.liquid`
2. Voeg de class `force-desktop` toe aan de `<html>` tag:

```liquid
<html class="no-js force-desktop" lang="{{ request.locale.iso_code }}">
```

**Let op:** Verwijder deze class voordat je naar productie gaat! Dit is alleen voor development.

### Optie 4: Browser Developer Tools

Als je Developer Tools gebruikt:
1. Open DevTools (F12)
2. Gebruik de device toolbar (Ctrl+Shift+M / Cmd+Shift+M)
3. Kies een desktop viewport size (bijv. 1920x1080)

## Testen van Responsive Design

Om verschillende viewport sizes te testen:

1. **Desktop**: > 1024px
2. **Tablet**: 768px - 1024px
3. **Mobile**: < 768px

Gebruik de browser Developer Tools om tussen deze sizes te schakelen.

## Shopify Preview URL

Je kunt ook de Shopify preview URL gebruiken voor een volledige desktop ervaring:

```
https://by-estelledegeyter.myshopify.com?preview_theme_id=192890601817
```

Dit geeft je de volledige browser viewport zonder beperkingen.

