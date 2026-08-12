# Changelog

## [v0.13.0] - 2026-08-11

### Added

- Panel privado de administración para consultar usuarios registrados, matrículas, fechas, tiempo de estudio, simulacros, exámenes finales y avance por capítulo.
- Rol administrativo protegido en Supabase para la cuenta propietaria de AcademiaQA.
- Búsqueda administrativa por nombre o correo y prueba de regresión para acceso autorizado, bloqueo de cuentas normales y vista móvil.

### Security

- Las consultas administrativas se autorizan en PostgreSQL con funciones privadas `security definer`; el frontend no decide los permisos ni contiene credenciales privilegiadas.
- La ruta `/admin/` queda fuera del sitemap y usa `noindex, nofollow`.

### Validation

- Sin cambios en cursos, bancos de preguntas, práctica, simulacros, progreso, pagos o contenido académico.

## [v0.12.0] - 2026-08-11

### Added

- Eliminación permanente de cursos cancelados desde `Mi cuenta`, incluyendo matrícula, progreso, tiempo e intentos.

- InstalaciÃ³n de AcademiaQA como PWA desde Android, Windows, macOS y Linux en navegadores compatibles.
- Manifiesto web con identidad estable, accesos directos e iconos `any` y `maskable`.
- Service worker limitado a recursos estÃ¡ticos del mismo origen y pantalla de contingencia sin conexiÃ³n.
- AcciÃ³n accesible `Instalar app`, visible solo cuando el navegador ofrece la instalaciÃ³n.
- Prueba de regresiÃ³n PWA para manifiesto, iconos, rutas generadas y registro del service worker.

### Changed

- Cada capítulo separa avance y dominio propio, mientras el dominio real del curso integra todos los capítulos y el mejor examen final; el tiempo compara minutos estudiados y sugeridos.
- Las pÃ¡ginas SEO generadas comparten los metadatos y scripts requeridos por la aplicaciÃ³n instalable.

### Security

- La eliminación exige una sesión autenticada, pertenencia del curso al usuario y estado previamente cancelado.

- El service worker no intercepta peticiones externas ni almacena sesiones o respuestas de Supabase y Google.

### Validation

- La prueba cloud cubre el bloqueo para cursos activos, la confirmación destructiva y la limpieza local y remota.

- Sin cambios en cursos, bancos de preguntas, prÃ¡ctica, simulacros, progreso, pagos o contenido acadÃ©mico.

## [v0.11.0] - 2026-08-11

### Added

- Tiempo de estudio activo por curso y por capítulo, sincronizado con Supabase.
- Avance por capítulo y porcentaje por curso visibles en `Mi cuenta`.
- Examen final aleatorio para todos los cursos, separado del simulacro y basado en el banco existente.
- Historial cloud de intentos del examen final con puntos, duración, resultado y aprobación.
- Estado `Completado` al aprobar el examen final, conservado al volver a entrar al curso.
- Acceso al examen final después del último capítulo, habilitado únicamente al alcanzar el 95% de avance.
- Acción de certificado en `Mi cuenta` disponible al completar el 100%, con aviso visual de próxima disponibilidad.

### Changed

- El progreso general del home y de la cuenta usa únicamente cursos inscritos activos o completados.
- El avance de cada capítulo combina tiempo activo frente al recomendado y cobertura de objetivos practicados.
- Los cursos cancelados conservan métricas, pero dejan de participar en el progreso general.
- El cierre de sesión vuelve al inicio y confirma al usuario que la sesión se cerró correctamente.

### Security

- Los intentos finales tienen RLS de lectura por propietario y escritura mediante RPC autenticada.
- La aprobación se valida por puntos en PostgreSQL antes de marcar el curso como completado.

### Validation

- Sin cambios en `courses/**`, bancos de preguntas, contenido académico, pagos ni certificados.

## [v0.10.0] - 2026-08-11

### Added

- Acceso obligatorio con Google antes de cargar el contenido interactivo de un curso.
- Matrículas y progreso por usuario sincronizados con Supabase y protegidos mediante RLS.
- Página privada `/mi-cuenta/` con perfil, cursos, fecha de inicio, horas estimadas, actividad y simulacros.
- Cancelación y reactivación de matrículas conservando el historial para métricas.
- Prueba de regresión cloud para matrícula, progreso, simulacros y cuenta.
- Migraciones reproducibles para `course_enrollments`, `course_progress` y funciones controladas.

### Changed

- El progreso local se fusiona con la copia en la nube al entrar a cada curso.
- Los bancos de preguntas se cargan bajo demanda únicamente después de validar la sesión y la matrícula.
- La política de privacidad explica la sincronización, las métricas y la conservación tras cancelar un curso.

### Security

- RLS restringe perfiles, matrículas y progreso al propietario autenticado.
- Las escrituras de matrícula y métricas usan funciones públicas `SECURITY INVOKER` con implementación privilegiada en esquema privado.
- No se expone ninguna clave `service_role`; el navegador utiliza exclusivamente la clave publicable de Supabase.

### Validation

- Sin cambios en `courses/**/course-data.js`, preguntas, selección aleatoria, pagos ni certificados.
- Quality gates funcionales, SEO, OAuth, catálogo y nube ejecutados en escritorio y móvil.

## [v0.9.0] - 2026-08-11

### Added

- Inicio de sesión opcional con Google mediante Supabase Auth y flujo OAuth PKCE.
- Estado de cuenta, menú accesible de usuario y cierre de sesión local en la cabecera.
- Ruta privada de retorno `/auth/callback/`, excluida de indexación.
- Prueba smoke dedicada a los estados anónimo y autenticado de la interfaz.

