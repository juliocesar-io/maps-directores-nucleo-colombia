# maps-coordinadores-nucleo-colombia

Mapa interactivo de Colombia para consultar coordinadores por departamento, con:

- Busqueda por nombre y departamento
- Resaltado dinamico en mapa
- Popover contextual sobre el departamento seleccionado
- Modo claro/oscuro/sistema
- Enlaces a comunidad SIDESED

## Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS + shadcn/ui
- Leaflet + react-leaflet
- pnpm

## Desarrollo local

```bash
pnpm install
pnpm dev
```

Abrir en [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
pnpm dev
pnpm lint
pnpm build
pnpm start
```

## Publicar en Vercel

Este proyecto esta listo para Vercel (no requiere variables de entorno para correr).

1. Subir el repo a GitHub.
2. Ir a [Vercel](https://vercel.com/new) y conectar el repositorio.
3. Framework detectado: **Next.js**.
4. Build Command: `pnpm build`
5. Install Command: `pnpm install`
6. Output: detectado automaticamente por Next.js.

Cada push a `main` genera un despliegue automatico.

## Datos geograficos

Geometria base de departamentos: [caticoa3/colombia_mapa](https://github.com/caticoa3/colombia_mapa).
