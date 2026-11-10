import { describe, expect, it } from 'vitest'
import { kernelSum, parseKernelDraft, prepareKernel, validateKernel } from '../src/core/convolution.js'
import { FILTERS, identityKernel } from '../src/core/kernels.js'

describe('Máscaras predeterminadas y personalizadas', () => {
  it('incluye los nueve filtros, todos con matrices válidas', () => {
    expect(FILTERS).toHaveLength(9)
    expect(new Set(FILTERS.map(f => f.id)).size).toBe(9)
    FILTERS.forEach(filter => {
      expect(() => validateKernel(filter.kernel)).not.toThrow()
      expect(filter.description.length).toBeGreaterThan(20)
      expect(filter.math.length).toBeGreaterThan(20)
      expect(filter.application.length).toBeGreaterThan(20)
    })
  })
  it.each(['identity', 'average', 'gaussian', 'sharpen'])('%s suma 1', id => {
    expect(kernelSum(FILTERS.find(f => f.id === id).kernel)).toBeCloseTo(1, 14)
  })
  it.each(['sobel-x', 'sobel-y', 'laplacian'])('%s suma cero', id => {
    expect(kernelSum(FILTERS.find(f => f.id === id).kernel)).toBe(0)
  })
  it('normalizar una máscara de suma cero produce un error controlado', () => {
    expect(() => prepareKernel(FILTERS.find(f => f.id === 'sobel-x').kernel, true)).toThrow(/suma es cero/)
  })
  it('rechaza también sumas numéricamente cercanas a cero', () => {
    const kernel = [[1, -1, 0], [0, 1e-14, 0], [0, 0, 0]]
    expect(() => prepareKernel(kernel, true)).toThrow(/cero/)
  })
  it('no modifica el kernel al invertirlo ni al normalizarlo', () => {
    const kernel = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
    const snapshot = structuredClone(kernel)
    const prepared = prepareKernel(kernel, true)
    expect(kernel).toEqual(snapshot)
    expect(kernelSum(prepared.effective)).toBeCloseTo(1, 14)
    expect(prepared.flipped[0][0]).toBe(9 / 45)
  })
  it.each([NaN, Infinity, -Infinity, '2', undefined, null, 1000001])('rechaza coeficiente inválido %s', invalid => {
    const kernel = identityKernel(); kernel[1][1] = invalid
    expect(() => validateKernel(kernel)).toThrow(/coeficiente/)
  })
  it.each([[], [[1]], [[1, 2], [3, 4]], [[1, 0, 0], [0, 1], [0, 0, 1]]])('rechaza matrices de tamaño inválido: %j', kernel => {
    expect(() => validateKernel(kernel)).toThrow(/3×3 o 5×5/)
  })
  it('el editor acepta enteros, decimales, negativos y notación científica', () => {
    expect(parseKernelDraft([['1', '-2.5', '0'], ['1e-3', '0', '0'], ['0', '0', '0']])[1][0]).toBe(0.001)
  })
  it.each(['', ' ', 'abc', 'Infinity', '1/9'])('el editor rechaza la celda inválida %j', invalid => {
    const draft = identityKernel().map(row => row.map(String)); draft[0][0] = invalid
    expect(() => parseKernelDraft(draft)).toThrow()
  })
})
