// Builds the website (plain HTML, no build step on the server) from the app repository's own texts, so the
// site says exactly what the app and the store say:
//   - home: docs/STORE-LISTING*.md (tagline, proof line, description) in 4 languages
//   - privacy: src/lib/legal.ts and src/locales/<language>/privacy.ts (the policy shown in the app)
//   - support: docs/SUPPORT*.md
//   - terms: TERMS below (English only, like the privacy policy's binding version)
//   - what's new and what's coming: docs/WHATS-NEW.md and docs/ROADMAP.md (English only)
//   - screenshots: store-assets/web/<language>/NN-name.webp (npm run screenshots) and store-assets/captions.json
//   - pricing: FREE_ALBUMS, FREE_EVERYONE_SESSIONS and PRO_PRICE_LABEL in src/lib/pro.ts
// Run after changing any of those:   node scripts/build.mjs [path to the app repository, default ../VoyageVault]
// Then commit and push: Cloudflare publishes the site from this repository.

import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const site = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const app = resolve(site, process.argv[2] ?? '../VoyageVault');
const read = (path) => readFileSync(join(app, path), 'utf8');
const DOMAIN = 'https://wepickthepic.app';
const EMAIL = read('src/lib/legal.ts').match(/CONTACT_EMAIL = '([^']+)'/)[1];
const LANGS = ['en', 'de', 'ro', 'es'];
/** Pages only in English: the language menu leads to each language's home page instead. */
const ONE_LANGUAGE = ['/terms/', '/changes/', '/roadmap/', '/404'];

// ---------- Words of the site itself ----------

