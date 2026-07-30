# Seguridad

## Controles incorporados

- Política CSP sin scripts inline.
- Sin manejadores `onclick`, `onchange` u `oninput` embebidos.
- Renderizado de contenido dinámico con escape HTML.
- Validación estructural de cursos antes del registro.
- Validación atómica de preguntas JSON importadas.
- Límites de tamaño y cantidad para importaciones.
- IDs de preguntas únicos y respuestas verificadas contra las opciones.
- Acceso a `localStorage` protegido con manejo de errores y normalización.
- Aleatorización Fisher–Yates usando `crypto.getRandomValues` cuando está disponible.
- Limpieza correcta de temporizadores al cambiar de curso o vista.
- Descargas con nombres saneados y revocación diferida de URLs temporales.
- `connect-src` limitado a la app y a `https://www.datos.gov.co` para consultar la TRM pública.

## Limitaciones de una aplicación estática

- El banco y las respuestas pueden inspeccionarse en el navegador.
- `localStorage` no es una fuente confiable para permisos o resultados oficiales.
- No existe autenticación ni autorización del lado del servidor.
- Un curso premium no debe entregarse completo al navegador antes de validar la membresía.
- El botón de Wompi solo redirige al checkout oficial; la app no guarda datos de tarjeta.
- La TRM mostrada es informativa; Wompi confirma el valor final en COP antes del pago.
- Un aporte voluntario no desbloquea cursos ni sustituye una confirmación segura de compra.

## Recomendación para una fase premium

Usar un backend que aplique autenticación, permisos por curso, expiración de sesión, validación de pagos por webhook y entrega de preguntas desde una API. Las respuestas correctas deberían evaluarse en el servidor cuando el contenido deba protegerse.
