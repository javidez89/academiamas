# Auditoría de fuentes y bancos ISTQB

Fecha de revisión: 2026-08-06  
Carpeta de conocimiento: Google Drive de QAvance
Alcance de publicación: contenido de estudio y preguntas originales; no se incorporan PDF oficiales al repositorio.

## Inventario de Drive

| Carpeta | Archivos | Decisión de uso |
| --- | ---: | --- |
| CTFL 4.0 | 41 | Usar syllabus 4.0.1 EN, traducción 4.0 ES, sets oficiales A-D y tabla de estructura como referencias. Los videos y ediciones antiguas no alimentan automáticamente el banco. |
| CT-AI 2.0 | 11 | Usar syllabus v2.0, examen de muestra v2.1 y Exam Structure Tables v1.18. Excluir versiones anteriores y el PDF CT-GenAI archivado por error. |
| CT-GenAI | 12 | Usar syllabus v1.1, release notes v1.1 y examen de muestra v1.1. Mantener v1.0 solo como histórico. |
| Project Management Essentials | 1 | Fuente vigente del curso PM²; queda fuera de esta ampliación ISTQB. |
| Scrum Fundamentals | 1 | Fuente vigente del curso Scrum; queda fuera de esta ampliación ISTQB. |
| Cybersecurity Awareness | 1 | Fuente vigente del curso; queda fuera de esta ampliación ISTQB. |
| PCI | 2 | Material y examen disponibles, pero no existe todavía un curso PCI en el catálogo. Requiere una iniciativa separada. |

## Criterio académico y legal

- Los syllabus definen capítulos, objetivos de aprendizaje, nivel K, terminología y alcance.
- Los exámenes de muestra se usan para comprobar distribución, dificultad, tipos de distractor y cobertura de LO.
- No se reproduce un examen oficial completo ni se publican sus PDF.
- Cada pregunta publicada debe ser original, tener explicación, fuente de alineación y trazabilidad a capítulo, LO y nivel K.
- Las matrices de simulacro conservan número de preguntas, puntos, aprobación y tiempo oficiales.

## Estado de los bancos

| Curso | Antes | Después | Cobertura mínima | Resultado |
| --- | ---: | ---: | ---: | --- |
| CTFL 4.0.1 | 400 | 400 | 6 por LO | Se mantiene el banco; se actualizan fuente, versión y explicaciones breves. |
| CT-AI 2.0 | 130 | 133 | 3 por LO | Se sustituyen 40 traducciones oficiales por preguntas originales y se cubren los tres LO con solo dos ítems. |
| CT-GenAI 1.1 | 74 | 148 | 4 por LO | Se actualiza v1.0 a v1.1, se amplía el banco y se distribuye la posición de respuestas correctas. |

## Estado de las flashcards

| Curso | Antes | Después | Cobertura mínima | Resultado |
| --- | ---: | ---: | ---: | --- |
| CTFL 4.0.1 | 110 | 174 | 1 por LO | Conserva glosario, fórmulas y comparaciones; agrega una tarjeta de aplicación para cada LO. |
| CT-AI 2.0 | 120 | 158 | 2 por LO | Consolida cinco duplicados exactos y agrega una tarjeta de aplicación para cada LO. |
| CT-GenAI 1.1 | 37 | 111 | 3 por LO | Cada LO incluye concepto, aplicación y trampa de examen. |

## Control automático

`node tools/course-content-audit.mjs` falla cuando encuentra IDs o enunciados duplicados, opciones repetidas, índices inválidos, explicaciones insuficientes, LO sin cobertura, una matriz imposible, respuestas concentradas en una sola posición o contenido identificado como traducción del examen oficial. También valida que las flashcards tengan frente y explicación, usen capítulos y LO existentes, no repitan el mismo frente y cumplan la cobertura mínima definida por curso.
