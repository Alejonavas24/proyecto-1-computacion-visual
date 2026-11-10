// Escena vectorial rasterizada con Canvas. No descarga fotografías ni recursos externos.
export function createExampleImage() {
  const canvas = document.createElement('canvas')
  canvas.width = 960; canvas.height = 640
  const c = canvas.getContext('2d', { willReadFrequently: true })
  const polygon = (points, color) => {
    c.fillStyle = color; c.beginPath()
    points.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y))
    c.closePath(); c.fill()
  }
  const sky = c.createLinearGradient(0, 0, 0, 640)
  sky.addColorStop(0, '#75c4c4'); sky.addColorStop(1, '#d7e5d2')
  c.fillStyle = sky; c.fillRect(0, 0, 960, 640)
  c.fillStyle = '#f7e9b4'; c.beginPath(); c.arc(760, 130, 68, 0, Math.PI * 2); c.fill()
  polygon([[0, 385], [125, 265], [270, 340], [400, 230], [620, 385]], '#87aaa0')
  polygon([[570, 400], [790, 270], [960, 350], [960, 510]], '#648f87')
  c.fillStyle = '#dec6a0'; c.fillRect(0, 470, 960, 170)
  polygon([[0, 640], [470, 430], [960, 640]], '#ead7b6')
  // Pabellón modernista: volúmenes, sombras, ventanas y escalera.
  polygon([[234, 187], [587, 187], [714, 251], [361, 251]], '#f3c49e')
  c.fillStyle = '#d98568'; c.fillRect(234, 187, 353, 302)
  polygon([[587, 187], [714, 251], [714, 521], [587, 489]], '#b56b58')
  c.fillStyle = '#f0ad85'; c.fillRect(219, 176, 380, 24)
  c.fillStyle = '#efb18a'; c.fillRect(264, 224, 293, 240)
  // Arcade centrale.
  c.fillStyle = '#204b49'; c.beginPath(); c.moveTo(335, 475); c.lineTo(335, 329)
  c.arc(410, 329, 75, Math.PI, 0); c.lineTo(485, 475); c.closePath(); c.fill()
  const shade = c.createLinearGradient(335, 0, 485, 0)
  shade.addColorStop(0, '#163b3b'); shade.addColorStop(1, '#487a70')
  c.fillStyle = shade; c.fillRect(350, 330, 120, 147)
  c.fillStyle = '#eac69d'; c.fillRect(385, 340, 5, 134); c.fillRect(435, 340, 5, 134)
  c.fillStyle = '#c87c61'; c.fillRect(264, 464, 293, 25)
  for (let i = 0; i < 6; i++) {
    c.fillStyle = i % 2 ? '#efdab4' : '#f9e7c7'
    c.fillRect(313 - i * 17, 484 + i * 17, 196 + i * 34, 17)
    c.fillStyle = '#c4a989'; c.fillRect(313 - i * 17, 498 + i * 17, 196 + i * 34, 3)
  }
  for (let i = 0; i < 4; i++) {
    polygon([[615 + i * 21, 286 + i * 10], [627 + i * 21, 292 + i * 10], [627 + i * 21, 383 + i * 9], [615 + i * 21, 378 + i * 9]], '#3d5850')
  }
  polygon([[714, 521], [900, 592], [589, 592], [502, 567]], '#b49d7e')
  // Plantas con siluetas definidas para estudiar los detectores de bordes.
  function plant(x, y, scale) {
    c.save(); c.translate(x, y); c.scale(scale, scale)
    for (let i = 0; i < 9; i++) {
      const angle = -Math.PI + i * Math.PI / 8
      const dx = Math.cos(angle) * 90, dy = Math.sin(angle) * 170
      c.fillStyle = ['#244d45', '#346b57', '#507e60'][i % 3]
      c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(dx * 1.6, dy * .4, dx, dy)
      c.quadraticCurveTo(dx * .2, dy * .8, 0, 0); c.fill()
    }
    polygon([[-43, 0], [43, 0], [30, 66], [-30, 66]], '#b1644e')
    c.fillStyle = '#d88d6b'; c.fillRect(-47, -5, 94, 13)
    c.restore()
  }
  plant(136, 495, .9); plant(785, 524, .7); plant(884, 592, .5)
  // Un grano determinista añade altas frecuencias sin recursos externos.
  const image = c.getImageData(0, 0, canvas.width, canvas.height)
  let seed = 71
  for (let i = 0; i < image.data.length; i += 4) {
    seed = (seed * 1664525 + 1013904223) >>> 0
    const grain = ((seed / 4294967296) - .5) * 6
    for (let channel = 0; channel < 3; channel++) image.data[i + channel] += grain
  }
  return { image, name: 'Pabellón de luz · ejemplo local', originalWidth: 960, originalHeight: 640, example: true }
}
