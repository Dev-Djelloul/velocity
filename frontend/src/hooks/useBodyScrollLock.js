import { useEffect } from 'react'

// Verrouille le scroll du body tant que le composant appelant (une modale plein écran ou
// un panneau superposé) est monté — sans ça, un swipe sur mobile pouvait faire défiler la
// page derrière la modale au lieu du panneau lui-même, aucun modal de l'app ne verrouillait
// le scroll du body (retour utilisateur, capture à l'appui sur la bibliothèque de widgets).
// Restaure la valeur précédente à la fermeture, y compris si plusieurs modales
// s'empilent (chacune restaure son propre "avant" plutôt qu'un '' fixe).
// `active` permet d'appeler le hook sans risque en haut d'un composant persistant
// (page toujours montée) où une seule modale interne parmi plusieurs est conditionnelle —
// le verrou ne s'active/se restaure qu'au moment où `active` passe à true/false.
export function useBodyScrollLock(active = true) {
  useEffect(() => {
    if (!active) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previous }
  }, [active])
}
