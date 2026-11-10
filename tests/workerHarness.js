// Adaptador de Web Worker a worker_threads solo para probar el protocolo en Node.
import { parentPort } from 'node:worker_threads'
globalThis.self = { postMessage: (message, transfer) => parentPort.postMessage(message, transfer) }
await import('../src/workers/convolution.worker.js')
parentPort.on('message', data => self.onmessage({ data }))
parentPort.postMessage({ ready: true })
