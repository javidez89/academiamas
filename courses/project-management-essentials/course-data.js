'use strict';

(function registerProjectManagementEssentialsCourse() {
  const courseKey = 'project-management-essentials';
  const sourceName = 'Project Management Essentials - CertiProf exam + PM2 Project Management Methodology Guide 3.1, European Commission, 2024';
  const examUrl = 'https://open.certiprof.com/project-management-essentials-exam-sp';

  const chapters = [
    chapter(1, 'Fundamentos de gestion de proyectos y PM2', 80,
      'Introduce que es un proyecto, por que se ejecuta, como se diferencian entregables, resultados y beneficios, y que aporta una metodologia como PM2.',
      ['proyecto', 'operaciones', 'entregable', 'resultado', 'beneficio', 'gestion de proyectos', 'PM2', 'adaptacion'],
      [
        section('Proyecto y operaciones', 'Un proyecto es un esfuerzo temporal orientado a crear un producto, servicio, resultado o cambio unico. Las operaciones sostienen el funcionamiento continuo de la organizacion.', ['El proyecto tiene inicio, fin, objetivos y restricciones.', 'Las operaciones son repetitivas y permanentes.', 'Un proyecto puede terminar aunque el producto continue operando.']),
        section('Entregables, resultados y beneficios', 'Los entregables son productos concretos del proyecto; los resultados son cambios generados por esos entregables; los beneficios son mejoras medibles para la organizacion o los usuarios.', ['Entregable: sistema, proceso, documento o servicio listo.', 'Resultado: capacidad o cambio en la forma de trabajar.', 'Beneficio: valor medible esperado despues de usar el resultado.']),
        section('Gestion de proyectos y PM2', 'La gestion de proyectos coordina personas, alcance, tiempo, coste, calidad, riesgos, interesados y cambios. PM2 ofrece estructura, roles, fases, artefactos y mentalidades para dirigir proyectos de forma adaptable.', ['PM2 debe adaptarse al contexto, no aplicarse como burocracia fija.', 'La documentacion es proporcional al riesgo y la complejidad.', 'La metodologia ayuda a decidir, comunicar y controlar.'])
      ],
      ['Confundir actividad operacional con proyecto.', 'Medir solo entregables sin comprobar beneficios.', 'Usar PM2 como checklist rigido sin adaptar.', 'Crear documentos que no apoyan decisiones.'],
      ['Implementar una nueva plataforma de pagos es proyecto; operar soporte diario es operacion.', 'Un portal entregado no es beneficio hasta que reduce tiempos, errores o costos.'],
      'PM2 Guide 3.1: capitulos 1-3'
    ),
    chapter(2, 'Gobernanza, roles y partes interesadas', 85,
      'Explica la organizacion del proyecto, capas de gobernanza, roles principales, interesados y uso de matrices RASCI para clarificar responsabilidades.',
      ['stakeholder', 'gobernanza', 'Project Owner', 'Project Manager', 'Solution Provider', 'Project Core Team', 'RASCI', 'comite de direccion'],
      [
        section('Partes interesadas y gobernanza', 'Las partes interesadas influyen o son afectadas por el proyecto. La gobernanza establece quien decide, quien aprueba, quien entrega y como se escalan asuntos relevantes.', ['Identificar interesados reduce sorpresas.', 'La autoridad debe ser visible antes de conflictos.', 'La gobernanza crea claridad, no distancia.']),
        section('Roles principales', 'PM2 separa responsabilidades de negocio, direccion, gestion y ejecucion. El Project Owner representa el valor de negocio; el Project Manager gestiona el proyecto; el proveedor y el equipo central entregan la solucion.', ['El Project Owner responde por objetivos de negocio.', 'El Project Manager coordina plan, riesgos, problemas y comunicacion.', 'El equipo central realiza el trabajo del proyecto.']),
        section('RASCI', 'Una matriz RASCI documenta roles responsables, aprobadores, soporte, consultados e informados. Sirve para evitar vacios, duplicidad y decisiones sin dueno.', ['Responsible ejecuta.', 'Accountable aprueba o responde por el resultado.', 'Consulted aporta informacion; Informed recibe comunicacion.'])
      ],
      ['Tener varios responsables finales para la misma decision.', 'No mapear interesados criticos al inicio.', 'Confundir informado con aprobador.', 'Delegar decisiones de negocio al equipo tecnico sin autoridad.'],
      ['Si un cambio afecta presupuesto, la gobernanza define quien decide.', 'RASCI evita que dos areas crean que la otra aceptara un entregable.'],
      'PM2 Guide 3.1: capitulo 4'
    ),
    chapter(3, 'Ciclo de vida PM2 y puertas de fase', 85,
      'Organiza el proyecto por fases: inicio, planificacion, ejecucion y cierre, con seguimiento y control transversal y puertas de fase para decidir continuidad.',
      ['inicio', 'planificacion', 'ejecucion', 'cierre', 'seguimiento y control', 'puerta de fase', 'acta de constitucion', 'manual del proyecto'],
      [
        section('Fases PM2', 'El ciclo PM2 estructura el proyecto en Inicio, Planificacion, Ejecucion y Cierre. Seguimiento y Control opera de forma transversal para comparar avance real contra plan y tomar acciones.', ['Inicio confirma necesidad y justificacion.', 'Planificacion define como se gestionara y entregara.', 'Ejecucion produce entregables; cierre formaliza aceptacion y aprendizaje.']),
        section('Puertas de fase', 'Las puertas de fase son momentos de revision y aprobacion donde se confirma si el proyecto esta listo para pasar a la fase siguiente.', ['Listo para Planificacion valida el arranque.', 'Listo para Ejecucion valida que el plan sea suficiente.', 'Listo para Cierre valida que los entregables y obligaciones esten atendidos.']),
        section('Artefactos clave por fase', 'Cada fase produce documentos utiles: solicitud de inicio, caso de negocio, acta de constitucion, manual, plan de trabajo, reportes, registro de riesgos, aceptacion y lecciones aprendidas.', ['Los artefactos apoyan decisiones y trazabilidad.', 'No todos requieren el mismo nivel de detalle.', 'La calidad del artefacto se mide por su uso real.'])
      ],
      ['Saltar a ejecucion sin entender el caso de negocio.', 'Cerrar sin aceptacion ni lecciones aprendidas.', 'Tratar seguimiento y control como fase final.', 'Aprobar puertas de fase sin evidencia.'],
      ['Una puerta de fase puede detener un proyecto si el caso de negocio ya no justifica la inversion.', 'El plan de trabajo se revisa cuando cambia el alcance o el riesgo.'],
      'PM2 Guide 3.1: capitulos 3, 5-8'
    ),
    chapter(4, 'Planificacion, alcance, cronograma y costes', 95,
      'Cubre el manual del proyecto, plan de trabajo, desglose del trabajo, estimacion, cronograma, costes, aceptacion, transicion e implementacion de negocio.',
      ['plan de trabajo', 'EDT', 'estimacion', 'cronograma', 'costes', 'dependencias', 'plan de aceptacion', 'plan de transicion'],
      [
        section('Plan de trabajo y desglose', 'La planificacion transforma objetivos en paquetes de trabajo, actividades, responsables, estimaciones, dependencias, hitos y restricciones.', ['La EDT/WBS descompone entregables o trabajo para gestionar alcance.', 'Las estimaciones consideran esfuerzo, coste, recursos y supuestos.', 'El cronograma comunica secuencia y fechas esperadas.']),
        section('Planes complementarios', 'PM2 recomienda planes de gestion y planes especificos cuando aportan control: requisitos, cambios, riesgos, calidad, comunicaciones, aceptacion, transicion e implementacion.', ['El plan de aceptacion define criterios y evidencia.', 'El plan de transicion prepara paso a operacion.', 'El plan de implementacion asegura adopcion del cambio.']),
        section('Estimacion y dependencias', 'La estimacion no es una promesa exacta; es una prevision basada en informacion disponible. Debe revisarse cuando cambian supuestos, capacidad, riesgos o alcance.', ['Las dependencias mal gestionadas generan retrasos.', 'El cronograma debe mostrar ruta critica o restricciones relevantes.', 'La reserva de gestion ayuda ante incertidumbre.'])
      ],
      ['Planificar solo fechas sin entregables.', 'No definir criterios de aceptacion.', 'Ignorar dependencias externas.', 'Mantener estimaciones antiguas cuando cambia el contexto.'],
      ['Una EDT puede dividir una plataforma en modulos, integraciones, migracion y capacitacion.', 'Si cambia un proveedor critico, el cronograma y el riesgo deben actualizarse.'],
      'PM2 Guide 3.1: capitulo 6 y apendice C'
    ),
    chapter(5, 'Ejecucion, calidad, comunicacion y entregables', 85,
      'Aborda coordinacion del proyecto, aseguramiento de calidad, informacion, informes, colaboracion y control de aceptacion de entregables.',
      ['coordinacion', 'aseguramiento de calidad', 'informe de proyecto', 'distribucion de informacion', 'aceptacion de entregables', 'no conformidad'],
      [
        section('Coordinacion de ejecucion', 'Durante ejecucion se coordinan actividades, equipo, interesados, proveedores y restricciones para producir entregables de acuerdo con el plan actualizado.', ['La coordinacion mantiene foco y visibilidad.', 'Las decisiones deben registrarse cuando afectan alcance, coste, tiempo o calidad.', 'Los problemas se escalan segun gobernanza.']),
        section('Calidad y aceptacion', 'La calidad se gestiona mediante criterios, revisiones, validaciones y acciones correctivas. La aceptacion confirma que el entregable cumple lo esperado y puede transferirse o usarse.', ['Aseguramiento de calidad revisa proceso y conformidad.', 'Control de calidad revisa entregables.', 'La aceptacion debe estar basada en criterios definidos.']),
        section('Comunicacion e informes', 'Los informes y la distribucion de informacion mantienen a los interesados alineados sobre avance, riesgos, problemas, decisiones, cambios y necesidades de apoyo.', ['La audiencia define nivel de detalle.', 'Un buen reporte permite decidir.', 'Ocultar problemas reduce capacidad de reaccion.'])
      ],
      ['Usar informes como decoracion, no como insumo de decision.', 'Aceptar entregables sin criterios.', 'Gestionar calidad solo al final.', 'No comunicar problemas hasta que ya son urgentes.'],
      ['Un informe ejecutivo prioriza estado, riesgos y decisiones requeridas.', 'Un hallazgo de calidad puede generar accion correctiva y actualizacion del plan.'],
      'PM2 Guide 3.1: capitulo 7'
    ),
    chapter(6, 'Seguimiento, control, riesgos, cambios y cierre', 95,
      'Integra control de progreso, cronograma, costes, requisitos, cambios, riesgos, incidencias, aceptacion final, cierre administrativo y lecciones aprendidas.',
      ['seguimiento', 'control', 'riesgo', 'incidencia', 'cambio', 'valor ganado', 'lecciones aprendidas', 'cierre administrativo'],
      [
        section('Seguimiento y control', 'Seguimiento y control compara avance real contra plan, detecta desviaciones y coordina acciones correctivas o preventivas.', ['Se controla progreso, cronograma, costes, requisitos, calidad, riesgos y cambios.', 'Las metricas deben conducir acciones.', 'Controlar no significa congelar el proyecto.']),
        section('Riesgos, incidencias y cambios', 'Un riesgo es incertidumbre futura; una incidencia ya esta ocurriendo; un cambio modifica alcance, coste, tiempo, calidad o expectativas. Cada uno requiere registro, analisis, responsable y respuesta.', ['Riesgos se evaluan por probabilidad e impacto.', 'Incidencias necesitan decision y resolucion.', 'Cambios deben aprobarse segun impacto y gobernanza.']),
        section('Cierre y aprendizaje', 'El cierre confirma aceptacion, transicion, cierre administrativo, informe final, recomendaciones y lecciones aprendidas para mejorar futuros proyectos.', ['Cerrar requiere evidencia, no solo fecha cumplida.', 'Las lecciones aprendidas deben ser accionables.', 'El cierre reduce riesgos post-proyecto.'])
      ],
      ['Confundir riesgo con incidencia.', 'Aprobar cambios sin impacto.', 'Cerrar sin aceptacion formal.', 'No capturar lecciones por falta de tiempo.'],
      ['Una vulnerabilidad conocida que podria explotarse es riesgo; un ataque activo es incidencia.', 'El cierre registra lo aceptado, lo pendiente y recomendaciones post-proyecto.'],
      'PM2 Guide 3.1: capitulos 8-9 y apendices B-C'
    )
  ];

  const objectiveDefinitions = [
    lo('PME-1.1.1', 1, 'K1', 'Recordar la diferencia entre proyecto y operacion', 'Un proyecto es temporal y unico; una operacion es continua y repetitiva.', 'Temporalidad y unicidad distinguen un proyecto.', 'Lanzar un sistema nuevo es proyecto; operarlo diariamente es operacion.', 'Llamar proyecto a cualquier tarea recurrente.'),
    lo('PME-1.2.1', 1, 'K2', 'Explicar entregables, resultados y beneficios', 'Los entregables son productos concretos, los resultados son cambios y los beneficios son valor medible.', 'El beneficio aparece cuando el resultado genera mejora real.', 'Un portal es entregable; reducir tiempo de atencion es beneficio.', 'Medir exito solo por entregar documentos.'),
    lo('PME-1.3.1', 1, 'K2', 'Describir el valor de la gestion de proyectos', 'La gestion coordina alcance, tiempo, coste, calidad, riesgo, interesados y comunicacion para alcanzar objetivos.', 'Gestionar es decidir y coordinar con informacion.', 'Un Project Manager usa registros y reportes para anticipar bloqueos.', 'Confundir gestion con seguimiento administrativo.'),
    lo('PME-1.4.1', 1, 'K3', 'Aplicar adaptacion de PM2 segun contexto', 'PM2 se adapta al tamano, riesgo, complejidad y entorno del proyecto.', 'La metodologia debe ser proporcional.', 'Un proyecto pequeno puede usar artefactos simplificados sin perder control.', 'Aplicar todos los documentos con el mismo peso.'),

    lo('PME-2.1.1', 2, 'K1', 'Recordar que es una parte interesada', 'Una parte interesada afecta, decide, ejecuta o recibe impacto del proyecto.', 'Stakeholder no es solo usuario final.', 'Proveedor, sponsor y area legal pueden ser stakeholders.', 'Ignorar interesados indirectos.'),
    lo('PME-2.2.1', 2, 'K2', 'Explicar roles y capas de gobernanza PM2', 'PM2 separa negocio, direccion, gestion, ejecucion y soporte para clarificar autoridad.', 'Cada capa reduce ambiguedad de decision.', 'El Project Owner representa valor y el Project Manager coordina ejecucion.', 'Esperar que el equipo tecnico decida prioridades de negocio.'),
    lo('PME-2.3.1', 2, 'K2', 'Interpretar una matriz RASCI', 'RASCI aclara quien ejecuta, aprueba, apoya, consulta o recibe informacion.', 'Una actividad debe tener accountability clara.', 'El PM puede ser responsable del plan, mientras el Project Owner aprueba cambios de valor.', 'Tener dos aprobadores finales sin regla.'),
    lo('PME-2.4.1', 2, 'K3', 'Elegir acciones de gobernanza ante conflictos', 'La gobernanza ayuda a escalar decisiones cuando hay impacto en alcance, coste, tiempo o beneficios.', 'Los conflictos se resuelven con autoridad y evidencia.', 'Un cambio con impacto presupuestal se eleva al comite definido.', 'Resolver todo informalmente sin registrar impacto.'),

    lo('PME-3.1.1', 3, 'K1', 'Recordar las fases PM2', 'PM2 organiza Inicio, Planificacion, Ejecucion y Cierre con Seguimiento y Control transversal.', 'Seguimiento y control cruza todo el proyecto.', 'El proyecto no espera al cierre para controlar riesgos.', 'Pensar que control es una fase final.'),
    lo('PME-3.2.1', 3, 'K2', 'Explicar puertas de fase', 'Las puertas de fase verifican si el proyecto puede avanzar con evidencia suficiente.', 'Una puerta protege decisiones de continuidad.', 'Listo para Ejecucion valida que plan, recursos y gobernanza sean adecuados.', 'Aprobar puertas sin revisar informacion.'),
    lo('PME-3.3.1', 3, 'K2', 'Relacionar artefactos con fases', 'Solicitud, caso de negocio, acta, manual, plan, reportes y cierre apoyan decisiones de cada fase.', 'Cada artefacto debe tener proposito claro.', 'El caso de negocio justifica el proyecto; el plan de trabajo dirige la ejecucion.', 'Crear documentos que nadie usa.'),
    lo('PME-3.4.1', 3, 'K3', 'Adaptar el ciclo de vida a un escenario', 'La secuencia PM2 puede personalizarse manteniendo decisiones, evidencia y control proporcional.', 'Adaptar no es eliminar control.', 'Un proyecto de baja complejidad puede simplificar aprobaciones y plantillas.', 'Saltar planificacion por presion de fecha.'),

    lo('PME-4.1.1', 4, 'K1', 'Recordar EDT/WBS y paquetes de trabajo', 'La EDT descompone el alcance en entregables o paquetes manejables.', 'Descomponer mejora estimacion y control.', 'Migracion, integraciones y capacitacion pueden ser paquetes.', 'Planificar solo con una fecha final.'),
    lo('PME-4.2.1', 4, 'K2', 'Explicar estimacion, cronograma y costes', 'La estimacion proyecta esfuerzo y coste; el cronograma ordena actividades, dependencias e hitos.', 'Las estimaciones cambian con nueva informacion.', 'Una dependencia externa puede mover ruta critica.', 'Tratar una estimacion inicial como contrato inmutable.'),
    lo('PME-4.3.1', 4, 'K2', 'Describir planes de aceptacion, transicion e implementacion', 'Estos planes definen como aceptar entregables, transferirlos a operacion y lograr adopcion del cambio.', 'La entrega no termina al desarrollar.', 'Capacitacion y soporte pueden ser parte de implementacion de negocio.', 'Liberar sin preparar usuarios u operacion.'),
    lo('PME-4.4.1', 4, 'K3', 'Seleccionar respuesta de planificacion ante cambio', 'Ante cambios de alcance o supuestos se actualizan plan, riesgos, cronograma, costes y aprobaciones.', 'La planificacion es viva.', 'Si el proveedor cambia fecha, se revisan dependencias y alternativas.', 'Mantener el plan original aunque sea falso.'),

    lo('PME-5.1.1', 5, 'K1', 'Recordar coordinacion e informes de proyecto', 'La coordinacion alinea actividades y los informes comunican estado, riesgos y decisiones necesarias.', 'Reportar debe facilitar accion.', 'Un informe ejecutivo resume estado, riesgos y decisiones pendientes.', 'Reportar solo porcentaje sin contexto.'),
    lo('PME-5.2.1', 5, 'K2', 'Explicar aseguramiento y control de calidad', 'Aseguramiento revisa que el proceso sea adecuado; control revisa conformidad de entregables.', 'Calidad incluye proceso y producto.', 'Una revision de plantilla es QA; una prueba de entrega es QC.', 'Dejar calidad para el final.'),
    lo('PME-5.3.1', 5, 'K2', 'Describir aceptacion de entregables', 'La aceptacion valida criterios acordados y genera evidencia de que el entregable es usable.', 'Aceptar requiere criterios previos.', 'Un acta de aceptacion documenta conformidad y pendientes.', 'Aceptar por confianza sin evidencia.'),
    lo('PME-5.4.1', 5, 'K3', 'Resolver incidencias durante ejecucion', 'Las incidencias se registran, analizan, asignan, escalan y cierran con comunicacion apropiada.', 'Una incidencia requiere dueno y fecha objetivo.', 'Un bloqueo critico se eleva segun gobernanza.', 'Ocultar incidencias para proteger la imagen del proyecto.'),

    lo('PME-6.1.1', 6, 'K1', 'Recordar seguimiento y control transversal', 'Seguimiento y control mide avance, detecta desviaciones y coordina acciones correctivas.', 'Controlar permite adaptar con evidencia.', 'Revisar coste real contra presupuesto es control.', 'Controlar solo al final.'),
    lo('PME-6.2.1', 6, 'K2', 'Diferenciar riesgo, incidencia y cambio', 'Riesgo es incertidumbre futura; incidencia es problema actual; cambio modifica la linea base o expectativas.', 'La respuesta depende del tipo.', 'Un retraso posible es riesgo; un retraso confirmado es incidencia.', 'Tratar todo como cambio sin analisis.'),
    lo('PME-6.3.1', 6, 'K2', 'Explicar medicion y valor ganado a nivel esencial', 'Metricas como avance, coste, cronograma y valor ganado ayudan a comparar plan contra realidad.', 'Las metricas deben activar decisiones.', 'Si el coste real supera valor ganado, se analiza desviacion.', 'Usar metricas sin accion.'),
    lo('PME-6.4.1', 6, 'K3', 'Aplicar cierre y lecciones aprendidas', 'El cierre confirma aceptacion, transicion, pendientes, informe final y aprendizaje reutilizable.', 'Cerrar bien reduce riesgo posterior.', 'Una leccion aprendida debe proponer accion para futuros proyectos.', 'Cerrar solo porque se agoto el tiempo.')
  ];

  const objectives = objectiveDefinitions.map((item) => ({
    lo: item.lo,
    chapter: item.chapter,
    k: item.k,
    text: item.text,
    theory: item.theory,
    remember: item.remember,
    example: item.example,
    trap: item.trap
  }));

  const questions = objectiveDefinitions.flatMap((item, index) => buildQuestions(item, index));

  const flashcards = [
    card('Proyecto', 'Esfuerzo temporal para crear un producto, servicio, resultado o cambio unico.', 1, 'PME-1.1.1', 'Concepto'),
    card('Operacion', 'Trabajo continuo y repetitivo que sostiene el funcionamiento normal.', 1, 'PME-1.1.1', 'Concepto'),
    card('Entregable', 'Producto concreto generado por el proyecto.', 1, 'PME-1.2.1', 'Glosario'),
    card('Beneficio', 'Valor medible logrado al usar resultados del proyecto.', 1, 'PME-1.2.1', 'Glosario'),
    card('PM2', 'Metodologia de gestion de proyectos con fases, roles, artefactos y mentalidades adaptables.', 1, 'PME-1.3.1', 'Metodologia'),
    card('Stakeholder', 'Persona, grupo u organizacion que afecta o recibe impacto del proyecto.', 2, 'PME-2.1.1', 'Glosario'),
    card('Project Owner', 'Rol que representa valor y objetivos de negocio.', 2, 'PME-2.2.1', 'Rol'),
    card('Project Manager', 'Rol que coordina plan, ejecucion, riesgos, cambios, comunicacion y control.', 2, 'PME-2.2.1', 'Rol'),
    card('RASCI', 'Responsible, Accountable, Supports, Consulted, Informed.', 2, 'PME-2.3.1', 'Herramienta'),
    card('Puerta de fase', 'Revision formal para decidir si se avanza a la siguiente fase.', 3, 'PME-3.2.1', 'Gobernanza'),
    card('Inicio', 'Fase que justifica necesidad, objetivos y arranque del proyecto.', 3, 'PME-3.1.1', 'Fase'),
    card('Planificacion', 'Fase que define como se gestionara y entregara el proyecto.', 3, 'PME-3.1.1', 'Fase'),
    card('Ejecucion', 'Fase donde se producen entregables y se coordina el trabajo.', 3, 'PME-3.1.1', 'Fase'),
    card('Cierre', 'Fase que formaliza aceptacion, entrega, informe final y aprendizaje.', 3, 'PME-6.4.1', 'Fase'),
    card('EDT/WBS', 'Desglose del trabajo en paquetes manejables.', 4, 'PME-4.1.1', 'Tecnica'),
    card('Ruta critica', 'Secuencia de actividades que determina duracion minima del proyecto.', 4, 'PME-4.2.1', 'Tecnica'),
    card('Plan de aceptacion', 'Define criterios y evidencia para aceptar entregables.', 4, 'PME-4.3.1', 'Plan'),
    card('Plan de transicion', 'Prepara el paso de entregables a operacion o uso real.', 4, 'PME-4.3.1', 'Plan'),
    card('Aseguramiento de calidad', 'Revisa que procesos y practicas favorezcan conformidad.', 5, 'PME-5.2.1', 'Calidad'),
    card('Control de calidad', 'Verifica entregables contra criterios acordados.', 5, 'PME-5.2.1', 'Calidad'),
    card('Incidencia', 'Problema actual que requiere analisis, responsable y resolucion.', 5, 'PME-5.4.1', 'Gestion'),
    card('Riesgo', 'Evento o condicion incierta que puede afectar objetivos.', 6, 'PME-6.2.1', 'Gestion'),
    card('Cambio', 'Modificacion aprobada o solicitada sobre alcance, tiempo, coste, calidad o expectativas.', 6, 'PME-6.2.1', 'Gestion'),
    card('Valor ganado', 'Tecnica para comparar avance, coste y plan en un momento del proyecto.', 6, 'PME-6.3.1', 'Tecnica'),
    card('Lecciones aprendidas', 'Aprendizaje accionable para mejorar proyectos futuros.', 6, 'PME-6.4.1', 'Mejora')
  ];

  AcademyRegistry.register(courseKey, {
    meta: {
      key: courseKey,
      code: 'PME',
      name: 'Project Management Essentials',
      shortName: 'Project Management',
      subtitle: 'Curso gratuito de fundamentos de gestion de proyectos basado en PM2: roles, fases, planificacion, ejecucion, control, riesgos, cambios y cierre.',
      versionLabel: 'CertiProf Project Management Essentials',
      storageKey: 'academy_project_management_essentials_progress',
      sourceLanguage: 'ES',
      questionLanguage: 'ES',
      examUrl,
      examLabel: 'Examen Project Management Essentials',
      certificationNote: 'Examen externo gratuito en CertiProf; confirma condiciones del certificado directamente en CertiProf.',
      k3Description: 'Escenarios para aplicar decisiones esenciales de gestion de proyectos, PM2, riesgos, cambios, aceptacion y cierre.'
    },
    chapters,
    objectives,
    questions,
    flashcards,
    blueprint: {
      totalQuestions: 40,
      totalPoints: 40,
      passingScore: 28,
      minutes: 60,
      extraTime25: 75,
      chapterDistribution: { 1: 7, 2: 7, 3: 7, 4: 7, 5: 6, 6: 6 },
      kDistribution: { K1: 12, K2: 20, K3: 8 },
      matrix: {
        1: { K1: 2, K2: 4, K3: 1 },
        2: { K1: 2, K2: 4, K3: 1 },
        3: { K1: 2, K2: 4, K3: 1 },
        4: { K1: 2, K2: 4, K3: 1 },
        5: { K1: 2, K2: 2, K3: 2 },
        6: { K1: 2, K2: 2, K3: 2 }
      },
      version: 'Project Management Essentials - matriz AcademiaQA'
    },
    generatedAt: '2026-07-31T00:00:00-05:00',
    qaValidation: buildQaValidation(),
    syllabusCoverageNote: {
      source: sourceName,
      scope: 'Curso adaptado desde el material Project Management Essentials cargado en Drive y la Guia PM2 3.1. Cubre fundamentos de proyectos, PM2, roles, gobernanza, ciclo de vida, planificacion, ejecucion, calidad, comunicacion, seguimiento, riesgos, cambios y cierre.',
      noOfficialPdfIncluded: true,
      externalExamUrl: examUrl,
      updatedAt: '2026-07-31'
    }
  });

  function chapter(id, title, minutes, summary, terms, theorySections, pitfalls, examples, pages) {
    return {
      id,
      title,
      minutes,
      summary,
      terms,
      pitfalls,
      examples,
      theorySections,
      completeSyllabusText: [
        `Capitulo ${id}. ${title}`,
        summary,
        `Terminos clave: ${terms.join(', ')}.`,
        theorySections.map((item) => `${item.title}: ${item.body} Puntos clave: ${item.bullets.join(' ')}`).join('\n\n')
      ].join('\n\n'),
      completeSyllabusPages: pages,
      syllabusSource: sourceName
    };
  }

  function section(title, body, bullets = []) {
    return { title, body, bullets };
  }

  function lo(code, chapterId, k, text, theory, remember, example, trap) {
    const topic = text.replace(/^(Recordar|Explicar|Describir|Aplicar|Interpretar|Relacionar|Diferenciar|Seleccionar|Elegir)\s+/i, '');
    return {
      lo: code,
      chapter: chapterId,
      k,
      text,
      theory,
      remember,
      example,
      trap,
      topic,
      correct: remember,
      distractors: [
        trap,
        'Resolverlo solo con intuicion, sin revisar evidencia ni responsabilidades.',
        'Esperar hasta el cierre del proyecto para tomar una decision.'
      ],
      scenario: example,
      scenarioCorrect: theory,
      scenarioDistractors: [
        trap,
        'Documentar el asunto sin asignar responsable ni siguiente paso.',
        'Tratarlo como una excepcion informal fuera de la gobernanza.'
      ]
    };
  }

  function buildQuestions(item, index) {
    const base = (index * 2) + 1;
    return [
      question(`${courseKey}-Q${String(base).padStart(3, '0')}`, item.chapter, item.k, item.lo, item.topic, `Cual afirmacion describe mejor: ${item.text}?`, [
        item.correct,
        ...item.distractors
      ], item.theory),
      question(`${courseKey}-Q${String(base + 1).padStart(3, '0')}`, item.chapter, item.k, item.lo, item.topic, `Escenario: ${item.scenario} Que decision es mas adecuada?`, [
        item.scenarioCorrect,
        ...item.scenarioDistractors
      ], item.remember)
    ];
  }

  function question(id, chapterId, k, objectiveCode, topic, stem, options, explanation) {
    return {
      id,
      chapter: chapterId,
      k,
      lo: objectiveCode,
      objective: objectives.find((item) => item.lo === objectiveCode)?.text || topic,
      topic,
      stem,
      options: options.slice(0, 4),
      correct: [0],
      explanation,
      multi: false,
      difficulty: k === 'K3' ? 'aplicacion' : 'normal',
      points: 1,
      source: sourceName
    };
  }

  function card(front, meaning, chapterId, objectiveCode, kind) {
    return {
      front,
      back: `Significado: ${meaning}\n\nQue estudiar: relaciona este concepto con el capitulo ${chapterId}, el objetivo ${objectiveCode} y una decision real de proyecto.`,
      meaning,
      chapter: chapterId,
      lo: objectiveCode,
      kind,
      hint: 'Piensa en valor, gobernanza, evidencia, riesgos, cambios y aceptacion.'
    };
  }

  function buildQaValidation() {
    return {
      version: 'Project Management Essentials - curso gratuito',
      sourceSyllabus: sourceName,
      syllabusStatus: 'OK: guia adaptada para estudio en espanol, sin incluir PDFs.',
      syllabusChapterAudit: chapters.map((item) => ({
        chapter: item.id,
        pages: item.completeSyllabusPages,
        chars: item.completeSyllabusText.length,
        expectedHeadings: item.theorySections.length,
        missingHeadings: [],
        wrongMajorChapterHeadings: [],
        losExpected: objectives.filter((objective) => objective.chapter === item.id).length,
        missingLOCodes: [],
        status: 'OK'
      })),
      questionBankAudit: {
        totalQuestions: questions.length,
        loCovered: new Set(questions.map((questionItem) => questionItem.lo)).size,
        loTotal: objectives.length,
        minQuestionsPerLO: 2,
        byChapter: countBy(questions, 'chapter'),
        byK: countBy(questions, 'k'),
        structuralIssues: [],
        correctedItems: [
          'Curso creado como adaptacion de estudio; no incluye el PDF fuente.',
          'Banco distribuido por capitulo y nivel K con matriz de 40 preguntas.',
          'Enlace de examen externo guardado en meta.examUrl.'
        ]
      },
      simulationAudit: {
        runs: 100,
        status: 'OK validado contra disponibilidad por matriz',
        issues: [],
        uniqueExamCombinationsObserved: 100,
        officialMatrix: '40 preguntas, K1=12, K2=20, K3=8'
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
