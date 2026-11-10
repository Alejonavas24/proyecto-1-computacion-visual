import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowUpRight, CheckCircle2, CircleHelp, X } from 'lucide-react'
import Sidebar, { NAVIGATION } from './components/Sidebar.jsx'
import ImageUploader from './components/ImageUploader.jsx'
import Laboratory from './pages/Laboratory.jsx'
import KernelEditor from './pages/KernelEditor.jsx'
import MathVisualizer from './pages/MathVisualizer.jsx'
import Theory from './pages/Theory.jsx'
import { createExampleImage } from './core/exampleImage.js'
import { getFilter } from './core/kernels.js'
import { loadImageFile } from './core/imageProcessor.js'
import { useImageProcessor } from './hooks/useImageProcessor.js'

export default function App() {
  const [page, setPage] = useState('lab')
  const [source, setSource] = useState(() => ({ ...createExampleImage(), id: 0 }))
  const [selected, setSelected] = useState('sobel')
  const [custom, setCustom] = useState(null)
  const [settings, setSettings] = useState({ border: 'replicate', grayscale: false, displayMode: 'clamp', gain: 1 })
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState(null)
  const [toast, setToast] = useState('')
  const [copyFallback, setCopyFallback] = useState('')
  const loadSequence = useRef(0)
  const filter = useMemo(() => selected === 'custom' ? {
    id: 'custom', name: 'Máscara personalizada', kernel: custom.kernel,
    description: 'Aplica los coeficientes definidos en el editor.',
    math: 'I′(x,y) = Σ I(x−i,y−j) K(i,j). La máscara se gira 180° antes de multiplicar.',
    application: 'Evaluar el efecto de coeficientes personalizados.',
  } : getFilter(selected) ?? getFilter('sobel'), [selected, custom])
  const config = useMemo(() => ({ ...settings, kernel: filter.kernel, magnitude: filter.id === 'sobel', normalize: filter.id === 'custom' ? custom.normalize : false, offset: 0 }), [settings, filter, custom])
  const processing = useImageProcessor(source?.image, config)
  useEffect(() => { if (!toast) return; const id = setTimeout(() => setToast(''), 4500); return () => clearTimeout(id) }, [toast])
  function navigate(next) { setPage(next); window.scrollTo({ top: 0, behavior: 'instant' }) }
  function selectFilter(id) {
    const next = getFilter(id)
    if (!next) return
    setSelected(id)
    setSettings(previous => ({ ...previous, displayMode: next.mode, gain: 1 }))
  }
  async function loadFile(file) {
    const sequence = ++loadSequence.current
    setLoading(true); setLoadError(null)
    try {
      const loaded = await loadImageFile(file)
      if (sequence === loadSequence.current) setSource({ ...loaded, id: sequence })
    } catch (error) { if (sequence === loadSequence.current) setLoadError(error.message) }
    finally { if (sequence === loadSequence.current) setLoading(false) }
  }
  function loadExample() {
    const id = ++loadSequence.current
    setSource({ ...createExampleImage(), id }); setLoading(false); setLoadError(null)
  }
  function removeImage() { ++loadSequence.current; setSource(null); setLoading(false); setLoadError(null) }
  async function copyMatrix(matrix) {
    const value = JSON.stringify(matrix, null, 2)
    try { await navigator.clipboard.writeText(value); setToast('Matriz copiada al portapapeles.') }
    catch { setCopyFallback(value) }
  }
  function applyCustom(kernel, normalize) {
    setCustom({ kernel, normalize }); setSelected('custom')
    setSettings(previous => ({ ...previous, displayMode: 'clamp', gain: 1 }))
    setToast('Máscara aplicada.')
  }
  function resetOriginal() {
    setSelected('identity')
    setSettings({ border: 'replicate', grayscale: false, displayMode: 'clamp', gain: 1 })
    setToast('Restablecida la imagen original.')
  }
  function updateSettings(changes) {
    setSettings(previous => Object.entries(changes).every(([key, value]) => previous[key] === value) ? previous : { ...previous, ...changes })
  }
  const uploader = <ImageUploader source={source} onLoad={loadFile} onExample={loadExample} onRemove={removeImage} loading={loading} />
  const shared = { image: source?.image, result: processing.result, busy: processing.busy, config, filter, onSelect: selectFilter, onChange: updateSettings, onNavigate: navigate, onCopy: copyMatrix, uploader }
  return <div className="app-shell"><a className="skip-link" href="#main-content">Saltar al contenido</a><Sidebar page={page} onNavigate={navigate} /><div className="main-shell">
    <header className="topbar"><div className="breadcrumb">COMPUTACIÓN VISUAL <span>/</span><strong>{NAVIGATION.find(item => item.id === page).label}</strong></div><div className="topbar-actions"><button className="help-button" onClick={() => navigate('theory')}><CircleHelp size={16} /><span>Guía del laboratorio</span><ArrowUpRight size={13} /></button></div></header>
    <main id="main-content" className="page-content">
      {(loadError || processing.error) && <div className="error-banner" role="alert"><span>{loadError || processing.error}</span>{loadError && <button className="icon-button" aria-label="Cerrar error de carga" onClick={() => setLoadError(null)}><X size={16} /></button>}</div>}
      {page === 'lab' && <Laboratory {...shared} onReset={resetOriginal} />}
      {page === 'editor' && <KernelEditor {...shared} onApply={applyCustom} />}
      {page === 'math' && <MathVisualizer {...shared} sourceKey={source?.id} />}
      {page === 'theory' && <Theory onNavigate={navigate} />}
    </main>
  </div>{toast && <div className="toast" role="status"><CheckCircle2 size={18} />{toast}<button aria-label="Cerrar notificación" onClick={() => setToast('')}><X size={15} /></button></div>}
  {copyFallback && <div className="modal-backdrop"><section role="dialog" aria-modal="true" aria-labelledby="copy-title" className="panel copy-dialog"><div className="panel-heading"><h2 id="copy-title">Copiar matriz</h2><button className="icon-button" aria-label="Cerrar ventana de copia" onClick={() => setCopyFallback('')}><X size={18} /></button></div><p>Selecciona el texto y usa Ctrl+C para copiarlo.</p><textarea autoFocus readOnly value={copyFallback} onFocus={event => event.target.select()} aria-label="Matriz para copiar" /></section></div>}
  </div>
}
