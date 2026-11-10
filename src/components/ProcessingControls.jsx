import { SlidersHorizontal } from 'lucide-react'

export default function ProcessingControls({ config, onChange }) {
  return <section className="panel controls-panel"><div className="panel-heading"><h2><SlidersHorizontal size={15} /> Parámetros de procesamiento</h2><span className="subtle">Aplicación automática</span></div>
    <div className="control-fields">
      <label>Bordes de la imagen<select value={config.border} onChange={event => onChange({ border: event.target.value })}><option value="replicate">Replicar extremos</option><option value="reflect">Reflejar sin repetir extremos</option><option value="zero">Rellenar con ceros</option></select></label>
      <label>Canales de entrada<select value={config.grayscale ? 'gray' : 'rgb'} onChange={event => onChange({ grayscale: event.target.value === 'gray' })}><option value="rgb">RGB · Color</option><option value="gray">Escala de grises · Luminancia</option></select></label>
      <label>Visualización de salida<select value={config.displayMode} onChange={event => onChange({ displayMode: event.target.value })}><option value="clamp">Recorte a [0, 255]</option><option value="signed">Con signo · 128 + respuesta</option><option value="absolute">Valor absoluto</option></select></label>
      <label>Ganancia de visualización<select value={config.gain} onChange={event => onChange({ gain: Number(event.target.value) })}>{[0.125, 0.25, 0.5, 1, 2].map(value => <option key={value} value={value}>{value}×</option>)}</select></label>
    </div><p className="control-note">El cálculo conserva decimales y valores negativos. La visualización convierte el resultado a 8 bits al final{config.offset ? `; el relieve añade ${config.offset} en modo recorte` : ''}.</p>
  </section>
}
