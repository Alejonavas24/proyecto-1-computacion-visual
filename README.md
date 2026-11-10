# Visual Convolution Lab

**Laboratorio de Máscaras de Convolución · Proyecto de Computación Visual**

Aplicación educativa para explorar filtros espaciales, diseñar máscaras y demostrar cómo se calcula un píxel. El procesamiento es real y está escrito manualmente en JavaScript: no usa bibliotecas de convolución, servicios externos, Python, WebGL ni WebGPU.

Las imágenes se procesan en el navegador con Canvas, ImageData y un Web Worker. El proyecto no tiene backend ni sube archivos. El servidor de Vite solo sirve los archivos de la aplicación durante el desarrollo.

## Objetivo académico

Relacionar la representación digital de una imagen con la operación matemática que transforma cada píxel. El laboratorio permite formular una hipótesis sobre un kernel, aplicarlo y comprobar sus productos y sumas en una coordenada concreta.

La interfaz está en español, usa un tema oscuro y se adapta a pantallas de escritorio, tabletas y teléfonos. Incluye navegación con teclado, etiquetas accesibles, estados de procesamiento y mensajes de validación.

## Instalación y ejecución

Requisito: **Node.js 24** (verificado con 24.18.0) y npm. `package.json` también admite Node 22 desde 22.12 y Node 26 o superior, conforme a las dependencias instaladas.

Desde la carpeta del proyecto:

```powershell
npm install
npm run dev
```

Abre la dirección que imprime Vite, normalmente `http://localhost:5173`. **Mantén la terminal abierta y el comando ejecutándose mientras uses la aplicación.** `Ctrl+C` detiene el servidor; después de detenerlo, el navegador mostrará un error de conexión hasta que ejecutes `npm run dev` otra vez. Si hay problemas con `localhost`, ejecuta `npm run dev -- --host 127.0.0.1` y abre la dirección que imprime ese comando. No abras `index.html` directamente con `file://`: los módulos y el Web Worker necesitan un servidor HTTP local.

Para reproducir exactamente las versiones del archivo de bloqueo puedes usar `npm ci` en lugar de `npm install`.

```powershell
npm run test          # Ejecuta las pruebas una vez y termina
npm run test:watch    # Pruebas durante el desarrollo
npm run build        # Genera dist/
npm run preview      # Sirve el build generado para revisarlo
```

No se necesitan claves, variables de entorno, cuentas ni conexión a servicios durante el uso. Tras instalar las dependencias, todos los recursos de ejecución son locales, incluidos iconos y la escena de ejemplo. No hay fuentes ni imágenes alojadas en un CDN.

## Funcionalidades

### 1. Laboratorio de filtros

- Nueve filtros implementados con operaciones sobre los píxeles.
- Imagen original y resultado lado a lado; modos de alternancia y deslizador antes/después.
- Zoom de 100 % a 400 %, desplazamiento mediante las barras del visor y restablecimiento de vista.
- Carga por selector o arrastrando un PNG/JPG/JPEG sobre la zona de carga.
- Vista previa, sustitución, eliminación y botón para volver a la escena de ejemplo.
- Restablecimiento del original mediante identidad, RGB y parámetros neutros.
- Descarga del resultado como PNG con su canal alfa.
- Ajustes de bordes, RGB/grises, representación de valores con signo y ganancia de visualización.
- Matriz efectiva, explicación del filtro, suma de coeficientes, copia de matriz y tiempo medido de procesamiento.

Cada filtro parte de la **imagen original cargada**, no del resultado anterior. Los ajustes y la imagen se mantienen al navegar entre secciones. No se guardan de forma permanente al recargar la página.

### 2. Editor de máscaras

- Matrices editables 3×3 y 5×5.
- Coeficientes enteros, negativos, decimales y notación científica mediante entradas numéricas.
- Presets de los filtros individuales, identidad 5×5 y promedio 5×5 con normalización activada.
- Suma de coeficientes y normalización opcional por esa suma.
- Restablecimiento a identidad y copia de la matriz efectiva normalizada.
- Aplicación explícita: editar una celda no dispara una convolución; se procesa al pulsar **Aplicar máscara**.

