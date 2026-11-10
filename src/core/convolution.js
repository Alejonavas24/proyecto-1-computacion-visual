import { BORDER_MODES, borderCoordinate, luminance, validateImage } from './pixelUtils.js'

export function validateKernel(kernel) {
  const size = kernel?.length
  if (![3, 5].includes(size) || kernel.some(row => !Array.isArray(row) || row.length !== size)) {
    throw new Error('La máscara debe ser una matriz cuadrada de 3×3 o 5×5.')
  }
  if (kernel.some(row => row.some(value => typeof value !== 'number' || !Number.isFinite(value) || Math.abs(value) > 1e6))) {
    throw new Error('Cada coeficiente debe ser un número finito entre −1 000 000 y 1 000 000.')
  }
  return kernel
}

export const kernelSum = kernel => kernel.flat().reduce((sum, value) => sum + value, 0)

export function parseKernelDraft(draft) {
  if (draft.some(row => row.some(value => String(value).trim() === ''))) throw new Error('Completa todas las celdas de la máscara.')
  return validateKernel(draft.map(row => row.map(Number)))
}

export function prepareKernel(kernel, normalize = false) {
  validateKernel(kernel)
  const sum = kernelSum(kernel)
  if (normalize && Math.abs(sum) < 1e-12) throw new Error('No se puede normalizar una máscara cuya suma es cero.')
  const divisor = normalize ? sum : 1
  const effective = kernel.map(row => row.map(value => value / divisor))
  // Convolución real: rotación de 180°. La correlación NO realiza este giro.
  const flipped = effective.map(row => [...row].reverse()).reverse()
  return { size: kernel.length, radius: Math.floor(kernel.length / 2), effective, flipped, divisor }
}

function checkOptions({ border = 'replicate' } = {}) {
  if (!BORDER_MODES.includes(border)) throw new Error('Política de bordes desconocida.')
}

/**
 * Único acumulador usado tanto por la imagen completa como por el inspector.
 * Cada producto y suma usa Number (64 bits); nunca se recorta aquí.
 * `terms` solo se solicita al inspeccionar un píxel, no al procesar la imagen.
 */
function accumulatePixel(image, x, y, prepared, options, terms) {
  const { border = 'replicate', grayscale = false } = options
  const { size, radius, flipped } = prepared
  let red = 0, green = 0, blue = 0
  for (let ky = 0; ky < size; ky++) {
    const sampleY = borderCoordinate(y + ky - radius, image.height, border)
    for (let kx = 0; kx < size; kx++) {
      const sampleX = borderCoordinate(x + kx - radius, image.width, border)
      let r = 0, g = 0, b = 0
      if (sampleX !== -1 && sampleY !== -1) {
        const index = (sampleY * image.width + sampleX) * 4
        r = image.data[index]; g = image.data[index + 1]; b = image.data[index + 2]
        if (grayscale) r = g = b = luminance(r, g, b)
      }
      const weight = flipped[ky][kx]
      red += r * weight; green += g * weight; blue += b * weight
      if (terms) terms.push({ row: ky, column: kx, x: sampleX, y: sampleY, values: [r, g, b], weight, products: [r * weight, g * weight, b * weight] })
    }
  }
  return [red, green, blue]
}

export function convolve(image, kernel, options = {}) {
  validateImage(image)
  checkOptions(options)
  const prepared = prepareKernel(kernel, options.normalize)
  const data = new Float64Array(image.data.length)
  for (let y = 0; y < image.height; y++) {
    for (let x = 0; x < image.width; x++) {
      const index = (y * image.width + x) * 4
      const values = accumulatePixel(image, x, y, prepared, options)
      data[index] = values[0]; data[index + 1] = values[1]; data[index + 2] = values[2]
      // Alfa pertenece al píxel de destino; no se filtra ni se sustituye por 255.
      data[index + 3] = image.data[index + 3]
    }
  }
  return { width: image.width, height: image.height, data }
}

export function inspectConvolution(image, kernel, x, y, options = {}) {
  validateImage(image)
  checkOptions(options)
  if (!Number.isInteger(x) || !Number.isInteger(y) || x < 0 || y < 0 || x >= image.width || y >= image.height) {
    throw new Error('Selecciona un píxel dentro de la imagen.')
  }
  const prepared = prepareKernel(kernel, options.normalize)
  const terms = []
  const values = accumulatePixel(image, x, y, prepared, options, terms)
  return { x, y, values, alpha: image.data[(y * image.width + x) * 4 + 3], terms, ...prepared }
}
