export function makeImage(width, height, sample) {
  const data = new Uint8ClampedArray(width * height * 4)
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const value = sample(x, y)
    const rgba = Array.isArray(value) ? value : [value, value, value, 255]
    data.set(rgba, (y * width + x) * 4)
  }
  return { width, height, data }
}

export const at = (image, x, y, channel = 0) => image.data[(y * image.width + x) * 4 + channel]
