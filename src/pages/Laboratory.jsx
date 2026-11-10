import { RotateCcw } from 'lucide-react'
import FilterSelector from '../components/FilterSelector.jsx'
import ImageComparison from '../components/ImageComparison.jsx'
import FilterExplanation from '../components/FilterExplanation.jsx'
import ProcessingControls from '../components/ProcessingControls.jsx'

export default function Laboratory({ image, result, busy, filter, config, onSelect, onChange, onNavigate, onCopy, onReset, uploader }) {
  return <><div className="page-heading"><h1>Laboratorio de filtros</h1><button className="button secondary" onClick={onReset} disabled={!image}><RotateCcw size={15} />Restablecer original</button></div>
    {uploader}
    <div className="lab-workspace"><FilterSelector selected={filter.id} onSelect={onSelect} /><div className="lab-main">
      <ImageComparison image={image} result={result} busy={busy} filterName={filter.name} filterId={filter.id} />
      <FilterExplanation filter={filter} config={config} onNavigate={onNavigate} onCopy={onCopy} />
    </div></div>
    <ProcessingControls config={config} onChange={onChange} />
  </>
}