### Changed

- Cliente de Supabase fijado en la versión `2.112.3` y servido desde los recursos del sitio.
- Política CSP ampliada únicamente para permitir comunicación con el proyecto AcademiaQA de Supabase.

### Validation

- El progreso continúa almacenado exclusivamente en el navegador en esta fase.
- Sin cambios en cursos, preguntas, simulacros, pagos ni certificados.

## [v0.8.0] - 2026-08-11

### Added

- 58 páginas indexables por capítulo con objetivos LO, términos, ejemplos y enlaces internos.
- Favicon, icono para dispositivos Apple e imagen social de 1200 × 630.
- Trazabilidad pública de versión, fuente de referencia, fecha y responsable de publicación.
- Guía operativa para envío y seguimiento de indexación en Google Search Console.
- Medición global con Google Analytics 4 (`G-F5VK3VZYR0`) para páginas públicas, cursos, capítulos y simulacros.

### Changed

- Logotipo del encabezado optimizado de 542 KB a 16 KB mediante WebP.
- Títulos y descripciones orientados a búsquedas de cursos gratis y simulacros por certificación.
- Primer render conserva el título principal para reducir la demora de LCP.
- Navegación por capítulos con URLs limpias, metadatos dinámicos y compatibilidad con hashes existentes.
- Controles del carrusel, contraste y atributos ARIA ajustados para accesibilidad móvil.
- Medición mejorada compatible con los cambios de historial de la navegación SPA, sin eventos manuales duplicados.

### Validation

- 79 URLs canónicas previstas en sitemap, sin hashes ni referencias a `github.io`.
- Sin cambios en preguntas, bancos, selección aleatoria, progreso, pagos ni PDF oficiales.

## [v0.7.0] - 2026-08-06

### Added

- Motor reutilizable de selección que prioriza preguntas no vistas, menos usadas y vistas hace más tiempo.
- Historial local de preguntas por curso, compatible con el progreso existente y limitado a 5.000 registros.
- Auditoría de realismo sobre bancos reales para matriz, puntos, idioma, diversidad y repetición entre simulacros.
- Guía de metodología, fortalezas, límites y capacidad sin repetición de los simuladores ISTQB.

### Changed

- Prácticas y simulacros equilibran LO y barajan preguntas y opciones en cada intento.
- CTFL y CT-AI reducen patrones de redacción y distractores genéricos; CT-GenAI usa variantes específicas por objetivo.
- Las letras A, B, C y D ahora siguen el orden visual barajado y coinciden con la revisión de resultados.
- El Quality Gate bloquea cambios que degraden el contenido o el realismo de los simuladores.

### Validation

- CTFL: seis simulacros consecutivos, 240 selecciones únicas, 40 preguntas y 40 puntos por intento.
- CT-AI: tres simulacros consecutivos, 120 selecciones únicas, 40 preguntas y 44 puntos por intento.
- CT-GenAI: tres simulacros consecutivos, 120 selecciones únicas, 40 preguntas y 46 puntos por intento.
- Sin cambios visuales, sin PDF oficiales y sin reproducción completa de exámenes de muestra.

## [v0.6.0] - 2026-08-06

### Added

- Auditoría reproducible de las siete carpetas de conocimiento y selección de fuentes canónicas ISTQB.
- Quality gate de contenido para cobertura LO/K, explicaciones, duplicados, distribución de respuestas y capacidad de las matrices.
- 74 preguntas originales adicionales para CT-GenAI y tres preguntas para completar la cobertura mínima de CT-AI.
- Auditoría de flashcards por contenido, capítulo, LO, duplicados y cobertura mínima.

### Changed

- CT-GenAI actualizado de syllabus v1.0 a v1.1 y ampliado de 74 a 148 preguntas.
- CT-AI conserva 40/44 puntos y sustituye 40 traducciones del examen oficial por preguntas originales alineadas a los mismos LO.
- CTFL conserva 400 preguntas y actualiza su trazabilidad a syllabus v4.0.1 y Exam Structure Tables v1.18.
- Flashcards ampliadas a 174 en CTFL, 158 en CT-AI y 111 en CT-GenAI, con tarjetas de aplicación por LO y tarjetas de trampa en CT-GenAI.

### Validation

- Los exámenes oficiales se usan como referencia de cobertura y dificultad; no se publican sus PDF ni se reproducen completos.
- Los tres simuladores ISTQB conservan tiempo, puntuación de aprobación y matriz por capítulo/nivel K.

## [v0.5.0] - 2026-08-06

### Added

- Datos estructurados `EducationalOrganization`, `WebSite`, `ItemList`, `Course`, `LearningResource` y `BreadcrumbList`.
- Documentación técnica para metadatos, jerarquía semántica, sitemap, robots y Core Web Vitals.
- Pruebas SEO para Schema, títulos y descripciones únicas, idioma, H1 y enlaces internos limpios.

### Changed

- Metadatos de portada, catálogo, rutas, cursos y simulacros con descripciones específicas y naturales.
- Navegación inicial con rutas rastreables y compatibilidad conservada con hashes antiguos.
- Sitemap ampliado para incluir la portada y señales de carga estables para imágenes.

### Validation

- 21 URLs canónicas verificadas en el smoke SEO.
- Sin cambios en cursos, preguntas, simulacros, progreso, pagos ni contenido académico.

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