const UI = {
  en: {
    name: 'English', locale: 'en-GB', home: 'Home', features: 'Features', together: 'Together', privacy: 'Privacy',
    support: 'Support', terms: 'Terms', soon: 'Coming soon to the', title: 'Best Trip Photos',
    privacyTitle: 'Privacy Policy', effective: 'Effective {date}', supportTitle: 'Support',
    supportMeta: 'We’re happy to help.', readPolicy: 'Read the privacy policy →',
    privacyHeading: 'Private by design', whatTitle: 'Hundreds of photos. One album.', best: 'the best', helpTitle: 'Have a question or a problem?',
    helpText: 'The support page answers the most common questions and shows how to reach us.',
    helpButton: 'Go to the support page', notFound: 'Page not found', notFoundText: 'This page doesn’t exist.',
    toHome: 'Go to the WePickThePic homepage →', translationNote: '',
    contactInApp: 'The quickest way: in WePickThePic, go to <strong>Settings › Contact support</strong> and choose to include the diagnostic info: the app version, your iPhone model and what the app did recently. It never contains your photos or their places, you see all of it in the email before you send it, and it helps us find the problem much faster.',
    contactMail: 'Can’t open the app? Email <a href="mailto:{email}">{email}</a> and mention your iPhone model and iOS version.',
    contactTitle: 'Contact', whatsNew: 'What’s new', whatsComing: 'What’s coming',
    lookTitle: 'A look inside', lookSub: 'Find your trips, keep the best photos and make the album with friends.',
    prev: 'Previous screenshots', next: 'Next screenshots', close: 'Close', page: 'Screenshots {n}',
    proTitle: 'Free to try. Pro, if you want more.', proSub: 'WePickThePic is free to download. Pro is bought once: no subscription.',
    free: 'Free', freePrice: 'Free to download', freeAlbums: '{n} albums, with friends or family',
    freeEveryone: '“Everyone’s photos” {n} times, when you start it', freeJoin: 'Joining a friend’s album: always free',
    freeChange: 'Changing a saved album stays free', perYear: '{price} once', launchNote: 'Launch price. Later {later}.', priceNote: 'Prices can vary by country.',
  },
  de: {
    name: 'Deutsch', locale: 'de-DE', home: 'Start', features: 'Funktionen', together: 'Gemeinsam', privacy: 'Datenschutz',
    support: 'Support', terms: 'Nutzungsbedingungen', soon: 'Bald im', title: 'Die besten Reisefotos',
    privacyTitle: 'Datenschutzerklärung', effective: 'Gültig ab {date}', supportTitle: 'Support',
    supportMeta: 'Wir helfen gern.', readPolicy: 'Zur Datenschutzerklärung →',
    privacyHeading: 'Privat von Grund auf', whatTitle: 'Hunderte Fotos. Ein Album.', best: 'die besten', helpTitle: 'Eine Frage oder ein Problem?',
    helpText: 'Die Support-Seite beantwortet die häufigsten Fragen und zeigt, wie du uns erreichst.',
    helpButton: 'Zur Support-Seite', notFound: 'Seite nicht gefunden', notFoundText: 'Diese Seite gibt es nicht.',
    toHome: 'Zur Startseite von WePickThePic →',
    translationNote: 'Dies ist eine Übersetzung zur besseren Verständlichkeit. Rechtlich maßgeblich ist die <a href="/privacy/">englische Fassung</a>.',
    contactInApp: 'Am schnellsten: Geh in WePickThePic zu <strong>Einstellungen › Support kontaktieren</strong> und füge die Diagnoseinfos hinzu: die App-Version, dein iPhone-Modell und was die App zuletzt getan hat. Sie enthalten nie deine Fotos oder deren Orte, du siehst alles in der E-Mail, bevor du sie sendest, und sie helfen uns, das Problem viel schneller zu finden.',
    contactMail: 'Die App lässt sich nicht öffnen? Schreib an <a href="mailto:{email}">{email}</a> und nenne dein iPhone-Modell und die iOS-Version.',
    contactTitle: 'Kontakt', whatsNew: 'Neuigkeiten', whatsComing: 'Was kommt',
    lookTitle: 'Ein Blick hinein', lookSub: 'Deine Reisen finden, die besten Fotos behalten und das Album mit Freunden machen.',
    prev: 'Vorherige Bildschirmfotos', next: 'Nächste Bildschirmfotos', close: 'Schließen', page: 'Bildschirmfotos {n}',
    proTitle: 'Kostenlos ausprobieren. Pro, wenn du mehr willst.', proSub: 'WePickThePic ist kostenlos zum Herunterladen. Pro kaufst du einmal: kein Abo.',
    free: 'Kostenlos', freePrice: 'Kostenlos zum Herunterladen', freeAlbums: '{n} Alben, mit Freunden oder Familie',
    freeEveryone: '„Fotos von allen“ {n}-mal, wenn du es startest', freeJoin: 'Beim Album eines Freundes mitmachen: immer kostenlos',
    freeChange: 'Ein gesichertes Album zu ändern bleibt kostenlos', perYear: '{price} einmalig', launchNote: 'Einführungspreis. Später {later}.', priceNote: 'Die Preise können je nach Land abweichen.',
  },
  ro: {
    name: 'Română', locale: 'ro-RO', home: 'Acasă', features: 'Funcții', together: 'Împreună', privacy: 'Confidențialitate',
    support: 'Asistență', terms: 'Termeni', soon: 'În curând în', title: 'Cele mai bune poze din călătorii',
    privacyTitle: 'Politica de confidențialitate', effective: 'În vigoare din {date}', supportTitle: 'Asistență',
    supportMeta: 'Te ajutăm cu drag.', readPolicy: 'Citește politica de confidențialitate →',
    privacyHeading: 'Privat din start', whatTitle: 'Sute de poze. Un singur album.', best: 'cele mai bune', helpTitle: 'Ai o întrebare sau o problemă?',
    helpText: 'Pagina de asistență răspunde la cele mai frecvente întrebări și arată cum ne poți contacta.',
    helpButton: 'Mergi la pagina de asistență', notFound: 'Pagina nu a fost găsită', notFoundText: 'Această pagină nu există.',
    toHome: 'Mergi la pagina principală WePickThePic →',
    translationNote: 'Aceasta este o traducere pentru o înțelegere mai ușoară. Versiunea obligatorie din punct de vedere juridic este <a href="/privacy/">cea în engleză</a>.',
    contactInApp: 'Cel mai rapid: în WePickThePic, mergi la <strong>Setări › Contactează asistența</strong> și alege să incluzi informațiile de diagnostic: versiunea aplicației, modelul iPhone-ului și ce a făcut aplicația recent. Nu conțin niciodată fotografiile tale sau locurile lor, vezi totul în e-mail înainte să-l trimiți și ne ajută să găsim problema mult mai repede.',
    contactMail: 'Nu poți deschide aplicația? Scrie la <a href="mailto:{email}">{email}</a> și menționează modelul iPhone-ului și versiunea iOS.',
    contactTitle: 'Contact', whatsNew: 'Noutăți', whatsComing: 'Ce urmează',
    lookTitle: 'O privire înăuntru', lookSub: 'Găsește-ți călătoriile, păstrează cele mai bune poze și fă albumul cu prietenii.',
    prev: 'Capturile anterioare', next: 'Capturile următoare', close: 'Închide', page: 'Capturi {n}',
    proTitle: 'Gratuit de încercat. Pro, dacă vrei mai mult.', proSub: 'WePickThePic se descarcă gratuit. Pro se cumpără o singură dată: fără abonament.',
    free: 'Gratuit', freePrice: 'Se descarcă gratuit', freeAlbums: '{n} albume, cu prietenii sau familia',
    freeEveryone: '„Fotografiile tuturor” de {n} ori, când îl pornești tu', freeJoin: 'Te alături albumului unui prieten mereu gratuit',
    freeChange: 'Modificarea unui album salvat rămâne gratuită', perYear: '{price} o singură dată', launchNote: 'Preț de lansare. Mai târziu {later}.', priceNote: 'Prețurile pot varia de la o țară la alta.',
  },
  es: {
    name: 'Español', locale: 'es-ES', home: 'Inicio', features: 'Funciones', together: 'Juntos', privacy: 'Privacidad',
    support: 'Soporte', terms: 'Términos', soon: 'Muy pronto en la', title: 'Las mejores fotos de viaje',
    privacyTitle: 'Política de privacidad', effective: 'Vigente desde el {date}', supportTitle: 'Soporte',
    supportMeta: 'Estamos encantados de ayudarte.', readPolicy: 'Leer la política de privacidad →',
    privacyHeading: 'Privado desde el diseño', whatTitle: 'Cientos de fotos. Un solo álbum.', best: 'las mejores', helpTitle: '¿Tienes una pregunta o un problema?',
    helpText: 'La página de soporte responde a las preguntas más frecuentes y explica cómo contactarnos.',
    helpButton: 'Ir a la página de soporte', notFound: 'Página no encontrada', notFoundText: 'Esta página no existe.',
    toHome: 'Ir a la página de inicio de WePickThePic →',
    translationNote: 'Esta es una traducción para facilitar la comprensión. La versión jurídicamente vinculante es <a href="/privacy/">la inglesa</a>.',
    contactInApp: 'Lo más rápido: en WePickThePic, ve a <strong>Ajustes › Contactar con soporte</strong> y elige incluir la información de diagnóstico: la versión de la app, el modelo de tu iPhone y lo que hizo la app recientemente. Nunca contiene tus fotos ni sus lugares, lo ves todo en el correo antes de enviarlo y nos ayuda a encontrar el problema mucho más rápido.',
    contactMail: '¿No puedes abrir la app? Escribe a <a href="mailto:{email}">{email}</a> e indica el modelo de tu iPhone y la versión de iOS.',
    contactTitle: 'Contacto', whatsNew: 'Novedades', whatsComing: 'Lo que viene',
    lookTitle: 'Un vistazo por dentro', lookSub: 'Encuentra tus viajes, quédate con las mejores fotos y haz el álbum con tus amigos.',
    prev: 'Capturas anteriores', next: 'Capturas siguientes', close: 'Cerrar', page: 'Capturas {n}',
    proTitle: 'Gratis para probar. Pro, si quieres más.', proSub: 'WePickThePic se descarga gratis. Pro se compra una sola vez: sin suscripción.',
    free: 'Gratis', freePrice: 'Descarga gratis', freeAlbums: '{n} álbumes, con amigos o familia',
    freeEveryone: '«Las fotos de todos» {n} veces, cuando lo empiezas tú', freeJoin: 'Unirte al álbum de un amigo: siempre gratis',
    freeChange: 'Cambiar un álbum guardado sigue siendo gratis', perYear: '{price} una sola vez', launchNote: 'Precio de lanzamiento. Después {later}.', priceNote: 'Los precios pueden variar según el país.',
  },
};

