import { useState, useEffect, useRef } from 'react'

/**
 * Hook pour optimiser le chargement des images :
 * - Lazy loading
 * - Progressive blur
 * - Skeleton state
 * - Error handling
 */
export function useImageOptimization(imagePath) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const imgRef = useRef(null)

  useEffect(() => {
    if (!imagePath) return

    const img = new Image()

    img.onload = () => {
      setLoaded(true)
      setError(false)
    }

    img.onerror = () => {
      setError(true)
      setLoaded(false)
    }

    img.src = imagePath
  }, [imagePath])

  return {
    loaded,
    error,
    imgRef,
    imageClass: loaded ? 'image-loaded' : 'image-loading'
  }
}

/**
 * Hook pour animer les éléments au scroll
 */
export function useScrollReveal() {
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [])

  return { ref, isVisible }
}

/**
 * Hook pour les compteurs animés (stats)
 */
export function useCounterAnimation(endValue, isVisible, duration = 2000) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isVisible) return

    let startTime
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = (timestamp - startTime) / duration

      if (progress < 1) {
        setCount(Math.floor(endValue * progress))
        requestAnimationFrame(animate)
      } else {
        setCount(endValue)
      }
    }

    requestAnimationFrame(animate)
  }, [isVisible, endValue, duration])

  return count
}

/**
 * Hook pour récupérer les images du dossier ai-images/
 *
 * Règle : chaque image n'est allouée qu'à UN SEUL emplacement sur tout le site
 * (voir Landing.jsx / HowItWorksPage.jsx) pour éviter la répétition visuelle
 * d'une page à l'autre. Certaines images du dossier sont volontairement
 * exclues de la rotation (voir commentaires ci-dessous) :
 * - dashboardMockup pointait vers un fichier inexistant (préfixe lucid-origin
 *   au lieu de gpt-image-2) → chemin corrigé.
 * - howItWorksWorkflow (infographie "5 steps: Discover/Define/Build/Launch/
 *   Measure", texte anglais figé dans l'image) contredit le vrai parcours à
 *   3 étapes du produit → non utilisée, pour éviter l'incohérence.
 * - founderCinematic2 : coquille visible dans le néon d'arrière-plan
 *   ("INOVATE OR D..." au lieu de "INNOVATE") → non utilisée en l'état.
 * - industriesAlt et professionalWoman : quasi-doublons conceptuels
 *   d'industriesSplit / professionalMan déjà utilisées ailleurs → gardées en
 *   réserve pour une future page plutôt que forcées ici.
 */
export function useAiImages() {
  const images = {
    heroIsometric: '/assets/ai-images/velocity-hero-launch-landscape.webp',
    controlCard: '/assets/ai-images/velocity-launch-system-network.webp',
    howItWorksNetwork: '/assets/ai-images/velocity-planning-control.webp',
    obsidianAtmosphere: '/assets/ai-images/velocity-obsidian-atmosphere.webp',
    heroIsometricAlt: '/assets/ai-images/isometric-3d-concept-of-an-ai-transforming-raw-not (1).png',

    howItWorksWorkflow: '/assets/ai-images/gpt-image-2_Product_launch_workflow_visualization_digital_strategy_diagram_with_5_steps_flow-0.jpg',

    professionalMan: '/assets/ai-images/lucid-origin_a_cinematic_photo_of_Professional_man_at_modern_desk_using_laptop_with_glowing_q-0.jpg',
    professionalWoman: '/assets/ai-images/lucid-origin_professional_photo_of_Professional_woman_at_modern_desk_using_laptop_with_glowin-0.jpg',

    teamFounders: '/assets/ai-images/velocity-founders.jpg',

    dashboardPreview: '/assets/ai-images/modern-saas-dashboard-dark-mode-ui-preview--isomet.png',
    dashboardPreviewAlt: '/assets/ai-images/modern-saas-dashboard-dark-mode-ui-preview--isomet (1).png',
    dashboardMockup: '/assets/ai-images/gpt-image-2_professional_photo_of_Dashboard_interface_mockup_for_product_launch_platform_col-0.jpg',

    // Aperçu produit v2 (4 cartes) - remplace les 3 précédentes dans Landing.jsx
    productPreview1: '/assets/ai-images/velocity-product-roadmap-sprint.jpg',
    productPreview2: '/assets/ai-images/high-level-description-a-3d-render-of-a-_QEvFEFjVXDGbQyI5bRy5LQ_dfn8eFbnRgmWLvCn2EZSYw.jpg',
    productPreview3: '/assets/ai-images/velocity-product-analytics.jpg',
    productPreview4: '/assets/ai-images/velocity-product-gantt-velocity.jpg',

    // Icônes 3D pour les 4 cartes "Pensé pour les founders pressés" (HowItWorksPage)
    valueFast: '/assets/ai-images/fast.jpg',
    valueBrain: '/assets/ai-images/brain-ai.jpg',
    valueCustom: '/assets/ai-images/custom-ai.jpg',
    valueActionable: '/assets/ai-images/actionnable.jpg',

    industriesSplit: '/assets/ai-images/gpt-image-2_exquisite_high_fashion_photography_of_Split-screen_showing_different_industries_-0.jpg',
    industriesAlt: '/assets/ai-images/gpt-image-2_professional_photo_of_Split-screen_showing_different_industries_using_launch_pla-0.jpg',
    industriesSaas: '/assets/ai-images/velocity-industries.jpg',

    speedProductivity: '/assets/ai-images/lucid-origin_Abstract_3D_isometric_illustration_representing_speed_and_productivity_for_a_Saa-0.jpg',

    abstractHero: '/assets/ai-images/lucid-origin_a_surreal_and_vibrant_cinematic_photo_of_Abstract_tech_hero_image_geometric_shap-0.jpg',

    founderCinematic1: '/assets/ai-images/cinematic-photo-of-a-focused-tech-founder-working-.png',
    founderCinematic2: '/assets/ai-images/cinematic-photo-of-a-focused-tech-founder-working- (1).png'
  }

  return images
}
