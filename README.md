# prpyectoMigracion

Proyecto migrado a Astro + React, responsive y listo para desplegar en Vercel.

## Scripts

- `npm install`
- `npm run dev`
- `npm run build`
- `npm run preview`

## Estructura

- `src/pages/` páginas: `/`, `/websecurity`, `/devsecops`, `/devsecops/az-400`
- `src/components/` Header (React) y Az400Content (React)
- `public/` estáticos: imágenes, contenido previo de `WebSecurity`, y `DevSecOps/AZ-400/Theory.txt`

## Despliegue en Vercel

Importa el proyecto en Vercel y deja por defecto:
- Build Command: `npm run build`
- Output Directory: `dist`

(Alternativamente, se incluye `vercel.json` con esa configuración.)

