export const BORDER_MODES = ['replicate', 'reflect', 'zero']

export function validateImage(image) {
  if (!image || !Number.isInteger(image.width) || !Number.isInteger(image.height) ||
      image.width < 1 || image.height < 1 || image.data?.length !== image.width * image.height * 4) {
    throw new Error('La imagen debe tener dimensiones válidas y cuatro canales RGBA por píxel.')
  }
}

// Reflexión sin repetir el extremo: … c b | a b c | b a …
export function borderCoordinate(value, length, mode) {
  if (value >= 0 && value < length) return value
  if (mode === 'zero') return -1
  if (mode === 'replicate') return Math.min(length - 1, Math.max(0, value))
  if (length === 1) return 0
  const period = 2 * (length - 1)
  const position = ((value % period) + period) % period
  return position < length ? position : period - position
}

export const luminance = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b
export const toByte = (value) => Math.max(0, Math.min(255, Math.round(value)))

export function displayValue(value, { displayMode = 'clamp', gain = 1, offset = 0 } = {}) {
  if (displayMode === 'signed') return toByte(128 + value * gain)
  if (displayMode === 'absolute') return toByte(Math.abs(value) * gain)
  return toByte(value * gain + offset)
}

export function formatNumber(value, digits = 3) {
  if (!Number.isFinite(value)) return '—'
  return new Intl.NumberFormat('es-CO', { maximumFractionDigits: digits }).format(value === 0 ? 0 : value)
}
