import { useEffect, useMemo, useRef, useState } from 'react'

export function useImageProcessor(image, config) {
  const [state, setState] = useState({ result: null, busy: false, error: null })
  const workerRef = useRef(null)
  const latestDisplay = useRef(null)
  const mathematicalConfig = useMemo(() => ({ kernel: config.kernel, magnitude: config.magnitude, border: config.border, grayscale: config.grayscale, normalize: config.normalize }), [config.kernel, config.magnitude, config.border, config.grayscale, config.normalize])
  const displayConfig = useMemo(() => ({ displayMode: config.displayMode, gain: config.gain, offset: config.offset }), [config.displayMode, config.gain, config.offset])
  const displayKey = JSON.stringify(displayConfig)
  latestDisplay.current = { config: displayConfig, key: displayKey }
  useEffect(() => {
    if (!image) { setState({ result: null, busy: false, error: null }); return }
    // Cada cambio cancela el trabajo anterior: jamás se presenta un resultado obsoleto.
    let worker
    let cancelled = false
    setState({ result: null, busy: true, error: null })
    try {
      worker = new Worker(new URL('../workers/convolution.worker.js', import.meta.url), { type: 'module' })
      workerRef.current = { worker, displayKey: latestDisplay.current.key }
      worker.onmessage = ({ data }) => {
        if (cancelled || data.displayKey !== latestDisplay.current.key) return
        setState(data.error ? { result: null, busy: false, error: data.error } : { result: data, busy: false, error: null })
      }
      worker.onerror = () => {
        if (cancelled) return
        setState({ result: null, busy: false, error: 'No se pudo procesar la imagen en el Web Worker. Recarga la página para reintentar.' })
        worker.terminate()
        workerRef.current = null
      }
      // Copia estructurada: el búfer original permanece disponible e intacto.
      worker.postMessage({ type: 'process', image: { width: image.width, height: image.height, data: image.data }, config: { ...mathematicalConfig, ...latestDisplay.current.config }, displayKey: latestDisplay.current.key })
    } catch (error) { setState({ result: null, busy: false, error: error.message }) }
    return () => { cancelled = true; worker?.terminate(); workerRef.current = null }
  }, [image, mathematicalConfig])
  useEffect(() => {
    const active = workerRef.current
    if (!active || active.displayKey === displayKey) return
    setState({ result: null, busy: true, error: null })
    active.displayKey = displayKey
    active.worker.postMessage({ type: 'render', config: displayConfig, displayKey })
  }, [displayConfig, displayKey])
  return state
}
