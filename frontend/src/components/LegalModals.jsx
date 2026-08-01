import InfoModal from './InfoModal'
import { IconLock, IconFileText, IconCookie } from './Icons'

const CONTACT_EMAIL = 'contact@digitalblueskye.com'

export function PrivacyModal({ onClose }) {
  return (
    <InfoModal icon={<IconLock width={26} height={26} />} title="Politique de confidentialité" onClose={onClose}>
      <section>
        <p>Dernière mise à jour : juillet 2026. VelocityLaunch accorde une attention particulière à la confidentialité de vos données.</p>
      </section>

      <section>
        <h2>Données collectées</h2>
        <p>Les réponses que vous saisissez dans le questionnaire (informations produit, marché, ressources) servent uniquement à générer votre plan de lancement. Par défaut, ces données restent stockées localement dans votre navigateur (localStorage) et ne transitent vers nos serveurs que si vous choisissez explicitement de partager un plan via un lien.</p>
      </section>

      <section>
        <h2>Utilisation des données</h2>
        <p>Nous n'utilisons jamais le contenu de vos plans à des fins publicitaires ou de revente. Google Analytics est utilisé uniquement pour comprendre l'usage global du service, sans lien avec le contenu de vos plans.</p>
      </section>

      <section>
        <h2>Vos droits (RGPD)</h2>
        <ul>
          <li><strong>Accès :</strong> vous pouvez consulter toutes les données que vous avez générées</li>
          <li><strong>Suppression :</strong> vider votre localStorage supprime immédiatement vos données locales</li>
          <li><strong>Portabilité :</strong> export possible à tout moment en PDF ou CSV</li>
          <li><strong>Opposition :</strong> écrivez-nous pour toute demande spécifique</li>
        </ul>
      </section>

      <section>
        <h2>Contact</h2>
        <p>Pour toute question relative à vos données : <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p>
      </section>

      <p className="info-modal-note">Ce document est fourni à titre indicatif pour un projet en beta. Il ne remplace pas un avis juridique et sera précisé avant toute mise en production commerciale.</p>
    </InfoModal>
  )
}

export function TermsModal({ onClose }) {
  return (
    <InfoModal icon={<IconFileText width={26} height={26} />} title="Conditions d'utilisation" onClose={onClose}>
      <section>
        <p>Dernière mise à jour : juillet 2026. En utilisant VelocityLaunch, vous acceptez les conditions suivantes.</p>
      </section>

      <section>
        <h2>Le service</h2>
        <p>VelocityLaunch génère des recommandations (roadmap, stratégie marketing, KPIs) à partir des réponses que vous fournissez. Ces recommandations sont des points de départ, pas des conseils professionnels garantis : à vous de les adapter à votre contexte réel.</p>
      </section>

      <section>
        <h2>Utilisation acceptable</h2>
        <ul>
          <li>Le service est fourni "tel quel", sans garantie de résultat commercial</li>
          <li>Vous restez propriétaire du contenu de vos plans</li>
          <li>Toute tentative d'abus, de scraping massif ou d'attaque du service est interdite</li>
        </ul>
      </section>

      <section>
        <h2>Disponibilité</h2>
        <p>VelocityLaunch est en beta gratuite : le service peut évoluer, et certaines fonctionnalités peuvent être ajustées sans préavis pendant cette phase.</p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>Pour toute question sur ces conditions : <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p>
      </section>

      <p className="info-modal-note">Ce document est fourni à titre indicatif pour un projet en beta. Il ne remplace pas un avis juridique et sera précisé avant toute mise en production commerciale.</p>
    </InfoModal>
  )
}

export function CookiesModal({ onClose }) {
  return (
    <InfoModal icon={<IconCookie width={26} height={26} />} title="Politique de cookies" onClose={onClose}>
      <section>
        <p>VelocityLaunch utilise le minimum de cookies et de stockage nécessaire au fonctionnement du service.</p>
      </section>

      <section>
        <h2>Stockage local (essentiel)</h2>
        <p>Votre langue préférée, vos brouillons et vos plans générés sont conservés dans le localStorage de votre navigateur. Ce stockage n'est pas un cookie tiers : il reste sur votre appareil et n'est jamais transmis sans action de votre part.</p>
      </section>

      <section>
        <h2>Mesure d'audience</h2>
        <p>Google Analytics dépose des cookies de mesure d'audience pour comprendre l'utilisation globale du service (pages visitées, provenance). Aucune donnée personnelle issue de vos plans n'y est associée.</p>
      </section>

      <section>
        <h2>Gérer vos cookies</h2>
        <p>Vous pouvez à tout moment bloquer les cookies de mesure d'audience via les réglages de votre navigateur, sans impact sur le fonctionnement du générateur de plan.</p>
      </section>

      <p className="info-modal-note">Ce document est fourni à titre indicatif pour un projet en beta. Il ne remplace pas un avis juridique et sera précisé avant toute mise en production commerciale.</p>
    </InfoModal>
  )
}
