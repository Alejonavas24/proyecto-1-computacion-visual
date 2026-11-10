import { describe, expect, it } from 'vitest'
import { convolve, inspectConvolution } from '../src/core/convolution.js'
import { FILTERS, SOBEL_X, SOBEL_Y, identityKernel } from '../src/core/kernels.js'
import { at, makeImage } from './helpers.js'

describe('Convolución 2D manual', () => {
  const ascending = makeImage(3, 3, (x, y) => y * 3 + x + 1)
  const asymmetric = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]

  it.each([3, 5])('la identidad de tamaño %i conserva RGBA, transparencia y original', size => {
    const image = makeImage(7, 6, (x, y) => [x * 21, y * 30, x + y, (x + y) * 17])
    const snapshot = [...image.data]
    const output = convolve(image, identityKernel(size))
    expect([...output.data]).toEqual(snapshot)
    expect([...image.data]).toEqual(snapshot)
    expect(output.data).not.toBe(image.data)
    expect(output).toMatchObject({ width: 7, height: 6 })
    expect(output.data.length).toBe(7 * 6 * 4)
    expect(output.data).toBeInstanceOf(Float64Array)
  })

  it.each(['replicate', 'reflect'])('el promedio conserva un color uniforme con borde %s', border => {
    const image = makeImage(5, 4, () => [54, 123, 201, 77])
    const output = convolve(image, FILTERS.find(f => f.id === 'average').kernel, { border })
    for (let i = 0; i < output.data.length; i += 4) {
      expect(output.data[i]).toBeCloseTo(54, 12)
      expect(output.data[i + 1]).toBeCloseTo(123, 12)
      expect(output.data[i + 2]).toBeCloseTo(201, 12)
      expect(output.data[i + 3]).toBe(77)
    }
  })

  it('3×3: usa el kernel girado y obtiene 165, no la correlación 285', () => {
    expect(at(convolve(ascending, asymmetric), 1, 1)).toBe(165)
    expect(inspectConvolution(ascending, asymmetric, 1, 1).flipped).toEqual([[9, 8, 7], [6, 5, 4], [3, 2, 1]])
  })

  it('5×5: calcula Σ n(26−n) = 2925 en el centro', () => {
    const image = makeImage(5, 5, (x, y) => y * 5 + x + 1)
    const kernel = Array.from({ length: 5 }, (_, y) => Array.from({ length: 5 }, (_, x) => y * 5 + x + 1))
    expect(at(convolve(image, kernel), 2, 2)).toBe(2925)
  })

  // Réplica: 9+8+14 + 6+5+8 + 12+8+5 = 75.
  it.each([['replicate', 75], ['zero', 26], ['reflect', 165]])('borde %s: respuesta conocida en la esquina superior izquierda', (border, expected) => {
    expect(at(convolve(ascending, asymmetric, { border }), 0, 0)).toBe(expected)
  })

  it('replicar extremos es el comportamiento predeterminado', () => {
    expect(at(convolve(ascending, asymmetric), 0, 0)).toBe(75)
  })

  it.each(['replicate', 'reflect', 'zero'])('procesa imágenes 1×1 con kernel 5×5 y borde %s', border => {
    const image = makeImage(1, 1, () => [32, 64, 128, 0])
    const output = convolve(image, Array.from({ length: 5 }, () => Array(5).fill(1 / 25)), { border })
    expect(output.data[0]).toBeCloseTo(border === 'zero' ? 32 / 25 : 32, 12)
    expect(output.data[3]).toBe(0)
  })

  it('conserva los decimales y las respuestas negativas antes de visualizar', () => {
    const image = makeImage(1, 1, () => [1, 3, 5, 123])
    const kernel = [[0, 0, 0], [0, -0.125, 0], [0, 0, 0]]
    expect([...convolve(image, kernel).data]).toEqual([-0.125, -0.375, -0.625, 123])
  })

  it('procesa RGB de forma independiente y aplica luminancia sin redondearla', () => {
    const image = makeImage(1, 1, () => [255, 0, 0, 99])
    const result = convolve(image, identityKernel(), { grayscale: true })
    expect(result.data[0]).toBeCloseTo(54.213, 12)
    expect(result.data[1]).toBe(result.data[0])
    expect(result.data[2]).toBe(result.data[0])
    expect(result.data[3]).toBe(99)
  })

  it('normalizar divide una máscara por la suma de sus coeficientes', () => {
    const image = makeImage(3, 3, () => 75)
    expect(at(convolve(image, Array.from({ length: 3 }, () => [1, 1, 1]), { normalize: true }), 1, 1)).toBeCloseTo(75, 12)
  })

  it('rechaza dimensiones, canales, coordenadas y políticas de borde inválidas', () => {
    expect(() => convolve({ width: 2, height: 1, data: [1, 2, 3] }, identityKernel())).toThrow(/RGBA/)
    expect(() => convolve(ascending, identityKernel(), { border: 'circular' })).toThrow(/bordes/)
    expect(() => inspectConvolution(ascending, identityKernel(), -1, 0)).toThrow(/píxel/)
    expect(() => inspectConvolution(ascending, identityKernel(), 1.5, 0)).toThrow(/píxel/)
  })
})

describe('Orientación de Sobel para convolución real', () => {
  it('una rampa hacia la derecha tiene Gx positivo y Gy cero', () => {
    const image = makeImage(5, 5, x => 10 * x)
    expect(at(convolve(image, SOBEL_X), 2, 2)).toBe(80)
    expect(at(convolve(image, SOBEL_Y), 2, 2)).toBe(0)
  })
  it('una rampa hacia abajo tiene Gy positivo y Gx cero', () => {
    const image = makeImage(5, 5, (_, y) => 10 * y)
    expect(at(convolve(image, SOBEL_Y), 2, 2)).toBe(80)
    expect(at(convolve(image, SOBEL_X), 2, 2)).toBe(0)
  })
  it('una rampa descendente conserva un gradiente negativo', () => {
    const image = makeImage(5, 5, x => 100 - 10 * x)
    expect(at(convolve(image, SOBEL_X), 2, 2)).toBe(-80)
  })
})
