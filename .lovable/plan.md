

# Rediseno del Hero de la Landing Page - Collage de Imagenes Estilo UNESUM

## Objetivo
Reemplazar el hero actual (dos screenshots del dashboard) con un collage dinamico de imagenes circulares y redondeadas distribuidas alrededor del texto central, inspirado en el diseno de la pagina oficial de UNESUM. Las imagenes seran tematicas de tecnologia, investigacion e inteligencia artificial, obtenidas de URLs publicas (Unsplash).

## Cambios Principales

### 1. Nuevo componente: ImageCollageHero
- Crear `src/components/landing/ImageCollageHero.tsx`
- Collage de 8-10 imagenes posicionadas con CSS absolute en formas circulares y redondeadas (rounded-full, rounded-3xl)
- Cada imagen tendra una animacion de entrada escalonada con framer-motion
- Las imagenes rotaran/se deslizaran automaticamente con un intervalo, cambiando entre sets de imagenes
- Imagenes de tecnologia desde Unsplash (URLs publicas): IA, circuitos, laboratorios, programacion, robots, datos

### 2. Diseno del collage
- Texto central: "Jipijapa - Manabi" subtitulo + titulo principal "GISICF Investigacion Inteligente" en estilo serif/italico
- Imagenes distribuidas alrededor del texto en posiciones fijas (top-left, top-right, bottom-left, etc.)
- Mezcla de formas: circulos grandes, circulos pequenos, rectangulos redondeados
- Efecto de parallax sutil al hacer scroll
- Transicion suave entre sets de imagenes cada 5 segundos

### 3. Modificacion de Landing.tsx
- Reemplazar el hero section actual (grid de 2 columnas con screenshots) por el nuevo ImageCollageHero centrado
- Mantener el texto del hero pero reorganizarlo al centro del collage
- Conservar el boton "Comenzar Ahora" y el badge "Hecho en Ecuador"
- Mantener todas las demas secciones sin cambios (research lines, about, FAQ, footer)

## Detalles Tecnicos

### Imagenes (URLs de Unsplash, sin necesidad de API key)
Se usaran ~10 imagenes de alta calidad relacionadas con:
- Inteligencia artificial y redes neuronales
- Laboratorios y microscopios
- Codigo y programacion
- Circuitos electronicos
- Trabajo colaborativo en tecnologia
- Datos y visualizaciones

### Animaciones (framer-motion)
- Entrada escalonada de cada imagen con scale + opacity
- Transicion de slide entre grupos de imagenes cada 5 segundos usando AnimatePresence
- Efecto hover con scale sutil en cada imagen
- Las imagenes flotaran ligeramente con una animacion CSS continua (float effect)

### Layout del collage
```text
  [circle]    [rounded-lg]         [circle]    [rounded-lg]
        \          |                  /           |
         \         |                 /            |
          --- TEXTO CENTRAL ---
         /         |                 \            |
        /          |                  \           |
  [rounded-lg]  [circle]         [rounded-lg]  [circle]
```

### Archivos a crear/modificar
1. **Crear** `src/components/landing/ImageCollageHero.tsx` - Componente del collage con imagenes deslizantes
2. **Modificar** `src/pages/Landing.tsx` - Reemplazar hero section con el nuevo componente
3. **Modificar** `src/index.css` - Agregar keyframes para animacion de flotacion (float)

