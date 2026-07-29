# Arquitectura

## Capas

1. **Presentación:** `index.html` y `assets/css/app.css`.
2. **Motor genérico:** `assets/js/app.js`.
3. **Seguridad y validación:** `assets/js/core/security.js`.
4. **Registro de cursos:** `assets/js/core/registry.js`.
5. **Persistencia local:** `assets/js/core/storage.js`.
6. **Contenido:** una carpeta independiente por curso.
7. **Catálogo:** `courses/catalog.js` decide qué cursos se cargan.

## Regla principal

El motor no contiene nombres, capítulos, objetivos ni preguntas específicas de una certificación. El front se genera desde el contrato de datos de cada curso.

## Extensión futura

Las vistas pueden ocultarse automáticamente según el contenido: el laboratorio K3 se oculta cuando no existen preguntas K3; flashcards y objetivos se ocultan si el curso no los incluye.

Para funciones exclusivas de un curso, agrega metadatos o banderas en `meta` y evita condicionales por nombre de certificación dentro del motor.
