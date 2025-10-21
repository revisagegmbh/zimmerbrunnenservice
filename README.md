# Hinger's Brunnenservice – Landingpage

## Projektüberblick
Eine immersive, wasserinspirierte Landingpage für **Hinger's Brunnenservice**. Der Fokus liegt auf einer eleganten, mobilen Erlebniswelt, die Vertrauen schafft, Leistungen klar kommuniziert und Besucher durch sanfte Animationen sowie interaktive Elemente führt.

## Aktuell umgesetzte Features
- Fixe Kontaktleiste mit gleitendem Eintritt und Hover-Mikrointeraktionen.
- Sticky-Navigation mit Shrink-Effekt, Logo-Animation und mobilem Slide-Down-Menü.
- Hero-Sektion mit CTA-Duo, KPI-Count-up, Video-/Canvas-Wassereffekt und Parallax-Scroll.
- Horizontale Services-Slider-Komponente inkl. Auto-Slide, Maus-/Touchsteuerung und aktivem Fokuszustand.
- Über-uns-Bereich mit animierten Info-Badges, nachhaltigkeitsorientierter Botschaft und Bildinszenierung.
- Projekte-Galerie mit drei Vorher-Nachher-Slidern (Range-Interaktion) sowie aufklappbarem Wartungskunden-Panel.
- FAQ-Akkordeon mit animierten Öffnen/Schließen-Icons.
- Kontaktformular mit sequentiellen Eingabefeldern, Fokus-Glow, Ripple-Button und Client-only-Feedback.
- Footer mit Newsletter-Eintrag, animierten Social-Icons und dynamischer Jahreszahl.
- Globale Scroll- und Hover-Animationen via Intersection Observer, GSAP ScrollTrigger sowie maßgeschneiderten CSS-Transitions.

## Navigations- und Anker-URLs
| Abschnitt | URI |
|-----------|-----|
| Start/Hero | `index.html#hero` |
| Dienstleistungen | `index.html#services` |
| Über uns | `index.html#about` |
| Galerie / Projekte | `index.html#projects` |
| FAQ | `index.html#faq` |
| Kontakt | `index.html#contact` |
| Newsletter (Footer) | `index.html#footer` (automatisch erreichbar über Footer-Bereich) |

Alle Navigationseinträge verweisen auf interne Anker der Single-Page-Landingpage. Die mobile Navigation nutzt die gleichen Hash-Links.

## Animationen & Interaktionslogik
- **Intersection Observer** steuert Fade-/Slide-in und Stagger-Effekte für Sektionen und Info-Karten.
- **KPI-Zähler** laufen beim Sichtbarwerden mit easing-basiertem Count-up.
- **Services-Slider** kombiniert Auto-Loop, Buttons, Hover-Fokus sowie Touch-/Pointer-Gesten.
- **Vorher-Nachher-Slider** verwenden CSS-Variablen für die Clip-Position, gesteuert über Range-Eingaben.
- **FAQ-Accordion** animiert Höhe und Icon-Rotation, speichert Aria-States.
- **Canvas-Wellenanimation** simuliert Wasserbewegungen mittels Sinuswellen und requestAnimationFrame.
- **GSAP ScrollTrigger** ergänzt Parallax- und Card-Drift-Effekte (optional, wird nur ausgeführt, wenn das CDN geladen wurde).

## Noch nicht implementiert / bekannte Einschränkungen
- Keine echte **Next.js**- oder **Framer Motion**-Integration (statische HTML/JS-Lösung mit Tailwind & GSAP).
- Kontakt- und Newsletter-Formulare sind rein client-seitig, ohne Versand an einen Server oder Table-API.
- Es existiert noch keine Bild-Optimierung / Asset-Minimierung für produktiven Betrieb.
- Keine mehrsprachige Umsetzung.
- Kein Tracking oder Analytics integriert.

## Empfohlene nächste Schritte
1. **Formular-Backend** anbinden (z. B. Table API oder externen Form-Service) und Erfolgs-/Fehlerzustände erweitern.
2. **Bildmaterial individualisieren** (eigene Projektfotos, optimierte Dateigrößen, ggf. WebP-Varianten).
3. **Inhaltsfeinschliff**: Texte, KPIs und Referenzen mit finalen Unternehmensdaten abstimmen.
4. **Performance-Tuning**: Lazy Loading für Videos/Bilder, Preloading kritischer Assets, evtl. CSS/JS-Minifizierung.
5. **SEO & Strukturierte Daten** ergänzen (Schema.org, OpenGraph, Favicons etc.).
6. **Accessibility-Test** durchführen (Tastaturnavigation, Kontrast, Screenreader-Checks).

## Öffentliche URLs
- **Produktiv-URL**: *Noch nicht veröffentlicht.* → Zum Online-Stellen bitte den **Publish-Tab** in dieser Umgebung nutzen.
- **API-Endpunkte**: Keine externen oder Table-API-Endpunkte angebunden.

## Datenmodelle & Speicherung
- Derzeit **kein persistenter Speicher** und keine definierten Table-Schemas in Verwendung.

## Technologiestack
- **HTML5**, **TailwindCSS (via CDN)**, benutzerdefiniertes CSS.
- **JavaScript (ES6)** mit Intersection Observer, Canvas, clientseitigen Interaktionen.
- **GSAP 3 + ScrollTrigger** (CDN) für optionale Parallax- und Scrollanimationen.
- **Font Awesome** für Iconographie.

## Deployment-Hinweis
Zum Veröffentlichen der Landingpage einfach den **Publish-Tab** verwenden. Dort erfolgt die Bereitstellung mit einem Klick; anschließend steht automatisch eine Live-URL zur Verfügung.
