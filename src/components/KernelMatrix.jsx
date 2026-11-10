import { formatNumber } from '../core/pixelUtils.js'

export default function KernelMatrix({ kernel, editable = false, onChange, highlight, compact = false, label = 'Matriz del kernel' }) {
  return <div className={`kernel-matrix ${compact ? 'compact' : ''} ${editable ? 'editable' : ''}`} role="group" aria-label={label} style={{ '--matrix-size': kernel.length }}>
    {kernel.flatMap((row, y) => row.map((value, x) => {
      const numeric = Number(value)
      const className = `matrix-cell ${numeric < 0 ? 'negative' : numeric > 0 ? 'positive' : 'zero'} ${highlight === y * kernel.length + x ? 'highlight' : ''}`
      return editable ? <input key={`${y}-${x}`} className={className} type="number" step="any" min="-1000000" max="1000000" value={value} onChange={event => onChange(y, x, event.target.value)} aria-label={`Fila ${y + 1}, columna ${x + 1}`} />
        : <span key={`${y}-${x}`} className={className} title={String(value)}>{formatNumber(numeric)}</span>
    }))}
  </div>
}