// ---------- Texts from the app repository ----------

const listingFile = (lang) => (lang === 'en' ? 'docs/STORE-LISTING.md' : `docs/STORE-LISTING-${lang}.md`);
const supportFile = (lang) => (lang === 'en' ? 'docs/SUPPORT.md' : `docs/SUPPORT-${lang}.md`);

function listing(lang) {
  const text = read(listingFile(lang));
  const description = text.match(/```text\n([\s\S]*?)\n```/)[1];
  let tagline;
  let proof;
  if (lang === 'en') {
    tagline = text.match(/\*\*Tagline\*\*[^\n]*\n\n([^\n]+)/)[1];
    proof = text.match(/\*\*Proof line\*\*[^:]*:[^:]*\): ([^\n]+)/)?.[1] ?? 'No cloud. No sign-up. Originals untouched.';
  } else {
    tagline = text.match(/\*\*Tagline\*\*[^:]*: ([^\n]+)/)[1];
    proof = text.match(/\*\*Proof line\*\*[^:]*: ([^\n]+)/)[1];
  }
  const blocks = description.split(/\n\n+/);
  const paragraphs = blocks.filter((b) => !/^[A-ZÄÖÜĂÂÎȘȚÁÉÍÓÚÑ ]{4,}\n/.test(b));
  const sections = blocks
    .filter((b) => /^[A-ZÄÖÜĂÂÎȘȚÁÉÍÓÚÑ ]{4,}\n/.test(b))
    .map((b) => {
      const [title, ...items] = b.split('\n');
      return { title, items: items.map((i) => i.replace(/^• /, '')) };
    });
  return { tagline, proof: proof.split(/\.\s*/).filter(Boolean), paragraphs, sections };
}

