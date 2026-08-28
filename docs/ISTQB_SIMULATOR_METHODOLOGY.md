# Metodologia de simuladores ISTQB

## Objetivo

Los simuladores de QAvance reproducen la estructura de evaluacion publicada para cada certificacion sin presentarse como examenes oficiales. Las preguntas son originales, estan redactadas en espanol y se alinean con los objetivos de aprendizaje (LO), capitulos y niveles cognitivos K del syllabus correspondiente.

## Fuentes y versiones

| Curso | Referencia de contenido | Estructura del simulacro |
| --- | --- | --- |
| CTFL | Syllabus CTFL v4.0.1 | Exam Structure Tables v1.18, 40 preguntas, 40 puntos, 60 minutos |
| CT-AI | Syllabus CT-AI v2.0 | Exam Structure Tables v1.18, 40 preguntas, 44 puntos, 60 minutos |
| CT-GenAI | Syllabus CT-GenAI v1.1 | Exam Structure Tables v1.18, 40 preguntas, 46 puntos, 60 minutos |

Los examenes de muestra se usan como referencia de formato, cobertura y dificultad. No se incorporan PDF oficiales ni se reproducen examenes completos.

## Seleccion de preguntas

1. Cada simulacro respeta la cantidad exacta por capitulo y nivel K definida en su matriz.
2. Una pregunta no puede aparecer dos veces dentro del mismo intento.
3. El motor prioriza preguntas nunca vistas; despues elige las menos usadas y las vistas hace mas tiempo.
4. Los empates se resuelven aleatoriamente y se equilibra la presencia de LO dentro de cada celda de la matriz.
5. Las preguntas y sus opciones se barajan en cada intento. La posicion correcta no queda asociada a una letra fija.
6. La practica aplica la misma regla anti-repeticion sobre el capitulo, LO, nivel K y cantidad seleccionados.
7. El historial se conserva por curso en el navegador y no altera intentos, estadisticas ni respuestas previas.

## Capacidad sin repeticion

La capacidad se calcula con la celda mas limitada de cada matriz. Con los bancos actuales se garantizan, desde un historial vacio:

| Curso | Simulacros completos consecutivos sin repetir |
| --- | ---: |
| CTFL | 6 |
| CT-AI | 3 |
| CT-GenAI | 3 |

Despues de ese punto el motor reutiliza primero las preguntas menos frecuentes y mas antiguas. Ampliar de forma equilibrada la celda limitante aumenta la capacidad; agregar preguntas solo a capitulos con excedente no la mejora.

## Controles de calidad

La auditoria automatica valida:

- IDs y enunciados unicos.
- Cobertura minima por LO y nivel K.
- Opciones no duplicadas y respuestas validas.
- Explicaciones suficientes y distribucion de posiciones correctas.
- Matriz exacta, puntuacion total y cantidad de preguntas en cada simulacro.
- Ausencia de repeticion durante la capacidad garantizada.
- Enunciados localizados al espanol.
- Diversidad de LO por intento.
- Proporcion minima de preguntas contextualizadas y ausencia de pistas evidentes por longitud de respuesta.

## Fortalezas y limites

Fortalezas actuales:

- Buena trazabilidad estructural con syllabus, LO, niveles K y matrices publicadas.
- Bancos amplios y seleccion adaptativa contra repeticion.
- Preguntas de comprension y aplicacion, no solo memorizacion.
- Explicacion inmediata para apoyar aprendizaje y correccion de errores.

Limites que impiden afirmar equivalencia del 100 % con un examen oficial:

- Las preguntas no han sido calibradas con una muestra amplia de candidatos mediante dificultad, discriminacion e indice de funcionamiento de distractores.
- La redaccion no ha pasado por un comite oficial de elaboracion y revision de items ISTQB.
- El examen oficial puede cambiar versiones, ponderaciones o estilo sin aviso al proyecto.
- Aprobar un simulacro predice preparacion, pero no garantiza aprobar ni permite emitir una certificacion ISTQB.

La siguiente mejora de mayor valor es un piloto anonimo con estadisticas por pregunta y revision experta de los items con baja discriminacion, sin almacenar datos personales.
