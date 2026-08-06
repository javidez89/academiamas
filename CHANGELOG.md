# Changelog

## [v0.4.0] - 2026-08-06

### Added

- Gobierno de ramas, releases, Conventional Commits, SemVer, calidad continua y rollback.
- Quality Gate para sintaxis, versión, persistencia, catálogo, SEO y flujos E2E.
- Smoke posterior al despliegue contra `academiaqaoficial.com`.
- Versión visible en la parte inferior izquierda del home.

### Validation

- La versión se valida entre `VERSION`, `package.json`, `assets/js/config.js` y este changelog.
- Los cambios no modifican cursos, preguntas, simulacros, progreso, pagos ni contenido académico.

## [v0.3.2] - 2026-07-30

### Changed

- El modal **Invítame un café** consulta la TRM vigente desde Datos Abiertos Colombia para mostrar el valor referencial en COP.
- La conversión conserva fallback local si la consulta pública de TRM no está disponible.
- La home incluye una opción visible hacia certificaciones gratuitas externas de CertiProf.

### Validation

- `node --check assets/js/app.js`.
- Playwright validó home, opción externa CertiProf, TRM dinámica, fallback TRM, Wompi popup único, menú móvil, CTFL simulacro y CT-AI práctica.
- Sin cambios en `courses/` y sin PDFs incluidos en el repositorio.

## [v0.3.1] - 2026-07-30

### Changed

- Ajuste visual UX/UI v3 para la home pública: header compacto, hero oscuro, CTA de continuidad y tarjeta de progreso.
- Catálogo visual con filtros, barras de progreso y tarjetas comparables para CTFL 4.0 y CT-AI 2.0.
- Modal de **Invítame un café** con opciones USD 5/10/15 y continuación al checkout oficial de Wompi.
- Bloqueo anti doble apertura para que **Continuar con Wompi** solicite un solo popup y muestre el valor referencial en COP.

### Validation

- `node --check assets/js/app.js`.
- Playwright validó home desktop/móvil, filtros de rutas, menú móvil, modal Wompi, CTFL en simulacro y CT-AI en práctica.
- Sin cambios en `courses/` y sin PDFs incluidos en el repositorio.

## [v0.3.0] - 2026-07-30

### Added

- Home pública de AcademiaQA organizada por rutas de aprendizaje.
- Filtros de catálogo por área: Testing e ISTQB, IA y automatización, Scrum y agilidad, Gestión de proyectos.
- Metadatos de catálogo para clasificar CTFL 4.0 y CT-AI 2.0 como cursos gratis.
- Botón **Invítame un café** conectado al checkout oficial de Wompi.
- Documentación actualizada para GitHub Pages, seguridad, pagos y verificaciones.

### Changed

- La navegación pública cambia de cursos ISTQB aislados a rutas y cursos gratis.
- El aporte voluntario deja de usar Ko-fi y abre Wompi en popup.
- La documentación aclara que los aportes no desbloquean cursos premium.

### Validation

- `node --check` ejecutado en todos los archivos JavaScript.
- Playwright validó home, rutas, filtros, menú móvil, popup Wompi, CTFL simulacro y CT-AI práctica.
- Sin cambios en `courses/ctfl/course-data.js` ni `courses/ctai/course-data.js`.
- Sin PDFs oficiales incluidos en el repositorio.

### Deployment

- Preparado para despliegue desde `main` mediante GitHub Pages.
