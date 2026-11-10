import { useEffect, useMemo, useState } from 'react'
import { MousePointer2 } from 'lucide-react'
import { FILTERS } from '../core/kernels.js'
import ImageCanvas from '../components/ImageCanvas.jsx'
import KernelMatrix from '../components/KernelMatrix.jsx'
import PixelInspector from '../components/PixelInspector.jsx'
import ConvolutionAnimation from '../components/ConvolutionAnimation.jsx'
import ProcessingControls from '../components/ProcessingControls.jsx'

export default function MathVisualizer(props) {
  const { image, uploader } = props
  return <><div className="page-heading"><h1>Visualizador matemático</h1></div>{uploader}
    {image ? <InteractiveMath key={`${image.width}-${image.height}-${props.sourceKey}`} {...props} /> : <div className="panel empty-state"><MousePointer2 size={32} /><h2>Carga una imagen</h2></div>}
  </>
}

function InteractiveMath({ image, config, filter, onSelect, onChange }) {
  const [pixel, setPixel] = useState({ x: Math.floor(image.width / 2), y: Math.floor(image.height / 2) })
  const [anchor, setAnchor] = useState(pixel)
  const [regionSize, setRegionSize] = useState(16)
  const [channel, setChannel] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(500)
  const region = useMemo(() => {
    const width = Math.min(regionSize, image.width), height = Math.min(regionSize, image.height)
    return { x: Math.min(image.width - width, Math.max(0, anchor.x - Math.floor(width / 2))), y: Math.min(image.height - height, Math.max(0, anchor.y - Math.floor(height / 2))), width, height }
  }, [anchor, image.width, image.height, regionSize])
  const selection = useMemo(() => ({ ...pixel, radius: (config.kernel.length - 1) / 2 }), [pixel, config.kernel.length])
  function selectPixel(x, y, recenter = true) {
    const next = { x, y }
    setPixel(next); setPlaying(false)
    if (recenter) setAnchor(next)
  }
  function step(delta) {
    setPlaying(false)
    setPixel(current => {
      const index = Math.min(region.width * region.height - 1, Math.max(0, (current.y - region.y) * region.width + current.x - region.x + delta))
      return { x: region.x + index % region.width, y: region.y + Math.floor(index / region.width) }
    })
  }
  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => {
      setPixel(current => {
        const next = (current.y - region.y) * region.width + current.x - region.x + 1
        if (next >= region.width * region.height) return current
        return { x: region.x + next % region.width, y: region.y + Math.floor(next / region.width) }
      })
    }, speed)
    return () => clearInterval(id)
  }, [playing, region, speed])
  useEffect(() => { if (pixel.x === region.x + region.width - 1 && pixel.y === region.y + region.height - 1) setPlaying(false) }, [pixel, region])
  return <>
    <div className="panel visualizer-settings">
      <label>Máscara aplicada<select value={filter.id} onChange={event => { onSelect(event.target.value); setPlaying(false) }}>
        {FILTERS.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
        {filter.id === 'identity' && <option value="identity">Original · sin filtro</option>}
        {filter.id === 'custom' && <option value="custom">Máscara personalizada</option>}
      </select></label>
      <label>Canal de estudio<select value={config.grayscale ? 'gray' : String(channel)} onChange={event => { const gray = event.target.value === 'gray'; onChange({ grayscale: gray }); if (!gray) setChannel(Number(event.target.value)) }}><option value="0">R · Rojo</option><option value="1">G · Verde</option><option value="2">B · Azul</option><option value="gray">Grises · Luminancia</option></select></label>
      <label>Región de animación<select value={regionSize} onChange={event => { setRegionSize(Number(event.target.value)); setAnchor(pixel); setPlaying(false) }}>{[8, 16, 24].map(size => <option key={size} value={size}>{size} × {size} píxeles</option>)}</select></label>
    </div>
    <div className="math-workspace"><div className="math-source-column"><section className="panel source-panel"><div className="panel-heading"><h2>Elige un píxel</h2><MousePointer2 size={16} /></div><p className="panel-hint">Haz clic sobre la imagen o escribe sus coordenadas.</p><div className="source-canvas checkerboard"><ImageCanvas image={image} selection={selection} onPixelClick={selectPixel} label="Imagen original: haz clic para seleccionar un píxel" /></div><div className="coordinate-inputs"><label>X<input type="number" min="0" max={image.width - 1} value={pixel.x} onChange={event => selectPixel(Math.min(image.width - 1, Math.max(0, Math.floor(Number(event.target.value)))), pixel.y)} /></label><label>Y<input type="number" min="0" max={image.height - 1} value={pixel.y} onChange={event => selectPixel(pixel.x, Math.min(image.height - 1, Math.max(0, Math.floor(Number(event.target.value)))))} /></label><span>Origen: esquina superior izquierda</span></div></section>
      <section className="panel original-kernel"><div><span className="eyebrow">MÁSCARA ORIGINAL{config.magnitude ? ' · Kx' : ''}</span><h3>{filter.name}</h3><p>En el cálculo se utiliza esta matriz girada 180°. {config.normalize ? 'También se divide por la suma de sus coeficientes.' : ''}</p></div><KernelMatrix kernel={config.kernel} compact /></section>
    </div><ConvolutionAnimation image={image} region={region} pixel={pixel} kernelSize={config.kernel.length} playing={playing} onPlaying={value => { if (value && pixel.x === region.x + region.width - 1 && pixel.y === region.y + region.height - 1) setPixel({ x: region.x, y: region.y }); setPlaying(value) }} onStep={step} onReset={() => { setPlaying(false); setPixel({ x: region.x, y: region.y }) }} speed={speed} onSpeed={setSpeed} onPixel={(x, y) => selectPixel(x, y, false)} /></div>
    <PixelInspector image={image} config={config} pixel={pixel} channel={config.grayscale ? 0 : channel} />
    <ProcessingControls config={config} onChange={onChange} />
  </>
}
