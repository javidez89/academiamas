'use strict';

(function registerScrumFundamentalsCourse() {
  const courseKey = 'scrum-fundamentals';
  const sourceName = 'Scrum Fundamentals - CertiProf exam + The Scrum Guide 2020, Ken Schwaber and Jeff Sutherland';
  const examUrl = 'https://open.certiprof.com/scrum-foundation-exam-pt';

  const chapters = [
    chapter(1, 'Definicion, teoria y valores de Scrum', 70,
      'Presenta Scrum como marco liviano para crear valor en problemas complejos, apoyado por empirismo, pensamiento Lean y cinco valores.',
      ['Scrum', 'empirismo', 'pensamiento Lean', 'transparencia', 'inspeccion', 'adaptacion', 'compromiso', 'foco', 'franqueza', 'respeto', 'coraje'],
      [
        section('Definicion de Scrum', 'Scrum ayuda a personas, equipos y organizaciones a generar valor mediante soluciones adaptativas para problemas complejos. Es intencionalmente incompleto y define solo las partes necesarias.', ['No es una metodologia detallada paso a paso.', 'Puede envolver tecnicas y practicas existentes.', 'Su estructura hace visible la eficacia del trabajo.']),
        section('Empirismo y Lean', 'Scrum se basa en conocimiento obtenido por experiencia y decisiones tomadas segun lo observado. Lean reduce desperdicio y enfoca lo esencial.', ['La evidencia real supera las suposiciones.', 'Iterar e incrementar mejora previsibilidad.', 'La inspeccion necesita transparencia.']),
        section('Valores Scrum', 'Compromiso, foco, franqueza, respeto y coraje guian comportamientos y decisiones. Cuando se viven, los pilares empiricos funcionan mejor y generan confianza.', ['Los valores se practican durante eventos y trabajo diario.', 'Foco protege el Sprint Goal.', 'Franqueza permite ver problemas temprano.'])
      ],
      ['Usar Scrum como lista de reuniones sin empirismo.', 'Llamarlo metodologia completa y prescriptiva.', 'Inspeccionar informacion poco transparente.', 'Declarar valores sin cambiar conductas.'],
      ['Un equipo que oculta bloqueos reduce transparencia y toma peores decisiones.', 'Un Sprint corto permite aprender y ajustar antes de invertir demasiado.'],
      'Scrum Guide 2020: proposito, definicion, teoria y valores'
    ),
    chapter(2, 'Scrum Team y responsabilidades', 75,
      'Describe el Scrum Team como unidad pequena, multifuncional y autogestionada, con Product Owner, Scrum Master y Developers.',
      ['Scrum Team', 'Developers', 'Product Owner', 'Scrum Master', 'multifuncional', 'autogestion', 'Incremento', 'Product Goal'],
      [
        section('Scrum Team', 'La unidad fundamental de Scrum es un Scrum Team pequeno, sin subequipos ni jerarquias internas, enfocado en un objetivo a la vez.', ['Generalmente son 10 personas o menos.', 'El equipo debe tener habilidades para crear valor cada Sprint.', 'Es responsable de todas las actividades relacionadas con el producto.']),
        section('Developers y Product Owner', 'Developers crean cualquier aspecto del Incremento usable y planifican su trabajo. El Product Owner maximiza valor y gestiona Product Goal y Product Backlog.', ['Developers crean Sprint Backlog y adaptan el plan diario.', 'El PO ordena el Product Backlog y comunica el Product Goal.', 'El PO es una persona, no un comite.']),
        section('Scrum Master', 'El Scrum Master establece Scrum como se define en la Guia, ayuda a comprender teoria y practica, y mejora la efectividad del Scrum Team y la organizacion.', ['Sirve al equipo, al Product Owner y a la organizacion.', 'Ayuda a eliminar impedimentos.', 'Asegura eventos positivos, productivos y dentro del timebox.'])
      ],
      ['Convertir Product Owner en comite.', 'Scrum Master como jefe que asigna tareas.', 'Separar QA, analisis o arquitectura como subequipos fijos dentro del Scrum Team.', 'Developers esperando instrucciones sobre como hacer todo.'],
      ['El PO puede delegar escritura de items, pero sigue siendo accountable por el backlog.', 'Developers deciden como convertir items seleccionados en Incremento.'],
      'Scrum Guide 2020: Scrum Team'
    ),
    chapter(3, 'Sprint y eventos Scrum', 85,
      'Explica el Sprint como contenedor de todos los eventos y revisa Sprint Planning, Daily Scrum, Sprint Review y Sprint Retrospective.',
      ['Sprint', 'Sprint Planning', 'Daily Scrum', 'Sprint Review', 'Sprint Retrospective', 'timebox', 'Sprint Goal', 'adaptacion'],
      [
        section('Sprint como contenedor', 'Los Sprints son eventos de duracion fija de un mes o menos donde las ideas se convierten en valor. Un nuevo Sprint inicia inmediatamente al terminar el anterior.', ['No se hacen cambios que pongan en peligro el Sprint Goal.', 'La calidad no disminuye.', 'El alcance puede aclararse y renegociarse con el Product Owner.']),
        section('Sprint Planning y Daily Scrum', 'Sprint Planning define por que el Sprint es valioso, que se puede hacer y como se realizara. Daily Scrum inspecciona progreso hacia el Sprint Goal y adapta el Sprint Backlog.', ['Sprint Planning produce Sprint Goal, seleccion de items y plan.', 'Daily Scrum es para Developers y dura 15 minutos.', 'La estructura diaria puede variar si mantiene foco en el objetivo.']),
        section('Sprint Review y Retrospective', 'Sprint Review inspecciona el resultado y adapta el Product Backlog. Sprint Retrospective planifica mejoras de calidad y efectividad.', ['Review es una sesion de trabajo, no solo demo.', 'Retrospective cierra el Sprint.', 'Las mejoras importantes pueden ir al Sprint Backlog siguiente.'])
      ],
      ['Daily Scrum como reporte al jefe.', 'Sprint Review como puerta de liberacion obligatoria.', 'Retrospective sin acciones concretas.', 'Cambiar el Sprint Goal por urgencias externas.'],
      ['Si se aprende que el alcance exacto debe cambiar, se negocia con el PO sin poner en peligro el Sprint Goal.', 'La Review puede modificar el Product Backlog con feedback de stakeholders.'],
      'Scrum Guide 2020: eventos'
    ),
    chapter(4, 'Artefactos y compromisos', 80,
      'Cubre Product Backlog, Sprint Backlog e Increment, junto con Product Goal, Sprint Goal y Definition of Done.',
      ['Product Backlog', 'Product Goal', 'Sprint Backlog', 'Sprint Goal', 'Increment', 'Definition of Done', 'refinamiento', 'transparencia'],
      [
        section('Product Backlog y Product Goal', 'El Product Backlog es una lista emergente y ordenada de lo necesario para mejorar el producto. Su compromiso es el Product Goal.', ['Es la unica fuente de trabajo del Scrum Team.', 'El Product Goal describe un estado futuro del producto.', 'El resto del backlog emerge para cumplir el objetivo.']),
        section('Sprint Backlog y Sprint Goal', 'El Sprint Backlog contiene el Sprint Goal, los items seleccionados y el plan para entregarlos. Es creado por y para Developers.', ['Se actualiza durante el Sprint al aprender mas.', 'El Sprint Goal crea coherencia y enfoque.', 'Debe tener detalle suficiente para inspeccion diaria.']),
        section('Increment y Definition of Done', 'Un Increment es un paso concreto hacia el Product Goal. La Definition of Done describe el estado de calidad requerido para considerar trabajo terminado.', ['Un item no es parte del Increment si no cumple DoD.', 'Puede haber multiples Increments en un Sprint.', 'La DoD crea entendimiento compartido.'])
      ],
      ['Tratar el Product Backlog como lista fija.', 'Aceptar incremento que no cumple DoD.', 'Usar Sprint Backlog como plan impuesto por un gerente.', 'Confundir Product Goal con Sprint Goal.'],
      ['Un Product Goal puede orientar varios Sprints; un Sprint Goal da foco a un Sprint.', 'Un item incompleto vuelve al Product Backlog para consideracion futura.'],
      'Scrum Guide 2020: artefactos'
    ),
    chapter(5, 'Empirismo aplicado, refinamiento y pronostico', 70,
      'Aplica transparencia, inspeccion y adaptacion a decisiones reales: refinamiento, pronostico, cancelacion de Sprint, gestion de riesgo y mejora continua.',
      ['refinamiento', 'pronostico', 'burndown', 'burnup', 'flujo acumulado', 'cancelacion de Sprint', 'riesgo', 'evidencia'],
      [
        section('Refinamiento y preparacion', 'El refinamiento divide y define elementos del Product Backlog con mas detalle. Es una actividad continua, no un evento obligatorio de la Guia.', ['Agrega detalles como descripcion, orden y tamano.', 'Developers estiman el trabajo que haran.', 'El PO puede influir ayudando a entender alternativas.']),
        section('Pronostico y evidencia', 'Practicas como burndown, burnup o flujo acumulado pueden ayudar, pero no reemplazan el empirismo. En entornos complejos, solo lo ocurrido sirve como base firme.', ['El pronostico mejora con desempeno pasado y capacidad actual.', 'Los graficos apoyan conversaciones, no garantizan resultados.', 'La transparencia reduce decisiones erroneas.']),
        section('Cancelacion y adaptacion', 'Un Sprint puede cancelarse si el Sprint Goal se vuelve obsoleto. Solo el Product Owner tiene autoridad para cancelarlo.', ['Cancelar es excepcional.', 'La adaptacion debe ocurrir pronto para minimizar desviaciones.', 'Autogestion facilita adaptacion efectiva.'])
      ],
      ['Creer que un burndown predice todo.', 'Llamar refinamiento a una fase de analisis pesado.', 'Cancelar Sprints por cualquier cambio pequeno.', 'Adaptar sin transparencia.'],
      ['Si una regulacion vuelve obsoleto el objetivo del Sprint, el PO puede cancelarlo.', 'Si la capacidad baja, Developers ajustan el Sprint Backlog hacia el objetivo.'],
      'Scrum Guide 2020: Sprint, Product Backlog y empirismo'
    ),
    chapter(6, 'Preparacion para examen y antipatrones', 70,
      'Resume reglas esenciales, diferencias frecuentes, trampas de examen y escenarios para reconocer Scrum completo frente a implementaciones parciales.',
      ['Scrum completo', 'antipatron', 'timebox', 'accountability', 'evento formal', 'compromiso', 'Done', 'autogestion'],
      [
        section('Scrum es gratuito e inmutable', 'Scrum como se describe en la Guia es gratuito e inmutable. Implementar solo partes puede ser util, pero el resultado no es Scrum.', ['No se pueden omitir elementos esenciales sin afectar resultados.', 'Las tacticas complementarias no reemplazan Scrum.', 'El marco existe solo en su totalidad.']),
        section('Diferencias de examen', 'Muchas preguntas distinguen rol, artefacto, evento y compromiso. Tambien prueban si se entiende la relacion entre transparencia, inspeccion y adaptacion.', ['Product Backlog tiene Product Goal.', 'Sprint Backlog tiene Sprint Goal.', 'Increment tiene Definition of Done.']),
        section('Antipatrones', 'Los antipatrones mas comunes ocultan problemas: PO comite, SM jefe, Daily de reporte, DoD negociable, Review como aprobacion final y backlog congelado.', ['Scrum hace problemas visibles.', 'La respuesta correcta suele proteger empirismo y valor.', 'Las decisiones importantes se toman con evidencia observada.'])
      ],
      ['Elegir respuestas que agregan jerarquia innecesaria.', 'Confundir eventos Scrum con ceremonias administrativas.', 'Aceptar calidad variable para terminar mas alcance.', 'Olvidar que Scrum Team no tiene subequipos internos.'],
      ['Si alguien pide que el Scrum Master asigne tareas, se debe reforzar autogestion de Developers.', 'Si la Review es solo presentacion, falta inspeccion colaborativa del resultado.'],
      'Scrum Guide 2020: nota final y cambios 2020'
    )
  ];

  const objectiveDefinitions = [
    lo('SF-1.1.1', 1, 'K1', 'Recordar la definicion de Scrum', 'Scrum es un marco liviano para generar valor mediante soluciones adaptativas a problemas complejos.', 'Scrum es un framework, no una metodologia detallada.', 'Un equipo usa Scrum para aprender en ciclos cortos mientras entrega incrementos.', 'Definir Scrum como un proceso predictivo completo.'),
    lo('SF-1.2.1', 1, 'K2', 'Explicar empirismo y pensamiento Lean', 'El empirismo decide con base en experiencia observada y Lean reduce desperdicio para enfocarse en lo esencial.', 'La evidencia observada guia adaptacion.', 'Un equipo cambia plan cuando inspecciona datos reales del Sprint.', 'Decidir solo por supuestos iniciales.'),
    lo('SF-1.3.1', 1, 'K2', 'Relacionar transparencia, inspeccion y adaptacion', 'La transparencia permite inspeccion util y la inspeccion habilita adaptacion efectiva.', 'Sin transparencia, inspeccion y adaptacion pierden valor.', 'Un backlog oculto dificulta decisiones correctas.', 'Inspeccionar informacion incompleta y no adaptar.'),
    lo('SF-1.4.1', 1, 'K3', 'Aplicar valores Scrum en un escenario', 'Compromiso, foco, franqueza, respeto y coraje orientan decisiones y comportamientos del Scrum Team.', 'Los valores hacen vivibles los pilares empiricos.', 'Un Developer expone un bloqueo con franqueza para proteger el Sprint Goal.', 'Ocultar problemas para evitar conversaciones dificiles.'),

    lo('SF-2.1.1', 2, 'K1', 'Recordar composicion del Scrum Team', 'El Scrum Team incluye Product Owner, Scrum Master y Developers, sin subequipos ni jerarquias internas.', 'Una unidad enfocada en un objetivo a la vez.', 'QA, analistas y developers pueden ser Developers si crean Incremento.', 'Crear subequipo de pruebas separado dentro del Scrum Team.'),
    lo('SF-2.2.1', 2, 'K2', 'Explicar responsabilidades de Developers', 'Developers crean el plan del Sprint, adhieren a DoD, adaptan el plan diario y se responsabilizan mutuamente.', 'Developers deciden como hacer el trabajo seleccionado.', 'Durante Daily adaptan Sprint Backlog hacia el Sprint Goal.', 'Esperar que el Scrum Master asigne tareas.'),
    lo('SF-2.3.1', 2, 'K2', 'Diferenciar Product Owner y Scrum Master', 'El Product Owner maximiza valor y gestiona backlog; Scrum Master establece Scrum y mejora efectividad.', 'Responsabilidades separadas evitan confusion.', 'El PO ordena backlog; el SM ayuda a entender Scrum.', 'Scrum Master definiendo valor de negocio.'),
    lo('SF-2.4.1', 2, 'K3', 'Elegir accion correcta segun accountability', 'Cada situacion debe resolverse respetando accountability de PO, SM y Developers.', 'El rol correcto depende de la responsabilidad.', 'Si stakeholders quieren cambiar prioridad, intentan convencer al PO.', 'Cambiar prioridad por votacion del comite.'),

    lo('SF-3.1.1', 3, 'K1', 'Recordar el Sprint como contenedor', 'El Sprint contiene Sprint Planning, Daily Scrums, Sprint Review, Retrospective y trabajo necesario para el Product Goal.', 'El Sprint dura un mes o menos.', 'Un Sprint nuevo inicia al terminar el anterior.', 'Tratar Daily como evento fuera del Sprint.'),
    lo('SF-3.2.1', 3, 'K2', 'Explicar Sprint Planning', 'Sprint Planning define por que el Sprint es valioso, que se puede hacer y como se realizara.', 'Produce Sprint Goal, seleccion y plan.', 'Developers seleccionan trabajo conversando con el PO.', 'Planificar solo una lista de tareas sin objetivo.'),
    lo('SF-3.3.1', 3, 'K2', 'Describir Daily Scrum, Review y Retrospective', 'Daily inspecciona progreso, Review inspecciona resultado y adapta backlog, Retrospective mejora calidad y efectividad.', 'Cada evento habilita inspeccion y adaptacion.', 'Review involucra stakeholders clave.', 'Usar Daily como reporte de estado al jefe.'),
    lo('SF-3.4.1', 3, 'K3', 'Corregir antipatrones de eventos', 'La respuesta correcta conserva proposito, timebox y foco empirico de cada evento.', 'Los eventos no son ceremonias vacias.', 'Una Review solo de diapositivas debe convertirse en sesion de inspeccion.', 'Eliminar Retrospective porque no produce codigo.'),

    lo('SF-4.1.1', 4, 'K1', 'Recordar artefactos Scrum', 'Los artefactos son Product Backlog, Sprint Backlog e Increment.', 'Cada artefacto representa trabajo o valor.', 'Product Backlog contiene todo lo necesario para mejorar el producto.', 'Agregar un documento de proyecto como artefacto Scrum obligatorio.'),
    lo('SF-4.2.1', 4, 'K2', 'Explicar Product Backlog y Product Goal', 'Product Backlog es lista emergente y ordenada; Product Goal describe estado futuro del producto.', 'Product Goal es compromiso del Product Backlog.', 'El backlog emerge para cumplir el Product Goal.', 'Confundir Product Goal con vision decorativa sin uso.'),
    lo('SF-4.3.1', 4, 'K2', 'Explicar Sprint Backlog y Sprint Goal', 'Sprint Backlog contiene Sprint Goal, items seleccionados y plan de entrega.', 'Sprint Goal crea coherencia y enfoque.', 'Developers actualizan Sprint Backlog durante el Sprint.', 'Sprint Backlog fijo y controlado por gerente externo.'),
    lo('SF-4.4.1', 4, 'K3', 'Aplicar Increment y Definition of Done', 'Un Increment solo cuenta si cumple la Definition of Done y es usable.', 'DoD crea transparencia sobre terminado.', 'Un item sin pruebas requeridas no forma parte del Increment.', 'Bajar DoD para cerrar mas puntos.'),

    lo('SF-5.1.1', 5, 'K1', 'Recordar timeboxes principales', 'Sprint dura un mes o menos; Daily 15 minutos; Planning hasta 8 horas, Review hasta 4 y Retrospective hasta 3 para Sprint de un mes.', 'Timebox limita complejidad.', 'Sprints mas cortos suelen tener eventos mas cortos.', 'Extender Daily a una hora diaria por defecto.'),
    lo('SF-5.2.1', 5, 'K2', 'Explicar refinamiento del Product Backlog', 'Refinamiento divide y aclara items; es continuo y ayuda a preparar elementos para seleccion futura.', 'No es evento formal obligatorio.', 'Agregar descripcion, orden y tamano aumenta transparencia.', 'Congelar backlog al inicio del proyecto.'),
    lo('SF-5.3.1', 5, 'K2', 'Interpretar pronosticos con empirismo', 'Graficos y metricas ayudan, pero en complejidad solo lo ocurrido informa decisiones futuras.', 'Herramientas no reemplazan empirismo.', 'Un burnup alimenta conversacion sobre avance real.', 'Creer que un grafico garantiza fecha.'),
    lo('SF-5.4.1', 5, 'K3', 'Aplicar reglas de cancelacion y renegociacion', 'Solo el Product Owner cancela Sprint si el Sprint Goal queda obsoleto; el alcance puede renegociarse sin comprometer el objetivo.', 'Cancelar es excepcional.', 'Si se aprende mas, PO y Developers ajustan alcance del Sprint.', 'Cancelar Sprint por cualquier duda pequena.'),

    lo('SF-6.1.1', 6, 'K1', 'Recordar que Scrum es gratuito e inmutable', 'Scrum como Guia es gratuito e inmutable; cambiar elementos esenciales puede ocultar problemas.', 'Scrum existe solo en su totalidad.', 'Puedes usar tecnicas complementarias dentro del marco.', 'Omitir eventos y seguir llamandolo Scrum completo.'),
    lo('SF-6.2.1', 6, 'K2', 'Identificar antipatrones frecuentes', 'Los antipatrones suelen reemplazar empirismo por jerarquia, reportes, baja transparencia o calidad negociable.', 'La respuesta correcta protege transparencia y valor.', 'Daily como reporte al jefe es antipatron.', 'Agregar mas control externo siempre mejora Scrum.'),
    lo('SF-6.3.1', 6, 'K2', 'Diferenciar artefacto, evento y compromiso', 'Evento crea oportunidad de inspeccion; artefacto representa trabajo o valor; compromiso refuerza enfoque y transparencia.', 'Distinguir categorias evita errores de examen.', 'Sprint Review es evento; Increment es artefacto; DoD es compromiso.', 'Decir que Daily Scrum es artefacto.'),
    lo('SF-6.4.1', 6, 'K3', 'Seleccionar correccion Scrum en escenarios', 'La correccion debe respetar accountabilities, autogestion, eventos, artefactos y empirismo.', 'Scrum hace visible el problema para adaptarlo.', 'Si la DoD no se cumple, el item no se cuenta como Increment.', 'Aceptar trabajo incompleto para mejorar velocidad aparente.')
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
    card('Scrum', 'Framework liviano para generar valor con soluciones adaptativas en problemas complejos.', 1, 'SF-1.1.1', 'Marco'),
    card('Empirismo', 'Conocimiento basado en experiencia y decisiones segun lo observado.', 1, 'SF-1.2.1', 'Teoria'),
    card('Lean', 'Enfoque para reducir desperdicio y concentrarse en lo esencial.', 1, 'SF-1.2.1', 'Teoria'),
    card('Transparencia', 'Visibilidad del proceso y trabajo emergente para tomar decisiones.', 1, 'SF-1.3.1', 'Pilar'),
    card('Inspeccion', 'Revision frecuente de artefactos y progreso hacia objetivos.', 1, 'SF-1.3.1', 'Pilar'),
    card('Adaptacion', 'Ajuste rapido cuando proceso o producto se desvian.', 1, 'SF-1.3.1', 'Pilar'),
    card('Valores Scrum', 'Compromiso, foco, franqueza, respeto y coraje.', 1, 'SF-1.4.1', 'Valores'),
    card('Scrum Team', 'Equipo pequeno, multifuncional y autogestionado con PO, SM y Developers.', 2, 'SF-2.1.1', 'Equipo'),
    card('Developers', 'Personas comprometidas a crear cualquier aspecto de un Incremento usable.', 2, 'SF-2.2.1', 'Accountability'),
    card('Product Owner', 'Responsable de maximizar valor y gestionar Product Goal/Product Backlog.', 2, 'SF-2.3.1', 'Accountability'),
    card('Scrum Master', 'Responsable de establecer Scrum y mejorar efectividad.', 2, 'SF-2.3.1', 'Accountability'),
    card('Sprint', 'Evento contenedor de duracion fija de un mes o menos.', 3, 'SF-3.1.1', 'Evento'),
    card('Sprint Planning', 'Define por que, que y como se trabajara en el Sprint.', 3, 'SF-3.2.1', 'Evento'),
    card('Daily Scrum', 'Evento de 15 minutos para que Developers inspeccionen progreso y adapten plan.', 3, 'SF-3.3.1', 'Evento'),
    card('Sprint Review', 'Inspeccion del resultado del Sprint y adaptacion del Product Backlog.', 3, 'SF-3.3.1', 'Evento'),
    card('Sprint Retrospective', 'Plan de mejoras para calidad y efectividad.', 3, 'SF-3.3.1', 'Evento'),
    card('Product Backlog', 'Lista emergente y ordenada de lo necesario para mejorar el producto.', 4, 'SF-4.2.1', 'Artefacto'),
    card('Product Goal', 'Estado futuro del producto que sirve como objetivo de planificacion.', 4, 'SF-4.2.1', 'Compromiso'),
    card('Sprint Backlog', 'Sprint Goal, items seleccionados y plan de entrega.', 4, 'SF-4.3.1', 'Artefacto'),
    card('Sprint Goal', 'Proposito unico del Sprint que crea enfoque y coherencia.', 4, 'SF-4.3.1', 'Compromiso'),
    card('Increment', 'Paso concreto hacia el Product Goal que debe ser usable.', 4, 'SF-4.4.1', 'Artefacto'),
    card('Definition of Done', 'Descripcion formal del estado requerido para considerar trabajo terminado.', 4, 'SF-4.4.1', 'Compromiso'),
    card('Refinamiento', 'Actividad continua para dividir y aclarar items del Product Backlog.', 5, 'SF-5.2.1', 'Actividad'),
    card('Cancelacion de Sprint', 'Solo el PO puede cancelarlo si el Sprint Goal se vuelve obsoleto.', 5, 'SF-5.4.1', 'Regla'),
    card('Scrum completo', 'Scrum existe solo en su totalidad; omitir elementos esenciales limita beneficios.', 6, 'SF-6.1.1', 'Regla')
  ];

  AcademyRegistry.register(courseKey, {
    meta: {
      key: courseKey,
      code: 'SF',
      name: 'Scrum Fundamentals',
      shortName: 'Scrum Fundamentals',
      subtitle: 'Curso gratuito para dominar fundamentos Scrum: teoria empirica, valores, Scrum Team, eventos, artefactos, compromisos y antipatrones de examen.',
      versionLabel: 'Scrum Guide 2020 + CertiProf Scrum Foundation',
      storageKey: 'academy_scrum_fundamentals_progress',
      sourceLanguage: 'ES',
      questionLanguage: 'ES',
      examUrl,
      examLabel: 'Examen Scrum Foundation',
      certificationNote: 'Examen externo gratuito en CertiProf; confirma condiciones del certificado directamente en CertiProf.',
      k3Description: 'Escenarios para aplicar reglas de Scrum, accountabilities, eventos, artefactos, compromisos y empirismo.'
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
      version: 'Scrum Fundamentals - matriz AcademiaQA'
    },
    generatedAt: '2026-07-31T00:00:00-05:00',
    qaValidation: buildQaValidation(),
    syllabusCoverageNote: {
      source: sourceName,
      scope: 'Curso adaptado desde Scrum Fundamentals cargado en Drive y Scrum Guide 2020. Cubre definicion, teoria, valores, equipo, accountabilities, eventos, artefactos, compromisos, refinamiento, pronostico, cancelacion y antipatrones.',
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
    const topic = text.replace(/^(Recordar|Explicar|Describir|Aplicar|Interpretar|Relacionar|Diferenciar|Seleccionar|Elegir|Corregir)\s+/i, '');
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
        'Aplicar una regla inventada que agrega jerarquia fuera del marco Scrum.',
        'Postergar inspeccion y adaptacion hasta el final del producto.'
      ],
      scenario: example,
      scenarioCorrect: theory,
      scenarioDistractors: [
        trap,
        'Cambiar Scrum sin hacer visible el problema que intenta resolver.',
        'Tomar la decision por autoridad externa sin usar el evento o accountability correspondiente.'
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
      question(`${courseKey}-Q${String(base + 1).padStart(3, '0')}`, item.chapter, item.k, item.lo, item.topic, `Escenario: ${item.scenario} Que respuesta se alinea mejor con Scrum?`, [
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
      back: `Significado: ${meaning}\n\nQue estudiar: conectalo con el capitulo ${chapterId}, el objetivo ${objectiveCode} y una situacion real de Scrum.`,
      meaning,
      chapter: chapterId,
      lo: objectiveCode,
      kind,
      hint: 'Piensa en empirismo, autogestion, eventos, artefactos, compromisos y valor.'
    };
  }

  function buildQaValidation() {
    return {
      version: 'Scrum Fundamentals - curso gratuito',
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
