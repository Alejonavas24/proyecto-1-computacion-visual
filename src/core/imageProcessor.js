import { convolve, inspectConvolution } from './convolution.js'
import { SOBEL_X, SOBEL_Y } from './kernels.js'
import { displayValue, validateImage } from './pixelUtils.js'

export const MAX_SIDE = 1280
export const MAX_PIXELS = 1048576
export const MAX_FILE_SIZE = 25 * 1024 * 1024

export function processingDimensions(width, height) {
  const scale = Math.min(1, MAX_SIDE / Math.max(width, height), Math.sqrt(MAX_PIXELS / (width * height)))
  return { width: Math.max(1, Math.floor(width * scale)), height: Math.max(1, Math.floor(height * scale)) }
}

export function renderRaw(raw, config = {}) {
  const data = new Uint8ClampedArray(raw.data.length)
  let min = Infinity, max = -Infinity
  for (let i = 0; i < data.length; i += 4) {
    for (let channel = 0; channel < 3; channel++) {
      const value = raw.data[i + channel]
      min = Math.min(min, value); max = Math.max(max, value)
      data[i + channel] = displayValue(value, config)
    }
    data[i + 3] = raw.data[i + 3]
  }
  return { image: { width: raw.width, height: raw.height, data }, min, max }
}

export function processImage(image, config) {
  validateImage(image)
  let raw
  if (config.magnitude) {
    const gx = convolve(image, SOBEL_X, config)
    const gy = convolve(image, SOBEL_Y, config)
    for (let i = 0; i < gx.data.length; i += 4) {
      for (let c = 0; c < 3; c++) gx.data[i + c] = Math.hypot(gx.data[i + c], gy.data[i + c])
    }
    raw = gx
  } else raw = convolve(image, config.kernel, config)
  return { raw, ...renderRaw(raw, config) }
}

export function inspectProcessedPixel(image, config, x, y, channel = 0) {
  const primary = inspectConvolution(image, config.magnitude ? SOBEL_X : config.kernel, x, y, config)
  const secondary = config.magnitude ? inspectConvolution(image, SOBEL_Y, x, y, config) : null
  const rawValue = secondary ? Math.hypot(primary.values[channel], secondary.values[channel]) : primary.values[channel]
  return { primary, secondary, rawValue, finalValue: displayValue(rawValue, config), channel }
}

export async function loadImageFile(file) {
  if (!file || !['image/png', 'image/jpeg'].includes(file.type)) throw new Error('Selecciona una imagen PNG, JPG o JPEG.')
  if (file.size > MAX_FILE_SIZE) throw new Error('El archivo supera el límite de 25 MB.')
  const url = URL.createObjectURL(file)
  try {
    const image = new Image()
    image.src = url
    await image.decode()
    const { width, height } = processingDimensions(image.naturalWidth, image.naturalHeight)
    const canvas = document.createElement('canvas')
    canvas.width = width; canvas.height = height
    const context = canvas.getContext('2d', { willReadFrequently: true })
    context.drawImage(image, 0, 0, width, height)
    return { image: context.getImageData(0, 0, width, height), name: file.name, originalWidth: image.naturalWidth, originalHeight: image.naturalHeight, example: false }
  } catch (error) {
    throw new Error(`No se pudo abrir la imagen. ${error.message}`)
  } finally { URL.revokeObjectURL(url) }
}

export function drawImageData(canvas, image) {
  if (!canvas || !image) return
  canvas.width = image.width; canvas.height = image.height
  canvas.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(image.data), image.width, image.height), 0, 0)
}

export function downloadImage(image, name = 'resultado') {
  const canvas = document.createElement('canvas')
  drawImageData(canvas, image)
  canvas.toBlob(blob => {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url; anchor.download = `${name}.png`
    anchor.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }, 'image/png')
}
