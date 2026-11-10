import { useRef, useState } from 'react'
import { ImagePlus, RefreshCw, Trash2, Upload } from 'lucide-react'

export default function ImageUploader({ source, onLoad, onExample, onRemove, loading }) {
  const input = useRef(null)
  const [dragging, setDragging] = useState(false)
  function handleFiles(files) { if (files?.[0]) onLoad(files[0]) }
  return <section className={`upload-bar ${dragging ? 'dragging' : ''} ${!source ? 'empty-upload' : ''}`} aria-label="Cargar imagen" onDragOver={event => { event.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={event => { event.preventDefault(); setDragging(false); handleFiles(event.dataTransfer.files) }}>
    <div className="upload-icon"><ImagePlus size={21} /></div>
    <div className="upload-info"><strong>{loading ? 'Abriendo imagen…' : source ? source.name : 'Carga una imagen'}</strong><span>{source ? `${source.image.width} × ${source.image.height} px · RGBA${source.originalWidth !== source.image.width || source.originalHeight !== source.image.height ? ` · Reducida desde ${source.originalWidth} × ${source.originalHeight}` : ''}` : 'Arrastra una imagen o selecciónala desde tu equipo'}</span></div>
    <input ref={input} type="file" accept="image/png,image/jpeg" className="sr-only" aria-label="Seleccionar imagen PNG o JPEG" onChange={event => { handleFiles(event.target.files); event.target.value = '' }} />
    <span className="upload-formats">PNG, JPG · máx. 25 MB</span>
    <button className="button secondary small" onClick={() => input.current.click()} disabled={loading}><Upload size={15} /> Subir imagen</button>
    <button className="icon-button" title="Cargar imagen de ejemplo" aria-label="Cargar imagen de ejemplo" onClick={onExample}><RefreshCw size={16} /></button>
    {source && <button className="icon-button" title="Eliminar imagen" aria-label="Eliminar imagen" onClick={onRemove}><Trash2 size={16} /></button>}
  </section>
}
