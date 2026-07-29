# Auditoría de código y refactorización

Archivo revisado: `SIMULADOR_MULTICERTIFICACION_QA_FINAL_RESPONSIVE-1.html`

## Diagnóstico de la versión original

### Riesgo alto: inyección de HTML/JavaScript mediante importación JSON

La importación aceptaba objetos sin validar y luego mostraba campos como `id`, `stem`, `topic`, `lo`, opciones y explicaciones mediante `innerHTML`. Algunos valores también se incorporaban en atributos `onclick`. Un JSON manipulado podía insertar etiquetas, atributos o código ejecutable en el DOM.

### Riesgo alto: arquitectura incompatible con una CSP estricta

El documento contenía un script inline grande y numerosos manejadores `onclick`, `onchange` y `oninput`. Para permitir ese patrón sería necesario habilitar `unsafe-inline`, debilitando la protección frente a XSS.

### Riesgo de producto: no existe backend

El archivo es una aplicación estática. El banco, las respuestas correctas, el progreso y toda la lógica llegan al navegador. Esto es válido para una herramienta gratuita y offline, pero no protege cursos premium, resultados oficiales, cuentas, membresías ni pagos.

### Mantenibilidad

- Datos, estilos, vistas, almacenamiento, lógica de examen y contenido estaban en un único archivo de aproximadamente 1,1 MB.
- Había estado global mutable y funciones expuestas en `window`.
- La navegación dependía de cadenas HTML con eventos inline.
- Existían textos específicos de CT-AI dentro del motor genérico.
- El número `40` estaba fijo en partes del menú.
- El registro de una certificación nueva exigía modificar el bloque central del programa.
- No había validación de esquema para capítulos, objetivos, preguntas ni matrices.

### Robustez

- La mezcla aleatoria usaba `sort(() => Math.random() - 0.5)`, que no garantiza una distribución uniforme.
- Al cambiar de certificación se reemplazaba el estado antes de limpiar el temporizador anterior.
- `localStorage` podía fallar por bloqueo, modo privado o cuota sin una respuesta controlada.
- IDs duplicados podían mezclar respuestas y estadísticas.
- Una pregunta importada con índices incorrectos podía romper el flujo.
- La revocación inmediata de la URL de descarga podía ser inestable en algunos navegadores.

## Cambios aplicados

1. Separación por capas: presentación, motor, seguridad, registro, almacenamiento y contenido.
2. Un archivo independiente por curso.
3. Catálogo central para agregar cursos sin modificar el motor ni el front.
4. Validación completa antes de registrar un curso.
5. Validación atómica y límites para importaciones JSON.
6. Escape HTML de todo contenido dinámico.
7. Eliminación de eventos inline y uso de delegación de eventos.
8. CSP que bloquea scripts inline.
9. Aleatorización Fisher–Yates con `crypto.getRandomValues` cuando está disponible.
10. Limpieza correcta de intervalos y temporizadores pendientes.
11. Normalización y migración compatible del progreso local.
12. Funciones y vistas encapsuladas, sin API global mutable.
13. Menú adaptativo según las funciones reales del curso.
14. Plantilla de ejemplo documentada para cursos futuros.
15. Documentación de límites de seguridad y requisitos de un backend premium.

## Resultado

El diseño visual y las funciones principales se mantienen, mientras que la incorporación de un curso nuevo se limita a crear su archivo de datos y registrarlo en `courses/catalog.js`.
