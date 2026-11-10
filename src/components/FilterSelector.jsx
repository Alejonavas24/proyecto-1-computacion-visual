import { Check, Circle, Focus, Layers, ScanLine, Sparkles, Waves } from 'lucide-react'
import { FILTERS } from '../core/kernels.js'

const icons = { identity: Circle, average: Waves, gaussian: Waves, sharpen: Focus, 'sobel-x': ScanLine, 'sobel-y': ScanLine, sobel: Layers, laplacian: Sparkles, emboss: Layers }

export default function FilterSelector({ selected, onSelect }) {
  return <section className="panel filter-panel">
    <div className="panel-heading"><h2>Máscaras disponibles</h2><span className="count">09</span></div>
    <div className="filter-list" role="group" aria-label="Filtros de convolución">
      {FILTERS.map(filter => {
        const Icon = icons[filter.id]
        return <button key={filter.id} className={`filter-option ${selected === filter.id ? 'selected' : ''}`} aria-pressed={selected === filter.id} onClick={() => onSelect(filter.id)}>
          <span className="filter-icon"><Icon size={18} strokeWidth={1.6} /></span>
          <span><strong>{filter.name}</strong><small>{filter.short}</small></span>
          {selected === filter.id && <Check size={15} className="selected-check" />}
        </button>
      })}
    </div>
  </section>
}
