import { processImage, renderRaw } from '../core/imageProcessor.js'

let raw = null
let duration = 0

self.onmessage = ({ data: { type, image, config, displayKey } }) => {
  try {
    const start = performance.now()
    let rendered
    if (type === 'process') {
      raw = null
      const result = processImage(image, config)
      raw = result.raw
      rendered = { image: result.image, min: result.min, max: result.max }
      duration = performance.now() - start
    } else {
      if (!raw) throw new Error('No hay una respuesta matemática disponible para visualizar.')
      rendered = renderRaw(raw, config)
    }
    // Los flotantes permanecen en el worker. Cambiar ganancia o modo no repite la convolución.
    self.postMessage({ ...rendered, duration, displayKey }, [rendered.image.data.buffer])
  } catch (error) { self.postMessage({ error: error.message, displayKey }) }
}
