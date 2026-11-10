import { Worker } from 'node:worker_threads'
import { once } from 'node:events'
import { afterEach, expect, it } from 'vitest'
import { SOBEL_X } from '../src/core/kernels.js'
import { at, makeImage } from './helpers.js'

let worker
afterEach(async () => { await worker?.terminate() })

async function startWorker() {
  worker = new Worker(new URL('./workerHarness.js', import.meta.url), { type: 'module' })
  const [message] = await once(worker, 'message')
  expect(message.ready).toBe(true)
}

async function send(message) {
  const response = once(worker, 'message')
  worker.postMessage(message)
  return (await response)[0]
}

it('el worker procesa y reutiliza los flotantes para distintos modos de visualización', async () => {
  await startWorker()
  const image = makeImage(3, 3, x => [100 - x * 10, 50, 20, 47])
  const config = { kernel: SOBEL_X, border: 'replicate', displayMode: 'signed', gain: 1, offset: 0 }
  const result = await send({ type: 'process', image, config, displayKey: 'signed' })
  expect(result.error).toBeUndefined()
  expect(result.displayKey).toBe('signed')
  expect(at(result.image, 1, 1)).toBe(48)
  expect(result.min).toBe(-80)
  expect(result.image.data[3]).toBe(47)
  expect(image.data.byteLength).toBe(36)
  // No se envían ni imagen ni kernel: se convierte la respuesta ya calculada.
  const absolute = await send({ type: 'render', config: { displayMode: 'absolute', gain: 1 }, displayKey: 'absolute' })
  expect(at(absolute.image, 1, 1)).toBe(80)
  expect(absolute.duration).toBe(result.duration)
  const clamp = await send({ type: 'render', config: { displayMode: 'clamp', gain: 1 }, displayKey: 'clamp' })
  expect(at(clamp.image, 1, 1)).toBe(0)
  expect(clamp.min).toBe(-80)
})

it('el worker devuelve errores controlados y descarta los datos de un cálculo fallido', async () => {
  await startWorker()
  const image = makeImage(1, 1, () => 10)
  const invalid = await send({ type: 'process', image, config: { kernel: SOBEL_X, normalize: true }, displayKey: 'invalid' })
  expect(invalid.error).toMatch(/suma es cero/)
  const render = await send({ type: 'render', config: {}, displayKey: 'render' })
  expect(render.error).toMatch(/No hay/)
})
