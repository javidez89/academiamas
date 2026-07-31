# AcademiaQA · Arquitectura modular segura y escalable

Esta versión conserva el diseño y las funciones principales del simulador, pero separa el motor, la seguridad, el almacenamiento, el estilo y los datos de cada curso.

## Estructura

```text
index.html
assets/
  css/app.css
  js/config.js
  js/app.js
  js/core/security.js
  js/core/registry.js
  js/core/storage.js
courses/
  catalog.js
  ctfl/course-data.js
  ctai/course-data.js
  scrum-master/course-data.js
  scrum-product-owner/course-data.js
  project-management-essentials/course-data.js
  scrum-fundamentals/course-data.js
  cybersecurity-awareness/course-data.js
  _template/course-data.example.js
```

## Cursos disponibles

- CTFL 4.0: curso gratuito de fundamentos ISTQB.
- CT-AI 2.0: curso gratuito de testing e inteligencia artificial.
- Scrum Master: curso gratuito basado en la Scrum Guide 2020.
- Scrum Product Owner Professional Certification: curso gratuito basado en guías Product Owner 2025/2026.
- Project Management Essentials: curso gratuito basado en PM2 y enlace externo al examen abierto de CertiProf.
- Scrum Fundamentals: curso gratuito basado en Scrum Guide 2020 y enlace externo al examen abierto de CertiProf.
- Cybersecurity Awareness: curso gratuito de concientización y enlace externo al examen abierto de CertiProf.

## Ejecutar

### GitHub Pages

Sube toda la carpeta al repositorio y publica la rama desde GitHub Pages. `index.html` debe permanecer en la raíz.

### Prueba local recomendada

Desde la carpeta ejecuta:

```bash
python -m http.server 8080
```

Luego abre `http://localhost:8080`.

También puede abrirse directamente como archivo local en navegadores que permitan cargar scripts relativos, pero el servidor local reproduce mejor el comportamiento del hosting.

## Agregar un curso nuevo

1. Copia `courses/_template/` como `courses/nuevo-curso/`.
2. Renombra `course-data.example.js` a `course-data.js`.
3. Cambia la clave de registro y completa `meta`, `chapters`, `objectives`, `questions`, `flashcards` y `blueprint`.
4. Añade una entrada en `courses/catalog.js` con su clasificación de navegación:

```js
Object.freeze({
  key: 'nuevo-curso',
  src: 'courses/nuevo-curso/course-data.js',
  access: 'free',
  family: 'Scrum',
  areas: Object.freeze(['scrum-agility']),
  tags: Object.freeze(['Scrum', 'Fundamentos'])
})
```

5. Abre la academia. El registro valida capítulos, objetivos, IDs, opciones, respuestas y matriz antes de habilitar el curso.

## Áreas de aprendizaje

- `testing-istqb`: Testing, fundamentos y especialidades ISTQB.
- `ai-automation`: Inteligencia artificial y automatización.
- `scrum-agility`: Scrum, agilidad, Scrum Master y Product Owner.
- `project-management`: Gestión de proyectos, riesgos, enfoques ágiles/híbridos y PMO.
- `cybersecurity`: Ciberseguridad, concientización, controles, incidentes y cumplimiento.

Un curso puede pertenecer a más de un área. Por ejemplo, CT-AI aparece en Testing e ISTQB y también en IA y automatización. La clasificación del catálogo solo controla navegación y presentación; no modifica el contenido académico.

## Pagos y aportes

El botón **Invítame un café** abre el checkout oficial de Wompi:

```text
https://checkout.wompi.co/l/VPOS_52PXST
```

El valor COP mostrado en el modal es referencial y se calcula con la TRM vigente consultada desde Datos Abiertos Colombia. Si esa consulta no está disponible, la app usa un valor local de respaldo y Wompi sigue confirmando el valor final antes del pago.

La app no procesa tarjetas ni confirma compras por sí sola. Los aportes voluntarios son independientes de los cursos; cualquier curso premium futuro requiere backend, autenticación y verificación segura de pago antes de habilitar acceso.

## Contrato mínimo de un curso

- `meta.name`, `meta.code`, `meta.storageKey`
- uno o más `chapters`
- uno o más `objectives`
- preguntas con IDs únicos, capítulo y objetivo existentes
- opciones entre 2 y 10 y respuestas dentro del rango
- `blueprint` con cantidad, puntos, aprobación y tiempo válidos

## Alcance de seguridad

Esta aplicación es estática y no contiene un backend. El progreso se guarda localmente y puede ser modificado por el usuario. No almacenes contraseñas, tokens, datos personales, secretos ni controles de acceso premium dentro de estos archivos.

Para membresías, pagos o cursos privados se necesita un backend con autenticación, autorización, base de datos y entrega controlada del contenido.

## Paquete para publicación

Este paquete incluye `.nojekyll` para que GitHub Pages sirva los archivos estáticos directamente. Consulta `DEPLOY_GITHUB.md` antes de cargarlo al repositorio.
