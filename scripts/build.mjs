// Builds the website (plain HTML, no build step on the server) from the app repository's own texts, so the
// site says exactly what the app and the store say:
//   - home: docs/STORE-LISTING*.md (tagline, proof line, description) in 4 languages
//   - privacy: src/lib/legal.ts and src/locales/<language>/privacy.ts (the policy shown in the app)
//   - support: docs/SUPPORT*.md
//   - terms: TERMS below (English only, like the privacy policy's binding version)
// Run after changing any of those:   node scripts/build.mjs [path to the app repository, default ../VoyageVault]
// Then commit and push: Cloudflare publishes the site from this repository.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const site = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const app = resolve(site, process.argv[2] ?? '../VoyageVault');
const read = (path) => readFileSync(join(app, path), 'utf8');
const DOMAIN = 'https://wepickthepic.app';
const EMAIL = 'smartin.appsupport@gmail.com';
const LANGS = ['en', 'de', 'ro', 'es'];

// ---------- Words of the site itself ----------

const UI = {
  en: {
    name: 'English', locale: 'en-GB', home: 'Home', features: 'Features', together: 'Together', privacy: 'Privacy',
    support: 'Support', terms: 'Terms', soon: 'Coming soon to the', title: 'Best Trip Photos',
    privacyTitle: 'Privacy Policy', effective: 'Effective {date}', supportTitle: 'Support',
    supportMeta: 'We’re happy to help.', readPolicy: 'Read the privacy policy →',
    privacyHeading: 'Private by design', helpTitle: 'Have a question or a problem?',
    helpText: 'The support page answers the most common questions and shows how to reach us.',
    helpButton: 'Go to the support page', notFound: 'Page not found', notFoundText: 'This page doesn’t exist.',
    toHome: 'Go to the WePickThePic homepage →', translationNote: '',
    contactInApp: 'The quickest way: in WePickThePic, go to <strong>Settings › Contact support</strong> and choose to include the diagnostic info: the app version, your iPhone model and what the app did recently. It never contains your photos or their places, you see all of it in the email before you send it, and it helps us find the problem much faster.',
    contactMail: 'Can’t open the app? Email <a href="mailto:{email}">{email}</a> and mention your iPhone model and iOS version.',
    contactTitle: 'Contact',
  },
  de: {
    name: 'Deutsch', locale: 'de-DE', home: 'Start', features: 'Funktionen', together: 'Gemeinsam', privacy: 'Datenschutz',
    support: 'Support', terms: 'Nutzungsbedingungen', soon: 'Bald im', title: 'Die besten Reisefotos',
    privacyTitle: 'Datenschutzerklärung', effective: 'Gültig ab {date}', supportTitle: 'Support',
    supportMeta: 'Wir helfen gern.', readPolicy: 'Zur Datenschutzerklärung →',
    privacyHeading: 'Privat von Grund auf', helpTitle: 'Eine Frage oder ein Problem?',
    helpText: 'Die Support-Seite beantwortet die häufigsten Fragen und zeigt, wie du uns erreichst.',
    helpButton: 'Zur Support-Seite', notFound: 'Seite nicht gefunden', notFoundText: 'Diese Seite gibt es nicht.',
    toHome: 'Zur Startseite von WePickThePic →',
    translationNote: 'Dies ist eine Übersetzung zur besseren Verständlichkeit. Rechtlich maßgeblich ist die <a href="/privacy/">englische Fassung</a>.',
    contactInApp: 'Am schnellsten: Geh in WePickThePic zu <strong>Einstellungen › Support kontaktieren</strong> und füge die Diagnoseinfos hinzu: die App-Version, dein iPhone-Modell und was die App zuletzt getan hat. Sie enthalten nie deine Fotos oder deren Orte, du siehst alles in der E-Mail, bevor du sie sendest, und sie helfen uns, das Problem viel schneller zu finden.',
    contactMail: 'Die App lässt sich nicht öffnen? Schreib an <a href="mailto:{email}">{email}</a> und nenne dein iPhone-Modell und die iOS-Version.',
    contactTitle: 'Kontakt',
  },
  ro: {
    name: 'Română', locale: 'ro-RO', home: 'Acasă', features: 'Funcții', together: 'Împreună', privacy: 'Confidențialitate',
    support: 'Asistență', terms: 'Termeni', soon: 'În curând în', title: 'Cele mai bune poze din călătorii',
    privacyTitle: 'Politica de confidențialitate', effective: 'În vigoare din {date}', supportTitle: 'Asistență',
    supportMeta: 'Te ajutăm cu drag.', readPolicy: 'Citește politica de confidențialitate →',
    privacyHeading: 'Privat din start', helpTitle: 'Ai o întrebare sau o problemă?',
    helpText: 'Pagina de asistență răspunde la cele mai frecvente întrebări și arată cum ne poți contacta.',
    helpButton: 'Mergi la pagina de asistență', notFound: 'Pagina nu a fost găsită', notFoundText: 'Această pagină nu există.',
    toHome: 'Mergi la pagina principală WePickThePic →',
    translationNote: 'Aceasta este o traducere pentru o înțelegere mai ușoară. Versiunea obligatorie din punct de vedere juridic este <a href="/privacy/">cea în engleză</a>.',
    contactInApp: 'Cel mai rapid: în WePickThePic, mergi la <strong>Setări › Contactează asistența</strong> și alege să incluzi informațiile de diagnostic: versiunea aplicației, modelul iPhone-ului și ce a făcut aplicația recent. Nu conțin niciodată fotografiile tale sau locurile lor, vezi totul în e-mail înainte să-l trimiți și ne ajută să găsim problema mult mai repede.',
    contactMail: 'Nu poți deschide aplicația? Scrie la <a href="mailto:{email}">{email}</a> și menționează modelul iPhone-ului și versiunea iOS.',
    contactTitle: 'Contact',
  },
  es: {
    name: 'Español', locale: 'es-ES', home: 'Inicio', features: 'Funciones', together: 'Juntos', privacy: 'Privacidad',
    support: 'Soporte', terms: 'Términos', soon: 'Muy pronto en la', title: 'Las mejores fotos de viaje',
    privacyTitle: 'Política de privacidad', effective: 'Vigente desde el {date}', supportTitle: 'Soporte',
    supportMeta: 'Estamos encantados de ayudarte.', readPolicy: 'Leer la política de privacidad →',
    privacyHeading: 'Privado desde el diseño', helpTitle: '¿Tienes una pregunta o un problema?',
    helpText: 'La página de soporte responde a las preguntas más frecuentes y explica cómo contactarnos.',
    helpButton: 'Ir a la página de soporte', notFound: 'Página no encontrada', notFoundText: 'Esta página no existe.',
    toHome: 'Ir a la página de inicio de WePickThePic →',
    translationNote: 'Esta es una traducción para facilitar la comprensión. La versión jurídicamente vinculante es <a href="/privacy/">la inglesa</a>.',
    contactInApp: 'Lo más rápido: en WePickThePic, ve a <strong>Ajustes › Contactar con soporte</strong> y elige incluir la información de diagnóstico: la versión de la app, el modelo de tu iPhone y lo que hizo la app recientemente. Nunca contiene tus fotos ni sus lugares, lo ves todo en el correo antes de enviarlo y nos ayuda a encontrar el problema mucho más rápido.',
    contactMail: '¿No puedes abrir la app? Escribe a <a href="mailto:{email}">{email}</a> e indica el modelo de tu iPhone y la versión de iOS.',
    contactTitle: 'Contacto',
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

function page({ lang, path, title, description, body, nav }) {
  const ui = UI[lang];
  const own = (l) => `${prefix(l)}${path}`;
  const alternates = path === '/terms/' || path === '/404'
    ? ''
    : LANGS.map((l) => `  <link rel="alternate" hreflang="${l}" href="${DOMAIN}${own(l)}">`).join('\n') +
      `\n  <link rel="alternate" hreflang="x-default" href="${DOMAIN}${path}">\n`;
  const menu = LANGS.map(
    (l) =>
      `            <li><a href="${path === '/terms/' || path === '/404' ? `${prefix(l)}/` : own(l)}" hreflang="${l}" lang="${l}"${l === lang ? ' aria-current="true"' : ''}>${UI[l].name}</a></li>`,
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
      <div><a href="${p}/privacy/">${ui.privacy}</a><a href="/terms/">${ui.terms}</a><a href="${p}/support/">${ui.support}</a></div>
    </div>
  </footer>
  <script src="/assets/menu.js" defer></script>
</body>
</html>
`;
}

function write(path, html) {
  const file = join(site, path);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}

// ---------- Pages ----------

function home(lang) {
  const ui = UI[lang];
  const l = listing(lang);
  const [lead, what, together] = l.paragraphs;
  const privacySection = l.sections[3];
  const featureSections = l.sections.filter((s) => s !== privacySection);
  const p = prefix(lang);
  const body = `  <main>
    <section class="hero">
      <div class="wrap">
        <img src="/assets/icon-512.png" alt="WePickThePic" width="96" height="96" class="hero-icon">
        <h1>${esc(l.tagline)}</h1>
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
        <p class="sub">${esc(what)}</p>
        <p class="sub">${esc(together)}</p>
        <div class="grid">
${featureSections
  .map(
    (s) => `          <div class="card">
            <h3>${esc(s.title.charAt(0) + s.title.slice(1).toLowerCase())}</h3>
            <ul>
${s.items.map((i) => `              <li>${esc(i)}</li>`).join('\n')}
            </ul>
          </div>`,
  )
  .join('\n')}
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
        <a href="#privacy">${ui.privacy}</a>
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
  ['1. The app', 'WePickThePic picks the best photos of your trips and saves them as albums in Photos, alone or together with friends. You may use it for personal, non-commercial purposes. You may not copy, modify, resell or reverse engineer the app, except where the law allows it.'],
  ['2. Your photos', 'Your photos stay in your own Photos library; WePickThePic never deletes a photo, and we don’t have servers that store anything. You are responsible for your photos and for keeping your iPhone backed up. See the <a href="/privacy/">privacy policy</a> for details.'],
  ['3. Making an album together', 'When you make an album with friends, you decide which photos you share, and your friends decide which photos they share and receive. Only share with people you trust: photos your friends receive are saved in their own Photos library and are theirs to keep. Make sure you may share the photos you share, for example of other people.'],
  ['4. Purchases', 'If WePickThePic offers an in-app purchase, the price is shown in the App Store before you buy. Payment, receipts and refunds are handled by Apple under its terms; refund requests go to Apple. You can restore a purchase on a new iPhone with the same Apple Account.'],
  ['5. Availability and changes', 'We work to keep the app reliable but can’t guarantee it will always be free of errors or available on every device. We may update the app and these terms; important changes will be announced in the app or on this page, with a new effective date.'],
  ['6. Liability', 'To the extent permitted by law, the app is provided “as is”, and our liability for any damage related to its use is limited to the amount you paid for the app. Nothing in these terms limits your statutory rights as a consumer, or liability that can’t be limited by law (for example for intent or gross negligence).'],
  ['7. Law and disputes', 'These terms are governed by the law of Romania, without affecting the mandatory consumer protection rules of the country where you live.'],
  ['8. Contact', `Questions about these terms? Write to <a href="mailto:${EMAIL}">${EMAIL}</a>.`],
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
${TERMS.map(([h, t]) => `        <h2>${h}</h2>\n        <p>${t}</p>`).join('\n')}
      </article>
    </div>
  </main>`;
  write('terms/index.html', page({ lang: 'en', path: '/terms/', title: 'Terms of Use – WePickThePic', description: 'Terms of use for WePickThePic.', body }));
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

for (const lang of LANGS) {
  home(lang);
  privacy(lang);
  support(lang);
}
terms();
notFound();
console.log(`Built from ${app}`);
