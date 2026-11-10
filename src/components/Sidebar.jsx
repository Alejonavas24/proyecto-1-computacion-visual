import { BookOpen, FlaskConical, Grid2X2, ScanLine } from 'lucide-react'

export const NAVIGATION = [
  { id: 'lab', label: 'Laboratorio de filtros', icon: FlaskConical, number: '01' },
  { id: 'editor', label: 'Editor de máscaras', icon: Grid2X2, number: '02' },
  { id: 'math', label: 'Visualizador matemático', icon: ScanLine, number: '03' },
  { id: 'theory', label: 'Conceptos y teoría', icon: BookOpen, number: '04' },
]

export default function Sidebar({ page, onNavigate }) {
  return <aside className="sidebar">
    <button className="brand" onClick={() => onNavigate('lab')} aria-label="Ir al laboratorio">
      <span className="brand-symbol"><Grid2X2 size={25} strokeWidth={1.5} /></span>
      <span>Visual<span className="brand-second">Convolution Lab<span className="brand-dot">.</span></span></span>
    </button>
    <nav aria-label="Navegación principal">
      {NAVIGATION.map(({ id, label, icon: Icon, number }) => <button key={id} onClick={() => onNavigate(id)} className={`nav-item ${page === id ? 'active' : ''}`} aria-current={page === id ? 'page' : undefined}>
        <Icon size={18} /><span>{label}</span><span className="nav-number">{number}</span>
      </button>)}
    </nav>
  </aside>
}