Las celdas vacías, los valores no finitos y los coeficientes con magnitud mayor que 1 000 000 se rechazan. Se bloquea la normalización si `|suma| < 10⁻¹²`, para evitar divisiones por cero o por un valor numéricamente inestable. La vista previa identifica la última máscara aplicada cuando hay cambios pendientes.

### 3. Visualizador matemático

- Selección de un píxel haciendo clic en la imagen, en la región ampliada o editando X/Y.
- Canales R, G y B; modo de estudio en grises que también activa grises en el procesamiento real.
- Matriz original y matriz girada 180°, intensidades del vecindario, productos, suma y valor final.
- Tabla desplegable con coordenada de muestreo, intensidad, coeficiente y producto de cada término.
- En magnitud Sobel se muestran ambas ramas, Gx/Gy, y su combinación con `Math.hypot`.
- Respuesta matemática sin recorte, valor de salida de 8 bits y alfa preservado.
- Animación por filas sobre una región de 8×8, 16×16 o 24×24 píxeles, limitada al tamaño de la imagen.
- Iniciar/pausar, anterior, siguiente, reiniciar y tres velocidades. Se detiene al llegar al último píxel.

La región ampliada sirve para recorrer la imagen; **no crea nuevos bordes** para el cálculo. Los vecinos se muestrean en la imagen completa. Solo se aplica la política de bordes cuando una coordenada sale de la imagen real.

### 4. Conceptos y teoría

Explicaciones con ejemplos sobre imagen digital, píxel, RGB/RGBA, matrices, kernels, convolución y correlación, filtros espaciales, Sobel, desenfoque, enfoque, normalización, bordes, precisión y aplicaciones. Incluye una guía de los nueve filtros y un ejemplo numérico resuelto.

## Tecnologías

| Tecnología | Uso |
| --- | --- |
| JavaScript ES6+ y JSX | Toda la lógica y componentes; sin TypeScript |
| React | Estado compartido y componentes |
| Vite | Desarrollo, módulos y build estático |
| Canvas 2D e ImageData | Lectura, representación y exportación de píxeles |
| Web Worker de módulo | Convolución y conversión visual fuera del hilo de interfaz |
| Tailwind CSS | Integración con Vite, utilidades y sistema de estilos |
| Lucide React | Iconos locales incluidos en el build |
| Vitest | Pruebas del motor, filtros, inspector y protocolo del worker |

Las versiones resueltas están registradas en `package-lock.json`.

## Arquitectura

```text
src/
  components/
    Sidebar.jsx                Navegación entre las cuatro secciones
    ImageUploader.jsx          Selector, drop y acciones de imagen
    ImageCanvas.jsx            Representación de ImageData y selección
    ImageComparison.jsx        Comparador, zoom y descarga
    FilterSelector.jsx         Catálogo de los nueve filtros
    FilterExplanation.jsx      Kernel, fórmula y copia
    ProcessingControls.jsx     Bordes, canales y visualización
    KernelMatrix.jsx           Matrices de lectura y edición
    PixelInspector.jsx         Vecindario, productos, suma y salida
    ConvolutionAnimation.jsx   Región ampliada y controles
  pages/
    Laboratory.jsx
    KernelEditor.jsx
    MathVisualizer.jsx
    Theory.jsx
  core/
    convolution.js             Validación, giro y acumulador compartido
    kernels.js                 Máscaras y descripciones de filtros
    pixelUtils.js              Bordes, luminancia y conversión a 8 bits
    imageProcessor.js          Pipeline, carga, Canvas y exportación
    exampleImage.js            Escena original generada con Canvas
  workers/
    convolution.worker.js      Procesamiento y caché de flotantes
  hooks/
    useImageProcessor.js       Ciclo de vida, cancelación y mensajes
  styles/
    index.css                  Tailwind y diseño responsive
  App.jsx                      Imagen y parámetros compartidos
  main.jsx
tests/
  convolution.test.js
  kernels.test.js
  imageProcessor.test.js
  worker.test.js
  workerHarness.js             Adaptador de pruebas para worker_threads
  helpers.js
public/
  favicon.svg
```

