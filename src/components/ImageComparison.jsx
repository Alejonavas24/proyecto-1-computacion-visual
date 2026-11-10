import { useState } from 'react'
import { Columns2, Download, Image, MoveHorizontal, RotateCcw, SlidersHorizontal, ZoomIn, ZoomOut } from 'lucide-react'
import ImageCanvas from './ImageCanvas.jsx'
import { downloadImage } from '../core/imageProcessor.js'
import { formatNumber } from '../core/pixelUtils.js'

export default function ImageComparison({ image, result, busy, filterName, filterId }) {
  const [mode, setMode] = useState('side')
  const [zoom, setZoom] = useState(100)
  const [split, setSplit] = useState(50)
  const [showResult, setShowResult] = useState(true)
  const processed = result?.image
  const fitWidth = image ? Math.min(100, image.width / image.height / 1.5 * 100) : 100
  function frame(data, title, isResult) {
    return <div className="image-frame"><div className="frame-heading"><span><span className={`frame-dot ${isResult ? 'green' : ''}`} />{title}</span><span>{isResult ? filterName : 'SIN FILTRO'}</span></div>
      <div className="canvas-viewport checkerboard"><div className="canvas-scale" style={{ width: `${fitWidth * zoom / 100}%` }}>
        {data && <ImageCanvas image={data} label={title} />}
      </div>{!data && <div className="processing-state"><span className={busy ? 'spinner' : ''} />{busy ? 'Calculando convolución…' : 'Carga una imagen para comenzar'}</div>}</div>
      <div className="frame-footer"><span>{data ? `${data.width} × ${data.height} px` : '—'}</span><span>{isResult ? 'SALIDA PNG · 8 BITS / CANAL' : 'ENTRADA · RGBA'}</span></div>
    </div>
  }
  return <section className="panel comparison-panel" aria-label="Comparador de imágenes">
    <div className="comparison-toolbar"><div className="segmented" role="group" aria-label="Modo de comparación">
      {[['side', Columns2, 'Lado a lado'], ['slider', SlidersHorizontal, 'Deslizador'], ['toggle', Image, 'Alternar']].map(([id, Icon, label]) => <button key={id} onClick={() => setMode(id)} aria-pressed={mode === id} className={mode === id ? 'active' : ''}><Icon size={14} /><span>{label}</span></button>)}
    </div><div className="zoom-controls"><button className="icon-button" aria-label="Reducir zoom" onClick={() => setZoom(z => Math.max(100, z - 25))} disabled={zoom === 100}><ZoomOut size={15} /></button><span>{zoom}%</span><button className="icon-button" aria-label="Aumentar zoom" onClick={() => setZoom(z => Math.min(400, z + 25))} disabled={zoom === 400}><ZoomIn size={15} /></button><button className="icon-button" aria-label="Restablecer vista" title="Restablecer vista" onClick={() => { setZoom(100); setSplit(50); setShowResult(true) }}><RotateCcw size={14} /></button></div></div>
    {mode === 'side' ? <div className="image-pair">{frame(image, 'Original', false)}{frame(processed, 'Resultado', true)}</div> : mode === 'toggle' ? <div className="single-comparison">{frame(showResult ? processed : image, showResult ? 'Resultado' : 'Original', showResult)}<button className="button secondary toggle-image" onClick={() => setShowResult(value => !value)}><MoveHorizontal size={15} />Mostrar {showResult ? 'original' : 'resultado'}</button></div> : <div className="slider-comparison">
      <div className="frame-heading"><span>Original <MoveHorizontal size={14} /> Resultado</span><span>ANTES / DESPUÉS</span></div>
      <div className="canvas-viewport checkerboard"><div className="canvas-scale overlay-stack" style={{ width: `${fitWidth * zoom / 100}%` }}>
        {image && <ImageCanvas image={image} label="Imagen original del deslizador" />}
        {processed && <div className="overlay-result" style={{ clipPath: `inset(0 0 0 ${split}%)` }}><ImageCanvas image={processed} label="Resultado del deslizador" /></div>}
        <div className="split-line" style={{ left: `${split}%` }}><MoveHorizontal size={18} /></div>
      </div></div><label className="split-control">Original<input type="range" min="0" max="100" value={split} onChange={event => setSplit(Number(event.target.value))} aria-label="Posición del deslizador antes y después" />Resultado</label>
    </div>}
    <div className="comparison-bottom"><div className="processing-meta"><span className="status-dot" /><span>{busy ? 'Procesando…' : result ? `Procesado en ${formatNumber(result.duration, 1)} ms` : 'Esperando imagen'}</span></div><button className="button primary small" disabled={!processed || busy} onClick={() => downloadImage(processed, `visual-lab-${filterId}`)}><Download size={15} />Descargar PNG</button></div>
  </section>
}
