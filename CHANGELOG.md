# Changelog

## [v0.17.3] - 2026-08-25

### Changed
- El bloque de comunidad del inicio muestra únicamente sus tres métricas, sin texto explicativo adicional.

## [v0.17.2] - 2026-08-25

### Changed
- El inicio conserva las métricas de personas registradas, cursos activos y usuarios en línea.
- Se retira la métrica visible de estudiantes realizando cuestionarios.

## [v0.17.1] - 2026-08-25

### Fixed
- El inicio vuelve a mostrar usuarios autenticados en línea a partir del heartbeat real de sesión.
- La actividad en cuestionarios se conserva como una métrica separada de quienes solo están conectados.

## [v0.17.0] - 2026-08-25

### Added
- Presencia académica verificable en Supabase para prácticas, simulacros y exámenes finales autenticados.
- Métricas públicas agregadas de personas registradas, cursos activos y estudiantes estudiando en tiempo real.

### Changed
- El indicador del inicio se actualiza cada 15 segundos y elimina cualquier dependencia de cifras simuladas.
- Las sesiones académicas usan latidos de 30 segundos y caducan en 90 segundos si el navegador deja de responder.

## [v0.16.2] - 2026-08-25

### Fixed

- La voz local avanza al segmento siguiente sin repetir la última palabra al llegar a comas, puntos o límites de narración.
- La barra de audio se sincroniza con los límites de palabra informados por el navegador y amplía su duración cuando la voz tarda más de lo estimado.

### Added

- El inicio muestra totales agregados y reales de personas registradas y en línea, sin exponer identidades ni datos personales.
- Una función pública limitada de Supabase entrega únicamente las métricas agregadas requeridas por el inicio.

### Validation

- La prueba de audio reproduce el cambio exacto entre segmentos y falla si reaparece una palabra aislada repetida.
- La prueba cloud valida los totales públicos renderizados en el inicio.

## [v0.16.1] - 2026-08-25

### Fixed

- La barra de narración ya no se congela ni sobrescribe la posición mientras el usuario la arrastra.
- La voz del dispositivo ofrece avance estimado y permite avanzar o retroceder por segmentos cuando la narración OpenAI no está disponible.
- El audio de los materiales de estudio ampliados usa los mismos controles de reproducción, velocidad y navegación que capítulos y objetivos.

### Changed

- Cada pregunta queda vinculada obligatoriamente a la clave de su curso y a una referencia documental válida antes de incorporarse al banco.
- Las prácticas, simulacros y exámenes filtran por el curso activo y diversifican preguntas por LO y referencia documental.
- La matriz documental incluye todos los juegos de muestra disponibles para CTFL, CT-AI y CT-GenAI, y conserva fuentes separadas para los demás cursos y futuros cursos.

### Validation

- Nueva prueba móvil del fallback de audio con avance, arrastre, salto hacia adelante y retroceso.
- Nueva auditoría dinámica de fuentes que detecta documentos mal ubicados, referencias cruzadas y mezcla de preguntas entre cursos.

## [v0.16.0] - 2026-08-24

### Added

- Extractos trazables del syllabus para los 144 objetivos de aprendizaje: CTFL conserva la traducción oficial al español y CT-AI y CT-GenAI ofrecen traducción al español basada en sus originales en inglés, sin incluir los PDF oficiales en el repositorio.
- Contenido completo de referencia por capítulo, explicación docente diferenciada y escenarios prácticos aplicados a los ocho cursos.
- Narración natural en español con voz Marin por capítulo, objetivo y contenido de referencia, reproducción consecutiva de textos largos, pausa, repetición, velocidades 0.75x, 1x y 1.25x, y barra de avance para volver a cualquier punto.
- Botón global y accesible para volver al inicio al llegar al final de páginas extensas.

### Changed

- El avance de práctica se calcula con preguntas únicas respondidas y el dominio con el último resultado de cada pregunta; los reintentos ya no inflan las métricas.
- El avance por capítulo combina tiempo activo de estudio y cobertura real de preguntas, y Mi cuenta y Administración consumen la misma evidencia académica.

### Security

- La voz OpenAI se solicita mediante una función segura de Supabase; la clave privada nunca llega al navegador.
- Los audios se validan contra un manifiesto de contenidos, se almacenan en un bucket privado y tienen límite diario de generación por usuario.

### Validation

- Auditoría automatizada de idioma español, códigos LO, caracteres dañados, fuentes, escenarios, manifiesto de audio, progreso por preguntas únicas y diseño de capítulos en escritorio y móvil.
- Las validaciones de narración y diseño descubren automáticamente todos los cursos del catálogo, incluidos los que se incorporen en el futuro.

## [v0.15.0] - 2026-08-17

### Added

- Validación pública de certificados mediante código único, URL compartible y QR.
- Certificados emitidos en Mi cuenta con descarga privada, consulta y opción de compartir en LinkedIn.
- Directorio administrativo de certificados por usuario y curso.
- Flujo de emisión por USD 25, conversión a COP con TRM, pago seguro en Wompi y captura posterior de nombre y documento.

### Security

- La aprobación del pago se confirma del lado servidor con Wompi; la redirección del navegador no autoriza por sí sola la emisión.
- Los PDF se almacenan en un bucket privado y se descargan mediante URLs firmadas de corta duración.
- La validación pública muestra el documento enmascarado y nunca expone el archivo privado.
- La consulta pública se ejecuta en una función de borde aislada; los visitantes ya no pueden invocar funciones privilegiadas de PostgreSQL.
- El certificado se identifica expresamente como constancia interna de finalización y no como certificación oficial de terceros.

### Validation

- Prueba de regresión para validación pública, certificados en Mi cuenta y consulta administrativa en móvil.
- Sin cambios en cursos, bancos de preguntas, práctica, simulacros ni cálculo del progreso académico.

## [v0.14.0] - 2026-08-16

### Added

- Indicadores de usuarios en línea, última actividad, usuarios activos y nuevos durante los últimos 30 días.
- Directorio gerencial en español con filtros, correos visibles, avance real, dominio, tiempo estudiado y detalle por curso y capítulo.
- Registro seguro de actividad de sesión en Supabase con actualización periódica para conservar la última conexión.

### Fixed

- Eliminado el ciclo de revalidación de sesión que podía mostrar erróneamente que una cuenta administradora no tenía permisos.
- Contraste explícito para nombres, correos y métricas del panel en pantallas de escritorio y móviles.

### Security

- La marca de actividad se asigna en PostgreSQL con `auth.uid()` y hora del servidor; el navegador no puede registrar actividad para otro usuario.
- La autorización administrativa continúa validándose exclusivamente en la base de datos.

### Validation

- Sin cambios en cursos, bancos de preguntas, práctica, simulacros, progreso académico, pagos o certificados.

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
