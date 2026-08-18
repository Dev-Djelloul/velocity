// Redimensionne une image uploadée avant de la stocker en data URL dans le plan (comme les
// avatars, voir personalSpace.js) — sans ça, une photo de plusieurs Mo alourdirait le JSON
// du plan et, plus grave, la liste /gallery qui agrège l'aperçu de dizaines de plans d'un
// coup. maxWidth 640 + JPEG qualité 0.82 : largement suffisant pour une carte de galerie ou
// un bandeau de plan, jamais plus de ~150 Ko en pratique.
export function resizeImageToDataUrl(file, maxWidth = 640) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = () => {
      const img = new Image()
      img.onerror = reject
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width)
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.82))
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}