`App` conserva la imagen original y la configuración aplicada. El hook envía los cálculos al worker, cancela el anterior si cambia la imagen o la operación y descarta respuestas de visualización obsoletas. La animación no modifica la configuración del motor: inspecciona solo un píxel por paso.

## Matemática e implementación

### Fórmula y convención

Para una máscara de tamaño `k = 2r + 1`:

```text
                  r      r
(I * K)(x, y) =   Σ      Σ    K(i, j) · I(x − i, y − j)
                 i=−r   j=−r
```

- `I`: imagen de entrada (un canal).
- `K`: kernel con coordenadas centradas en cero.
- `(x,y)`: posición de salida; X horizontal, Y vertical hacia abajo.
- `(i,j)`: desplazamientos horizontal y vertical del kernel.
- `r`: radio, 1 en 3×3 y 2 en 5×5.

Las matrices del código se almacenan como `kernel[fila][columna]`. `prepareKernel` valida, normaliza cuando se solicita y gira 180° una copia del kernel. `accumulatePixel` recorre el vecindario en orden normal y usa esa copia girada. `convolve` y `inspectConvolution` usan **el mismo acumulador**.

La correlación usaría los coeficientes sin invertir. Para kernels simétricos ambas operaciones coinciden; para kernels direccionales puede cambiar el signo o la dirección. No se intercambian silenciosamente las convenciones.

```javascript
const flipped = effective.map(row => [...row].reverse()).reverse()
// Por cada posición y canal:
// salida = Σ muestra(x + columna − radio, y + fila − radio) * flipped[fila][columna]
```

### Pipeline

1. Decodificar el archivo local y ajustarlo a los límites de resolución.
2. Dibujarlo en Canvas y leer `getImageData`, siempre como RGBA.
3. Muestrear cada vecino con la política de bordes elegida.
4. Multiplicar por el kernel invertido y acumular en números de 64 bits.
5. Guardar las respuestas RGB en `Float64Array`, incluso si son negativas o mayores que 255.
6. En magnitud Sobel, calcular `hypot(Gx, Gy)` por canal **antes de recortar**.
7. Convertir a `Uint8ClampedArray` una sola vez según el modo de visualización.
8. Mantener el alfa del píxel de destino, dibujar la salida y exportarla a PNG si se solicita.

El motor devuelve dimensiones y cuatro canales. No modifica el búfer de entrada ni el kernel recibido. Los RGB se filtran independientemente; en grises se usa `0.2126R + 0.7152G + 0.0722B` sin redondear previamente. Esta fórmula sobre los canales sRGB de 8 bits es una aproximación educativa de luminancia, sin linealización de gamma.

Canvas puede convertir el espacio de color y representar internamente el alfa premultiplicado al decodificar. La identidad conserva los valores de **ImageData cargados**, no necesariamente los bytes comprimidos originales del archivo.

### Bordes configurables

| Modo | Muestra fuera de la imagen |
| --- | --- |
| Replicar (predeterminado) | Extremo válido más cercano |
| Reflejar | Reflexión sin repetir extremos, `…c,b \| a,b,c \| b,a…` |
| Ceros | RGB = 0 |

La reflexión también funciona con imágenes de ancho o alto igual a 1 y con kernels mayores que la imagen. El alfa de salida siempre corresponde al centro original.

### Visualización y valores negativos

Sea `v` la respuesta matemática y `g` la ganancia:

```text
Recorte:       clamp(round(v · g + offset), 0, 255)
Con signo:     clamp(round(128 + v · g), 0, 255)
Absoluto:      clamp(round(abs(v) · g), 0, 255)
```

