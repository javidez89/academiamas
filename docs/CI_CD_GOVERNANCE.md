# Gobierno de versionamiento, integración y despliegue

## Decisión arquitectónica

AcademiaQA adoptará **Trunk-Based Development con ramas cortas**. Para un sitio estático mantenido por un equipo pequeño, este modelo reduce divergencia, simplifica GitHub Pages y permite entregar varias historias por sprint sin sostener ramas `develop`, `release` y `hotfix` de larga duración.

`main` es la única rama de integración y debe permanecer desplegable. No se permiten pushes directos. Todo cambio entra mediante pull request con controles automáticos y revisión proporcional al riesgo.

```text
Historia del sprint
      |
      v
feat|fix|content|ci/AQA-123-descripcion
      |
      v
Pull request -> Quality Gate -> revisión -> merge squash
                                      |
                                      v
                                    main
                                      |
                                      v
                     GitHub Pages -> Production Smoke
                                      |
                                      v
                             tag vX.Y.Z + release
```

## Estrategia de ramas integrada con Scrum

### Ramas permitidas

| Prefijo | Uso | Vida esperada | Ejemplo |
|---|---|---:|---|
| `feat/` | Historia funcional | 1-2 días | `feat/AQA-142-progreso-global` |
| `fix/` | Defecto del sprint | Menos de 1 día | `fix/AQA-155-menu-movil` |
| `content/` | Material académico | 1-3 días | `content/AQA-160-ctfl-capitulo-2` |
| `seo/` | Indexación y metadatos | 1-2 días | `seo/AQA-171-rutas-limpias` |
| `ci/` | Pipeline e infraestructura | 1-2 días | `ci/AQA-180-quality-gates` |
| `hotfix/` | Incidente productivo crítico | Horas | `hotfix/AQA-999-restaurar-progreso` |

La rama se crea desde el último `main` verde. Debe actualizarse antes del merge y eliminarse después. Un cambio que exceda tres días debe dividirse por feature flags o historias verticales más pequeñas.

### Ceremonias y artefactos Scrum

- **Refinement:** clasifica el riesgo, define criterios de aceptación y determina pruebas requeridas.
- **Sprint Planning:** cada historia técnica incluye tarea de automatización y evidencia de despliegue.
- **Daily Scrum:** se reportan bloqueos del pipeline, no solo avance de código.
- **Review:** se demuestra desde un entorno local/preview y se presenta evidencia del Quality Gate.
- **Retrospective:** analiza fallos escapados, tiempo de recuperación, flaky tests y deuda del pipeline.
- **Definition of Done:** código/contenido revisado, pruebas verdes, documentación y versión coherentes, observabilidad posterior al despliegue y rollback identificado.

### Flujo especial para contenido académico

Los cambios de material usan `content/` y requieren dos perspectivas de revisión:

1. Revisión académica: fidelidad a la fuente autorizada, cobertura de capítulos/LO y lenguaje.
2. Revisión técnica: contrato del curso, IDs únicos, conteos del catálogo, simulacro, compatibilidad y ausencia de PDFs oficiales.

Una corrección editorial aislada puede publicarse como patch. Un curso nuevo o ampliación material de objetivos es minor. Un cambio incompatible del contrato de datos es major.

## Pipeline de calidad continua

### Etapas activas

El archivo `.github/workflows/quality.yml` ejecuta estas capas:

1. **Política de commits:** valida Conventional Commits en todos los commits del PR.
2. **Análisis estático:** ejecuta `node --check` sobre el motor, herramientas y todos los cursos.
3. **Control de versión:** obliga a sincronizar `VERSION`, `package.json`, `assets/js/config.js` y `CHANGELOG.md`.
4. **Unitarias de persistencia:** valida normalización, límites, aislamiento por curso y conservación tras recarga.
5. **Generación determinista:** regenera SEO y falla si los artefactos versionados no coinciden.
6. **Integración de catálogo:** carga cada curso, comprueba conteos y abre su simulacro sin iniciarlo.
7. **SEO smoke:** valida sitemap, robots, canonical, title, descripción, `og:url`, rutas limpias y hashes heredados.
8. **E2E crítico:** recorre home, menú móvil, entrada a curso, práctica y simulacro, y falla ante errores de consola.
9. **Post-deploy:** `.github/workflows/production-smoke.yml` repite smoke SEO y funcional contra el dominio real cuando GitHub Pages informa despliegue exitoso.

### Matriz de bloqueo

| Prueba | Alcance | ¿Bloquea merge? | Motivo |
|---|---|---:|---|
| Sintaxis/estático | Todo JS y datos de curso | Sí | Evita publicar archivos que no cargan |
| Unitarias de storage | Progreso y estadísticas | Sí | Protege datos locales del estudiante |
| Integración catálogo | Todos los cursos | Sí | Detecta contratos, conteos y registro inválidos |
| E2E práctica/simulacro | Flujo crítico | Sí | Protege aprendizaje y evaluación |
| SEO smoke | 20+ rutas indexables | Sí | Evita 404, canonical incorrecto y sitemap roto |
| Accesibilidad crítica | Navegación, nombres y foco | Sí al automatizarse | Evita barreras funcionales |
| Regresión visual | Desktop/móvil | Sí para cambios visuales aprobados | Evita solapamientos y pérdida de controles |
| Rendimiento | Presupuesto acordado | Advertencia inicialmente; luego bloqueo | Permite establecer una línea base real |

