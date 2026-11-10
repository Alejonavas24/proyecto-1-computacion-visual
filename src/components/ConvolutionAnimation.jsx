import { useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from 'lucide-react'
import { drawImageData } from '../core/imageProcessor.js'

export default function ConvolutionAnimation({ image, region, pixel, kernelSize, playing, onPlaying, onStep, onReset, speed, onSpeed, onPixel }) {
  const ref = useRef(null)
  const cell = 24
  const index = (pixel.y - region.y) * region.width + pixel.x - region.x
  const total = region.width * region.height
  useEffect(() => {
    const source = document.createElement('canvas')
    drawImageData(source, image)
    const canvas = ref.current
    canvas.width = region.width * cell; canvas.height = region.height * cell
    const c = canvas.getContext('2d')
    c.imageSmoothingEnabled = false
    c.drawImage(source, region.x, region.y, region.width, region.height, 0, 0, canvas.width, canvas.height)
    c.strokeStyle = 'rgba(0,0,0,.3)'; c.lineWidth = 1
    for (let x = 0; x <= canvas.width; x += cell) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, canvas.height); c.stroke() }
    for (let y = 0; y <= canvas.height; y += cell) { c.beginPath(); c.moveTo(0, y); c.lineTo(canvas.width, y); c.stroke() }
    const radius = (kernelSize - 1) / 2
    const px = (pixel.x - region.x) * cell, py = (pixel.y - region.y) * cell
    c.fillStyle = 'rgba(195,245,120,.17)'; c.fillRect(px - radius * cell, py - radius * cell, kernelSize * cell, kernelSize * cell)
    c.strokeStyle = '#c3f578'; c.lineWidth = 3; c.strokeRect(px - radius * cell + 1, py - radius * cell + 1, kernelSize * cell - 2, kernelSize * cell - 2)
    c.strokeStyle = '#fff'; c.lineWidth = 2; c.strokeRect(px + 2, py + 2, cell - 4, cell - 4)
  }, [image, region, pixel, kernelSize])
  return <section className="panel animation-panel"><div className="panel-heading"><h2>El kernel en movimiento</h2><span className="tag">{region.width} × {region.height} px</span></div><p className="panel-hint">Región ampliada · un paso equivale a un píxel</p>
    <div className="pixel-region checkerboard"><canvas ref={ref} role="img" aria-label="Región ampliada con el kernel y el píxel seleccionado" onClick={event => { const rect = ref.current.getBoundingClientRect(); onPixel(region.x + Math.min(region.width - 1, Math.floor((event.clientX - rect.left) / rect.width * region.width)), region.y + Math.min(region.height - 1, Math.floor((event.clientY - rect.top) / rect.height * region.height))) }} /></div>
    <div className="animation-progress"><span>Paso {index + 1} de {total}</span><span className="mono">({pixel.x}, {pixel.y})</span></div>
    <div className="progress-track"><div style={{ width: `${(index + 1) / total * 100}%` }} /></div>
    <div className="animation-controls"><button className="icon-button" aria-label="Reiniciar animación" onClick={onReset}><RotateCcw size={16} /></button><button className="icon-button" aria-label="Paso anterior" disabled={index <= 0} onClick={() => onStep(-1)}><ChevronLeft size={19} /></button><button className="button primary small" onClick={() => onPlaying(!playing)}>{playing ? <Pause size={15} /> : <Play size={15} />}{playing ? 'Pausar' : 'Iniciar'}</button><button className="icon-button" aria-label="Siguiente paso" disabled={index >= total - 1} onClick={() => onStep(1)}><ChevronRight size={19} /></button><label className="speed-control">Velocidad<select value={speed} onChange={event => onSpeed(Number(event.target.value))}><option value="1200">Lenta</option><option value="500">Normal</option><option value="120">Rápida</option></select></label></div>
    <p className="helper">El marco verde representa la máscara. El centro blanco es el píxel que se está calculando. El vecindario puede extenderse fuera de esta región.</p>
  </section>
}
