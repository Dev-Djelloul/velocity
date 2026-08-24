import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // autoUpdate : le nouveau service worker prend la main dès qu'il est prêt (pas de
      // popup "nouvelle version disponible" à gérer) — cohérent avec un produit qui déploie
      // plusieurs fois par jour, mieux vaut que les utilisateurs récupèrent le dernier build
      // au prochain chargement plutôt que de rester bloqués sur une version en cache.
      registerType: 'autoUpdate',
      // L'enregistrement est géré dans main.jsx pour pouvoir recharger la page lorsqu'un
      // nouveau worker prend le contrôle. Le script généré par défaut met à jour le worker,
      // mais laisse l'onglet courant exécuter l'ancien bundle jusqu'au rechargement suivant.
      injectRegister: false,
      // Aucune règle runtimeCaching pour /api/* : les appels au backend (auth, plans,
      // Copilote IA...) doivent toujours repartir sur le réseau, jamais servis depuis un
      // cache qui rendrait une session ou des données périmées. Seuls les fichiers statiques
      // du build (JS/CSS/HTML/polices/icônes) sont précachés pour permettre l'installation
      // et un premier écran hors-ligne.
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webp,woff2}'],
        // Bibliothèques d'export (PDF/Excel/PPTX/capture d'écran), chargées à la demande
        // seulement quand l'utilisateur exporte un plan — plusieurs Mo à elles seules,
        // aucun intérêt à les précacher à l'installation (ça ralentirait l'install pour une
        // fonctionnalité que la plupart des visites n'utilisent jamais). Le réseau suffit le
        // jour où elles sont réellement utilisées.
        globIgnores: ['**/assets/{pdfmake,pdf,pdf.worker.min,vfs_fonts,xlsx,pptxgen.es,html2canvas.esm,jszip.min}-*.{js,mjs}'],
        navigateFallbackDenylist: [/^\/api\//]
      },
      manifest: {
        name: 'VelocityLaunch',
        short_name: 'VelocityLaunch',
        description: 'Générez un plan de lancement produit complet avec l\'IA : roadmap, marketing, KPIs, prévisionnel financier.',
        lang: 'fr',
        start_url: '/',
        display: 'standalone',
        background_color: '#0b0c10',
        theme_color: '#0b0c10',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      }
    })
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true
      }
    }
  }
})
