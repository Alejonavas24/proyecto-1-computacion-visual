import { describe, expect, it } from 'vitest'
import { inspectProcessedPixel, processingDimensions, processImage, MAX_PIXELS, MAX_SIDE } from '../src/core/imageProcessor.js'
import { displayValue } from '../src/core/pixelUtils.js'
import { FILTERS } from '../src/core/kernels.js'
import { at, makeImage } from './helpers.js'

const configFor = (filter, changes = {}) => ({ kernel: filter.kernel, magnitude: filter.id === 'sobel', border: 'replicate', normalize: false, grayscale: false, displayMode: filter.mode, gain: 1, offset: filter.offset ?? 0, ...changes })

describe('Procesamiento, visualización y precisión del inspector', () => {
  it('combina Gx=240 y Gy=320 en magnitud 400 antes del recorte final', () => {
    const image = makeImage(3, 3, (x, y) => 30 * x + 40 * y)
    const config = configFor(FILTERS.find(f => f.id === 'sobel'))
    const result = processImage(image, config)
    const inspection = inspectProcessedPixel(image, config, 1, 1)
    expect(at(result.raw, 1, 1)).toBe(400)
    expect(at(result.image, 1, 1)).toBe(255)
    expect(inspection.primary.values[0]).toBe(240)
    expect(inspection.secondary.values[0]).toBe(320)
    expect(inspection.rawValue).toBe(400)
    expect(result.max).toBe(400)
  })

  it.each(FILTERS.map(filter => [filter.id, filter]))('el inspector coincide exactamente con %s en cada canal y cada píxel', (_, filter) => {
    const image = makeImage(4, 3, (x, y) => [x * 30 + y * 7, x * 5 + y * 50, (x + y) * 13, (x + y) * 23])
    for (const border of ['replicate', 'reflect', 'zero']) {
      for (const grayscale of [false, true]) {
        const config = configFor(filter, { border, grayscale })
        const result = processImage(image, config)
        for (let y = 0; y < image.height; y++) for (let x = 0; x < image.width; x++) for (let channel = 0; channel < 3; channel++) {
          const inspection = inspectProcessedPixel(image, config, x, y, channel)
          expect(inspection.rawValue).toBe(at(result.raw, x, y, channel))
          expect(inspection.finalValue).toBe(at(result.image, x, y, channel))
        }
      }
    }
  })

  it('el inspector 5×5 coincide con normalización y un borde de ceros', () => {
    const image = makeImage(3, 2, (x, y) => [21 + x, 50 + y, 71, 127])
    const config = configFor(FILTERS[0], { kernel: Array.from({ length: 5 }, () => Array(5).fill(1)), normalize: true, border: 'zero', displayMode: 'signed', gain: .25 })
    const output = processImage(image, config)
    const inspection = inspectProcessedPixel(image, config, 0, 0, 1)
    expect(inspection.primary.terms).toHaveLength(25)
    expect(inspection.rawValue).toBe(at(output.raw, 0, 0, 1))
    expect(inspection.finalValue).toBe(at(output.image, 0, 0, 1))
    expect(output.image.data[3]).toBe(127)
  })

  it.each([['signed', 88], ['absolute', 40], ['clamp', 0]])('el modo %s representa −40 como %i', (displayMode, expected) => {
    expect(displayValue(-40, { displayMode })).toBe(expected)
  })
  it('ganancia, desplazamiento y saturación se aplican al final', () => {
    expect(displayValue(-40, { displayMode: 'signed', gain: .5 })).toBe(108)
    expect(displayValue(200, { displayMode: 'clamp', offset: 128 })).toBe(255)
    expect(displayValue(.6)).toBe(1)
    expect(displayValue(-10000)).toBe(0)
    expect(displayValue(10000)).toBe(255)
  })

  it('la identidad produce una imagen PNG equivalente y conserva dimensiones/canales', () => {
    const image = makeImage(3, 4, (x, y) => [x * 33, y * 30, 14, x * 47])
    const output = processImage(image, configFor(FILTERS[0]))
    expect(output.image.data).toEqual(image.data)
    expect(output.image.width).toBe(3)
    expect(output.image.height).toBe(4)
    expect(output.image.data).toBeInstanceOf(Uint8ClampedArray)
  })
})

describe('Límites de resolución', () => {
  it.each([[4000, 3000], [10000, 100], [100, 10000], [6000, 6000]])('reduce %i×%i respetando ambos límites', (width, height) => {
    const output = processingDimensions(width, height)
    expect(Math.max(output.width, output.height)).toBeLessThanOrEqual(MAX_SIDE)
    expect(output.width * output.height).toBeLessThanOrEqual(MAX_PIXELS)
    expect(Math.abs(output.width / width - output.height / height)).toBeLessThan(.011)
  })
  it('no amplía imágenes pequeñas', () => { expect(processingDimensions(120, 90)).toEqual({ width: 120, height: 90 }) })
})