`offset` es 128 para relieve y 0 para los otros filtros. Se aplica solo en modo recorte. La ganancia es un factor de visualización, **no** una interpolación con el original ni una modificación del kernel. Los modos con signo y absoluto ignoran el offset de relieve.

La representación con signo permite distinguir respuestas positivas y negativas alrededor del gris 128. Como cualquier PNG de 8 bits, puede saturarse; el valor completo sigue disponible en el inspector y en los flotantes del worker. Reducir la ganancia permite ver un rango mayor.

## Filtros implementados

Las siguientes matrices son los kernels **originales**, antes del giro:

| Filtro | Kernel / cálculo | Uso y visualización inicial |
| --- | --- | --- |
| Identidad | `[0,0,0; 0,1,0; 0,0,0]` | Comprobar el original; recorte |
| Promedio | `1/9 · [1,1,1; 1,1,1; 1,1,1]` | Suavizado uniforme; recorte |
| Gaussiano | `1/16 · [1,2,1; 2,4,2; 1,2,1]` | Suavizado con mayor peso central; recorte |
| Enfoque | `[0,−1,0; −1,5,−1; 0,−1,0]` | Realzar detalles; recorte |
| Sobel X | `[1,0,−1; 2,0,−2; 1,0,−1]` | Cambios a lo largo de X, contornos verticales; con signo |
| Sobel Y | `[1,2,1; 0,0,0; −1,−2,−1]` | Cambios a lo largo de Y, contornos horizontales; con signo |
| Magnitud Sobel | `sqrt(Gx² + Gy²)` con ambos kernels | Contornos en todas las direcciones; recorte |
| Laplaciano | `[0,1,0; 1,−4,1; 0,1,0]` | Segunda derivada y discontinuidades; con signo |
| Relieve | `[2,1,0; 1,1,−1; 0,−1,−2]` | Efecto direccional; recorte con offset 128 |

Los signos de Sobel están elegidos para **convolución real**: una rampa que crece hacia la derecha produce Gx positivo; una que crece hacia abajo produce Gy positivo. La magnitud se calcula por canal en RGB o sobre la luminancia cuando se activa grises.

## Ejemplos para explicar en clase

### Promedio

```text
Vecindario:     10 20 30
                40 50 60
                70 80 90

Kernel: nueve valores de 1/9
Salida: (10 + 20 + … + 90) / 9 = 50
```

### Giro del kernel

```text
Imagen:         1 2 3      Kernel original:   1 2 3
                4 5 6                        4 5 6
                7 8 9                        7 8 9

Kernel girado:  9 8 7
                6 5 4
                3 2 1

Convolución central = 1·9 + 2·8 + 3·7 + 4·6 + 5·5 + 6·4 + 7·3 + 8·2 + 9·1 = 165
Correlación central = 1·1 + 2·2 + … + 9·9 = 285
```

### Gradientes y magnitud

Para `I(x,y) = 30x + 40y`, en una posición interior, Sobel produce `Gx = 240`, `Gy = 320` y magnitud `400`. Recortar ambos gradientes antes de combinarlos daría una magnitud incorrecta. Aquí `400` se conserva en flotantes; el PNG muestra `255` con ganancia 1 y `100` con ganancia 0,25.

### Demostración sugerida

1. Abre el laboratorio con el ejemplo local y compara promedio, enfoque y magnitud Sobel.
2. Entra al visualizador, elige Sobel X y el canal rojo. Haz clic en un borde vertical.
3. Muestra el kernel original, su giro, las intensidades y la suma de productos. Prueba el modo con signo.
4. Selecciona la esquina `(0,0)` y cambia entre réplica, reflexión y ceros.
5. Inicia la animación en una región 8×8. Pausa y avanza un paso para revisar un cálculo.
6. Abre el editor, elige promedio 5×5 y modifica un peso. Aplica y comprueba el resultado.
7. Intenta normalizar Sobel: la suma cero produce un mensaje y bloquea la aplicación.
8. Descarga el PNG.

