// Prérend les pages marketing publiques (Landing, HowItWorksPage) en HTML statique après le
// build client, pour que Googlebot et les robots de partage social (LinkedIn, Twitter/X...)
// voient le contenu texte réel sans exécuter de JavaScript. L'app CSR habituelle continue de
// fonctionner à l'identique par-dessus : ce script ne fait qu'injecter le HTML déjà rendu
// dans le <div id="root"> du dist/index.html, le client React remplace ensuite ce contenu au
// premier rendu (pas d'hydratation réelle, juste un remplacement — suffisant pour du SEO/
// partage, et beaucoup plus simple/robuste qu'une vraie hydratation SSR).
//
// Best-effort volontaire : une erreur ici ne doit jamais faire échouer le déploiement. Le
// build Vite (dist/) est déjà valide et déployable avant ce script.
import { build } from 'vite'
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const distDir = path.join(root, 'dist')
const ssrOutDir = path.join(root, 'dist-ssr')

// route -> { file de sortie relatif à dist/, title, description }
const PAGES = {
  '/': {
    outFile: 'index.html',
    title: 'VelocityLaunch - Générateur de plan de lancement produit par IA',
    description: "Générez votre plan de lancement produit complet en 5 minutes : roadmap, backlog, stratégie marketing, KPIs, prévisions financières et suivi post-lancement. Idéal pour startups et équipes produit."
  },
  '/comment-ca-marche': {
    outFile: 'comment-ca-marche/index.html',
    title: 'Comment ça marche - VelocityLaunch',
    description: "3 étapes simples pour transformer vos réponses en plan de lancement complet : répondez au questionnaire, laissez le générateur créer votre stratégie, exportez et lancez."
  },
  '/confidentialite': {
    outFile: 'confidentialite/index.html',
    title: 'Politique de confidentialité - VelocityLaunch',
    description: "Comment VelocityLaunch collecte, utilise et protège vos données : compte, plans générés par IA, intégrations tierces, paiement, et vos droits RGPD."
  }
}

function injectPage(template, { html, title, description, url }) {
  let out = template
  out = out.replace(/<title>.*?<\/title>/s, `<title>${title}</title>`)
  out = out.replace(/<meta name="description" content=".*?">/s, `<meta name="description" content="${description}">`)
  out = out.replace(/<meta property="og:title" content=".*?">/s, `<meta property="og:title" content="${title}">`)
  out = out.replace(/<meta property="og:description" content=".*?">/s, `<meta property="og:description" content="${description}">`)
  out = out.replace(/<meta property="og:url" content=".*?">/s, `<meta property="og:url" content="https://velocity.digitalblueskye.com${url}">`)
  out = out.replace(/<meta name="twitter:title" content=".*?">/s, `<meta name="twitter:title" content="${title}">`)
  out = out.replace(/<meta name="twitter:description" content=".*?">/s, `<meta name="twitter:description" content="${description}">`)
  out = out.replace(/<link rel="canonical" href=".*?">/s, `<link rel="canonical" href="https://velocity.digitalblueskye.com${url}">`)
  out = out.replace('<div id="root"></div>', `<div id="root">${html}</div>`)
  return out
}

async function main() {
  console.log('[prerender] build du bundle SSR...')
  await build({
    root,
    build: {
      ssr: 'src/entry-server.jsx',
      outDir: 'dist-ssr',
      emptyOutDir: true
    },
    logLevel: 'warn'
  })

  const ssrEntry = path.join(ssrOutDir, 'entry-server.js')
  const { render } = await import(`file://${ssrEntry}`)
  const template = await readFile(path.join(distDir, 'index.html'), 'utf-8')

  for (const [url, page] of Object.entries(PAGES)) {
    try {
      const html = render(url, 'fr')
      if (!html) {
        console.warn(`[prerender] pas de rendu pour ${url}, ignoré`)
        continue
      }
      const finalHtml = injectPage(template, { html, url, ...page })
      const outPath = path.join(distDir, page.outFile)
      await mkdir(path.dirname(outPath), { recursive: true })
      await writeFile(outPath, finalHtml, 'utf-8')
      // Fichier plat en plus du dossier (ex: comment-ca-marche.html en plus de
      // comment-ca-marche/index.html) : filet de sécurité pour les hébergeurs/outils locaux
      // (ex: vite preview) qui ne résolvent pas tous l'index d'un dossier sans slash final —
      // Netlify le fait nativement, mais autant ne pas en dépendre.
      if (page.outFile !== 'index.html' && page.outFile.endsWith('/index.html')) {
        const flatPath = outPath.replace(/\/index\.html$/, '.html')
        await writeFile(flatPath, finalHtml, 'utf-8')
      }
      console.log(`[prerender] ${url} -> dist/${page.outFile}`)
    } catch (err) {
      console.warn(`[prerender] échec sur ${url}, page CSR standard conservée :`, err.message)
    }
  }

  await rm(ssrOutDir, { recursive: true, force: true })
}

main().catch((err) => {
  console.warn('[prerender] échec global, le build reste déployable sans prérendu :', err.message)
})
