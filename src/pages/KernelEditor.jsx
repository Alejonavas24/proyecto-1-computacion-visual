import { useMemo, useState } from 'react'
import { Check, Copy, Grid2X2, Info, Play, RotateCcw } from 'lucide-react'
import KernelMatrix from '../components/KernelMatrix.jsx'
import ImageComparison from '../components/ImageComparison.jsx'
import ProcessingControls from '../components/ProcessingControls.jsx'
import { FILTERS, identityKernel } from '../core/kernels.js'
import { kernelSum, parseKernelDraft, prepareKernel } from '../core/convolution.js'
import { formatNumber } from '../core/pixelUtils.js'

export default function KernelEditor({ image, result, busy, config, filter, onApply, onCopy, onChange, uploader }) {
  const [draft, setDraft] = useState(() => config.kernel.map(row => row.map(String)))
  const [normalize, setNormalize] = useState(config.normalize)
  const [preset, setPreset] = useState('')
  const validation = useMemo(() => {
    try {
      const kernel = parseKernelDraft(draft)
      const sum = kernelSum(kernel)
      try { return { kernel, prepared: prepareKernel(kernel, normalize), sum, error: null } }
      catch (error) { return { kernel, sum, error: error.message } }
    } catch (error) { return { error: error.message } }
  }, [draft, normalize])
  function loadKernel(kernel) { setDraft(kernel.map(row => row.map(String))); setNormalize(false) }
  function loadPreset(id) {
    setPreset(id)
    if (!id) return
    if (id === 'identity5') loadKernel(identityKernel(5))
    else if (id === 'average5') { loadKernel(Array.from({ length: 5 }, () => Array(5).fill(1))); setNormalize(true) }
    else loadKernel(FILTERS.find(item => item.id === id).kernel)
  }
  const dirty = JSON.stringify(validation.kernel) !== JSON.stringify(config.kernel) || normalize !== config.normalize || filter.id !== 'custom'
  return <><div className="page-heading"><h1>Editor de máscaras</h1></div>
    {uploader}
    <div className="editor-workspace"><section className="panel editor-panel"><div className="panel-heading"><h2>Máscara personalizada</h2><Grid2X2 size={17} /></div>
      <div className="segmented size-selector" role="group" aria-label="Tamaño de matriz">{[3, 5].map(size => <button key={size} className={draft.length === size ? 'active' : ''} aria-pressed={draft.length === size} onClick={() => { loadKernel(identityKernel(size)); setPreset('') }}>{size} × {size}</button>)}</div>
      <label className="field-label">Cargar una máscara<select value={preset} onChange={event => loadPreset(event.target.value)}><option value="">Selecciona una máscara</option>{FILTERS.filter(item => !item.secondaryKernel).map(item => <option key={item.id} value={item.id}>{item.name} · 3×3</option>)}<option value="identity5">Identidad · 5×5</option><option value="average5">Promedio (unos) · 5×5</option></select></label>
      <div className="editor-matrix-area"><KernelMatrix kernel={draft} editable onChange={(y, x, value) => setDraft(rows => rows.map((row, rowIndex) => rowIndex === y ? row.map((cell, column) => column === x ? value : cell) : row))} /></div>
      <div className="kernel-stats"><span>Suma de coeficientes</span><strong>{formatNumber(validation.sum, 6)}</strong></div>
      <label className="checkbox-label"><input type="checkbox" checked={normalize} onChange={event => setNormalize(event.target.checked)} />Normalizar por la suma</label>
      <p className="helper">Cada coeficiente se divide entre la suma. Las máscaras de suma cero, como Sobel, no pueden normalizarse.</p>
      {validation.error && <p className="inline-error" role="alert">{validation.error}</p>}
      <div className="editor-actions"><button className="button primary" disabled={!!validation.error || !image || busy} onClick={() => onApply(validation.kernel, normalize)}>{dirty ? <Play size={15} /> : <Check size={15} />}{dirty ? 'Aplicar máscara' : 'Máscara aplicada'}</button><button className="icon-button" aria-label="Copiar matriz del editor" title="Copiar matriz efectiva" disabled={!!validation.error} onClick={() => onCopy(validation.prepared.effective)}><Copy size={17} /></button><button className="icon-button" aria-label="Restablecer matriz a identidad" title="Restablecer a identidad" onClick={() => { loadKernel(identityKernel(draft.length)); setPreset('') }}><RotateCcw size={17} /></button></div>
      <div className="info-box"><Info size={17} /><p>La matriz se gira 180° al convolucionar. Los cambios se procesan al pulsar <strong>Aplicar máscara</strong>.</p></div>
    </section><div className="editor-preview"><ImageComparison image={image} result={result} busy={busy} filterName={filter.name} filterId={filter.id} />{dirty && <p className="helper">Vista previa: {filter.name}. Aplica los cambios para actualizarla.</p>}</div></div>
    <ProcessingControls config={config} onChange={onChange} />
  </>
}