/** The policy sections from a TypeScript file: `export const NAME: PolicySection[] = [ ... ];` */
function policy(path, name) {
  const text = read(path);
  const start = text.indexOf(`export const ${name}: PolicySection[] = [`);
  const body = text.slice(text.indexOf('[', start), text.indexOf('\n];', start) + 2);
  return new Function(`return ${body}`)();
}

function privacySections(lang) {
  if (lang === 'en') return policy('src/lib/legal.ts', 'PRIVACY_POLICY');
  return policy(`src/locales/${lang}/privacy.ts`, `PRIVACY_POLICY_${lang.toUpperCase()}`);
}

const effectiveDate = read('src/lib/legal.ts').match(/PRIVACY_EFFECTIVE_DATE = '([\d-]+)'/)[1];

/** One of the app's own texts (src/locales/<language>/app.ts), so the site and the app say the same about Pro. */
function appText(lang, key) {
  const text = read(`src/locales/${lang}/app.ts`);
  const at = text.indexOf(`'${key}':`);
  const m = at >= 0 && text.slice(at + key.length + 3).match(/^\s*'((?:[^'\\]|\\.)*)'/);
  if (!m) throw new Error(`${key} not found in src/locales/${lang}/app.ts`);
  return m[1].replace(/\\'/g, "'");
}

/** The free limits and the price, from src/lib/pro.ts. */
const proFile = read('src/lib/pro.ts');
const proNumber = (name) => Number(proFile.match(new RegExp(`${name} = (\\d+)`))[1]);
const FREE_ALBUMS = proNumber('FREE_ALBUMS');
const FREE_EVERYONE = proNumber('FREE_EVERYONE_SESSIONS');
/** '€2.99' → 2.99: the same amount in euros and US dollars (decided 2026-11-21), written the way each language does. */
const amount = (name) => Number(proFile.match(new RegExp(`${name} = '\\D*([\\d.]+)'`))[1]);
const PRO_AMOUNT = amount('PRO_PRICE_LABEL');
/** The price after the launch price (one-time: $4.99 at launch, $6.99 later; decided 2026-11-21). */
const PRO_LATER_AMOUNT = amount('PRO_LATER_PRICE_LABEL');
const money = (lang, currency, value = PRO_AMOUNT) =>
  new Intl.NumberFormat(UI[lang].locale, { style: 'currency', currency, currencyDisplay: 'narrowSymbol' }).format(value);

/**
 * docs/WHATS-NEW.md and docs/ROADMAP.md: an HTML comment, the intro (paragraphs before the first "## "), then
 * "## " sections, each with optional plain lines (notes) and "- " items.
 */
