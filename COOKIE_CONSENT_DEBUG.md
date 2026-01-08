# Cookie Consent Debugging

## Waarom blijft de cookie banner verschijnen?

Er zijn verschillende redenen waarom een cookie consent banner steeds opnieuw kan verschijnen, zelfs nadat je cookies hebt geaccepteerd:

### 1. **Localhost/Dev Server Issues**

**Probleem:**
- Localhost (`127.0.0.1` of `localhost`) wordt door browsers anders behandeld dan echte domeinen
- Cookies kunnen niet correct worden opgeslagen vanwege SameSite en domain restrictions
- Browser cache wordt niet altijd correct gebruikt op localhost

**Oplossing:**
- Test op de echte development theme URL: `https://by-estelledegeyter.myshopify.com?preview_theme_id=192890601817`
- Of gebruik een local domain mapping (bijv. via `/etc/hosts`)

### 2. **Cookie Domain Mismatch**

**Probleem:**
- Cookie wordt opgeslagen voor `by-estelledegeyter.myshopify.com`
- Maar je bezoekt `localhost:9292` of `127.0.0.1:9292`
- Browsers zien dit als verschillende domeinen

**Oplossing:**
- Accepteer cookies op de echte Shopify URL, niet op localhost
- Of gebruik de preview link van Shopify

### 3. **SameSite Cookie Restrictions**

**Probleem:**
- Moderne browsers hebben strikte SameSite cookie policies
- Cookies zonder `SameSite=None; Secure` worden niet gedeeld tussen localhost en Shopify

**Oplossing:**
- Dit is normaal gedrag - cookies werken niet tussen localhost en Shopify domain
- Accepteer cookies op de Shopify preview URL

### 4. **Browser Cache/Cookies Gewist**

**Probleem:**
- Browser cache of cookies worden gewist
- Incognito/Private browsing mode
- Browser extensies die cookies blokkeren

**Oplossing:**
- Controleer of cookies niet worden geblokkeerd
- Gebruik normale browsing mode (niet incognito)
- Check browser extensies (ad blockers, privacy tools)

### 5. **Shopify Cookie Consent App**

**Probleem:**
- Als je een Shopify app gebruikt voor cookie consent, kan deze:
  - Cookies niet correct opslaan op localhost
  - Verschillende instellingen hebben voor dev vs. production
  - Session-based zijn (vervalt na browser sluiten)

**Oplossing:**
- Check Shopify Admin → Apps → Cookie Consent app instellingen
  - Zorg dat cookies lang genoeg geldig zijn
  - Check of er domain restrictions zijn

## Hoe te Debuggen

### Stap 1: Check welke cookies worden opgeslagen

1. Open Developer Tools (F12)
2. Ga naar **Application** tab (Chrome) of **Storage** tab (Firefox)
3. Kijk onder **Cookies**
4. Check of er een cookie is voor cookie consent (bijv. `cookie_consent`, `gdpr_consent`, etc.)

### Stap 2: Check de cookie properties

Kijk naar:
- **Domain**: Moet overeenkomen met het domein waar je op zit
- **Path**: Meestal `/`
- **Expires**: Wanneer verloopt de cookie?
- **SameSite**: Moet `None` of `Lax` zijn voor cross-domain
- **Secure**: Moet `true` zijn voor HTTPS

### Stap 3: Test op echte Shopify URL

In plaats van localhost, test op:
```
https://by-estelledegeyter.myshopify.com?preview_theme_id=192890601817
```

Dit is de preview link voor je development theme. Cookies zouden hier wel moeten werken.

### Stap 4: Check Console voor Errors

Open Developer Tools → Console en kijk naar:
- Cookie errors
- CORS errors
- JavaScript errors die cookie opslag blokkeren

## Aanbevolen Workflow

### Voor Development:

1. **Gebruik Shopify Preview URL** in plaats van localhost voor cookie testing
2. **Accepteer cookies op de preview URL**
3. **Test functionaliteit** die cookies nodig heeft

### Voor Localhost Development:

1. **Accepteer dat cookies niet werken op localhost**
2. **Test cookie-gerelateerde features op preview URL**
3. **Of implementeer een local cookie consent** die alleen op localhost werkt

## Custom Cookie Consent Implementatie

Als je een eigen cookie consent wilt die wel werkt op localhost, kun je dit toevoegen:

```javascript
// In assets/theme.js
function initCookieConsent() {
  const consentKey = 'cookie_consent_accepted';
  const consentBanner = document.getElementById('CookieConsentBanner');
  
  if (!consentBanner) return;
  
  // Check if consent already given
  const consent = localStorage.getItem(consentKey);
  if (consent === 'true') {
    consentBanner.hidden = true;
    return;
  }
  
  // Show banner
  consentBanner.hidden = false;
  
  // Accept button
  const acceptBtn = consentBanner.querySelector('[data-cookie-accept]');
  if (acceptBtn) {
    acceptBtn.addEventListener('click', () => {
      localStorage.setItem(consentKey, 'true');
      consentBanner.hidden = true;
    });
  }
}
```

## Conclusie

**Ja, het is waarschijnlijk een dev server issue.** Cookies werken niet goed tussen localhost en Shopify's domein vanwege browser security restrictions. 

**Oplossing:** Test cookie-gerelateerde features op de Shopify preview URL in plaats van localhost.