No se debe hacer `continue-on-error` en storage, catálogo, E2E, SEO ni seguridad. Una prueba flaky se corrige o se aísla con incidente y vencimiento; nunca se ignora indefinidamente.

### Protección específica del progreso

El progreso actual vive en `localStorage`, separado por `meta.storageKey`. Los gates deben garantizar:

- compatibilidad del esquema o migración explícita;
- conservación de intentos, respuestas por LO y preguntas marcadas;
- aislamiento entre certificaciones;
- límites defensivos y normalización de entradas dañadas;
- ausencia de borrado automático durante releases;
- E2E de recarga y cambio de curso para cambios en `storage.js` o estadísticas.

Cualquier cambio en `assets/js/core/storage.js`, claves `storageKey`, cálculo de avance o estadísticas se clasifica como riesgo alto y requiere revisión manual adicional.

## Conventional Commits

Formato obligatorio:

```text
tipo(alcance): descripción imperativa corta
```

Tipos admitidos:

- `feat`: nueva capacidad visible.
- `fix`: corrección de comportamiento.
- `content`: material académico o catálogo.
- `test`: pruebas sin cambio funcional.
- `seo`: indexación, metadatos o rutas.
- `ci`: pipelines y automatización.
- `docs`: documentación.
- `refactor`, `perf`, `build`, `chore`, `style`, `revert` según Conventional Commits.

Ejemplos:

```text
feat(home): muestra la versión de la plataforma
fix(storage): conserva intentos al migrar el esquema
content(ctfl): corrige objetivo FL-2.1.3
seo(routes): genera canonical para simulacros
ci(quality): bloquea merge cuando falla el smoke funcional
```

Los cambios incompatibles usan `!` y un bloque `BREAKING CHANGE`:

```text
feat(storage)!: migra el progreso al esquema 3

BREAKING CHANGE: las claves anteriores requieren migración durante la carga.
```

## Versionamiento semántico

AcademiaQA usa `MAJOR.MINOR.PATCH`:

- **MAJOR:** contrato incompatible de curso/progreso, eliminación de rutas o migración sin compatibilidad.
- **MINOR:** curso nuevo, módulo nuevo, nueva ruta o capacidad compatible.
- **PATCH:** defectos, correcciones editoriales, SEO, accesibilidad y rendimiento compatibles.

La versión canónica vive en `VERSION` y debe coincidir con `package.json`, `assets/js/config.js` y el encabezado correspondiente de `CHANGELOG.md`. Los tags usan `vX.Y.Z` y se crean únicamente desde `main` después del smoke productivo.

Durante un sprint se pueden integrar varios PR sin crear un tag por cada uno. Al cerrar el incremento aprobado:

1. Actualizar versión y changelog en un PR `chore(release)`.
2. Ejecutar Quality Gate y obtener aprobación.
3. Fusionar en `main` y esperar GitHub Pages.
4. Validar Production Smoke.
5. Crear tag anotado y GitHub Release.

## Configuración requerida en GitHub

En **Settings > Branches > Branch protection rules** para `main`:

- Require a pull request before merging.
- Require at least 1 approval; 2 para cambios académicos o de progreso.
- Dismiss stale approvals when new commits are pushed.
- Require review from Code Owners cuando se incorpore un equipo.
- Require status checks: `Conventional Commits`, `Static and unit gates`, `Browser integration gates`.
- Require branches to be up to date.
- Require conversation resolution.
- Block force pushes and deletions.
- Prefer squash merge para mantener un commit auditable por historia.

GitHub Pages conserva `main` y `/ (root)` como fuente. El pipeline no cambia el `CNAME`; la publicación ocurre solo después de fusionar un PR verde.

## Gestión de riesgos y rollback

Antes de cada merge se registra en el PR:

- SHA verde anterior;
- nivel de riesgo y superficies afectadas;
- versión objetivo;
- evidencia de pruebas;
- decisión de rollback.

Ante fallo productivo:

1. Detener nuevos merges y abrir incidente `hotfix/`.
2. Confirmar si el fallo está en código, contenido, DNS o caché.
3. Ejecutar `git revert <sha-del-merge>`; no reescribir `main`.
4. Conservar `CNAME`, `.nojekyll`, `robots.txt` y configuración DNS salvo que sean la causa demostrada.
5. Fusionar el revert mediante el camino de emergencia con gates críticos verdes.
6. Esperar despliegue de Pages y ejecutar smoke productivo.
7. Reenviar el sitemap únicamente cuando todas las rutas vuelvan a responder correctamente.
8. Documentar causa raíz y prueba preventiva en la retrospectiva.

No se debe usar `robots.txt` para bloquear todo el sitio salvo una emergencia real de indexación aprobada y con tiempo de reversión definido.

## Métricas recomendadas

- Deployment Frequency por sprint.
- Lead Time for Changes desde primer commit hasta producción.
- Change Failure Rate de releases que requieren revert/hotfix.
- Mean Time to Restore desde detección hasta smoke verde.
- Tasa de pruebas flaky y duración del pipeline.
- Defectos escapados por curso y por tipo de flujo.

Estas métricas se revisan en retrospectiva para mejorar el sistema de entrega, no para evaluar personas.
