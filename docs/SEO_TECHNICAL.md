# SEO técnico de AcademiaQA

## Datos estructurados

El sitio genera JSON-LD desde `tools/generate-seo.mjs` sin leer ni modificar los bancos académicos:

- Portada: `EducationalOrganization` y `WebSite`.
- Catálogo y rutas de aprendizaje: `ItemList` con un `Course` por curso.
- Página de curso: `Course` y `BreadcrumbList`.
- Página de simulacro: `LearningResource` y `BreadcrumbList`.

No se usa `FAQPage` porque AcademiaQA no es un sitio gubernamental o de salud elegible para su resultado enriquecido habitual. Tampoco se usa `QAPage`: ese tipo exige una sola pregunta con respuestas aportadas por usuarios. Las flashcards pueden evaluarse en una fase posterior como contenido educativo estructurado cuando cada pregunta y respuesta tenga una URL indexable y esté visible en el HTML inicial.

## Jerarquía semántica

Cada URL indexable mantiene un solo `h1` con el tema principal de la página. La organización recomendada del contenido es:

```html
<h1>Nombre del curso</h1>
<h2>Capítulo del syllabus</h2>
<h3>Teoría, objetivos LO o términos clave</h3>
```

Los encabezados describen secciones; no se usan únicamente para obtener un tamaño visual. Las tarjetas de catálogo usan `h3` bajo el `h2` de la sección de cursos.

## Sitemap y robots

`npm run generate:seo` regenera `sitemap.xml`, `robots.txt`, las páginas públicas, los cursos, los simulacros y una URL por capítulo. El sitemap contiene solo URLs canónicas públicas y no incluye hashes, progreso, sesiones de práctica ni resultados. No se añaden `priority` o `changefreq` porque Google no los usa.

```text
User-agent: *
Allow: /

Sitemap: https://academiaqaoficial.com/sitemap.xml
```

## Rendimiento

- Las imágenes de rutas se sirven con `picture`, AVIF/WebP, `srcset`, tamaños intrínsecos y carga diferida.
- El logotipo visible usa una variante WebP de 660 × 175 con dimensiones estables y fallback PNG.
- Los scripts propios usan `defer`; los datos completos de cada curso se cargan al entrar al curso y Wompi se abre solo después de la acción del usuario.

Las metas operativas son LCP menor o igual a 2.5 s, INP menor a 200 ms y CLS menor a 0.1 en el percentil 75 de datos reales.

## Google Analytics

El generador inserta una sola etiqueta de Google Analytics 4 con el identificador `G-F5VK3VZYR0` en cada URL pública. La CSP permite únicamente los dominios usados por `gtag.js` y sus endpoints de medición. La navegación interna usa History API y queda cubierta por la medición mejorada de páginas de GA4, sin emitir eventos manuales duplicados.

La política de privacidad informa el uso de medición agregada. Después del despliegue se debe verificar el dominio con Tag Assistant y confirmar una visita en el informe En tiempo real de Google Analytics.

## Validación

```powershell
npm run generate:seo
npm run check
node tools/seo-smoke.mjs
$env:ACADEMIAQA_URL='http://127.0.0.1:8080/'; npm run test:e2e
```

Después del despliegue se debe validar el sitemap y una muestra de páginas con Search Console, Rich Results Test y PageSpeed Insights.
