import VelocityLaunchLogo from './VelocityLaunchLogo'
import '../styles/AppLoader.css'

// Écran de chargement plein écran affiché pendant l'initialisation de Clerk (isLoaded
// false) — évite un flash de contenu (landing puis dashboard, ou l'inverse) le temps que
// l'état de session soit connu. Fond noir + symbole VelocityLaunch, volontairement
// indépendant du thème clair/sombre de l'app (comme la bannière de cookies) : un écran de
// démarrage reste un composant "système", pas une page de l'interface produit.
export default function AppLoader() {
  return (
    <div className="app-loader">
      <div className="app-loader-ring">
        <div className="app-loader-mark">
          <VelocityLaunchLogo width={56} height={56} animated />
        </div>
      </div>
    </div>
  )
}