function markdownSections(path) {
  const text = read(path).replace(/<!--[\s\S]*?-->/g, '').replace(/\r\n/g, '\n');
  const [head, ...blocks] = text.split(/^## /m);
  const intro = head
    .replace(/^# .*\n/, '')
    .split(/\n\s*\n/)
    .map((p) => p.trim().replace(/\s*\n\s*/g, ' '))
    .filter(Boolean);
  const sections = blocks.map((block) => {
    const [title, ...rest] = block.split('\n');
    return {
      title: title.trim(),
      notes: rest.filter((l) => l.trim() && !l.startsWith('- ')).map((l) => l.trim()),
      items: rest.filter((l) => l.startsWith('- ')).map((l) => l.slice(2).trim()),
    };
  });
  return { intro, sections };
}

/**
 * The store screenshots for the website, copied to assets/shots/<language>/. A language without its own falls back
 * to the English ones; with none at all, the home page has no gallery. Returns language → [{ src, alt }].
 */
function screenshots() {
  const out = join(site, 'assets/shots');
  rmSync(out, { recursive: true, force: true });
  const captions = JSON.parse(read('store-assets/captions.json'));
  const own = {};
  for (const lang of LANGS) {
    const dir = join(app, 'store-assets/web', lang);
    const files = existsSync(dir) ? readdirSync(dir).filter((f) => /^\d+-.+\.webp$/.test(f)).sort() : [];
    if (!files.length) continue;
    mkdirSync(join(out, lang), { recursive: true });
    own[lang] = files.map((file) => {
      copyFileSync(join(dir, file), join(out, lang, file));
      const caption = captions[lang]?.[file.replace(/\.webp$/, '')];
      return { src: `/assets/shots/${lang}/${file}`, alt: (caption?.title ?? '').replace(/\s*\n\s*/g, ' ') };
    });
  }
  return Object.fromEntries(LANGS.map((lang) => [lang, own[lang] ?? own.en ?? []]));
}

// ---------- HTML ----------

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const prefix = (lang) => (lang === 'en' ? '' : `/${lang}`);

/** Plain text with **bold**, [links](…) and emails, to HTML. */
function inline(text, lang) {
  return esc(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => {
      const target = /PRIVACY/.test(href) ? `${prefix(lang)}/privacy/` : href;
      return `<a href="${target}">${label}</a>`;
    })
    .replace(/(?<![">:])\b([\w.+-]+@[\w-]+\.[\w.]+\w)/g, '<a href="mailto:$1">$1</a>');
}

/** docs/WHATS-NEW.md / docs/ROADMAP.md sections as HTML for the English text pages. */
const sectionsHtml = (sections) =>
  sections
    .map((s) =>
      [
        `        <h2>${esc(s.title)}</h2>`,
        ...s.notes.map((n) => `        <p>${inline(n, 'en')}</p>`),
        '        <ul>',
        ...s.items.map((i) => `          <li>${inline(i, 'en')}</li>`),
        '        </ul>',
      ].join('\n'),
    )
    .join('\n');

function page({ lang, path, title, description, body, nav }) {
  const ui = UI[lang];
  const own = (l) => `${prefix(l)}${path}`;
  const alternates = ONE_LANGUAGE.includes(path)
    ? ''
    : LANGS.map((l) => `  <link rel="alternate" hreflang="${l}" href="${DOMAIN}${own(l)}">`).join('\n') +
      `\n  <link rel="alternate" hreflang="x-default" href="${DOMAIN}${path}">\n`;
  const menu = LANGS.map(
    (l) =>
      `            <li><a href="${ONE_LANGUAGE.includes(path) ? `${prefix(l)}/` : own(l)}" hreflang="${l}" lang="${l}"${l === lang ? ' aria-current="true"' : ''}>${UI[l].name}</a></li>`,
  ).join('\n');
  const p = prefix(lang);
  return `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="theme-color" content="#FF6B57">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${DOMAIN}${path === '/404' ? '/' : own(lang)}">
  <link rel="icon" href="/assets/favicon.png">
  <link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
  <link rel="stylesheet" href="/assets/style.css">
${alternates}</head>
<body>
  <header class="site">
    <div class="wrap">
      <a class="logo" href="${p}/"><img class="mark" src="/assets/icon-512.png" alt="" width="34" height="34">WePickThePic</a>
      <nav class="site">
${nav ?? `        <a href="${p}/">${ui.home}</a>
        <a href="${p}/privacy/">${ui.privacy}</a>
        <a href="${p}/support/">${ui.support}</a>`}
      </nav>
      <details class="lang-menu">
        <summary aria-label="Language: ${ui.name}"><svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg><span>${lang.toUpperCase()}</span></summary>
        <ul>
${menu}
        </ul>
      </details>
    </div>
  </header>

${body}

  <footer class="site">
    <div class="wrap">
      <div>© 2026 Sergiu Martin</div>
      <div><a href="${p}/privacy/">${ui.privacy}</a><a href="/terms/">${ui.terms}</a><a href="${p}/support/">${ui.support}</a><a href="/changes/">${ui.whatsNew}</a><a href="/roadmap/">${ui.whatsComing}</a></div>
    </div>
  </footer>
  <script src="/assets/menu.js" defer></script>
${body.includes('class="gallery"') ? '  <script src="/assets/gallery.js" defer></script>\n' : ''}</body>
</html>
`;
}

function write(path, html) {
  const file = join(site, path);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}

// ---------- Pages ----------

/** "Everyone takes pictures.<br>We pick <span>the best</span>.": the second sentence on its own line, the best in coral. */
function headline(tagline, best) {
  const cut = tagline.indexOf('. ') + 1;
  const second = esc(tagline.slice(cut).trim());
  if (!second.includes(best)) throw new Error(`"${best}" not in the tagline "${tagline}"`);
  return `${esc(tagline.slice(0, cut))}<br>${second.replace(best, `<span>${best}</span>`)}`;
}

function home(lang, shots) {
  const ui = UI[lang];
  const l = listing(lang);
  const [lead, what, together] = l.paragraphs;
  // The description's sections, in order: picks the best, finds your trips, together, private, nothing deleted.
  const [picks, trips, togetherSection, privacySection, kept] = l.sections;
  const cards = [
    ['✨', picks],
    ['🗺️', trips],
    ['🛡️', kept],
  ];
  // "Travelled with friends? Make the album together: …": the question is the heading.
  const question = together.indexOf('?') + 1;
  const ticks = (items, indent) => items.map((i) => `${indent}<li>${esc(i)}</li>`).join('\n');
  const p = prefix(lang);
  const body = `  <main>
    <section class="hero">
      <div class="wrap">
        <img src="/assets/icon-512.png" alt="WePickThePic" width="96" height="96" class="hero-icon">
        <h1>${headline(l.tagline, ui.best)}</h1>
        <p class="lead">${esc(lead)}</p>
        <div class="pills">
${l.proof.map((x) => `          <span class="pill">${esc(x)}</span>`).join('\n')}
        </div>
        <!-- Replace with the official App Store badge and link when the app is live. -->
        <div class="stores">
          <span class="store soon" aria-disabled="true"><small>${ui.soon}</small><strong>App Store</strong></span>
        </div>
      </div>
    </section>

    <section id="features">
      <div class="wrap">
        <div class="center">
          <h2>${ui.whatTitle}</h2>
          <p class="sub">${esc(what)}</p>
        </div>
        <div class="grid three">
${cards
  .map(
    ([icon, s]) => `          <div class="card">
            <div class="icon" aria-hidden="true">${icon}</div>
            <h3>${esc(s.title.charAt(0) + s.title.slice(1).toLowerCase())}</h3>
            <ul class="ticks">
${ticks(s.items, '              ')}
            </ul>
          </div>`,
  )
  .join('\n')}
        </div>
      </div>
    </section>

${shots.length ? `    <section id="screenshots">
      <div class="wrap">
        <div class="center">
          <h2>${ui.lookTitle}</h2>
          <p class="sub">${ui.lookSub}</p>
        </div>
        <div class="gallery" data-close-label="${ui.close}" data-page-label="${ui.page}">
          <button type="button" class="gallery-btn gallery-prev" aria-label="${ui.prev}">‹</button>
          <div class="shots" tabindex="0">
${shots
  .map(
    (s) => `            <figure class="shot-item store-shot">
              <img src="${s.src}" alt="${esc(s.alt)}" loading="lazy" width="600" height="1304">
            </figure>`,
  )
  .join('\n')}
          </div>
          <button type="button" class="gallery-btn gallery-next" aria-label="${ui.next}">›</button>
          <div class="gallery-dots"></div>
        </div>
      </div>
    </section>

` : ''}    <section id="together">
      <div class="wrap">
        <div class="together-block">
          <h2>${esc(together.slice(0, question))}</h2>
          <p class="sub">${esc(together.slice(question).trim())}</p>
          <ul class="ticks">
${ticks(togetherSection.items, '            ')}
          </ul>
        </div>
      </div>
    </section>

    <section id="privacy">
      <div class="wrap">
        <div class="privacy-block">
          <h2>${ui.privacyHeading}</h2>
          <ul>
${privacySection.items.map((i) => `            <li>${esc(i)}</li>`).join('\n')}
          </ul>
          <p style="margin:20px 0 0"><a href="${p}/privacy/">${ui.readPolicy}</a></p>
        </div>
      </div>
    </section>

    <section id="pro">
      <div class="wrap">
        <!-- The free limits and the price come from src/lib/pro.ts, the Pro lines from the app's own texts. -->
        <h2>${ui.proTitle}</h2>
        <p class="sub">${ui.proSub}</p>
        <div class="plans">
          <div class="card plan">
            <h3>${ui.free}</h3>
            <div class="price">${ui.freePrice}</div>
            <ul>
              <li>${esc(ui.freeAlbums.replace('{n}', FREE_ALBUMS))}</li>
              <li>${esc(ui.freeEveryone.replace('{n}', FREE_EVERYONE))}</li>
              <li>${esc(ui.freeJoin)}</li>
              <li>${esc(ui.freeChange)}</li>
            </ul>
          </div>
          <div class="card plan pro">
            <h3>${esc(appText(lang, 'app.pro.title'))}</h3>
            <div class="price">${esc(ui.perYear.replace('{price}', `${money(lang, 'EUR')} / ${money(lang, 'USD')}`))}</div>
            <div class="price-note">${esc(ui.launchNote.replace('{later}', `${money(lang, 'EUR', PRO_LATER_AMOUNT)} / ${money(lang, 'USD', PRO_LATER_AMOUNT)}`))}</div>
            <ul>
              <li>${esc(appText(lang, 'app.pro.featureAlbums'))}</li>
              <li>${esc(appText(lang, 'app.pro.featureEveryone'))}</li>
              <li>${esc(appText(lang, 'app.pro.featureJoin'))}</li>
            </ul>
            <p style="margin:12px 0 0">${esc(appText(lang, 'app.pro.finePrint'))}</p>
          </div>
        </div>
        <div class="note">${ui.priceNote}</div>
      </div>
    </section>

    <section id="help">
      <div class="wrap">
        <div class="card help-card">
          <h2>${ui.helpTitle}</h2>
          <p class="sub">${ui.helpText}</p>
          <a class="button" href="${p}/support/">${ui.helpButton}</a>
        </div>
      </div>
    </section>
  </main>`;
  write(`${p}/index.html`.replace(/^\//, ''), page({
    lang, path: '/', title: `WePickThePic – ${ui.title}`, description: `${l.tagline} ${l.proof.join('. ')}.`,
    body,
    nav: `        <a href="#features">${ui.features}</a>
        <a href="#together">${ui.together}</a>
        <a href="#privacy">${ui.privacy}</a>
        <a href="#pro">Pro</a>
        <a href="${p}/support/">${ui.support}</a>`,
  }));
}

function privacy(lang) {
  const ui = UI[lang];
  const date = new Date(`${effectiveDate}T12:00:00Z`).toLocaleDateString(ui.locale, { day: 'numeric', month: 'long', year: 'numeric' });
  const sections = privacySections(lang)
    .map(
      (s) => `        <h2>${esc(s.title)}</h2>
${s.text.split('\n\n').map((para) => `        <p>${inline(para, lang)}</p>`).join('\n')}`,
    )
    .join('\n\n');
  const body = `  <main class="page">
    <div class="wrap">
      <article>
        <!-- Built from src/lib/legal.ts and src/locales/<language>/privacy.ts in the app repository: change it there. -->
        <h1>${ui.privacyTitle}</h1>
        <p class="meta">${ui.effective.replace('{date}', date)}</p>
${ui.translationNote ? `        <p class="note">${ui.translationNote}</p>\n` : ''}
${sections}
      </article>
    </div>
  </main>`;
  write(`${prefix(lang)}/privacy/index.html`.replace(/^\//, ''), page({
    lang, path: '/privacy/', title: `${ui.privacyTitle} – WePickThePic`, description: ui.privacyTitle, body,
  }));
}

function support(lang) {
  const ui = UI[lang];
  const md = read(supportFile(lang)).replace(/<!--[\s\S]*?-->/g, '');
  const blocks = md.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  const out = [];
  for (const block of blocks) {
    if (block.startsWith('# ')) continue;
    if (block.startsWith('## ')) {
      out.push(`        <h2>${esc(block.slice(3))}</h2>`);
      continue;
    }
    const lines = block.split('\n');
    const question = lines[0].match(/^\*\*(.+)\*\*$/);
    if (question) {
      out.push(`        <details>
          <summary>${esc(question[1])}</summary>
          <p>${inline(lines.slice(1).join(' '), lang)}</p>
        </details>`);
    } else if (!/@/.test(block) || out.length > 0) {
      out.push(`        <p>${inline(lines.join(' '), lang)}</p>`);
    }
  }
  const body = `  <main class="page">
    <div class="wrap">
      <article>
        <!-- Built from docs/SUPPORT*.md in the app repository: change it there. -->
        <h1>${ui.supportTitle}</h1>
        <p class="meta">${ui.supportMeta}</p>

        <div class="contact">
          <strong>${ui.contactTitle}</strong>
          <p style="margin:6px 0 0">${ui.contactInApp}</p>
          <p style="margin:6px 0 0">${ui.contactMail.replaceAll('{email}', EMAIL)}</p>
        </div>

${out.join('\n')}
      </article>
    </div>
  </main>`;
  write(`${prefix(lang)}/support/index.html`.replace(/^\//, ''), page({
    lang, path: '/support/', title: `${ui.supportTitle} – WePickThePic`, description: ui.helpText, body,
  }));
}

const TERMS = [
  ['The app', 'WePickThePic picks the best photos of your trips and saves them as albums in Photos, alone or together with friends. You may use it for personal, non-commercial purposes. You may not copy, modify, resell or reverse engineer the app, except where the law allows it.'],
  ['Your photos', 'Your photos stay in your own Photos library; WePickThePic never deletes a photo, and we don’t have servers that store anything. You are responsible for your photos and for keeping your iPhone backed up. See the <a href="/privacy/">privacy policy</a> for details.'],
  ['Making an album together', 'When you make an album with friends, you decide which photos you share, and your friends decide which photos they share and receive. Only share with people you trust: photos your friends receive are saved in their own Photos library and are theirs to keep. Make sure you may share the photos you share, for example of other people.'],
  ['Purchases', 'For an in-app purchase, the price is shown in the App Store before you buy. Payment, receipts and refunds are handled by Apple under its terms; refund requests go to Apple. You can restore a purchase on a new iPhone with the same Apple Account.'],
  ['WePickThePic Pro', 'WePickThePic is free to download. WePickThePic Pro is a one-time purchase through the App Store that lets you make as many albums as you like; the price is shown before you buy. There is no subscription. Apple handles payment and refunds, and <a href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/">Apple’s standard Licensed Application End User License Agreement</a> applies.'],
  ['Availability and changes', 'We work to keep the app reliable but can’t guarantee it will always be free of errors or available on every device. We may update the app and these terms; important changes will be announced in the app or on this page, with a new effective date.'],
  ['Liability', 'To the extent permitted by law, the app is provided “as is”, and our liability for any damage related to its use is limited to what you paid for WePickThePic Pro. Nothing in these terms limits your statutory rights as a consumer, or liability that can’t be limited by law (for example for intent or gross negligence).'],
  ['Law and disputes', 'These terms are governed by the law of Romania, without affecting the mandatory consumer protection rules of the country where you live.'],
  ['Contact', `Questions about these terms? Write to <a href="mailto:${EMAIL}">${EMAIL}</a>.`],
];

function terms() {
  const date = new Date(`${effectiveDate}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const body = `  <main class="page">
    <div class="wrap">
      <article>
        <!-- Edit TERMS in scripts/build.mjs. A plain-language starting point, not legal advice: have it reviewed. -->
        <h1>Terms of Use</h1>
        <p class="meta">Effective ${date}</p>
        <p>These terms apply to the WePickThePic app (“the app”). WePickThePic is developed by Sergiu Martin, Romania (“we”, “us”). By using the app you agree to these terms. Apple’s standard Licensed Application End User License Agreement also applies.</p>
${TERMS.map(([h, t], i) => `        <h2>${i + 1}. ${h}</h2>\n        <p>${t}</p>`).join('\n')}
      </article>
    </div>
  </main>`;
  write('terms/index.html', page({ lang: 'en', path: '/terms/', title: 'Terms of Use – WePickThePic', description: 'Terms of use for WePickThePic.', body }));
}

/** What's new, from the app repository's docs/WHATS-NEW.md (English, like OurCents' page). */
function changes() {
  const { intro, sections } = markdownSections('docs/WHATS-NEW.md');
  const updated = sections[0]?.title.match(/– (.+)$/)?.[1] ?? '';
  const body = `  <main class="page">
    <div class="wrap">
      <article>
        <h1>What’s new</h1>
        <p class="meta">Updated ${esc(updated)}</p>
${intro.map((p) => `        <p>${inline(p, 'en')}</p>`).join('\n')}
${sectionsHtml(sections)}
      </article>
    </div>
  </main>`;
  write('changes/index.html', page({
    lang: 'en', path: '/changes/', title: 'What’s new – WePickThePic',
    description: 'What changed in WePickThePic, newest first: new features, improvements and fixes.', body,
  }));
}

/** What's coming, from the app repository's docs/ROADMAP.md (English, like What's new). */
function roadmap() {
  const { intro, sections } = markdownSections('docs/ROADMAP.md');
  const body = `  <main class="page">
    <div class="wrap">
      <article>
        <!-- Built from docs/ROADMAP.md in the app repository: change it there. -->
        <h1>What’s coming</h1>
${intro.map((p) => `        <p>${inline(p, 'en')}</p>`).join('\n')}

        <div class="contact">
          <strong>What would help you most?</strong>
          <p style="margin:6px 0 0">Tell us: in WePickThePic, go to <strong>Settings › Contact support</strong>, or email <a href="mailto:${EMAIL}">${EMAIL}</a>.</p>
        </div>

${sectionsHtml(sections)}

        <p>What changed so far: see <a href="/changes/">What’s new</a>.</p>
      </article>
    </div>
  </main>`;
  write('roadmap/index.html', page({
    lang: 'en', path: '/roadmap/', title: 'What’s coming – WePickThePic',
    description: 'What we’re testing and the ideas we’re looking at for WePickThePic. No promised dates.', body,
  }));
}

function notFound() {
  const ui = UI.en;
  const body = `  <main class="page">
    <div class="wrap">
      <article>
        <h1>${ui.notFound}</h1>
        <p class="meta">${ui.notFoundText}</p>
        <p><a href="/">${ui.toHome}</a></p>
      </article>
    </div>
  </main>`;
  write('404.html', page({ lang: 'en', path: '/404', title: `${ui.notFound} – WePickThePic`, description: ui.notFoundText, body }));
}

const shots = screenshots();
for (const lang of LANGS) {
  home(lang, shots[lang]);
  privacy(lang);
  support(lang);
}
terms();
changes();
roadmap();
notFound();
console.log(`Built from ${app}`);
