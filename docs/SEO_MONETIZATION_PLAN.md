# SEO y monetización de QAvance

## Estado implementado

- SEO técnico existente conservado: canonical, Open Graph, JSON-LD, páginas estáticas por curso/capítulo y generador SEO.
- `robots.txt` protege rutas privadas (`/admin/`, `/mi-cuenta/`, `/auth/`) y publica los sitemaps.
- `sitemap.xml` mantiene las rutas educativas existentes.
- `sitemap-seo.xml` agrega páginas creadas para intención de búsqueda.
- Landing pages iniciales:
  - `/simulador-istqb-ctfl/`
  - `/preguntas-istqb-ctfl/`
  - `/como-aprobar-istqb-ctfl/`
  - `/simulador-istqb-ctai/`
- GA4 existente: `G-F5VK3VZYR0`.
- `assets/js/seo-analytics.js` permite medir intención de curso, práctica, simulacro, contacto y donación en páginas donde se cargue.

## Embudo recomendado

1. Búsqueda orgánica en Google.
2. Landing educativa alineada con la intención.
3. Curso, práctica o simulacro gratuito.
4. Registro/cuenta cuando aporte valor al usuario.
5. Conversión: donación, patrocinio, vacante, afiliado o producto premium futuro.

## Eventos GA4

- `course_intent`
- `practice_intent`
- `simulator_intent`
- `contact_intent`
- `donation_intent`

Los nombres anteriores permiten construir en GA4 un embudo de adquisición orgánica sin mezclar la visita inicial con una conversión real.

## Monetización por prioridad

### 1. Apoyo de la comunidad

Mantener visible el flujo “Invítame un café” después de entregar valor: finalizar capítulo, práctica o simulacro. Evitar bloquear contenido SEO antes de que el usuario pueda evaluarlo.

### 2. Patrocinios

Crear ofertas para empresas de tecnología, QA, formación y reclutamiento. Las ubicaciones recomendadas son home, páginas de curso y resultados de simulacro. Todo patrocinio debe identificarse claramente como tal.

### 3. Vacantes

Una futura sección de empleos puede monetizar publicaciones destacadas para QA, automatización, Scrum, producto, proyectos, IA y ciberseguridad.

### 4. Afiliados

Solo usar enlaces de afiliado cuando el producto sea pertinente al contenido y declararlos de forma transparente.

### 5. AdSense

No se agrega código de AdSense hasta disponer del publisher ID aprobado. Cuando exista:

- colocar anuncios principalmente en páginas informativas y teoría;
- evitar saturar simulacros y flujos de evaluación;
- crear `ads.txt` con el identificador oficial proporcionado por Google;
- revisar consentimiento, privacidad y políticas antes de activar anuncios personalizados.

## Activaciones externas pendientes

Estas acciones no se resuelven únicamente con cambios en GitHub:

1. Verificar `academiaqaoficial.com` en Google Search Console.
2. Enviar `https://academiaqaoficial.com/sitemap.xml`.
3. Enviar `https://academiaqaoficial.com/sitemap-seo.xml`.
4. Solicitar indexación de las landing pages prioritarias después del despliegue.
5. Configurar como conversiones en GA4 los eventos que se decidan como objetivos de negocio.
6. Solicitar/activar AdSense cuando el sitio y la cuenta sean elegibles; introducir únicamente el publisher ID real.

## Siguiente expansión SEO

Escalar por intención y calidad, no por cantidad. Prioridad sugerida:

- técnicas CTFL concretas (partición de equivalencia, valores límite, tablas de decisión, transición de estados);
- preguntas y simuladores de CT-AI;
- Scrum Master y Product Owner;
- gestión de proyectos;
- ciberseguridad;
- glosario enlazado internamente a cursos y capítulos.

Cada página nueva debe tener una intención distinta, contenido útil, canonical propio, enlaces internos y una CTA educativa coherente.
