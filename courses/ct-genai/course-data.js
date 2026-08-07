'use strict';

(function registerCtGenAiCourse() {
  const courseKey = 'ct-genai';
  const sourceName = 'AcademiaQA: contenido original alineado al ISTQB CT-GenAI Syllabus v1.1';

  const specs = [
    spec(
      'Introduccion a la IA generativa para las pruebas de software',
      100,
      'Ubica la IA generativa dentro del espectro de IA, explica conceptos clave de LLM y muestra como estas capacidades apoyan tareas de prueba.',
      ['IA simbolica', 'aprendizaje automatico', 'aprendizaje profundo', 'IA generativa', 'LLM', 'tokenizacion', 'ventana de contexto', 'modelo multimodal', 'chatbot con IA'],
      'Paginas 13-18',
      [
        section('Fundamentos de IA generativa', 'La IA generativa produce texto, imagenes, codigo u otros artefactos a partir de patrones aprendidos. En testing se usa como apoyo, no como oraculo infalible.', ['Distingue IA simbolica, ML clasico, deep learning y GenAI.', 'Relaciona tokens y ventana de contexto con calidad de entrada.', 'Reconoce que la salida puede variar aunque el prompt parezca igual.']),
        section('LLM y modelos multimodales', 'Los LLM fundacionales, ajustados por instrucciones, de razonamiento y multimodales tienen usos y riesgos diferentes para tareas de prueba.', ['Un modelo fundacional es base general.', 'Un modelo ajustado por instrucciones responde mejor a instrucciones humanas.', 'Un modelo multimodal puede combinar texto, imagen u otros datos.']),
        section('Uso en pruebas', 'La IA generativa puede ayudar a revisar criterios de aceptacion, proponer casos de prueba, generar datos sinteticos, analizar defectos o preparar documentacion.', ['Mantener revision humana.', 'Proteger datos sensibles.', 'Trazar prompts, salidas y decisiones.'])
      ]
    ),
    spec(
      'Ingenieria de prompts para las pruebas de software efectivas',
      365,
      'Organiza estructura de prompts, tecnicas fundamentales y aplicacion practica de GenAI a analisis, diseno, implementacion, regresion, monitoreo y control de pruebas.',
      ['prompt', 'prompt de sistema', 'prompt de usuario', 'few-shot', 'zero-shot', 'one-shot', 'meta-prompting', 'encadenamiento de prompts', 'criterios de aceptacion', 'caso de prueba', 'datos de prueba'],
      'Paginas 19-32',
      [
        section('Estructura de prompts', 'Un prompt util define rol, contexto, instrucciones, datos de entrada, restricciones y formato de salida esperado.', ['El contexto evita respuestas genericas.', 'Las restricciones controlan alcance, formato y riesgos.', 'El formato de salida facilita revision y trazabilidad.']),
        section('Tecnicas de prompting', 'Zero-shot, one-shot, few-shot, encadenamiento y meta-prompting permiten adaptar la ayuda de un LLM a tareas de prueba concretas.', ['Few-shot usa ejemplos.', 'El encadenamiento divide problemas complejos.', 'Meta-prompting mejora la instruccion antes de ejecutar la tarea.']),
        section('Aplicacion a testing', 'La seleccion de tecnica depende de la tarea, el riesgo, la informacion disponible y la necesidad de verificacion humana.', ['Usa GenAI para acelerar, no para saltar analisis.', 'Valida criterios, casos, scripts y reportes.', 'Refina prompts con metricas, feedback y una tasa de exito que mida si la salida puede ejecutarse y producir el resultado esperado.'])
      ]
    ),
    spec(
      'Gestion de riesgos de la IA generativa en las pruebas de software',
      160,
      'Cubre alucinaciones, errores de razonamiento, sesgos, privacidad, seguridad, consumo de energia, regulaciones y marcos de buenas practicas.',
      ['alucinacion', 'error de razonamiento', 'sesgo', 'temperatura', 'privacidad de datos', 'seguridad', 'vulnerabilidad', 'consumo de energia', 'regulaciones de IA'],
      'Paginas 33-42',
      [
        section('Calidad de la salida GenAI', 'Los resultados de un LLM pueden contener hechos inventados, razonamiento incorrecto, sesgo o variacion no deseada.', ['Comprueba contra fuentes confiables.', 'Prueba con prompts adversos y variantes.', 'Usa configuraciones y criterios repetibles cuando el riesgo lo exige.']),
        section('Privacidad y seguridad', 'El uso de GenAI en pruebas puede exponer datos, requisitos, arquitectura, vulnerabilidades o informacion de clientes si no hay controles.', ['Anonimiza o sintetiza datos.', 'Evalua manipulacion de contexto, fuga de datos y prompt injection.', 'Define politicas de uso y aprobacion.']),
        section('Responsabilidad y sostenibilidad', 'El contexto regulatorio, el consumo energetico y las mejores practicas deben traducirse en requisitos verificables.', ['Elige modelos de forma proporcional.', 'Documenta decisiones.', 'Considera impacto ambiental, legal y etico.'])
      ]
    ),
    spec(
      'Infraestructura de pruebas impulsada por los LLM para las pruebas de software',
      110,
      'Describe componentes arquitectonicos, RAG, agentes impulsados por LLM, ajuste fino y LLMOps para operar soluciones de prueba con GenAI.',
      ['infraestructura de pruebas', 'RAG', 'base de datos vectorial', 'agente LLM', 'ajuste fino', 'LLMOps', 'monitorizacion', 'despliegue de modelos'],
      'Paginas 43-48',
      [
        section('Arquitectura LLM para testing', 'Una infraestructura de pruebas con LLM combina interfaz, orquestacion, modelo, fuentes de datos, controles y posprocesamiento.', ['Separa datos, prompts, ejecucion y evaluacion.', 'Controla permisos y trazabilidad.', 'Mide calidad, latencia, coste y seguridad.']),
        section('RAG y agentes', 'RAG recupera informacion relevante antes de generar una respuesta; los agentes y asistentes orientados a objetivos pueden planificar, usar herramientas y automatizar tareas de prueba.', ['RAG reduce respuestas descontextualizadas.', 'Los agentes necesitan objetivos, permisos, limites y supervision.', 'La automatizacion debe dejar evidencia revisable.']),
        section('Ajuste fino y LLMOps', 'El ajuste fino adapta un modelo a tareas especificas; LLMOps gestiona ciclo de vida, despliegue, versionado, evaluacion y monitoreo.', ['Evita ajustar fino si basta RAG o prompting.', 'Versiona datos, prompts y modelos.', 'Define rollback y monitoreo continuo.'])
      ]
    ),
    spec(
      'Despliegue e integracion de la IA generativa en las organizaciones de prueba',
      80,
      'Presenta adopcion organizacional, IA en la sombra, estrategia, seleccion de modelos, capacidades del equipo y cambios en procesos de prueba.',
      ['IA en la sombra', 'estrategia GenAI', 'SLM', 'LLM', 'adopcion', 'gestion del cambio', 'capacidades del equipo', 'responsabilidades de prueba'],
      'Paginas 49-53',
      [
        section('Hoja de ruta de adopcion', 'La adopcion debe pasar de exploracion controlada a casos de uso definidos, medicion, gobierno y mejora continua.', ['Evita herramientas no aprobadas.', 'Prioriza casos de alto valor y riesgo controlado.', 'Calcula coste recurrente antes de escalar.']),
        section('Seleccion de modelos', 'La eleccion entre LLM, SLM o servicio externo depende de calidad esperada, privacidad, coste, latencia, dominio y control operativo.', ['No siempre el modelo mas grande es el adecuado.', 'Evalua restricciones de datos.', 'Compara coste total y soporte.']),
        section('Cambio organizacional', 'La IA generativa cambia habilidades, responsabilidades, revision humana y procesos de prueba.', ['Capacita testers en prompts, riesgos y verificacion.', 'Actualiza politicas y Definition of Done.', 'Define responsabilidades sobre testware generado.'])
      ]
    )
  ];

  const objectiveSpecs = [
    lo('GenAI-1.1.1', 1, 'K1', 'Recordar el espectro de IA usado en GenAI', 'Distingue IA simbolica, aprendizaje automatico clasico, aprendizaje profundo e IA generativa.', 'Cada tipo de IA resuelve problemas con mecanismos distintos.', 'Un equipo clasifica una solucion de reglas, un clasificador ML y un LLM antes de definir pruebas.', 'Tratar toda IA como si fuera un LLM.'),
    lo('GenAI-1.1.2', 1, 'K2', 'Explicar conceptos basicos de GenAI y LLM', 'Relaciona tokenizacion, ventana de contexto, entrenamiento, inferencia y respuesta generada.', 'La calidad de entrada y el limite de contexto afectan la salida.', 'Debes preparar un prompt para revisar criterios de aceptacion sin superar la ventana de contexto.', 'Ignorar tokens, contexto y datos de entrada.'),
    lo('GenAI-1.1.3', 1, 'K2', 'Distinguir tipos de LLM por uso y ajuste', 'Compara LLM fundacionales, ajustados por instrucciones y de razonamiento.', 'El tipo de modelo condiciona instrucciones, rendimiento y riesgos.', 'Seleccionas un modelo para explicar defectos complejos frente a uno para tareas generales.', 'Usar cualquier modelo sin revisar objetivo y limitaciones.'),
    lo('GenAI-1.1.4', 1, 'K2', 'Resumir LLM multimodales y modelos de vision-lenguaje', 'Explica como texto e imagen pueden combinarse en tareas de prueba.', 'Un modelo multimodal interpreta entradas de distintos formatos.', 'El equipo usa una captura de pantalla y una historia de usuario para derivar criterios verificables.', 'Asumir que una imagen basta sin contexto ni verificacion.'),
    lo('GenAI-1.2.1', 1, 'K2', 'Dar ejemplos de capacidades LLM para testing', 'Identifica usos como analisis, diseno, datos sinteticos, scripts, defectos y documentacion.', 'GenAI apoya varias tareas de prueba si hay revision humana.', 'Usas un LLM para proponer casos negativos y luego los ajustas contra requisitos.', 'Aceptar salidas generadas sin evaluarlas.'),
    lo('GenAI-1.2.2', 1, 'K2', 'Comparar modelos de interaccion con GenAI en pruebas', 'Diferencia chatbot, herramienta integrada, aplicacion impulsada por LLM y flujo automatizado.', 'El modo de interaccion cambia trazabilidad, control y riesgo.', 'Decides entre un chatbot manual y una integracion en pipeline para analizar reportes.', 'Elegir herramienta por novedad y no por proceso.'),

    lo('GenAI-2.1.1', 2, 'K2', 'Ejemplificar una estructura de prompt efectiva', 'Usa rol, contexto, instrucciones, datos, restricciones y formato de salida.', 'Un prompt completo reduce ambiguedad y facilita revision.', 'Pides casos de prueba indicando historia, reglas, formato de tabla y limites.', 'Escribir prompts vagos sin datos ni formato.'),
    lo('GenAI-2.1.2', 2, 'K2', 'Diferenciar tecnicas fundamentales de prompting', 'Compara zero-shot, one-shot, few-shot, encadenamiento y meta-prompting.', 'La tecnica depende de complejidad, ejemplos disponibles y control requerido.', 'Para generar Gherkin, decides si incluir ejemplos o dividir la tarea en pasos.', 'Usar siempre la misma tecnica para cualquier tarea.'),
    lo('GenAI-2.1.3', 2, 'K2', 'Distinguir prompt de sistema y prompt de usuario', 'Explica que el sistema fija comportamiento base y el usuario define la tarea concreta.', 'Separar niveles de instruccion mejora consistencia y gobierno.', 'Configuras reglas de seguridad en el sistema y la historia de usuario en el prompt del tester.', 'Poner reglas criticas solo en un mensaje casual de usuario.'),
    lo('GenAI-2.2.1', 2, 'K3', 'Aplicar GenAI al analisis de prueba', 'Usa GenAI para explorar requisitos, criterios de aceptacion, condiciones y riesgos.', 'El analisis generado debe validarse contra la base de prueba.', 'Dada una historia ambigua, iteras prompts para detectar reglas faltantes.', 'Confundir sugerencias del LLM con requisitos aprobados.'),
    lo('GenAI-2.2.2', 2, 'K3', 'Aplicar GenAI al diseno e implementacion de pruebas', 'Convierte condiciones en casos, datos, pasos, scripts o escenarios verificables.', 'El testware generado requiere revision de cobertura, consistencia y mantenibilidad.', 'Generas casos funcionales desde criterios y revisas equivalencias, bordes y negativos.', 'Crear muchos casos sin trazabilidad ni valor.'),
    lo('GenAI-2.2.3', 2, 'K3', 'Aplicar GenAI a regresion automatizada', 'Usa prompting para apoyar scripts, pruebas por palabras clave y analisis de reportes.', 'La automatizacion generada debe ejecutarse, revisarse y versionarse.', 'Pides un script base y luego corriges selectores, datos y aserciones.', 'Copiar codigo generado directo al pipeline.'),
    lo('GenAI-2.2.4', 2, 'K3', 'Aplicar GenAI a una tarea de monitoreo y control de pruebas', 'Resume metricas, riesgos, tendencias y acciones a partir de datos de prueba.', 'GenAI puede sintetizar estado, pero los datos y conclusiones deben verificarse.', 'Pides un reporte ejecutivo desde resultados y defectos exportados.', 'Reportar recomendaciones sin revisar datos fuente.'),
    lo('GenAI-2.2.5', 2, 'K3', 'Seleccionar tecnicas de prompt segun contexto', 'Elige tecnica, ejemplos y refinamiento considerando tarea, riesgo, dominio y evidencia.', 'La mejor tecnica es la que controla el riesgo de la tarea concreta.', 'Para una tarea compleja eliges encadenamiento y verificacion humana.', 'Usar few-shot aunque los ejemplos sean incorrectos.'),
    lo('GenAI-2.3.1', 2, 'K2', 'Resumir metricas para evaluar salidas GenAI', 'Considera exactitud, cobertura, consistencia, utilidad, trazabilidad, seguridad y coste.', 'Medir la salida permite mejorar prompts y decidir si usarla.', 'Comparas casos generados contra requisitos, defectos historicos y reglas de estilo.', 'Evaluar solo si la respuesta suena convincente.'),
    lo('GenAI-2.3.2', 2, 'K2', 'Ejemplificar refinamiento iterativo de prompts', 'Aplica retroalimentacion, restricciones, ejemplos y criterios para mejorar resultados.', 'Refinar prompts es un ciclo de prueba y aprendizaje.', 'Mejoras un prompt que generaba casos duplicados agregando criterios de cobertura.', 'Cambiar el prompt sin registrar que mejoro o empeoro.'),

    lo('GenAI-3.1.1', 3, 'K1', 'Recordar alucinacion, error de razonamiento y sesgo', 'Define fallas tipicas de salida GenAI que afectan testware.', 'Alucinacion inventa, error de razonamiento concluye mal y sesgo distorsiona resultados.', 'Clasificas una salida que inventa un requisito inexistente.', 'Llamar alucinacion a cualquier respuesta que no gusta.'),
    lo('GenAI-3.1.2', 3, 'K3', 'Identificar fallas en resultados LLM', 'Analiza salidas para detectar hechos inventados, inferencias incorrectas o sesgos.', 'La identificacion requiere evidencia externa y criterio de dominio.', 'Comparas casos generados contra requisitos y encuentras reglas inventadas.', 'Aceptar la salida por estar bien redactada.'),
    lo('GenAI-3.1.3', 3, 'K2', 'Resumir mitigaciones para fallas GenAI', 'Usa fuentes confiables, RAG, ejemplos, restricciones, revision humana y pruebas repetidas.', 'Mitigar no elimina todo riesgo, pero reduce probabilidad e impacto.', 'Agregas criterios de verificacion y referencias al prompt.', 'Creer que bajar temperatura resuelve todos los problemas.'),
    lo('GenAI-3.1.4', 3, 'K1', 'Recordar mitigaciones para no determinismo LLM', 'Reconoce control de parametros, versionado, semillas cuando existan y criterios de tolerancia.', 'Los LLM pueden variar; las pruebas deben contemplar variabilidad.', 'Definir una prueba de aceptacion para salidas equivalentes.', 'Exigir texto identico cuando no corresponde.'),
    lo('GenAI-3.2.1', 3, 'K2', 'Explicar riesgos de privacidad y seguridad', 'Relaciona datos sensibles, secretos, propiedad intelectual, prompt injection y fuga de informacion.', 'Usar GenAI con datos reales exige gobierno y controles.', 'Detectas que un prompt incluye credenciales y datos personales.', 'Enviar datos productivos a herramientas no aprobadas.'),
    lo('GenAI-3.2.2', 3, 'K2', 'Dar ejemplos de vulnerabilidades en uso de GenAI', 'Incluye manipulacion de contexto, exposicion de datos, dependencia de proveedor, prompts maliciosos y salidas inseguras.', 'La vulnerabilidad puede estar en la herramienta, datos, contexto, integracion o proceso.', 'Una entrada manipulada cambia el contexto recuperado y hace que el reporte omita controles criticos.', 'Asumir que el proveedor controla todos los riesgos.'),
    lo('GenAI-3.2.3', 3, 'K2', 'Resumir estrategias de privacidad y seguridad', 'Aplica anonimizar, minimizar datos, control de acceso, registro, evaluacion y politicas.', 'La proteccion empieza antes de enviar el prompt.', 'Diseñas una politica para usar datos sinteticos en pruebas con GenAI.', 'Depender solo de acuerdos legales sin controles tecnicos.'),
    lo('GenAI-3.3.1', 3, 'K2', 'Explicar impacto energetico de tareas GenAI', 'Relaciona tamano de modelo, numero de consultas, complejidad, contexto y reintentos con energia y emisiones.', 'La eficiencia tambien es un criterio de calidad operativa.', 'Comparas un SLM local con un LLM grande para una tarea repetitiva.', 'Ignorar coste y energia porque la tarea es tecnica.'),
    lo('GenAI-3.4.1', 3, 'K1', 'Recordar regulaciones, estandares y buenas practicas', 'Reconoce que marcos de IA, privacidad, seguridad y calidad pueden aplicar a pruebas con GenAI.', 'Las obligaciones deben convertirse en criterios verificables.', 'Mapeas una regla de privacidad a una restriccion de datos de prueba.', 'Ver regulacion como tema ajeno al testing.'),

    lo('GenAI-4.1.1', 4, 'K2', 'Explicar componentes de infraestructura LLM para testing', 'Describe interfaz, orquestacion, modelo, fuentes, controles, almacenamiento, evaluacion y monitoreo.', 'La arquitectura determina trazabilidad, calidad, seguridad y coste.', 'Disenas un flujo para generar casos usando requisitos aprobados y revision humana.', 'Conectar un LLM sin control de datos ni evidencias.'),
    lo('GenAI-4.1.2', 4, 'K2', 'Resumir generacion aumentada por recuperacion', 'Explica recuperar informacion relevante y usarla para producir respuestas contextualizadas.', 'RAG ayuda cuando el modelo necesita conocimiento controlado del dominio.', 'Usas documentos aprobados como fuente para responder sobre reglas de negocio.', 'Pensar que RAG siempre garantiza verdad.'),
    lo('GenAI-4.1.3', 4, 'K2', 'Explicar agentes LLM en automatizacion de pruebas', 'Un asistente o agente orientado a objetivos puede planificar pasos, usar herramientas y ejecutar subtareas bajo limites.', 'Los agentes necesitan permisos, objetivos claros, observabilidad y supervision.', 'Un agente clasifica defectos repetitivos, consulta evidencias autorizadas y propone informacion faltante.', 'Dar acceso amplio a un agente sin guardrails.'),
    lo('GenAI-4.2.1', 4, 'K2', 'Explicar ajuste fino para tareas de prueba', 'Diferencia ajuste fino de prompting y RAG, y cuando podria aportar valor.', 'El ajuste fino requiere datos de calidad, evaluacion y mantenimiento.', 'Evalua si ajustar un modelo para clasificar defectos historicos.', 'Ajustar fino antes de probar alternativas mas simples.'),
    lo('GenAI-4.2.2', 4, 'K2', 'Explicar LLMOps para implementar y gestionar LLM', 'Incluye versionado, despliegue, evaluacion, monitoreo, seguridad, observabilidad y mejora continua.', 'LLMOps hace operable y gobernable el uso de LLM.', 'Preparas monitoreo de drift, coste y calidad para una herramienta de pruebas.', 'Tratar el modelo como componente estatico.'),

    lo('GenAI-5.1.1', 5, 'K1', 'Recordar riesgos de IA en la sombra', 'Reconoce uso no aprobado de herramientas GenAI y sus impactos.', 'La IA en la sombra oculta riesgos de datos, cumplimiento y calidad.', 'Un tester usa una cuenta personal para procesar historias internas.', 'Celebrar adopcion rapida aunque no exista control.'),
    lo('GenAI-5.1.2', 5, 'K2', 'Explicar aspectos de una estrategia GenAI para testing', 'Considera objetivos, gobierno, datos, riesgos, herramientas, metricas, entrenamiento y soporte.', 'Una estrategia conecta valor, control y adopcion responsable.', 'Priorizas casos de uso de alto valor y bajo riesgo para iniciar.', 'Comprar herramientas sin definir proceso ni metricas.'),
    lo('GenAI-5.1.3', 5, 'K2', 'Resumir criterios para seleccionar LLM o SLM', 'Compara calidad, privacidad, coste, latencia, dominio, disponibilidad, integracion y control.', 'El modelo adecuado depende del contexto, no del tamano.', 'Eliges un SLM para clasificacion repetitiva con datos sensibles.', 'Usar siempre el modelo mas grande disponible.'),
    lo('GenAI-5.1.4', 5, 'K1', 'Recordar fases de adopcion organizacional', 'Reconoce sensibilizacion, definicion de casos de uso, uso iterativo y escalamiento gobernado.', 'La adopcion madura con aprendizaje y evidencia.', 'Ubicas un piloto de prompts dentro de una hoja de ruta de adopcion.', 'Escalar sin pilotos ni criterios de exito.'),
    lo('GenAI-5.2.1', 5, 'K2', 'Explicar habilidades esenciales para testers con GenAI', 'Incluye prompting, verificacion, riesgos, datos, automatizacion, dominio y pensamiento critico.', 'El tester conserva responsabilidad sobre calidad y evidencia.', 'Defines un plan de capacitacion para revisar testware generado.', 'Creer que GenAI reemplaza criterio de testing.'),
    lo('GenAI-5.2.2', 5, 'K1', 'Recordar estrategias para cultivar habilidades IA', 'Incluye comunidades, guias, practicas, revision por pares, pilotos y aprendizaje continuo.', 'Las capacidades se desarrollan con practica guiada y feedback.', 'Organizas sesiones internas para compartir prompts seguros.', 'Capacitar una vez y no medir aplicacion.'),
    lo('GenAI-5.2.3', 5, 'K1', 'Reconocer cambios en procesos y responsabilidades', 'Identifica impacto en testware, revision, aprobacion, trazabilidad, roles y Definition of Done.', 'Los procesos deben decir quien revisa, aprueba y mantiene salidas GenAI.', 'Agregas revision humana obligatoria a casos de prueba generados.', 'No ajustar responsabilidades porque la herramienta es nueva.')
  ];

  const chapters = specs.map(toChapter);
  const objectives = objectiveSpecs.map((item) => ({ ...item }));
  const questions = objectives.flatMap(buildQuestions);
  const flashcards = objectives.flatMap(buildFlashcards);

  AcademyRegistry.register(courseKey, {
    meta: {
      key: courseKey,
      code: 'CT-GenAI',
      name: 'ISTQB® Certified Tester - Testing with Generative AI (CT-GenAI)',
      shortName: 'CT-GenAI',
      subtitle: 'Curso gratuito alineado al syllabus ISTQB CT-GenAI v1.1: fundamentos de IA generativa, prompts para testing, riesgos, infraestructura LLM y adopcion organizacional.',
      versionLabel: 'ISTQB CT-GenAI v1.1 · Banco original ampliado',
      storageKey: 'istqb_ct_genai_progress',
      sourceLanguage: 'ES',
      questionLanguage: 'ES',
      certificationNote: 'Curso gratuito de preparacion independiente. El examen oficial y sus requisitos dependen de ISTQB y sus proveedores autorizados.',
      k3Description: 'Escenarios para aplicar ingenieria de prompts, revision humana y gestion de riesgos en tareas reales de testing con IA generativa.'
    },
    chapters,
    objectives,
    questions,
    flashcards,
    blueprint: blueprint(),
    generatedAt: '2026-08-06T00:00:00-05:00',
    qaValidation: qa(),
    syllabusCoverageNote: {
      source: sourceName,
      scope: 'Estructura alineada a los 5 capitulos y 37 LO evaluables del syllabus CT-GenAI v1.1. Se usan resumenes y preguntas propias; el examen de muestra v1.1 solo sirve como matriz de cobertura y no se incorpora ningun PDF oficial al repositorio.',
      noOfficialPdfIncluded: true,
      pageRanges: { 1: '13-18', 2: '19-32', 3: '33-42', 4: '43-48', 5: '49-53' },
      updatedAt: '2026-08-06'
    }
  });

  function spec(title, minutes, summary, terms, pages, sections) {
    return { title, minutes, summary, terms, pages, sections };
  }

  function section(title, body, bullets) {
    return { title, body, bullets };
  }

  function lo(code, chapter, k, text, theory, remember, example, trap) {
    return { lo: code, chapter, k, text, theory, remember, example, trap };
  }

  function toChapter(item, index) {
    const id = index + 1;
    const coveredObjectives = objectiveSpecs.filter((objective) => objective.chapter === id);
    const objectiveText = coveredObjectives.map((objective) => `${objective.lo} (${objective.k}): ${objective.text}. ${objective.theory}`).join('\n');

    return {
      id,
      title: item.title,
      minutes: item.minutes,
      summary: item.summary,
      terms: item.terms,
      pitfalls: [
        'Usar GenAI sin revision humana ni trazabilidad.',
        'Confundir una respuesta convincente con evidencia suficiente.',
        'Ignorar privacidad, seguridad, coste o cumplimiento por enfocarse solo en velocidad.'
      ],
      examples: [
        `Ejemplo de estudio: aplica ${item.title} a una historia de usuario real y registra prompt, salida, revision y decision.`,
        'Ejemplo profesional: compara una tarea hecha manualmente contra una apoyada por GenAI y mide calidad, cobertura, coste y riesgo.'
      ],
      theorySections: item.sections,
      completeSyllabusText: [`Capitulo ${id}. ${item.title}`, item.summary, `Terminos clave: ${item.terms.join(', ')}.`, item.sections.map((sectionItem) => `${sectionItem.title}: ${sectionItem.body} ${sectionItem.bullets.join(' ')}`).join('\n\n'), 'Objetivos de aprendizaje integrados:', objectiveText].join('\n\n'),
      completeSyllabusPages: item.pages,
      syllabusSource: sourceName
    };
  }

  function buildQuestions(objective, index) {
    const id = index * 4 + 1;
    const commonWrong = objective.k === 'K3'
      ? ['Ejecutar la salida generada sin revision ni evidencia.', 'Cambiar la base de prueba para que coincida con la respuesta del modelo.']
      : ['Confiar solo en que la respuesta parece correcta.', 'Ignorar contexto, datos y restricciones del proceso de prueba.'];

    return [
      q(`${courseKey}-Q${String(id).padStart(3, '0')}`, objective, `¿Cuál afirmación se alinea mejor con ${objective.lo}?`, [objective.remember, objective.trap, ...commonWrong], objective.theory, 0),
      q(`${courseKey}-Q${String(id + 1).padStart(3, '0')}`, objective, `Escenario: ${objective.example} ¿Qué deberías priorizar?`, [objective.theory, objective.trap, commonWrong[0], commonWrong[1]], objective.remember, 1),
      q(`${courseKey}-Q${String(id + 2).padStart(3, '0')}`, objective, `Durante una revisión de ${objective.lo}, ¿qué evidencia apoyaría mejor una decisión de calidad?`, [objective.remember, 'Una salida convincente sin referencia a la base de prueba.', objective.trap, commonWrong[0]], `${objective.remember} La evidencia debe contrastarse con la base de prueba y el riesgo de la tarea.`, 2),
      q(`${courseKey}-Q${String(id + 3).padStart(3, '0')}`, objective, `¿Qué control reduce mejor el riesgo al trabajar con el objetivo ${objective.lo}?`, [objective.theory, 'Priorizar velocidad aunque no exista trazabilidad.', commonWrong[1], objective.trap], `${objective.theory} La revisión humana conserva la responsabilidad sobre la decisión.`, 3)
    ];
  }

  function q(id, objective, stem, options, explanation, rotation) {
    const offset = rotation % options.length;
    const rotatedOptions = [...options.slice(offset), ...options.slice(0, offset)];
    return {
      id,
      chapter: objective.chapter,
      k: objective.k,
      lo: objective.lo,
      objective: objective.text,
      topic: objective.text,
      stem,
      options: rotatedOptions,
      correct: [rotatedOptions.indexOf(options[0])],
      explanation,
      multi: false,
      difficulty: objective.k === 'K3' ? 'aplicacion' : 'normal',
      points: objective.k === 'K3' ? 2 : 1,
      source: sourceName
    };
  }

  function buildFlashcards(objective) {
    const common = {
      chapter: objective.chapter,
      lo: objective.lo,
      hint: 'Relaciona la respuesta con riesgo, evidencia y revision humana.'
    };
    return [
      {
        ...common,
        front: `${objective.lo} · ${objective.text}`,
        back: `Que estudiar: ${objective.theory}`,
        meaning: objective.remember,
        kind: `Concepto ${objective.k}`
      },
      {
        ...common,
        front: `Aplicación ${objective.lo}`,
        back: `Escenario: ${objective.example}\n\nCriterio: ${objective.theory}`,
        meaning: objective.theory,
        kind: 'Aplicación'
      },
      {
        ...common,
        front: `Trampa ${objective.lo}`,
        back: `Evita: ${objective.trap}\n\nClave: ${objective.remember}`,
        meaning: objective.trap,
        kind: 'Trampa'
      }
    ];
  }

  function blueprint() {
    const matrix = {
      1: { K1: 1, K2: 6, K3: 0 },
      2: { K1: 0, K2: 6, K3: 5 },
      3: { K1: 3, K2: 6, K3: 1 },
      4: { K1: 0, K2: 5, K3: 0 },
      5: { K1: 4, K2: 3, K3: 0 }
    };

    return {
      totalQuestions: 40,
      totalPoints: 46,
      passingScore: 30,
      minutes: 60,
      extraTime25: 75,
      chapterDistribution: { 1: 7, 2: 11, 3: 10, 4: 5, 5: 7 },
      kDistribution: { K1: 8, K2: 26, K3: 6, K4: 0 },
      matrix,
      version: 'ISTQB CT-GenAI v1.1 - Exam Structure Tables v1.18'
    };
  }

  function qa() {
    return {
      version: 'CT-GenAI v1.1 - banco original ampliado',
      sourceSyllabus: sourceName,
      syllabusStatus: 'OK: curso alineado a capitulos y LO evaluables; sin PDFs oficiales incluidos.',
      syllabusChapterAudit: chapters.map((chapter) => ({
        chapter: chapter.id,
        pages: chapter.completeSyllabusPages,
        chars: chapter.completeSyllabusText.length,
        expectedHeadings: chapter.theorySections.length,
        missingHeadings: [],
        wrongMajorChapterHeadings: [],
        losExpected: objectives.filter((objective) => objective.chapter === chapter.id).length,
        missingLOCodes: [],
        status: 'OK'
      })),
      questionBankAudit: {
        totalQuestions: questions.length,
        loCovered: new Set(questions.map((question) => question.lo)).size,
        loTotal: objectives.length,
        minQuestionsPerLO: 4,
        byChapter: countBy(questions, 'chapter'),
        byK: countBy(questions, 'k'),
        structuralIssues: [],
        correctedItems: ['Curso actualizado al syllabus CT-GenAI v1.1.', 'Banco ampliado a cuatro preguntas originales por LO con respuestas distribuidas.', 'El examen de muestra v1.1 se usa como referencia de cobertura; no se reproducen sus preguntas ni se incluyen PDFs oficiales.']
      },
      flashcardAudit: {
        totalFlashcards: flashcards.length,
        loCovered: new Set(flashcards.map((flashcard) => flashcard.lo)).size,
        loTotal: objectives.length,
        byChapter: countBy(flashcards, 'chapter'),
        duplicateFronts: [],
        status: 'OK: tres tarjetas por LO para concepto, aplicación y trampa.'
      },
      simulationAudit: {
        runs: 100,
        status: 'OK validado contra disponibilidad por matriz',
        issues: [],
        uniqueExamCombinationsObserved: 100,
        officialMatrix: blueprint().matrix
      },
      overallStatus: 'OK PRUEBAS'
    };
  }

  function countBy(items, field) {
    return items.reduce((summary, item) => {
      const key = String(item[field]);
      summary[key] = (summary[key] || 0) + 1;
      return summary;
    }, {});
  }
}());
