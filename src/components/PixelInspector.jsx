import { useMemo, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import KernelMatrix from './KernelMatrix.jsx'
import { inspectProcessedPixel } from '../core/imageProcessor.js'
import { formatNumber } from '../core/pixelUtils.js'

export default function PixelInspector({ image, config, pixel, channel }) {
  const [branch, setBranch] = useState('x')
  const inspection = useMemo(() => inspectProcessedPixel(image, config, pixel.x, pixel.y, channel), [image, config, pixel, channel])
  const active = branch === 'y' && inspection.secondary ? inspection.secondary : inspection.primary
  const { size, terms } = active
  const neighborhood = Array.from({ length: size }, (_, y) => terms.slice(y * size, y * size + size).map(term => term.values[channel]))
  const products = Array.from({ length: size }, (_, y) => terms.slice(y * size, y * size + size).map(term => term.products[channel]))
  const sum = active.values[channel]
  return <section className="panel inspector-panel"><div className="panel-heading"><h2>Cálculo por píxel</h2></div>
    {config.magnitude && <div className="inspector-branches segmented"><button className={branch === 'x' ? 'active' : ''} onClick={() => setBranch('x')}>Gradiente X</button><button className={branch === 'y' ? 'active' : ''} onClick={() => setBranch('y')}>Gradiente Y</button></div>}
    <div className="math-matrices"><div><h3><span>01</span> Vecindario</h3><KernelMatrix kernel={neighborhood} label="Intensidades de los vecinos" /></div><span className="math-operator">⊙</span><div><h3><span>02</span> Kernel girado 180°</h3><KernelMatrix kernel={active.flipped} label="Kernel invertido usado en el cálculo" /></div><span className="math-operator">=</span><div><h3><span>03</span> Productos</h3><KernelMatrix kernel={products} label="Productos de intensidades y coeficientes" /></div></div>
    <div className="sum-detail"><span className="eyebrow">04 · SUMA DE PRODUCTOS</span><p className="mono">{terms.map((term, i) => <span key={i}>{i ? ' + ' : ''}({formatNumber(term.products[channel], 5)})</span>)} <strong>= {formatNumber(sum, 6)}</strong></p></div>
    {inspection.secondary && <div className="magnitude-equation">Gx = {formatNumber(inspection.primary.values[channel], 6)} <span>·</span> Gy = {formatNumber(inspection.secondary.values[channel], 6)}<p>M = √(Gx² + Gy²) = <strong>{formatNumber(inspection.rawValue, 6)}</strong></p></div>}
    <div className="pixel-result"><div><span>Respuesta matemática</span><strong>{formatNumber(inspection.rawValue, 6)}</strong><small>Precisión de 64 bits · sin recorte</small></div><ArrowRight size={23} /><div><span>Píxel de salida</span><strong className="accent">{inspection.finalValue}<small> / 255</small></strong><small>Alfa original: {inspection.primary.alpha}</small></div></div>
    <p className="helper">Salida = {config.displayMode === 'signed' ? `recortar(redondear(128 + respuesta × ${config.gain}))` : config.displayMode === 'absolute' ? `recortar(redondear(|respuesta| × ${config.gain}))` : `recortar(redondear(respuesta × ${config.gain} + ${config.offset}))`}. El recorte final usa [0, 255]. Se muestran hasta 6 decimales; la operación usa toda la precisión.</p>
    <details className="calculation-details"><summary>Ver cada multiplicación y su coordenada de muestreo</summary><div className="terms-table-wrapper"><table><thead><tr><th>Celda</th><th>Píxel muestreado</th><th>Intensidad</th><th>Coeficiente</th><th>Producto</th></tr></thead><tbody>{terms.map((term, i) => <tr key={i}><td>{term.row + 1}, {term.column + 1}</td><td>{term.x < 0 || term.y < 0 ? 'Fuera → cero' : `(${term.x}, ${term.y})`}</td><td>{formatNumber(term.values[channel], 6)}</td><td>{formatNumber(term.weight, 6)}</td><td>{formatNumber(term.products[channel], 6)}</td></tr>)}</tbody></table></div></details>
  </section>
}
