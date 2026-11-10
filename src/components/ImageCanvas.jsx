import { useEffect, useRef } from 'react'
import { drawImageData } from '../core/imageProcessor.js'

export default function ImageCanvas({ image, label, onPixelClick, selection, className = '' }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!image) return
    drawImageData(ref.current, image)
    if (selection) {
      const c = ref.current.getContext('2d')
      const radius = selection.radius ?? 1
      c.strokeStyle = '#c3f578'; c.lineWidth = Math.max(1, image.width / 240)
      c.strokeRect(selection.x - radius - .5, selection.y - radius - .5, radius * 2 + 1, radius * 2 + 1)
    }
  }, [image, selection])
  return <canvas ref={ref} className={className} role="img" aria-label={label} onClick={onPixelClick ? event => {
    const rect = ref.current.getBoundingClientRect()
    onPixelClick(Math.min(image.width - 1, Math.max(0, Math.floor((event.clientX - rect.left) / rect.width * image.width))), Math.min(image.height - 1, Math.max(0, Math.floor((event.clientY - rect.top) / rect.height * image.height))))
  } : undefined} />
}