## Rendimiento y recursos

- Límite de archivo: **25 MB**.
- Máximo lado procesado: **1280 px**.
- Máximo total: **1 048 576 píxeles**. Se conserva la proporción sin ampliar imágenes pequeñas; el redondeo puede introducir una diferencia menor de un píxel.
- El archivo se decodifica antes de redimensionarse; imágenes extremadamente grandes aún dependen de los límites de memoria del navegador.
- La convolución tiene coste `O(ancho · alto · k² · 3)`. Se ejecuta en un Web Worker de módulo.
- El worker conserva los flotantes y **no repite la convolución** al cambiar ganancia o visualización: solo convierte la respuesta existente.
- Cambiar imagen, kernel, normalización, canal de entrada o bordes cancela el worker anterior y crea un cálculo nuevo.
- Mover el píxel o animar inspecciona únicamente su vecindario, sin procesar toda la imagen ni cambiar el resultado aplicado.
- Los mensajes transfieren el búfer de salida; la imagen original se copia para mantenerla intacta.
- Los object URLs de carga y descarga se revocan. El worker y los intervalos se limpian al cambiar o desmontar sus dependencias.
- El tiempo mostrado corresponde al procesamiento inicial de la operación, incluido su primer render, y depende del equipo y tamaño de imagen.

## Pruebas y verificación

```powershell
npm run test
npm run build
```

La suite contiene **71 pruebas** y cubre:

- Identidad 3×3/5×5, dimensiones, cuatro canales, alfa y ausencia de mutaciones.
- Promedio en color uniforme y normalización.
- Resultados numéricos conocidos de convolución 3×3 y 5×5.
- Giro real del kernel frente a correlación.
- Tres políticas de borde, esquinas e imágenes 1×1.
- Conservación de decimales y respuestas negativas; RGB y luminancia.
- Orientación y signo de Sobel X/Y y magnitud antes del recorte.
- Coincidencia exacta del inspector con la salida de todos los filtros, todos los píxeles/canales de una imagen pequeña, tres bordes y modo RGB/grises.
- Inspector 5×5 con normalización y conversión final.
- Matrices inválidas, celdas vacías y prevención de división por cero.
- Límite de resolución y ausencia de ampliación.
- Procesamiento y reutilización de flotantes en un worker real de Node mediante un adaptador de la API de mensajes; errores controlados y búfer original preservado.

Verificado en el entorno de desarrollo: instalación, 71 pruebas, build de Vite y respuesta HTTP 200 del servidor local. **No se completó la revisión visual ni la interacción en Chrome**: Computer Use detuvo el acceso al no poder identificar con suficiente confianza la URL del navegador. Las pruebas del worker en Node no sustituyen la validación de Canvas, selector de archivos, descarga, animación y responsive en un navegador real.

Para completar esa revisión manual, usa la demostración sugerida y comprueba además una imagen vertical, un PNG semitransparente, un JPEG, un archivo inválido, el drop, el deslizador, el zoom, la copia y una ventana de 375 px de ancho.

## Posibles mejoras futuras

- Exportar respuestas con signo y alta precisión a un formato numérico, además del PNG.
- Visualizar orientación del gradiente y añadir supresión de no máximos.
- Incorporar kernels mayores y separación de filtros separables.
- Guardar presets personalizados en almacenamiento local e importar/exportar configuraciones.
- Comparar correlación y convolución como dos operaciones explícitas.
- Añadir pruebas automatizadas de interfaz en un navegador y mediciones de accesibilidad.
- Incluir un modo de procesamiento en luz lineal para estudiar gamma y color.

## Documentación de referencia

- [Vite: guía oficial](https://vite.dev/guide/).
- [Tailwind CSS: integración oficial con Vite](https://tailwindcss.com/docs/installation/using-vite).
- [Vitest: guía oficial](https://vitest.dev/guide/).
- [MDN: Web Workers de módulo](https://developer.mozilla.org/en-US/docs/Web/API/Worker/Worker).
