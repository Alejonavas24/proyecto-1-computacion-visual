export const identityKernel = (size = 3) => Array.from({ length: size }, (_, y) => Array.from({ length: size }, (_, x) => Number(y === Math.floor(size / 2) && x === y)))

// Con estos signos, la CONVOLUCIÓN produce Gx > 0 hacia la derecha y Gy > 0 hacia abajo.
export const SOBEL_X = [[1, 0, -1], [2, 0, -2], [1, 0, -1]]
export const SOBEL_Y = [[1, 2, 1], [0, 0, 0], [-1, -2, -1]]

// Operación interna para restablecer el original; no forma parte del catálogo.
export const ORIGINAL_FILTER = { id: 'identity', name: 'Original', kernel: identityKernel(), mode: 'clamp', description: 'Conserva los valores originales de cada píxel.', math: 'Solo el coeficiente central vale 1: I′(x,y) = I(x,y).', application: 'Restablecer la imagen original.' }

export const FILTERS = [
  { id: 'average', name: 'Desenfoque promedio', short: 'Suavizado uniforme', group: 'Suavizado', kernel: Array.from({ length: 3 }, () => [1 / 9, 1 / 9, 1 / 9]), mode: 'clamp', description: 'Reemplaza cada píxel por el promedio de sus nueve vecinos.', math: 'I′(x,y) = (1/9) Σ I(x−i,y−j). La suma del kernel es 1.', application: 'Reducir variaciones pequeñas y ruido; también suaviza los bordes.' },
  { id: 'gaussian', name: 'Desenfoque gaussiano', short: 'Suavizado ponderado', group: 'Suavizado', kernel: [[1 / 16, 2 / 16, 1 / 16], [2 / 16, 4 / 16, 2 / 16], [1 / 16, 2 / 16, 1 / 16]], mode: 'clamp', description: 'Suaviza dando más peso al centro y a los vecinos más cercanos.', math: 'K = (1/16) · [[1,2,1],[2,4,2],[1,2,1]]. Es una aproximación gaussiana separable.', application: 'Preparar una imagen para detectar bordes y atenuar ruido de alta frecuencia.' },
  { id: 'sobel-x', name: 'Sobel X', short: 'Gradiente horizontal', group: 'Bordes', kernel: SOBEL_X, mode: 'signed', description: 'Mide cambios de intensidad a lo largo del eje X; resalta bordes verticales.', math: 'Gx = I * Kx. Una rampa creciente hacia la derecha genera respuesta positiva.', application: 'Localizar contornos verticales y medir la dirección de variación horizontal.' },
  { id: 'sobel-y', name: 'Sobel Y', short: 'Gradiente vertical', group: 'Bordes', kernel: SOBEL_Y, mode: 'signed', description: 'Mide cambios de intensidad a lo largo del eje Y; resalta bordes horizontales.', math: 'Gy = I * Ky. El eje Y de Canvas crece hacia abajo; una rampa descendente genera respuesta positiva.', application: 'Detectar horizontes, líneas horizontales y variaciones verticales.' },
  { id: 'sobel', name: 'Magnitud Sobel', short: 'Todos los contornos', group: 'Bordes', kernel: SOBEL_X, secondaryKernel: SOBEL_Y, mode: 'clamp', description: 'Combina ambos gradientes para revelar contornos en cualquier dirección.', math: 'M(x,y) = √(Gx² + Gy²). Los gradientes conservan su signo antes de calcular la magnitud.', application: 'Extraer bordes para segmentación y análisis de formas.' },
]

export const getFilter = id => id === ORIGINAL_FILTER.id ? ORIGINAL_FILTER : FILTERS.find(filter => filter.id === id)
