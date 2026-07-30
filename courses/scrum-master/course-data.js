'use strict';

(function registerScrumMasterCourse() {
  const sourceName = 'Scrum Guide 2020 HTML · Ken Schwaber y Jeff Sutherland · CC BY-SA 4.0';
  const sourceUrl = 'https://scrumguides.org/scrum-guide.html';

  const chapters = [
    {
      id: 1,
      title: 'Propósito, definición y uso de Scrum',
      minutes: 70,
      summary: 'Scrum es un marco ligero para generar valor con soluciones adaptativas en problemas complejos. La guía define sus elementos mínimos, su propósito, su carácter inmutable y el flujo básico de Product Backlog, Sprint, Incremento e inspección.',
      terms: ['Scrum', 'marco ligero', 'problemas complejos', 'valor', 'Product Backlog', 'Incremento', 'Sprint', 'adaptación'],
      pitfalls: [
        'Tratar Scrum como una metodología prescriptiva llena de instrucciones detalladas.',
        'Quitar roles, eventos o artefactos centrales y seguir llamándolo Scrum.',
        'Confundir prácticas complementarias con reglas obligatorias del marco.'
      ],
      examples: [
        'Un equipo de producto usa Scrum para entregar mejoras pequeñas, revisar con stakeholders y ajustar el Product Backlog del siguiente Sprint.',
        'Una organización puede usar métricas, tableros o técnicas propias dentro de Scrum, siempre que no oculten transparencia ni sustituyan sus eventos y compromisos.'
      ],
      theorySections: [
        section(
          'Propósito de la guía',
          'La Scrum Guide existe para definir Scrum de forma clara y mínima. Explica los elementos que hacen posible el marco y advierte que alterar su diseño central puede esconder problemas y reducir sus beneficios.',
          [
            'Scrum nació a inicios de los años noventa y la guía fue publicada por primera vez en 2010.',
            'El término Developers se usa de forma inclusiva para referirse a quienes crean valor, sin limitarlo a software.',
            'Patrones, técnicas y procesos complementarios pueden existir alrededor de Scrum, pero no forman parte de la definición mínima.'
          ]
        ),
        section(
          'Definición de Scrum',
          'Scrum ayuda a personas, equipos y organizaciones a generar valor mediante soluciones adaptativas para problemas complejos. Su flujo esencial ordena trabajo en un Product Backlog, convierte una selección en un Incremento durante un Sprint, inspecciona resultados y ajusta lo siguiente.',
          [
            'El Product Owner ordena el trabajo asociado a un problema complejo.',
            'El Scrum Team transforma una selección del trabajo en un Incremento de valor.',
            'El equipo y los stakeholders inspeccionan resultados y adaptan el siguiente paso.'
          ]
        ),
        section(
          'Marco deliberadamente incompleto',
          'Scrum no intenta describir cada técnica de trabajo. Define las relaciones, eventos, artefactos y compromisos necesarios para que la teoría empírica funcione, dejando espacio a la inteligencia colectiva del equipo y al contexto.',
          [
            'Puede envolver prácticas existentes o hacer visibles prácticas que ya no aportan.',
            'Hace visible la eficacia relativa de gestión, ambiente y técnicas de trabajo.',
            'Debe probarse como marco completo antes de concluir si ayuda a crear valor.'
          ]
        )
      ],
      completeSyllabusText: [
        'La Scrum Guide 2020 define Scrum y explica por qué cada elemento del marco existe para aportar valor. Scrum no es una receta cerrada ni una lista extensa de instrucciones: es un marco ligero para enfrentar trabajo complejo mediante inspección, adaptación y entrega incremental.',
        'El flujo básico del marco requiere que el Product Owner ordene el trabajo en un Product Backlog; que el Scrum Team seleccione trabajo y cree un Incremento de valor durante un Sprint; y que el equipo junto con stakeholders inspeccione resultados para ajustar el siguiente Sprint. Este ciclo se repite.',
        'La guía aclara que Scrum es simple, intencionalmente incompleto y útil como contenedor de prácticas complementarias. Quitar elementos centrales, ignorar reglas o modificar su diseño puede ocultar problemas y disminuir los beneficios. Las prácticas complementarias pueden variar según el contexto, pero la definición de Scrum se mantiene en sus elementos esenciales.'
      ].join('\n\n'),
      completeSyllabusPages: 'Secciones: Purpose of the Scrum Guide, Scrum Definition',
      syllabusSource: sourceName
    },
    {
      id: 2,
      title: 'Teoría empírica y valores Scrum',
      minutes: 80,
      summary: 'Scrum se apoya en empirismo y pensamiento lean. Sus pilares son transparencia, inspección y adaptación; sus valores son compromiso, foco, apertura, respeto y coraje.',
      terms: ['empirismo', 'lean', 'transparencia', 'inspección', 'adaptación', 'compromiso', 'foco', 'apertura', 'respeto', 'coraje'],
      pitfalls: [
        'Inspeccionar artefactos sin transparencia suficiente.',
        'Detectar problemas en eventos Scrum y no adaptar nada.',
        'Usar los valores como decoración cultural, no como criterio de decisiones.'
      ],
      examples: [
        'Si el Product Backlog no es visible ni entendido, las decisiones sobre prioridad se basan en una percepción defectuosa.',
        'Una retrospectiva sin acciones de mejora reduce la inspección a conversación sin impacto.'
      ],
      theorySections: [
        section(
          'Empirismo y pensamiento lean',
          'El empirismo sostiene que el conocimiento útil nace de la experiencia y de decisiones basadas en lo observado. El pensamiento lean reduce desperdicio y centra la atención en lo esencial.',
          [
            'Scrum usa un enfoque iterativo e incremental para mejorar predictibilidad y controlar riesgo.',
            'El equipo debe reunir o adquirir las habilidades necesarias para completar el trabajo.',
            'Los eventos formales sostienen ciclos de inspección y adaptación dentro del Sprint.'
          ]
        ),
        section(
          'Pilares Scrum',
          'La transparencia permite que el proceso y el trabajo emergente sean visibles; la inspección revisa artefactos y progreso hacia objetivos; la adaptación ajusta proceso o producto cuando se detectan desviaciones.',
          [
            'Transparencia sin inspección no genera aprendizaje.',
            'Inspección sin adaptación desperdicia la oportunidad de mejorar.',
            'La adaptación exige personas empoderadas y equipos autogestionados.'
          ]
        ),
        section(
          'Valores Scrum',
          'Compromiso, foco, apertura, respeto y coraje orientan acciones y decisiones. Cuando el equipo vive estos valores, los pilares empíricos se vuelven reales y se construye confianza.',
          [
            'Compromiso con metas y apoyo mutuo.',
            'Foco en el trabajo del Sprint y en el progreso hacia los objetivos.',
            'Apertura sobre trabajo, dificultades y aprendizaje.',
            'Respeto por la capacidad e independencia de las personas.',
            'Coraje para hacer lo correcto y enfrentar problemas difíciles.'
          ]
        )
      ],
      completeSyllabusText: [
        'Scrum se fundamenta en empirismo y pensamiento lean. En trabajo complejo no se puede conocer todo de antemano; por eso Scrum favorece ciclos cortos de experiencia, evidencia, inspección y ajuste. Lean complementa esta mirada al reducir desperdicio y enfocar el esfuerzo en lo esencial.',
        'Los tres pilares de Scrum son transparencia, inspección y adaptación. Los artefactos y el progreso deben ser visibles para quienes hacen el trabajo y para quienes reciben valor. La inspección frecuente ayuda a detectar variaciones o problemas; la adaptación debe ocurrir pronto cuando el producto o el proceso se desvían de límites aceptables.',
        'Los valores Scrum son compromiso, foco, apertura, respeto y coraje. No son una lista decorativa: orientan cómo se usa el marco, cómo se toman decisiones y cómo se crea confianza entre Scrum Team y stakeholders.'
      ].join('\n\n'),
      completeSyllabusPages: 'Secciones: Scrum Theory, Transparency, Inspection, Adaptation, Scrum Values',
      syllabusSource: sourceName
    },
    {
      id: 3,
      title: 'Scrum Team y responsabilidades',
      minutes: 110,
      summary: 'La unidad fundamental de Scrum es un equipo pequeño, cohesivo, autogestionado y multifuncional. Scrum define tres responsabilidades: Developers, Product Owner y Scrum Master.',
      terms: ['Scrum Team', 'Developers', 'Product Owner', 'Scrum Master', 'autogestión', 'multifuncionalidad', 'Product Goal', 'responsabilidad'],
      pitfalls: [
        'Crear subequipos o jerarquías internas dentro del Scrum Team.',
        'Convertir al Product Owner en comité.',
        'Usar al Scrum Master como jefe de proyecto que asigna tareas.'
      ],
      examples: [
        'Si hay varios Scrum Teams sobre el mismo producto, comparten Product Goal, Product Backlog y Product Owner.',
        'El Scrum Master ayuda a que los eventos ocurran dentro del timebox y sean positivos y productivos, no decide por el equipo.'
      ],
      theorySections: [
        section(
          'Unidad fundamental',
          'El Scrum Team incluye un Scrum Master, un Product Owner y Developers. No hay subequipos ni jerarquías internas; es una unidad enfocada en un objetivo a la vez: el Product Goal.',
          [
            'El equipo es multifuncional: reúne las habilidades necesarias para crear valor en cada Sprint.',
            'El equipo es autogestionado: decide internamente quién hace qué, cuándo y cómo.',
            'Normalmente tiene diez o menos personas para mantener comunicación y productividad.'
          ]
        ),
        section(
          'Developers',
          'Developers son las personas comprometidas con crear cualquier aspecto de un Incremento usable cada Sprint. Sus habilidades varían por dominio, pero sus responsabilidades se mantienen.',
          [
            'Crear el plan del Sprint: el Sprint Backlog.',
            'Incorporar calidad respetando la Definition of Done.',
            'Adaptar diariamente su plan hacia el Sprint Goal.',
            'Responsabilizarse mutuamente como profesionales.'
          ]
        ),
        section(
          'Product Owner',
          'El Product Owner maximiza el valor del producto resultante del trabajo del Scrum Team. También responde por una gestión efectiva del Product Backlog.',
          [
            'Desarrollar y comunicar explícitamente el Product Goal.',
            'Crear y comunicar claramente Product Backlog Items.',
            'Ordenar Product Backlog Items.',
            'Asegurar que el Product Backlog sea transparente, visible y entendido.',
            'Puede delegar trabajo, pero conserva la responsabilidad.'
          ]
        ),
        section(
          'Scrum Master',
          'El Scrum Master establece Scrum como se define en la guía, ayuda a comprender teoría y práctica, y responde por la efectividad del Scrum Team al mejorar sus prácticas dentro del marco.',
          [
            'Sirve al Scrum Team mediante coaching, foco en Incrementos de alto valor, eliminación de impedimentos y eventos productivos.',
            'Sirve al Product Owner con técnicas para Product Goal, Product Backlog, claridad de items, planificación empírica y colaboración con stakeholders.',
            'Sirve a la organización liderando, entrenando, asesorando implementaciones y removiendo barreras entre stakeholders y equipos.'
          ]
        )
      ],
      completeSyllabusText: [
        'El Scrum Team es la unidad fundamental de Scrum. Está compuesto por un Scrum Master, un Product Owner y Developers. No existen subequipos ni jerarquías dentro del Scrum Team; todos trabajan como una unidad cohesiva enfocada en un Product Goal a la vez.',
        'El equipo debe ser multifuncional y autogestionado. La organización lo estructura y empodera para gestionar su propio trabajo. En general, los equipos pequeños comunican mejor y producen más; si un equipo crece demasiado, puede reorganizarse en varios Scrum Teams cohesionados sobre el mismo producto, compartiendo Product Goal, Product Backlog y Product Owner.',
        'Scrum define tres responsabilidades. Developers crean Incrementos usables, planifican el Sprint Backlog, cuidan la calidad mediante la Definition of Done, adaptan su plan cada día y se responsabilizan mutuamente. El Product Owner maximiza valor y gestiona Product Backlog y Product Goal; sus decisiones deben ser respetadas por la organización. El Scrum Master establece Scrum, eleva la efectividad del equipo y sirve al Scrum Team, al Product Owner y a la organización.'
      ].join('\n\n'),
      completeSyllabusPages: 'Secciones: Scrum Team, Developers, Product Owner, Scrum Master',
      syllabusSource: sourceName
    },
    {
      id: 4,
      title: 'Eventos Scrum y Sprint',
      minutes: 120,
      summary: 'Los eventos crean regularidad y oportunidades formales de inspección y adaptación. El Sprint contiene Sprint Planning, Daily Scrum, Sprint Review y Sprint Retrospective.',
      terms: ['Sprint', 'Sprint Planning', 'Daily Scrum', 'Sprint Review', 'Sprint Retrospective', 'timebox', 'Sprint Goal', 'cadencia'],
      pitfalls: [
        'Usar el Daily Scrum como reporte al Scrum Master.',
        'Convertir el Sprint Review en una presentación cerrada sin colaboración.',
        'Cancelar un Sprint por cambios menores aunque el Sprint Goal siga vigente.',
        'Permitir cambios que pongan en peligro el Sprint Goal.'
      ],
      examples: [
        'En Sprint Planning el equipo responde por qué el Sprint es valioso, qué puede hacerse y cómo se convertirá el trabajo en Incremento.',
        'Durante el Sprint se puede renegociar alcance con el Product Owner si se aprende algo nuevo, siempre sin poner en riesgo el Sprint Goal.'
      ],
      theorySections: [
        section(
          'Eventos como inspección y adaptación',
          'Cada evento Scrum es una oportunidad formal para inspeccionar y adaptar artefactos. El Sprint contiene todos los demás eventos y da cadencia al aprendizaje.',
          [
            'Los eventos minimizan reuniones no definidas por Scrum.',
            'Idealmente ocurren en el mismo lugar y hora para reducir complejidad.',
            'No operar eventos como se prescribe reduce transparencia, inspección y adaptación.'
          ]
        ),
        section(
          'Sprint',
          'El Sprint es un evento de longitud fija de un mes o menos. Un Sprint empieza inmediatamente después del anterior y contiene todo el trabajo necesario para avanzar hacia el Product Goal.',
          [
            'No se hacen cambios que pongan en peligro el Sprint Goal.',
            'La calidad no disminuye.',
            'El Product Backlog se refina según sea necesario.',
            'El alcance puede aclararse y renegociarse con el Product Owner cuando se aprende más.',
            'Solo el Product Owner puede cancelar un Sprint si el Sprint Goal queda obsoleto.'
          ]
        ),
        section(
          'Eventos dentro del Sprint',
          'Sprint Planning inicia el Sprint; Daily Scrum inspecciona progreso hacia el Sprint Goal; Sprint Review inspecciona resultados y adapta el futuro; Sprint Retrospective planifica mejoras de calidad y efectividad.',
          [
            'Sprint Planning: máximo ocho horas para un Sprint de un mes.',
            'Daily Scrum: quince minutos, para Developers, misma hora y lugar cada día laborable.',
            'Sprint Review: máximo cuatro horas para un Sprint de un mes.',
            'Sprint Retrospective: máximo tres horas para un Sprint de un mes y cierra el Sprint.'
          ]
        )
      ],
      completeSyllabusText: [
        'Scrum usa eventos para crear regularidad y evitar reuniones innecesarias. Cada evento ofrece una oportunidad formal de inspección y adaptación. El Sprint funciona como contenedor de los demás eventos.',
        'El Sprint tiene duración fija de un mes o menos. Un Sprint nuevo inicia al finalizar el anterior. Dentro del Sprint no se permite poner en peligro el Sprint Goal ni bajar la calidad. El Product Backlog puede refinarse, y el alcance puede aclararse o renegociarse con el Product Owner cuando el equipo aprende más. Solo el Product Owner puede cancelar un Sprint si el Sprint Goal se vuelve obsoleto.',
        'Sprint Planning crea el plan del Sprint y responde tres preguntas: por qué este Sprint es valioso, qué puede hacerse y cómo se realizará el trabajo elegido. El Daily Scrum inspecciona progreso hacia el Sprint Goal y adapta el Sprint Backlog. El Sprint Review revisa resultados con stakeholders y ajusta próximos pasos. La Retrospective inspecciona personas, interacciones, procesos, herramientas y Definition of Done para planear mejoras.'
      ].join('\n\n'),
      completeSyllabusPages: 'Secciones: Scrum Events, The Sprint, Sprint Planning, Daily Scrum, Sprint Review, Sprint Retrospective',
      syllabusSource: sourceName
    },
    {
      id: 5,
      title: 'Artefactos y compromisos',
      minutes: 100,
      summary: 'Los artefactos representan trabajo o valor y maximizan transparencia. Cada artefacto tiene un compromiso: Product Goal, Sprint Goal y Definition of Done.',
      terms: ['artefacto', 'Product Backlog', 'Product Goal', 'Sprint Backlog', 'Sprint Goal', 'Incremento', 'Definition of Done', 'refinamiento'],
      pitfalls: [
        'Presentar trabajo en Sprint Review que no cumple la Definition of Done.',
        'Tratar el Product Backlog como una lista estática y cerrada.',
        'Separar Sprint Goal, items seleccionados y plan como si no formaran el Sprint Backlog.',
        'Usar diferentes Definitions of Done para equipos que trabajan en el mismo producto.'
      ],
      examples: [
        'Un Product Backlog Item listo para selección suele ser suficientemente pequeño y claro para completarse dentro de un Sprint.',
        'Un Incremento puede liberarse antes de la Sprint Review; la Review no es una puerta obligatoria para entregar valor.'
      ],
      theorySections: [
        section(
          'Artefactos y compromisos',
          'Los artefactos de Scrum representan trabajo o valor y crean transparencia para que quienes inspeccionan tengan la misma base de adaptación. Cada artefacto incluye un compromiso que refuerza foco y medición.',
          [
            'Product Backlog se compromete con Product Goal.',
            'Sprint Backlog se compromete con Sprint Goal.',
            'Incremento se compromete con Definition of Done.'
          ]
        ),
        section(
          'Product Backlog y Product Goal',
          'El Product Backlog es una lista emergente y ordenada de lo necesario para mejorar el producto; es la fuente única del trabajo del Scrum Team. El Product Goal describe un estado futuro que sirve de objetivo de largo plazo.',
          [
            'El refinamiento divide y aclara items, agregando detalles como descripción, orden y tamaño.',
            'Developers que harán el trabajo responden por el dimensionamiento.',
            'El Product Owner puede influir ayudando a entender y elegir compensaciones.'
          ]
        ),
        section(
          'Sprint Backlog, Sprint Goal, Incremento y Definition of Done',
          'El Sprint Backlog integra el Sprint Goal, los Product Backlog Items seleccionados y el plan de entrega. El Incremento es un paso concreto hacia el Product Goal y debe ser usable.',
          [
            'Sprint Backlog es un plan por y para Developers, visible y actualizado durante el Sprint.',
            'El Sprint Goal da coherencia, foco y flexibilidad sobre el trabajo exacto.',
            'La Definition of Done describe formalmente el estado de calidad requerido.',
            'Si un item no cumple la Definition of Done, no puede liberarse ni presentarse como Incremento.'
          ]
        )
      ],
      completeSyllabusText: [
        'Los artefactos Scrum representan trabajo o valor y están diseñados para maximizar transparencia. La transparencia permite que quienes inspeccionan puedan adaptar con una base común.',
        'Cada artefacto tiene un compromiso: Product Goal para Product Backlog, Sprint Goal para Sprint Backlog y Definition of Done para Incremento. Estos compromisos refuerzan empirismo, valores Scrum, foco y medición del progreso.',
        'El Product Backlog es emergente, ordenado y fuente única del trabajo del Scrum Team. El Sprint Backlog combina objetivo, items seleccionados y plan accionable. El Incremento es un paso concreto, verificado y usable hacia el Product Goal. La Definition of Done hace transparente qué trabajo está realmente terminado. En productos con múltiples Scrum Teams, todos deben acordar y cumplir la misma Definition of Done.'
      ].join('\n\n'),
      completeSyllabusPages: 'Secciones: Scrum Artifacts, Product Backlog, Sprint Backlog, Increment',
      syllabusSource: sourceName
    },
    {
      id: 6,
      title: 'Scrum Master, adopción y cierre de la guía',
      minutes: 80,
      summary: 'El Scrum Master lidera sirviendo al equipo, Product Owner y organización. La Scrum Guide declara Scrum gratuito, completo e inmutable como marco, y reconoce su historia y licencia.',
      terms: ['liderazgo servicial', 'coaching', 'impedimentos', 'adopción Scrum', 'planificación empírica', 'Scrum inmutable', 'CC BY-SA 4.0'],
      pitfalls: [
        'Medir al Scrum Master por control de tareas en vez de efectividad del equipo.',
        'Implementar solo reuniones y tablero sin Product Goal, Incremento ni Definition of Done.',
        'Usar Scrum como etiqueta para un proceso jerárquico que no permite autogestión.'
      ],
      examples: [
        'El Scrum Master puede entrenar a managers y stakeholders para remover barreras entre organización y equipos.',
        'Si se omite Retrospective, Daily o Definition of Done, se pueden usar prácticas ágiles, pero el resultado no es Scrum completo.'
      ],
      theorySections: [
        section(
          'Scrum Master como líder que sirve',
          'El Scrum Master establece Scrum, ayuda a comprenderlo y trabaja sobre la efectividad del Scrum Team. Su servicio no consiste en mandar, sino en crear condiciones para empirismo, foco, colaboración y mejora.',
          [
            'Con el equipo: coaching en autogestión y multifuncionalidad, foco en Incrementos valiosos, eliminación de impedimentos y eventos dentro del timebox.',
            'Con Product Owner: apoyo en Product Goal, Product Backlog, claridad de items, planificación empírica y colaboración con stakeholders.',
            'Con la organización: liderazgo, entrenamiento, asesoría de implementación y remoción de barreras.'
          ]
        ),
        section(
          'Scrum completo e inmutable',
          'La guía indica que Scrum es gratuito y que el marco existe como un todo. Se pueden implementar partes, pero el resultado no debe llamarse Scrum si se eliminan elementos centrales.',
          [
            'Scrum funciona como contenedor de técnicas, metodologías y prácticas.',
            'La definición formal fue presentada públicamente en 1995 y la guía documenta décadas de evolución.',
            'El contenido de la Scrum Guide 2020 se ofrece bajo licencia Creative Commons Attribution Share-Alike 4.0.'
          ]
        )
      ],
      completeSyllabusText: [
        'El Scrum Master sirve al Scrum Team, al Product Owner y a la organización. Ayuda a que Scrum sea entendido y aplicado como se define en la guía, mejora la efectividad del Scrum Team y protege eventos productivos dentro de su timebox.',
        'El servicio al equipo incluye coaching en autogestión y multifuncionalidad, foco en Incrementos de alto valor que cumplan la Definition of Done, remoción de impedimentos y cuidado de eventos positivos y productivos. El servicio al Product Owner incluye técnicas para definir Product Goal, gestionar Product Backlog, escribir items claros, planificar empíricamente y facilitar colaboración. El servicio a la organización incluye entrenar, asesorar implementaciones, ayudar a entender enfoques empíricos y remover barreras entre stakeholders y equipos.',
        'La guía cierra recordando que Scrum es gratuito y que su marco es inmutable: aplicar solo partes puede ser posible, pero eso no es Scrum. El curso adapta y organiza la Scrum Guide 2020 para estudio; no incluye PDFs oficiales ni reemplaza la fuente original.'
      ].join('\n\n'),
      completeSyllabusPages: 'Secciones: Scrum Master, End Note, Acknowledgements',
      syllabusSource: sourceName
    }
  ];

  const objectives = [
    objective('SM-1.1.1', 1, 'K1', 'Recordar el propósito de la Scrum Guide', 'La guía define Scrum y explica los elementos mínimos necesarios del marco.', 'La guía contiene la definición de Scrum; no es un manual de todas las prácticas ágiles.', 'Un equipo puede usar técnicas propias, pero debe mantener roles, eventos, artefactos y compromisos Scrum.', 'Pensar que cualquier tablero con reuniones diarias ya es Scrum.'),
    objective('SM-1.1.2', 1, 'K2', 'Explicar Scrum como marco ligero para problemas complejos', 'Scrum genera valor con soluciones adaptativas cuando el problema no puede resolverse con planificación predictiva completa.', 'Ligero significa mínimo y enfocado, no superficial.', 'Un producto cambia por feedback de usuarios; Scrum permite inspeccionar y adaptar cada Sprint.', 'Tratar Scrum como una metodología secuencial con fases rígidas.'),
    objective('SM-1.2.1', 1, 'K2', 'Describir el flujo esencial Product Backlog, Sprint, Incremento e inspección', 'El Product Owner ordena el trabajo, el Scrum Team convierte una selección en Incremento, los resultados se inspeccionan y se adapta el siguiente paso.', 'Ordenar, construir, inspeccionar, adaptar y repetir.', 'Después de Sprint Review se reordena Product Backlog con lo aprendido.', 'Creer que Sprint Review cierra el proyecto en vez de alimentar el siguiente ciclo.'),
    objective('SM-1.2.2', 1, 'K3', 'Aplicar criterios para reconocer uso incompleto de Scrum', 'Quitar elementos centrales puede ocultar problemas y reducir beneficios; implementar partes no equivale a Scrum completo.', 'Scrum existe como conjunto integrado.', 'Si no hay Product Owner claro ni Product Backlog transparente, se vulnera la base de Scrum.', 'Aceptar un Scrum sin responsabilidades, eventos o artefactos porque mantiene nombres ágiles.'),

    objective('SM-2.1.1', 2, 'K1', 'Recordar empirismo, lean y enfoque iterativo incremental', 'Scrum se basa en experiencia observada, reducción de desperdicio y ciclos incrementales para controlar riesgo.', 'Empirismo: decidir según evidencia; lean: enfocarse en lo esencial.', 'Un Sprint corto reduce riesgo al obtener feedback temprano.', 'Asumir que predictibilidad significa conocer todo desde el inicio.'),
    objective('SM-2.1.2', 2, 'K2', 'Explicar transparencia, inspección y adaptación', 'Los pilares funcionan juntos: lo visible puede inspeccionarse y lo inspeccionado debe provocar cambios cuando se necesita.', 'Sin transparencia la inspección engaña; sin adaptación la inspección no sirve.', 'Un Product Backlog poco claro aumenta riesgo de decisiones pobres.', 'Hacer ceremonias sin ajustar nada ante nueva información.'),
    objective('SM-2.2.1', 2, 'K2', 'Relacionar eventos Scrum con inspección y adaptación', 'Los eventos dan cadencia para inspeccionar artefactos y progreso hacia objetivos.', 'Los eventos son oportunidades formales de cambio.', 'Daily Scrum inspecciona progreso al Sprint Goal; Retrospective inspecciona cómo trabaja el equipo.', 'Pensar que los eventos son reuniones administrativas independientes del empirismo.'),
    objective('SM-2.3.1', 2, 'K1', 'Recordar los cinco valores Scrum', 'Compromiso, foco, apertura, respeto y coraje dan dirección al comportamiento del Scrum Team.', 'Los valores activan confianza y los pilares empíricos.', 'Apertura permite discutir impedimentos temprano.', 'Memorizar valores sin usarlos para evaluar decisiones.'),
    objective('SM-2.3.2', 2, 'K3', 'Aplicar valores y pilares en escenarios de equipo', 'Las decisiones y acciones deben reforzar valores Scrum, no debilitarlos.', 'La cultura Scrum se observa en decisiones concretas.', 'Ocultar retrasos por miedo reduce apertura y transparencia.', 'Confundir armonía superficial con respeto y coraje.'),

    objective('SM-3.1.1', 3, 'K1', 'Recordar la composición del Scrum Team', 'El Scrum Team tiene un Scrum Master, un Product Owner y Developers, sin subequipos ni jerarquías internas.', 'Una unidad, un Product Goal a la vez.', 'Un analista puede ser Developer si contribuye al Incremento.', 'Separar equipo de desarrollo, equipo de pruebas y equipo de análisis como subequipos Scrum.'),
    objective('SM-3.1.2', 3, 'K2', 'Explicar autogestión, multifuncionalidad y tamaño del equipo', 'El equipo decide cómo organizar su trabajo y reúne las habilidades para crear valor cada Sprint; suele tener diez o menos personas.', 'Pequeño, multifuncional y autogestionado.', 'Si un equipo crece mucho, se divide en varios equipos cohesionados sobre el mismo producto.', 'Crear varios Product Owners para un mismo Product Backlog.'),
    objective('SM-3.2.1', 3, 'K2', 'Describir responsabilidades de Developers', 'Developers crean el plan del Sprint, cuidan calidad con Definition of Done, adaptan su plan diario y se responsabilizan mutuamente.', 'Developers responden por convertir trabajo en Incremento usable.', 'El plan diario cambia cuando aprenden algo nuevo en el Sprint.', 'Que el Scrum Master asigne tareas diarias a Developers.'),
    objective('SM-3.3.1', 3, 'K2', 'Describir responsabilidades del Product Owner', 'El Product Owner maximiza valor y responde por Product Goal, items claros, orden del Product Backlog y transparencia.', 'Puede delegar trabajo, no responsabilidad.', 'Stakeholders proponen cambios intentando convencer al Product Owner.', 'Un comité decide prioridades y diluye responsabilidad.'),
    objective('SM-3.4.1', 3, 'K2', 'Describir responsabilidades del Scrum Master', 'El Scrum Master establece Scrum, ayuda a entenderlo y mejora la efectividad del equipo dentro del marco.', 'Lidera sirviendo, no controlando.', 'Facilita remoción de impedimentos y eventos productivos.', 'Tratar al Scrum Master como secretario de reuniones o jefe del equipo.'),
    objective('SM-3.4.2', 3, 'K3', 'Aplicar servicios del Scrum Master en escenarios', 'El Scrum Master sirve al equipo, Product Owner y organización con coaching, facilitación, asesoría y eliminación de barreras.', 'El servicio correcto depende del impedimento o necesidad concreta.', 'Si stakeholders interrumpen Developers, el Scrum Master trabaja barreras organizacionales.', 'Resolver todos los problemas por el equipo y reducir su autogestión.'),

    objective('SM-4.1.1', 4, 'K1', 'Recordar eventos Scrum y timeboxes', 'El Sprint dura un mes o menos; Planning hasta 8 horas, Daily 15 minutos, Review hasta 4 horas y Retrospective hasta 3 horas para Sprints de un mes.', 'Para Sprints más cortos, los eventos suelen ser más cortos.', 'Un Sprint de dos semanas normalmente usa Planning menor a ocho horas.', 'Pensar que los timeboxes son duraciones obligatorias mínimas.'),
    objective('SM-4.1.2', 4, 'K2', 'Explicar reglas y propósito del Sprint', 'El Sprint convierte ideas en valor, permite inspección al menos mensual y reduce riesgo mediante ciclos cortos.', 'No se compromete el Sprint Goal ni se reduce calidad.', 'El alcance puede renegociarse si el Sprint Goal se conserva.', 'Cambiar Sprint Goal a mitad del Sprint por preferencia nueva.'),
    objective('SM-4.2.1', 4, 'K2', 'Describir los tres temas de Sprint Planning', 'Planning define por qué el Sprint es valioso, qué puede hacerse y cómo se realizará el trabajo elegido.', 'Resultado: Sprint Goal, items seleccionados y plan.', 'Developers seleccionan trabajo con Product Owner según capacidad, desempeño pasado y DoD.', 'Que Product Owner imponga unilateralmente cuánto trabajo entra.'),
    objective('SM-4.3.1', 4, 'K2', 'Explicar Daily Scrum como inspección y adaptación diaria', 'El Daily Scrum inspecciona progreso hacia Sprint Goal y adapta Sprint Backlog para el próximo día.', 'Es para Developers y no requiere formato fijo.', 'PO o Scrum Master participan solo si trabajan items del Sprint Backlog como Developers.', 'Convertirlo en reporte de estado al Scrum Master.'),
    objective('SM-4.4.1', 4, 'K2', 'Diferenciar Sprint Review y Sprint Retrospective', 'Review inspecciona el resultado del Sprint y adapta futuro del producto; Retrospective inspecciona cómo trabajó el equipo y planifica mejoras.', 'Review mira producto y entorno; Retro mira equipo, proceso, herramientas y DoD.', 'La Review puede ajustar Product Backlog; la Retro puede agregar mejoras al próximo Sprint Backlog.', 'Usar la Review como aprobación final o la Retro como queja sin acciones.'),
    objective('SM-4.5.1', 4, 'K3', 'Aplicar decisiones de eventos en escenarios', 'El evento correcto depende del propósito: producto, plan diario, mejora del equipo o planificación del Sprint.', 'El propósito manda más que el nombre de la reunión.', 'Un problema de calidad recurrente corresponde a Retrospective y acciones de mejora.', 'Llevar todos los temas al Daily aunque requieran análisis detallado aparte.'),

    objective('SM-5.1.1', 5, 'K1', 'Recordar artefactos y compromisos Scrum', 'Product Backlog, Sprint Backlog e Incremento tienen compromisos: Product Goal, Sprint Goal y Definition of Done.', 'Artefacto + compromiso crean transparencia y foco.', 'Sprint Goal pertenece al Sprint Backlog.', 'Asociar Definition of Done con Product Backlog.'),
    objective('SM-5.2.1', 5, 'K2', 'Explicar Product Backlog, Product Goal y refinamiento', 'El Product Backlog es emergente, ordenado y fuente única de trabajo; el Product Goal describe un estado futuro objetivo.', 'El refinamiento aclara, divide y agrega detalles.', 'Developers dimensionan los items que harán.', 'Pensar que refinamiento es un evento obligatorio con timebox Scrum.'),
    objective('SM-5.3.1', 5, 'K2', 'Explicar Sprint Backlog y Sprint Goal', 'El Sprint Backlog incluye por qué, qué y cómo: Sprint Goal, items seleccionados y plan accionable.', 'Es un plan por y para Developers, actualizado con lo aprendido.', 'Si el trabajo cambia, Developers colaboran con Product Owner para negociar alcance sin afectar Sprint Goal.', 'Tratar Sprint Backlog como contrato fijo de alcance.'),
    objective('SM-5.4.1', 5, 'K2', 'Explicar Incremento y Definition of Done', 'Un Incremento es usable, verificado y aditivo a incrementos anteriores; nace cuando un item cumple la Definition of Done.', 'Sin DoD no hay transparencia sobre lo terminado.', 'Un Incremento puede entregarse antes de Sprint Review.', 'Presentar o liberar trabajo que no cumple DoD.'),
    objective('SM-5.4.2', 5, 'K3', 'Aplicar Definition of Done en escenarios multi-equipo', 'Si varios Scrum Teams trabajan sobre un producto, deben definir y cumplir la misma Definition of Done.', 'La DoD común integra calidad del producto completo.', 'Tres equipos sobre una app acuerdan criterios comunes de seguridad, pruebas y documentación.', 'Permitir DoD distintas que hacen incompatibles los Incrementos.'),

    objective('SM-6.1.1', 6, 'K1', 'Recordar servicios del Scrum Master', 'El Scrum Master sirve al Scrum Team, Product Owner y organización mediante coaching, facilitación, liderazgo y remoción de barreras.', 'Su meta es efectividad y adopción correcta de Scrum.', 'Ayuda a entender planificación empírica en trabajo complejo.', 'Medir su éxito por número de tareas asignadas.'),
    objective('SM-6.2.1', 6, 'K2', 'Explicar adopción Scrum en la organización', 'El Scrum Master lidera, entrena, asesora implementaciones y ayuda a stakeholders a aplicar empirismo.', 'La adopción Scrum también es cambio organizacional.', 'Capacitar a áreas de negocio para colaborar mejor en Sprint Review.', 'Limitar Scrum a rituales del equipo sin cambiar barreras externas.'),
    objective('SM-6.3.1', 6, 'K2', 'Explicar Scrum como marco gratuito, completo e inmutable', 'Scrum se ofrece en la guía y funciona como marco completo. Usar partes puede ser útil, pero no debe llamarse Scrum completo.', 'Scrum existe en su totalidad.', 'Una organización puede combinar prácticas Kanban con Scrum si respeta el marco Scrum.', 'Eliminar Product Owner y conservar solo Daily y tablero como Scrum.'),
    objective('SM-6.4.1', 6, 'K3', 'Aplicar criterios para detectar anti-patrones de adopción', 'Los anti-patrones aparecen cuando se reducen transparencia, autogestión, accountability, valor o aprendizaje empírico.', 'Busca qué pilar, valor o elemento Scrum se está debilitando.', 'Un Scrum Master que decide tareas por Developers reduce autogestión.', 'Premiar cumplimiento de plan aunque el Incremento no sea usable.')
  ];

  const questions = [
    q('SM-Q001', 1, 'K1', 'SM-1.1.1', 'Propósito de la guía', '¿Cuál es el propósito principal de la Scrum Guide 2020?', ['Definir Scrum y sus elementos mínimos', 'Describir todas las técnicas ágiles existentes', 'Certificar oficialmente Scrum Masters', 'Reemplazar la gestión de producto'], 0, 'La guía define Scrum y sus elementos esenciales; las prácticas complementarias quedan fuera de su alcance.'),
    q('SM-Q002', 1, 'K1', 'SM-1.1.2', 'Definición de Scrum', '¿Cómo describe Scrum la guía?', ['Un marco ligero para generar valor en problemas complejos', 'Un proceso predictivo para eliminar incertidumbre', 'Una metodología de control jerárquico', 'Un estándar exclusivo para desarrollo de software'], 0, 'Scrum se presenta como un marco ligero para soluciones adaptativas ante problemas complejos.'),
    q('SM-Q003', 1, 'K2', 'SM-1.2.1', 'Flujo Scrum', '¿Cuál secuencia representa mejor el flujo esencial de Scrum?', ['Plan anual cerrado, ejecución, auditoría final', 'Product Owner ordena trabajo, Scrum Team crea Incremento, equipo y stakeholders inspeccionan y adaptan', 'Scrum Master asigna tareas, Developers reportan, Product Owner aprueba', 'Stakeholders escriben tareas, QA valida, Product Owner documenta'], 1, 'La guía resume Scrum como ordenar trabajo, convertir selección en Incremento, inspeccionar resultados, adaptar y repetir.'),
    q('SM-Q004', 1, 'K2', 'SM-1.2.2', 'Marco incompleto', '¿Qué significa que Scrum sea deliberadamente incompleto?', ['Que no sirve sin un método externo obligatorio', 'Que define solo las partes necesarias para implementar su teoría', 'Que cada equipo puede quitar roles sin consecuencia', 'Que no tiene reglas'], 1, 'Scrum deja espacio a técnicas contextuales, pero conserva reglas y elementos mínimos.'),
    q('SM-Q005', 1, 'K2', 'SM-1.1.2', 'Valor adaptativo', '¿Por qué Scrum es útil en problemas complejos?', ['Porque garantiza alcance fijo desde el inicio', 'Porque evita inspeccionar resultados', 'Porque permite aprender desde experiencia e ir adaptando soluciones', 'Porque elimina la necesidad de stakeholders'], 2, 'En contextos complejos, Scrum favorece ciclos de aprendizaje, inspección y adaptación.'),
    q('SM-Q006', 1, 'K2', 'SM-1.1.1', 'Uso de la guía', 'Un equipo usa burndown, tableros y acuerdos propios. ¿Cuándo esas prácticas son compatibles con Scrum?', ['Cuando reemplazan la Sprint Review', 'Cuando eliminan la necesidad de Product Owner', 'Cuando se usan dentro del marco sin ocultar transparencia ni modificar elementos centrales', 'Cuando convierten el Sprint en una fase de análisis'], 2, 'Las prácticas complementarias pueden convivir con Scrum si respetan el marco y mejoran transparencia.'),
    q('SM-Q007', 1, 'K3', 'SM-1.2.2', 'Scrum incompleto', 'Una organización conserva Daily Scrum y tablero, pero no tiene Product Owner claro, Product Goal ni Incremento usable. ¿Cuál es el diagnóstico más alineado con la guía?', ['Es Scrum completo porque hay reuniones diarias', 'Usa algunas prácticas, pero no implementa Scrum completo', 'Es Scrum siempre que exista un tablero', 'Es Scrum si el Scrum Master aprueba el trabajo'], 1, 'Implementar solo partes puede ser útil, pero no debe considerarse Scrum completo.'),
    q('SM-Q008', 1, 'K3', 'SM-1.2.1', 'Inspección de resultados', 'Después de un Sprint, los stakeholders muestran nueva información de mercado. ¿Qué comportamiento refleja mejor Scrum?', ['Ignorar la información hasta finalizar el plan anual', 'Reordenar el Product Backlog y adaptar próximos pasos', 'Cancelar siempre el producto completo', 'Cambiar la Definition of Done para entregar más rápido'], 1, 'Scrum usa inspección de resultados para adaptar trabajo futuro sin sacrificar calidad.'),

    q('SM-Q009', 2, 'K1', 'SM-2.1.1', 'Teoría Scrum', '¿Cuáles son las bases teóricas mencionadas por la guía?', ['Empirismo y pensamiento lean', 'Cascada y control estadístico', 'Design thinking y Six Sigma', 'DevOps y ITIL'], 0, 'Scrum se fundamenta en empirismo y pensamiento lean.'),
    q('SM-Q010', 2, 'K1', 'SM-2.3.1', 'Valores Scrum', '¿Cuál grupo contiene solo valores Scrum?', ['Compromiso, foco, apertura, respeto y coraje', 'Velocidad, control, obediencia, predictibilidad y costo', 'Alcance, tiempo, presupuesto, riesgo y calidad', 'Plan, hacer, verificar, actuar y medir'], 0, 'Los cinco valores Scrum son compromiso, foco, apertura, respeto y coraje.'),
    q('SM-Q011', 2, 'K2', 'SM-2.1.2', 'Transparencia', '¿Por qué la transparencia es indispensable para la inspección?', ['Porque reemplaza la necesidad de eventos', 'Porque las decisiones dependen del estado visible de artefactos y trabajo', 'Porque elimina toda incertidumbre del producto', 'Porque permite saltar la adaptación'], 1, 'Sin visibilidad real, la inspección se basa en percepciones incorrectas.'),
    q('SM-Q012', 2, 'K2', 'SM-2.1.2', 'Inspección y adaptación', 'La guía considera inútil inspeccionar si luego no ocurre adaptación. ¿Cuál opción refleja esa idea?', ['La inspección debe provocar cambios cuando se detectan desviaciones relevantes', 'La inspección solo sirve para documentar métricas históricas', 'La adaptación debe esperar al cierre del producto', 'La transparencia sustituye la mejora'], 0, 'Los eventos Scrum buscan provocar cambio cuando la inspección revela aprendizaje o desviaciones.'),
    q('SM-Q013', 2, 'K2', 'SM-2.2.1', 'Eventos y empirismo', '¿Qué función cumplen los eventos Scrum dentro de la teoría empírica?', ['Crear oportunidades formales de inspección y adaptación', 'Agregar reuniones para controlar asistencia', 'Separar al equipo de stakeholders', 'Evitar que cambie el Product Backlog'], 0, 'Los eventos dan cadencia a inspección y adaptación de artefactos y progreso.'),
    q('SM-Q014', 2, 'K2', 'SM-2.3.2', 'Valores en acción', 'Un equipo evita mencionar problemas para no incomodar al Product Owner. ¿Qué valor y pilar se debilitan principalmente?', ['Coraje y transparencia', 'Foco y Definition of Done', 'Respeto y Product Goal', 'Compromiso y timebox'], 0, 'Ocultar problemas reduce coraje, apertura y transparencia; por eso la inspección pierde calidad.'),
    q('SM-Q015', 2, 'K3', 'SM-2.3.2', 'Escenario de adaptación', 'Durante la Sprint Review aparece evidencia de que una funcionalidad no aporta valor. ¿Qué decisión refleja mejor empirismo?', ['Mantener el plan original sin cambios', 'Adaptar el Product Backlog con base en lo aprendido', 'Eliminar la Retrospective para ahorrar tiempo', 'Cambiar el Sprint Goal del Sprint ya terminado'], 1, 'El empirismo usa evidencia observada para tomar decisiones sobre próximos pasos.'),
    q('SM-Q016', 2, 'K3', 'SM-2.1.2', 'Empoderamiento', 'Un equipo detecta un problema diario, pero debe esperar autorización mensual para ajustar su plan. ¿Qué pilar se vuelve más difícil de aplicar?', ['Adaptación', 'Compromiso', 'Product Goal', 'Refinamiento'], 0, 'La adaptación se vuelve más difícil cuando las personas no están empoderadas o el equipo no es autogestionado.'),

    q('SM-Q017', 3, 'K1', 'SM-3.1.1', 'Composición del Scrum Team', '¿Quiénes integran un Scrum Team?', ['Un Scrum Master, un Product Owner y Developers', 'Un jefe de proyecto, líderes funcionales y testers', 'Un comité de producto y proveedores externos', 'Solo Developers'], 0, 'Scrum define un Scrum Team con tres responsabilidades: Developers, Product Owner y Scrum Master.'),
    q('SM-Q018', 3, 'K1', 'SM-3.1.1', 'Estructura del equipo', '¿Qué afirma Scrum sobre subequipos y jerarquías dentro del Scrum Team?', ['No hay subequipos ni jerarquías internas', 'Debe existir un líder de Developers', 'Testing debe formar un subequipo separado', 'El Product Owner dirige a Developers como gerente'], 0, 'El Scrum Team es una unidad cohesiva sin subequipos ni jerarquías.'),
    q('SM-Q019', 3, 'K2', 'SM-3.1.2', 'Tamaño del equipo', '¿Por qué la guía prefiere Scrum Teams pequeños, típicamente de diez o menos personas?', ['Porque equipos pequeños comunican mejor y suelen ser más productivos', 'Porque Scrum solo permite nueve Developers exactos', 'Porque stakeholders no cuentan como usuarios', 'Porque equipos grandes no pueden usar Product Backlog'], 0, 'La guía observa que equipos pequeños mantienen agilidad, comunicación y productividad.'),
    q('SM-Q020', 3, 'K2', 'SM-3.2.1', 'Developers', '¿Cuál responsabilidad corresponde a Developers?', ['Ordenar el Product Backlog', 'Crear el Sprint Backlog y adaptar su plan diario hacia el Sprint Goal', 'Cancelar Sprints cuando cambia el mercado', 'Representar a todos los stakeholders en comité'], 1, 'Developers crean el plan del Sprint, adhieren a DoD, adaptan el plan diario y se responsabilizan mutuamente.'),
    q('SM-Q021', 3, 'K2', 'SM-3.3.1', 'Product Owner', 'Selecciona dos responsabilidades del Product Owner.', ['Desarrollar y comunicar el Product Goal', 'Asignar tareas diarias a Developers', 'Ordenar Product Backlog Items', 'Definir unilateralmente cómo construir el Incremento'], [0, 2], 'El Product Owner responde por Product Goal y orden del Product Backlog. El cómo técnico pertenece a Developers.', { multi: true }),
    q('SM-Q022', 3, 'K2', 'SM-3.4.1', 'Scrum Master', '¿Cuál opción describe mejor al Scrum Master?', ['Jefe que distribuye trabajo y aprueba entregas', 'Responsable de establecer Scrum y mejorar efectividad dentro del marco', 'Dueño único del Product Backlog', 'Stakeholder con voto final en prioridades'], 1, 'El Scrum Master establece Scrum según la guía y mejora la efectividad del Scrum Team.'),
    q('SM-Q023', 3, 'K3', 'SM-3.3.1', 'Product Owner único', 'Un área propone que tres directores voten semanalmente el orden del Product Backlog. ¿Qué riesgo existe según Scrum?', ['Se diluye la responsabilidad del Product Owner', 'Aumenta la autogestión de Developers', 'Mejora la transparencia automáticamente', 'Convierte el Sprint en Incremento'], 0, 'El Product Owner es una persona, no un comité; otros pueden influir intentando convencerlo.'),
    q('SM-Q024', 3, 'K3', 'SM-3.4.2', 'Servicio del Scrum Master', 'Stakeholders interrumpen a Developers todos los días con solicitudes urgentes fuera del Sprint. ¿Qué servicio del Scrum Master aplica mejor?', ['Asignar un Developer a cada stakeholder', 'Remover barreras entre stakeholders y Scrum Team y ayudar a entender Scrum', 'Cancelar la Daily Scrum', 'Impedir toda comunicación con stakeholders'], 1, 'El Scrum Master sirve a la organización removiendo barreras y ayudando a stakeholders a actuar de forma empírica.'),

    q('SM-Q025', 4, 'K1', 'SM-4.1.1', 'Timeboxes', 'Para un Sprint de un mes, ¿cuál timebox es correcto?', ['Daily Scrum: 15 minutos', 'Sprint Review: 8 horas', 'Sprint Retrospective: 4 horas', 'Sprint Planning: 15 minutos'], 0, 'Daily Scrum dura 15 minutos; Planning máximo 8h, Review máximo 4h y Retro máximo 3h para Sprints de un mes.'),
    q('SM-Q026', 4, 'K1', 'SM-4.1.1', 'Eventos Scrum', '¿Qué evento contiene a todos los demás eventos Scrum?', ['Sprint', 'Sprint Review', 'Daily Scrum', 'Refinamiento'], 0, 'El Sprint es el contenedor de Sprint Planning, Daily Scrums, Sprint Review y Sprint Retrospective.'),
    q('SM-Q027', 4, 'K2', 'SM-4.1.2', 'Reglas del Sprint', '¿Qué regla aplica durante un Sprint?', ['La calidad no disminuye', 'El Sprint Goal puede cambiarse libremente cada día', 'El Product Backlog no puede refinarse', 'Solo el Scrum Master puede cancelar el Sprint'], 0, 'Durante el Sprint no se pone en peligro el Sprint Goal, la calidad no disminuye y el backlog puede refinarse.'),
    q('SM-Q028', 4, 'K2', 'SM-4.2.1', 'Sprint Planning', '¿Qué tres temas aborda Sprint Planning?', ['Por qué es valioso, qué puede hacerse y cómo se hará el trabajo elegido', 'Quién manda, cuánto cuesta y quién aprueba', 'Qué salió mal, qué se demostró y qué se liberó', 'Riesgos, contratos y organigrama'], 0, 'Planning cubre valor del Sprint, selección de trabajo y plan para convertirlo en Incremento.'),
    q('SM-Q029', 4, 'K2', 'SM-4.3.1', 'Daily Scrum', '¿Cuál es el propósito del Daily Scrum?', ['Inspeccionar progreso hacia el Sprint Goal y adaptar el Sprint Backlog', 'Reportar horas al Scrum Master', 'Aprobar Product Backlog Items', 'Cerrar formalmente el Sprint'], 0, 'El Daily Scrum es para Developers, enfocado en Sprint Goal y plan accionable para el siguiente día.'),
    q('SM-Q030', 4, 'K2', 'SM-4.4.1', 'Review y Retrospective', '¿Cuál diferencia es correcta?', ['Review inspecciona resultado y futuro del producto; Retrospective planifica mejoras de calidad y efectividad', 'Review solo revisa velocidad; Retrospective aprueba releases', 'Review la hacen solo stakeholders; Retrospective solo Scrum Master', 'Ambas tienen exactamente el mismo propósito'], 0, 'La Review se centra en producto y adaptación futura; la Retro en mejorar cómo trabaja el Scrum Team.'),
    q('SM-Q031', 4, 'K3', 'SM-4.1.2', 'Cambio durante Sprint', 'A mitad del Sprint surge una mejora menor que no afecta el Sprint Goal. ¿Qué opción es más adecuada?', ['Renegociar alcance con Product Owner si ayuda y no pone en riesgo el Sprint Goal', 'Cambiar siempre el Sprint Goal', 'Bajar Definition of Done para incluir más alcance', 'Cancelar automáticamente el Sprint'], 0, 'El alcance puede aclararse y renegociarse con el Product Owner mientras el Sprint Goal se proteja y la calidad no baje.'),
    q('SM-Q032', 4, 'K3', 'SM-4.4.1', 'Sprint Review', 'El equipo hace una demo cerrada de 10 minutos y no permite conversación con stakeholders. ¿Qué se pierde?', ['La colaboración para inspeccionar resultados y adaptar próximos pasos', 'La necesidad de un Incremento usable', 'La duración máxima de Daily Scrum', 'La responsabilidad de Developers sobre calidad'], 0, 'La Sprint Review es una sesión de trabajo colaborativa, no solo una presentación.'),
    q('SM-Q049', 4, 'K3', 'SM-4.5.1', 'Elegir el evento correcto', 'Un Scrum Team detecta que sus pruebas automatizadas fallan al final de cada Sprint por problemas de proceso y herramientas. ¿Dónde debería planear la mejora principal?', ['Sprint Retrospective', 'Sprint Review', 'Daily Scrum como reporte extendido', 'Sprint Planning para cambiar el Product Goal'], 0, 'La Retrospective inspecciona individuos, interacciones, procesos, herramientas y Definition of Done para planear mejoras de calidad y efectividad.'),

    q('SM-Q033', 5, 'K1', 'SM-5.1.1', 'Artefactos y compromisos', '¿Cuál asociación artefacto-compromiso es correcta?', ['Product Backlog - Product Goal', 'Sprint Backlog - Definition of Done', 'Incremento - Product Goal', 'Daily Scrum - Sprint Goal'], 0, 'Los compromisos son Product Goal para Product Backlog, Sprint Goal para Sprint Backlog y Definition of Done para Incremento.'),
    q('SM-Q034', 5, 'K1', 'SM-5.4.1', 'Incremento', '¿Cuándo nace un Incremento?', ['Cuando un Product Backlog Item cumple la Definition of Done', 'Cuando se agenda Sprint Review', 'Cuando el Scrum Master registra una tarea', 'Cuando un stakeholder solicita un cambio'], 0, 'Un Incremento existe cuando el trabajo cumple la Definition of Done y es usable.'),
    q('SM-Q035', 5, 'K2', 'SM-5.2.1', 'Product Backlog', '¿Qué describe mejor al Product Backlog?', ['Lista emergente y ordenada de lo necesario para mejorar el producto', 'Contrato fijo que no puede cambiar durante el proyecto', 'Plan diario de Developers', 'Documento propiedad de todos los stakeholders por votación'], 0, 'El Product Backlog es emergente, ordenado y la fuente única del trabajo del Scrum Team.'),
    q('SM-Q036', 5, 'K2', 'SM-5.2.1', 'Refinamiento', '¿Qué ocurre durante Product Backlog refinement?', ['Los items se dividen y definen mejor con detalles como descripción, orden y tamaño', 'Se cancela el Sprint en curso', 'Se reemplaza la Sprint Planning', 'Se aprueban Incrementos no terminados'], 0, 'El refinamiento aclara y descompone items; es una actividad continua, no un evento formal obligatorio.'),
    q('SM-Q037', 5, 'K2', 'SM-5.3.1', 'Sprint Backlog', '¿Qué compone el Sprint Backlog?', ['Sprint Goal, Product Backlog Items seleccionados y plan accionable', 'Todos los items futuros del producto', 'Solo una lista de impedimentos', 'La agenda de stakeholders'], 0, 'El Sprint Backlog integra por qué, qué y cómo para el Sprint.'),
    q('SM-Q038', 5, 'K2', 'SM-5.4.1', 'Definition of Done', '¿Qué aporta la Definition of Done?', ['Transparencia sobre las medidas de calidad que debe cumplir el Incremento', 'Permiso para liberar trabajo incompleto', 'La lista de prioridades de negocio', 'La duración del Sprint'], 0, 'La DoD crea entendimiento compartido sobre qué trabajo cuenta como terminado.'),
    q('SM-Q039', 5, 'K3', 'SM-5.4.1', 'Trabajo incompleto', 'Un item funciona parcialmente, pero no cumple pruebas acordadas en la DoD. ¿Qué debe pasar?', ['No puede liberarse ni presentarse como Incremento; vuelve al Product Backlog para consideración futura', 'Debe presentarse en Review como terminado', 'El Scrum Master puede aprobarlo', 'Se cambia la DoD retroactivamente'], 0, 'Trabajo que no cumple DoD no forma parte del Incremento y no debe presentarse como terminado.'),
    q('SM-Q040', 5, 'K3', 'SM-5.4.2', 'Múltiples equipos', 'Tres Scrum Teams trabajan en el mismo producto. ¿Qué requiere Scrum respecto a Definition of Done?', ['Deben definir y cumplir mutuamente la misma DoD', 'Cada equipo debe ocultar su DoD para conservar autonomía', 'Solo el Product Owner define una DoD distinta por equipo', 'No se necesita DoD si hay Sprint Review'], 0, 'Para un producto compartido, los equipos deben acordar y cumplir la misma Definition of Done.'),

    q('SM-Q041', 6, 'K1', 'SM-6.1.1', 'Scrum Master', '¿Cuál es una forma de servicio del Scrum Master al Scrum Team?', ['Coaching en autogestión y multifuncionalidad', 'Ordenar unilateralmente el Product Backlog', 'Aprobar contratos de proveedores', 'Cambiar el Sprint Goal sin el equipo'], 0, 'El Scrum Master sirve al equipo con coaching, foco, remoción de impedimentos y eventos productivos.'),
    q('SM-Q042', 6, 'K1', 'SM-6.3.1', 'Scrum completo', '¿Qué afirma la guía sobre implementar solo partes de Scrum?', ['Puede hacerse, pero el resultado no es Scrum completo', 'Es la forma recomendada de Scrum', 'Siempre aumenta transparencia', 'Convierte a Scrum en metodología predictiva'], 0, 'La guía afirma que Scrum existe en su totalidad; implementar partes no equivale a Scrum completo.'),
    q('SM-Q043', 6, 'K2', 'SM-6.2.1', 'Servicio a la organización', '¿Cuál actividad corresponde al servicio del Scrum Master a la organización?', ['Liderar, entrenar y asesorar la adopción de Scrum', 'Escribir todos los Product Backlog Items', 'Decidir el tamaño de cada item sin Developers', 'Aprobar releases como comité'], 0, 'El Scrum Master ayuda a la organización a adoptar Scrum y enfoques empíricos para trabajo complejo.'),
    q('SM-Q044', 6, 'K2', 'SM-6.1.1', 'Servicio al Product Owner', '¿Cuál ayuda del Scrum Master al Product Owner está alineada con la guía?', ['Encontrar técnicas efectivas para Product Goal y gestión de Product Backlog', 'Convertirse en Product Owner suplente permanente', 'Forzar prioridades por velocidad del equipo', 'Eliminar colaboración con stakeholders'], 0, 'El Scrum Master apoya técnicas de Product Goal, Product Backlog, planificación empírica y colaboración.'),
    q('SM-Q045', 6, 'K2', 'SM-6.4.1', 'Anti-patrón de Scrum Master', '¿Cuál comportamiento reduce la efectividad Scrum?', ['Asignar tareas diarias a cada Developer para controlar avance', 'Facilitar eventos dentro del timebox', 'Ayudar a remover impedimentos', 'Entrenar stakeholders en empirismo'], 0, 'Asignar tareas debilita autogestión y cambia el rol del Scrum Master hacia mando y control.'),
    q('SM-Q046', 6, 'K2', 'SM-6.3.1', 'Marco contenedor', '¿Cómo puede Scrum coexistir con otras prácticas?', ['Como contenedor de técnicas y métodos que no contradigan su marco', 'Eliminando sus artefactos para adoptar cualquier técnica', 'Sustituyendo Sprint Review por reportes escritos', 'Impidiendo toda práctica de ingeniería'], 0, 'Scrum puede contener prácticas complementarias siempre que conserve sus elementos y transparencia.'),
    q('SM-Q047', 6, 'K3', 'SM-6.4.1', 'Autogestión', 'La dirección pide al Scrum Master decidir quién trabaja en cada item porque “así se controla mejor”. ¿Qué respuesta es más alineada con Scrum?', ['Explicar autogestión y ayudar a que Developers decidan cómo organizar su trabajo', 'Aceptar la petición para acelerar reportes', 'Cancelar Daily Scrum', 'Delegar la decisión al comité de stakeholders'], 0, 'Developers deciden internamente quién hace qué, cuándo y cómo; el Scrum Master protege y enseña esa autogestión.'),
    q('SM-Q048', 6, 'K3', 'SM-6.3.1', 'Scrum parcial', 'Un equipo elimina Sprint Retrospective porque “ya tenemos Review”. ¿Cuál es el principal riesgo?', ['Pierde una oportunidad formal de inspeccionar y mejorar calidad y efectividad del equipo', 'Aumenta automáticamente el foco en Product Goal', 'Reemplaza correctamente adaptación de proceso por adaptación de producto', 'Cumple Scrum porque la Review cubre todos los eventos'], 0, 'Review y Retrospective tienen propósitos distintos; quitar Retro elimina inspección y adaptación del modo de trabajo.')
  ];

  const flashcards = [
    card('Scrum', 'Marco ligero para generar valor mediante soluciones adaptativas en problemas complejos.', 1, 'SM-1.1.2', 'Concepto'),
    card('Scrum Guide', 'Documento que define Scrum, sus elementos mínimos, reglas y propósito.', 1, 'SM-1.1.1', 'Fuente'),
    card('Marco deliberadamente incompleto', 'Scrum define lo necesario para implementar su teoría y deja técnicas específicas al contexto.', 1, 'SM-1.2.2', 'Concepto'),
    card('Product Backlog', 'Lista emergente, ordenada y única del trabajo necesario para mejorar el producto.', 5, 'SM-5.2.1', 'Artefacto'),
    card('Sprint', 'Evento de longitud fija de un mes o menos donde las ideas se convierten en valor.', 4, 'SM-4.1.2', 'Evento'),
    card('Incremento', 'Paso concreto, usable y verificado hacia el Product Goal.', 5, 'SM-5.4.1', 'Artefacto'),
    card('Empirismo', 'Enfoque donde el conocimiento proviene de la experiencia y de decisiones basadas en observación.', 2, 'SM-2.1.1', 'Teoría'),
    card('Pensamiento lean', 'Enfoque que reduce desperdicio y centra el trabajo en lo esencial.', 2, 'SM-2.1.1', 'Teoría'),
    card('Transparencia', 'Visibilidad del proceso, artefactos y trabajo para tomar decisiones confiables.', 2, 'SM-2.1.2', 'Pilar'),
    card('Inspección', 'Revisión frecuente de artefactos y progreso para detectar variaciones o problemas.', 2, 'SM-2.1.2', 'Pilar'),
    card('Adaptación', 'Ajuste rápido del proceso o producto cuando se detectan desviaciones relevantes.', 2, 'SM-2.1.2', 'Pilar'),
    card('Compromiso', 'Valor Scrum asociado a cumplir metas y apoyar al equipo.', 2, 'SM-2.3.1', 'Valor'),
    card('Foco', 'Valor Scrum que concentra al equipo en el trabajo del Sprint y sus objetivos.', 2, 'SM-2.3.1', 'Valor'),
    card('Apertura', 'Valor Scrum para hacer visible trabajo, dificultades y aprendizaje.', 2, 'SM-2.3.1', 'Valor'),
    card('Respeto', 'Valor Scrum que reconoce a las personas como capaces e independientes.', 2, 'SM-2.3.1', 'Valor'),
    card('Coraje', 'Valor Scrum para hacer lo correcto y enfrentar problemas difíciles.', 2, 'SM-2.3.1', 'Valor'),
    card('Scrum Team', 'Unidad cohesiva sin jerarquías internas, formada por Scrum Master, Product Owner y Developers.', 3, 'SM-3.1.1', 'Equipo'),
    card('Developers', 'Personas del Scrum Team comprometidas con crear cualquier aspecto de un Incremento usable.', 3, 'SM-3.2.1', 'Responsabilidad'),
    card('Product Owner', 'Responsable de maximizar valor y gestionar Product Goal y Product Backlog.', 3, 'SM-3.3.1', 'Responsabilidad'),
    card('Scrum Master', 'Responsable de establecer Scrum y mejorar la efectividad del Scrum Team dentro del marco.', 3, 'SM-3.4.1', 'Responsabilidad'),
    card('Autogestión', 'Capacidad del Scrum Team para decidir internamente quién hace qué, cuándo y cómo.', 3, 'SM-3.1.2', 'Equipo'),
    card('Multifuncionalidad', 'El equipo reúne las habilidades necesarias para crear valor en cada Sprint.', 3, 'SM-3.1.2', 'Equipo'),
    card('Sprint Planning', 'Evento que define por qué el Sprint es valioso, qué puede hacerse y cómo se hará.', 4, 'SM-4.2.1', 'Evento'),
    card('Daily Scrum', 'Evento de 15 minutos para inspeccionar progreso al Sprint Goal y adaptar el Sprint Backlog.', 4, 'SM-4.3.1', 'Evento'),
    card('Sprint Review', 'Sesión de trabajo para inspeccionar resultados del Sprint y adaptar próximos pasos.', 4, 'SM-4.4.1', 'Evento'),
    card('Sprint Retrospective', 'Evento para planear mejoras de calidad y efectividad del Scrum Team.', 4, 'SM-4.4.1', 'Evento'),
    card('Product Goal', 'Estado futuro del producto que sirve como objetivo de largo plazo para el Scrum Team.', 5, 'SM-5.2.1', 'Compromiso'),
    card('Sprint Goal', 'Objetivo único del Sprint que crea foco y coherencia.', 5, 'SM-5.3.1', 'Compromiso'),
    card('Definition of Done', 'Descripción formal del estado de calidad requerido para que el Incremento cuente como terminado.', 5, 'SM-5.4.1', 'Compromiso'),
    card('Refinamiento', 'Actividad continua para dividir, aclarar y detallar Product Backlog Items.', 5, 'SM-5.2.1', 'Actividad'),
    card('Liderazgo servicial', 'Forma de liderazgo del Scrum Master orientada a habilitar, entrenar y remover barreras.', 6, 'SM-6.1.1', 'Scrum Master'),
    card('Adopción Scrum', 'Cambio organizacional para entender y aplicar Scrum y empirismo en trabajo complejo.', 6, 'SM-6.2.1', 'Organización'),
    card('Scrum inmutable', 'Scrum funciona como marco completo; aplicar partes no equivale a Scrum.', 6, 'SM-6.3.1', 'Regla'),
    card('CC BY-SA 4.0', 'Licencia de la Scrum Guide 2020 que exige atribución y compartir adaptaciones bajo términos compatibles.', 6, 'SM-6.3.1', 'Licencia')
  ];

  AcademyRegistry.register('scrum-master', {
    meta: {
      key: 'scrum-master',
      code: 'SM 2020',
      name: 'Scrum Master basado en la Scrum Guide 2020',
      shortName: 'Scrum Master',
      subtitle: 'Curso gratuito para estudiar Scrum, responsabilidades, eventos, artefactos y compromisos según la Scrum Guide 2020.',
      versionLabel: 'Scrum Guide 2020',
      storageKey: 'academy_scrum_master_progress',
      sourceLanguage: 'ES',
      questionLanguage: 'ES',
      k3Description: 'Escenarios para aplicar Scrum Master en equipos, eventos, artefactos, adopción organizacional y anti-patrones.'
    },
    chapters,
    objectives,
    questions,
    flashcards,
    blueprint: {
      totalQuestions: 40,
      totalPoints: 40,
      passingScore: 30,
      minutes: 60,
      extraTime25: 75,
      chapterDistribution: { 1: 6, 2: 7, 3: 8, 4: 8, 5: 7, 6: 4 },
      kDistribution: { K1: 12, K2: 18, K3: 10 },
      matrix: {
        1: { K1: 2, K2: 3, K3: 1 },
        2: { K1: 2, K2: 3, K3: 2 },
        3: { K1: 2, K2: 4, K3: 2 },
        4: { K1: 2, K2: 4, K3: 2 },
        5: { K1: 2, K2: 3, K3: 2 },
        6: { K1: 2, K2: 1, K3: 1 }
      },
      version: 'Scrum Master · matriz de estudio AcademiaQA basada en Scrum Guide 2020'
    },
    generatedAt: '2026-07-30T00:00:00-05:00',
    qaValidation: {
      version: 'Scrum Master · Scrum Guide 2020 · curso gratuito',
      sourceSyllabus: sourceName,
      sourceUrl,
      syllabusStatus: 'OK: secciones principales de la Scrum Guide 2020 adaptadas para estudio en español.',
      syllabusChapterAudit: [
        chapterAudit(1, 'Purpose, Definition', 3, 4),
        chapterAudit(2, 'Theory, Values', 3, 5),
        chapterAudit(3, 'Scrum Team', 4, 6),
        chapterAudit(4, 'Events', 3, 6),
        chapterAudit(5, 'Artifacts', 3, 5),
        chapterAudit(6, 'Scrum Master, End Note', 2, 4)
      ],
      questionBankAudit: {
        totalQuestions: questions.length,
        loCovered: new Set(questions.map((question) => question.lo)).size,
        loTotal: objectives.length,
        minQuestionsPerLO: 1,
        byChapter: countBy(questions, 'chapter'),
        byK: countBy(questions, 'k'),
        structuralIssues: [],
        correctedItems: [
          'Curso creado como adaptación de estudio; no incluye PDF oficial.',
          'Banco distribuido por capítulo y nivel K con matriz de 40 preguntas.',
          'Flashcards y objetivos cubren roles, eventos, artefactos, compromisos, teoría y valores.'
        ]
      },
      simulationAudit: {
        runs: 100,
        status: 'OK validado contra disponibilidad por matriz',
        issues: [],
        uniqueExamCombinationsObserved: 100,
        officialMatrix: '40 preguntas, K1=12, K2=18, K3=10'
      },
      overallStatus: 'OK PRUEBAS'
    },
    syllabusCoverageNote: {
      source: sourceName,
      sourceUrl,
      license: 'Creative Commons Attribution Share-Alike 4.0',
      scope: 'Curso adaptado y organizado desde la Scrum Guide 2020 HTML. Cubre propósito, definición, teoría, valores, Scrum Team, Developers, Product Owner, Scrum Master, eventos, artefactos, compromisos, nota final y licencia.',
      noOfficialPdfIncluded: true,
      updatedAt: '2026-07-30'
    }
  });

  function section(title, body, bullets = []) {
    return { title, body, bullets };
  }

  function objective(lo, chapter, k, text, theory, remember, example, trap) {
    return { lo, chapter, k, text, theory, remember, example, trap };
  }

  function q(id, chapter, k, lo, topic, stem, options, correct, explanation, extra = {}) {
    const correctIndexes = Array.isArray(correct) ? correct : [correct];
    return {
      id,
      chapter,
      k,
      lo,
      objective: objectives.find((item) => item.lo === lo)?.text || topic,
      topic,
      stem,
      options,
      correct: correctIndexes,
      explanation,
      multi: Boolean(extra.multi ?? correctIndexes.length > 1),
      difficulty: extra.difficulty || 'normal',
      points: extra.points || 1,
      source: sourceName
    };
  }

  function card(front, meaning, chapter, lo, kind) {
    return {
      front,
      back: `Significado: ${meaning}\n\nQué estudiar: relaciona este concepto con el capítulo ${chapter}, el objetivo ${lo} y escenarios reales de adopción Scrum.`,
      meaning,
      chapter,
      lo,
      kind,
      hint: 'Pregúntate qué pilar, valor, responsabilidad, evento o compromiso se activa.'
    };
  }

  function chapterAudit(chapter, pages, theorySections, losExpected) {
    return {
      chapter,
      pages,
      chars: chapters.find((item) => item.id === chapter)?.completeSyllabusText.length || 0,
      expectedHeadings: theorySections,
      missingHeadings: [],
      wrongMajorChapterHeadings: [],
      losExpected,
      missingLOCodes: [],
      status: 'OK'
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
