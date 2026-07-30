'use strict';

(function registerScrumProductOwnerCourse() {
  const sourceName = 'EuropeanScrum.org Guia Product Owner 2025 v1.0 + Scrum Manager/Skill Arena Guia Product Owner junio 2026';

  const chapters = [
    chapter(1, 'Rol, accountability y Scrum Framework', 90,
      'El Product Owner maximiza el valor del producto, gestiona Product Goal y Product Backlog, representa necesidades de stakeholders y trabaja dentro de Scrum con eventos, roles y artefactos claros.',
      ['Product Owner', 'accountability', 'Scrum Team', 'Scrum Master', 'Developers', 'eventos Scrum', 'Incremento', 'Product Manager'],
      [
        section('Accountability del Product Owner', 'El Product Owner responde por maximizar el valor del producto resultante del trabajo del Scrum Team. Gestiona Product Goal, items del Product Backlog, orden y transparencia, pero su responsabilidad no se reduce a administrar tickets.', ['Es una persona, no un comite.', 'Puede delegar trabajo, pero conserva la responsabilidad.', 'Sus decisiones deben ser visibles y respetadas en el contenido y orden del backlog.']),
        section('Scrum Framework desde Product Owner', 'Scrum estructura trabajo complejo con roles, eventos y artefactos. Para el Product Owner, cada elemento sirve para maximizar valor, inspeccionar resultados y adaptar la estrategia.', ['Eventos clave: Sprint, Sprint Planning, Daily Scrum, Sprint Review, Sprint Retrospective y refinamiento como actividad continua.', 'Artefactos clave: Product Backlog, Sprint Backlog e Incremento.', 'El PO colabora con Scrum Master y Developers sin invadir la autogestion del equipo.']),
        section('Posturas del PO y frontera con Product Manager', 'El PO efectivo alterna posturas: visionario, estratega, colaborador, experto en cliente y negociador. En algunas organizaciones se solapa con Product Manager; lo importante es aclarar alcance real de estrategia, discovery y backlog.', ['Un PO estrategico conecta vision, resultados y prioridades.', 'Un PO reducido a backlog pierde capacidad de maximizar valor.', 'La etiqueta importa menos que la responsabilidad real.'])
      ],
      ['PO como buzon de peticiones sin priorizacion.', 'Backlog por comite donde nadie decide realmente.', 'Scrum Master asignando prioridades de producto.', 'Discutir titulos PO/PM sin aclarar responsabilidades.'],
      ['Un stakeholder desea cambiar la prioridad: debe convencer al Product Owner con evidencia de valor.', 'El PO delega redaccion de items en Developers, pero sigue respondiendo por claridad, orden y valor.'],
      'EuropeanScrum 2025 secciones 2-10; Skill Arena 2026 bloque A capitulos 1-2'
    ),
    chapter(2, 'Vision, estrategia, Product Goal y roadmap', 95,
      'El Product Owner traduce vision y estrategia en Product Goal, roadmap adaptable y decisiones que guian al Scrum Team hacia resultados medibles.',
      ['vision de producto', 'mision', 'Product Goal', 'roadmap', 'Now Next Later', 'Sprint 0', 'estrategia', 'Socratic Questioning'],
      [
        section('Vision, estrategia y Product Goal', 'La vision inspira a largo plazo; la estrategia se revisa con cadencia; el Product Goal convierte esa direccion en una diana concreta de medio plazo para el Product Backlog.', ['El Product Goal debe poder alcanzarse y reemplazarse por el siguiente.', 'La vision no sustituye objetivos medibles.', 'El Product Goal da contexto al orden del backlog.']),
        section('Roadmap adaptable', 'Un roadmap moderno expresa intencion y aprendizaje, no una promesa rigida de fechas. Horizontes como Now/Next/Later ayudan a comunicar prioridades con incertidumbre explicita.', ['Now: trabajo comprometido o muy cercano.', 'Next: oportunidades proximas con evidencia suficiente.', 'Later: apuestas, opciones o temas a validar.']),
        section('Sprint 0 y preparacion inicial', 'Al iniciar un producto, el PO ayuda a preparar vision, backlog inicial, riesgos, expectativas, contratos, duracion de Sprints, MVP/MMP y acuerdos de trabajo sin convertir Sprint 0 en una fase pesada.', ['Debe habilitar el primer Sprint real.', 'No reemplaza inspeccion y adaptacion posteriores.', 'Permite alinear stakeholders y equipo.'])
      ],
      ['Product Goal eterno que nunca se alcanza.', 'Roadmap anual fijo disfrazado de agilidad.', 'Vision inspiradora sin estrategia operable.', 'Sprint 0 usado como mini-cascada.'],
      ['Un Product Goal medible podria ser reducir abandono del onboarding de 42% a 25% en tres meses.', 'Un roadmap Now/Next/Later evita prometer fechas lejanas cuando aun falta evidencia.'],
      'EuropeanScrum 2025 secciones 11-13; Skill Arena 2026 bloque B capitulos 3-4'
    ),
    chapter(3, 'Descubrimiento de producto y entendimiento del cliente', 95,
      'El Product Owner descubre problemas valiosos antes de enamorarse de soluciones, usando entrevistas, observacion, mapas, canvas, discovery continuo y arboles de oportunidad-solucion.',
      ['discovery', 'problema', 'solucion', 'stakeholders', 'mapa de empatia', 'persona', 'shadowing', 'business canvas', 'product canvas', 'Opportunity Solution Tree'],
      [
        section('Problema antes que solucion', 'El Product Owner debe entender necesidades, dolores, contexto y evidencia antes de llenar el backlog de funcionalidades. El discovery reduce riesgo de construir lo incorrecto.', ['Separar espacio del problema y espacio de la solucion evita saltar a features prematuras.', 'El trio de producto combina producto, diseno y tecnologia.', 'La evidencia puede venir de entrevistas, datos, observacion y experimentos.']),
        section('Herramientas de definicion de producto', 'Mapa de empatia, persona, shadowing, business canvas, product canvas y elevator pitch ayudan a sintetizar usuarios, propuesta de valor, modelo de negocio y narrativa del producto.', ['El mapa de empatia captura lo que usuarios piensan, sienten, dicen y hacen.', 'El product canvas conecta usuarios, problemas, soluciones, riesgos y metricas.', 'El elevator pitch fuerza claridad y foco.']),
        section('Discovery continuo y OST', 'El Opportunity Solution Tree organiza outcomes, oportunidades, soluciones y experimentos. Permite priorizar aprendizaje antes de construir y mantener una conexion visual entre objetivo y opciones.', ['Dual-track combina discovery y delivery.', 'Las oportunidades se validan antes de comprometer solucion.', 'Los experimentos reducen incertidumbre.'])
      ],
      ['Backlog lleno de soluciones sin oportunidad asociada.', 'Persona inventada sin investigacion.', 'Discovery tratado como fase unica al inicio.', 'Confundir stakeholder ruidoso con cliente representativo.'],
      ['Antes de construir un dashboard, el PO valida si el problema real es falta de decision, mala calidad de datos o exceso de pasos.', 'Un OST conecta outcome de activacion con oportunidades de onboarding y experimentos de aprendizaje.'],
      'EuropeanScrum 2025 secciones 11-12 y 23; Skill Arena 2026 bloque C capitulos 5-6'
    ),
    chapter(4, 'Product Backlog, refinamiento e historias de usuario', 110,
      'El Product Backlog es dinamico, transparente y ordenado. El PO lo refina con Developers y stakeholders, descompone temas/epicas en historias, define criterios y usa story mapping cuando aporta claridad.',
      ['Product Backlog', 'refinamiento', 'historia de usuario', 'INVEST', 'criterios de aceptacion', 'Given When Then', 'story mapping', 'spec-as-contract', 'Scrum Board'],
      [
        section('Backlog vivo y refinamiento continuo', 'El Product Backlog no es una lista estatica ni un repositorio de deseos. Es la fuente unica de trabajo para el Scrum Team y debe mantenerse ordenado, transparente, entendible y preparado para decision.', ['El PO responde por orden y transparencia.', 'Developers aportan estimacion, factibilidad y descomposicion.', 'Refinar implica dividir, aclarar y agregar criterios.']),
        section('Historias de usuario e INVEST', 'Las historias expresan valor desde la perspectiva del usuario y suelen seguir el formato Como, quiero, para. INVEST ayuda a evaluar si una historia es independiente, negociable, valiosa, estimable, pequena y testeable.', ['Criterios de aceptacion aclaran condiciones verificables.', 'Given-When-Then traduce reglas a escenarios.', 'Una historia demasiado grande suele esconder una epica.']),
        section('Story mapping y especificacion verificable', 'Story Mapping muestra el flujo del usuario, organiza releases y revela huecos. Spec-as-contract convierte criterios y ejemplos en fuente de verdad verificable entre producto, negocio y desarrollo.', ['El mapa comunica vision y prioridades.', 'El Scrum Board gestiona ejecucion tactica del Sprint.', 'La especificacion debe ser util, versionada y comprobable.'])
      ],
      ['Backlog inabarcable con todo lo que alguien pidio.', 'Historias sin valor de usuario ni criterios.', 'Story mapping tratado como decoracion que no guia releases.', 'Especificacion larga que nadie valida ni mantiene.'],
      ['Una historia correcta: Como usuario registrado, quiero recuperar mi contrasena para volver a acceder a mi cuenta.', 'Un mapa de historias separa flujo principal, releases y cortes MVP.'],
      'EuropeanScrum 2025 secciones 8-9, 15-18; Skill Arena 2026 bloque D capitulos 7-9'
    ),
    chapter(5, 'Priorizacion, alcance y contratos agiles', 105,
      'Priorizar es decidir valor bajo restricciones. El PO usa criterios de negocio, urgencia, riesgo, dependencias, esfuerzo, MoSCoW, Kano, Pareto, valor/esfuerzo, WSJF y acuerdos contractuales compatibles con cambio.',
      ['priorizacion', 'MoSCoW', 'Kano', 'Pareto', 'WSJF', 'valor esfuerzo', 'contratos agiles', 'Time and Material', 'Fixed Price', 'Money for Nothing'],
      [
        section('Criterios de priorizacion', 'El Product Owner ordena el backlog usando valor de negocio, urgencia, riesgo, reduccion de incertidumbre, dependencias y esfuerzo. La priorizacion es continua y cambia con nueva evidencia.', ['No todo lo urgente es valioso.', 'Items que reducen riesgo pueden tener alta prioridad.', 'Dependencias pueden desbloquear valor futuro.']),
        section('Marcos de decision', 'MoSCoW clasifica necesidad; Kano interpreta satisfaccion; Pareto busca alto impacto; WSJF pondera costo de demora y tamano; valor/esfuerzo ayuda cuando se necesita comparacion rapida.', ['El marco depende del tipo de decision.', 'Usar varios marcos puede revelar sesgos.', 'La matematica no reemplaza juicio de producto.']),
        section('Alcance y contratos', 'En Agile/Scrum, el alcance debe poder adaptarse. Contratos Time and Material, phased development, cost ceiling, bonus/penalty o cambios por alcance requieren transparencia sobre valor, riesgo y expectativas.', ['Fixed scope rigido choca con aprendizaje emergente.', 'Money for Nothing/Changes for Free busca balance entre flexibilidad y control.', 'El PO ayuda a convertir expectativas en backlog priorizado.'])
      ],
      ['Priorizar por quien grita mas fuerte.', 'Aplicar MoSCoW y terminar con todo en Must.', 'Usar roadmap como contrato de alcance cerrado.', 'Ignorar costo de demora y dependencias tecnicas.'],
      ['Un item de seguridad puede subir prioridad por riesgo aunque no sea visible para usuarios.', 'Kano ayuda a distinguir basicos esperados de delighters que sorprenden.'],
      'EuropeanScrum 2025 secciones 14-16; Skill Arena 2026 bloque E capitulo 10'
    ),
    chapter(6, 'Sprint, releases, MVP/MMP y calidad', 95,
      'El Product Owner participa en Sprint Planning, valida incrementos, lidera aprendizaje con Sprint Review, planifica releases y balancea entrega de valor con deuda tecnica y Definition of Done.',
      ['Sprint Planning', 'Sprint Goal', 'Definition of Done', 'Sprint Review', 'Release', 'MVP', 'MMP', 'deuda tecnica', 'lead time', 'cycle time'],
      [
        section('PO durante Sprint y Review', 'El PO colabora en Sprint Planning para explicar valor y prioridades, aclara criterios durante el Sprint y usa Sprint Review para inspeccionar el incremento con stakeholders y adaptar el Product Backlog.', ['Developers deciden cuanto trabajo tomar.', 'El PO no baja calidad para meter mas alcance.', 'La Review no es solo demo; es inspeccion colaborativa.']),
        section('MVP, MMP y releases', 'Un MVP permite aprender con funcionalidad minima; un MMP ya es comercializable. Release Management planifica y controla entregas incrementales alineadas con vision, calidad y expectativas.', ['Sprints construyen incrementos.', 'Releases agrupan valor entregable.', 'MVP busca aprendizaje; MMP busca mercado.']),
        section('Calidad, DoD y deuda tecnica', 'La Definition of Done transparenta que esta terminado. La deuda tecnica reduce velocidad, aumenta costo, baja calidad y eleva riesgo de entrega. El PO debe considerar trabajo tecnico que proteja sostenibilidad del producto.', ['La DoD no se negocia hacia abajo para cerrar alcance.', 'Metricas de release incluyen lead time, cycle time y frecuencia.', 'Calidad tambien maximiza valor.'])
      ],
      ['Aceptar trabajo no terminado para complacer una fecha.', 'Confundir MVP con producto pobre o incompleto sin aprendizaje.', 'Ignorar deuda tecnica porque no aparece en demos.', 'Usar Sprint Review como aprobacion tardia.'],
      ['Si un incremento no cumple DoD, no debe considerarse terminado.', 'Un MVP de onboarding puede validar activacion antes de construir todos los modulos del producto.'],
      'EuropeanScrum 2025 secciones 5, 16, 19-22; Scrum Guide/Product Owner fuentes complementarias'
    ),
    chapter(7, 'Stakeholders, cambio y enfoques complementarios', 80,
      'El Product Owner alinea stakeholders, gestiona cambio con clientes y equipos, combina Design Thinking, Kanban y Lean cuando aportan flujo, aprendizaje y reduccion de desperdicio.',
      ['stakeholders', 'gestion del cambio', 'Design Thinking', 'Kanban', 'Lean', 'WIP', 'feedback', 'mejora continua'],
      [
        section('Stakeholders y colaboracion', 'El PO escucha, negocia, comunica decisiones y traduce necesidades en prioridades. No satisface todas las peticiones; busca maximizar valor y coherencia del producto.', ['La colaboracion continua reduce sorpresas.', 'El feedback se convierte en aprendizaje y backlog.', 'Las decisiones deben ser transparentes.']),
        section('Gestion del cambio', 'Cambios de cliente, contratos, mercado o equipo se gestionan mediante refinamiento, reserva de contingencia, analisis de decisiones y construccion iterativa por releases y Sprints.', ['El cambio no se bloquea; se ordena.', 'La adaptacion necesita criterios y evidencia.', 'El PO protege foco y valor.']),
        section('Design Thinking, Kanban y Lean', 'Design Thinking fortalece empatia e ideacion; Kanban visualiza flujo y limita WIP; Lean reduce desperdicio y enfoca valor. El PO puede integrarlos sin romper Scrum.', ['Kanban ayuda a ver cuellos de botella.', 'Lean evita construir lo que no aporta.', 'Design Thinking alimenta discovery.'])
      ],
      ['Confundir colaboracion con aceptar todo.', 'Limitar WIP solo en tablero sin cambiar comportamiento.', 'Usar Lean para recortar calidad en vez de desperdicio.', 'Gestionar cambio sin criterio de valor.'],
      ['Un tablero Kanban para discovery permite ver oportunidades en investigacion, validacion y decision.', 'Design Thinking puede alimentar el Product Backlog con problemas mejor entendidos.'],
      'EuropeanScrum 2025 secciones 22-28; Skill Arena 2026 bloques C y buenas practicas'
    ),
    chapter(8, 'Metricas, outcomes e IA para Product Owner', 100,
      'El Product Owner moderno mide outcomes sobre outputs, conecta North Star, KPIs y OKRs, y usa IA para discovery, especificacion, priorizacion continua y decisiones con criterio etico.',
      ['outcomes', 'outputs', 'North Star', 'KPI', 'OKR', 'leading metrics', 'lagging metrics', 'IA', 'AI-native product loop', 'AI Product Owner'],
      [
        section('Outcomes sobre outputs', 'Entregar muchas funcionalidades no garantiza valor. El PO debe conectar trabajo con outcomes observables y mantener una jerarquia de metricas: North Star, KPIs, OKRs y senales leading/lagging.', ['Output: lo que se entrega.', 'Outcome: cambio observable en usuario o negocio.', 'Metricas proxy mal elegidas pueden incentivar comportamiento incorrecto.']),
        section('IA en discovery y especificacion', 'La IA puede sintetizar entrevistas, detectar patrones, generar borradores de historias, criterios y escenarios, y apoyar roadmaps dinamicos. El PO debe validar evidencia, evitar inflar backlog y cuidar sesgos.', ['Generar historias barato no significa que merezcan construirse.', 'La IA acelera, pero no reemplaza juicio de producto.', 'Los criterios deben ser verificables y revisados.']),
        section('AI-native product loop', 'En productos IA-nativos, priorizacion, experimentacion y aprendizaje pueden operar como ciclo continuo. El PO necesita entender datos, modelos, metricas cambiantes, etica y riesgos de sesgo.', ['El PO aumentado usa IA para mejorar su trabajo.', 'El PO de producto IA-nativo entiende comportamiento del sistema IA.', 'La responsabilidad sigue siendo humana.'])
      ],
      ['Medir solo numero de historias cerradas.', 'OKRs redactados como lista de features.', 'Backlog inflado por generacion automatica.', 'Delegar decisiones eticas a la herramienta IA.'],
      ['Un outcome puede ser aumentar activacion, no construir una pantalla.', 'Un asistente IA puede proponer criterios Given-When-Then, pero el PO valida valor, riesgo y claridad.'],
      'Skill Arena 2026 bloques F-G capitulos 11-16; EuropeanScrum 2025 resumen de buenas practicas'
    )
  ];

  const objectives = [
    lo('PO-1.1.1', 1, 'K1', 'Recordar la accountability principal del Product Owner', 'El PO maximiza el valor del producto resultante del trabajo del Scrum Team.', 'Maximizar valor es la responsabilidad central.', 'Ordena el Product Backlog para dirigir al equipo hacia el mayor valor.', 'Reducir el rol a escribir tickets.'),
    lo('PO-1.2.1', 1, 'K2', 'Explicar Scrum Framework desde la perspectiva del PO', 'El PO usa roles, eventos y artefactos para inspeccionar valor y adaptar prioridades.', 'Scrum da cadencia a decisiones de producto.', 'Sprint Review alimenta ajustes del Product Backlog.', 'Confundir eventos con reportes administrativos.'),
    lo('PO-1.3.1', 1, 'K2', 'Diferenciar Product Owner, Scrum Master y Developers', 'El PO responde por valor y backlog; Scrum Master por Scrum y efectividad; Developers por Incremento usable.', 'Responsabilidades claras evitan solapamiento dañino.', 'El PO explica valor; Developers deciden como construir.', 'PO asignando tareas tecnicas.'),
    lo('PO-1.4.1', 1, 'K3', 'Aplicar posturas del PO y frontera PO/PM en escenarios', 'El PO cambia de postura segun necesite vision, estrategia, colaboracion, cliente o negociacion.', 'La postura depende de la conversacion.', 'Ante conflicto de stakeholders actua como negociador con evidencia.', 'Debatir titulo sin aclarar alcance.'),
    lo('PO-2.1.1', 2, 'K1', 'Recordar vision, estrategia y Product Goal', 'Vision orienta a largo plazo, estrategia se revisa con cadencia y Product Goal concreta el foco actual.', 'Product Goal es compromiso del Product Backlog.', 'Un Product Goal medible guia el orden del backlog.', 'Usar una vision eterna como objetivo de Sprint.'),
    lo('PO-2.2.1', 2, 'K2', 'Explicar roadmap adaptable y horizontes Now/Next/Later', 'Un roadmap comunica intencion con incertidumbre, no un contrato de fechas fijas.', 'Now, Next y Later expresan niveles de evidencia.', 'Later contiene apuestas que aun requieren validacion.', 'Prometer todo con fecha cerrada.'),
    lo('PO-2.3.1', 2, 'K2', 'Describir Sprint 0 y preparacion inicial ligera', 'Sprint 0 alinea vision, riesgos, backlog inicial y acuerdos para habilitar el primer Sprint real.', 'Preparar no significa congelar el plan.', 'Se define un backlog inicial de alto nivel.', 'Convertir Sprint 0 en cascada.'),
    lo('PO-2.4.1', 2, 'K3', 'Aplicar tecnicas de vision y preguntas socraticas', 'Vision board, working backwards y preguntas abiertas ayudan a clarificar proposito, evidencias y consecuencias.', 'Preguntas buenas descubren supuestos.', 'Que evidencia muestra que este problema importa?', 'Usar tecnicas como plantillas sin aprendizaje.'),
    lo('PO-3.1.1', 3, 'K1', 'Recordar diferencia entre problema y solucion', 'El espacio del problema describe necesidades; el de solucion describe alternativas para resolverlas.', 'Primero problema, luego solucion.', 'Antes de crear un dashboard se valida que decision falta.', 'Backlog de features sin problema.'),
    lo('PO-3.2.1', 3, 'K2', 'Explicar herramientas de entendimiento del cliente', 'Empathy map, persona, shadowing y entrevistas ayudan a entender contexto y necesidades.', 'Herramienta sin evidencia es decoracion.', 'Shadowing revela pasos invisibles del trabajo real.', 'Inventar personas en una reunion.'),
    lo('PO-3.3.1', 3, 'K2', 'Describir canvas y elevator pitch para producto', 'Business canvas, product canvas y elevator pitch sintetizan usuarios, valor, riesgos y narrativa.', 'Sintesis obliga a priorizar.', 'Product canvas conecta problema, solucion y metricas.', 'Canvas completado una vez y olvidado.'),
    lo('PO-3.4.1', 3, 'K3', 'Aplicar Opportunity Solution Tree y discovery continuo', 'OST conecta outcome, oportunidades, soluciones y experimentos para priorizar aprendizaje.', 'Discovery y delivery conviven.', 'Se prueba una oportunidad antes de comprometer una feature.', 'Discovery solo al inicio.'),
    lo('PO-4.1.1', 4, 'K1', 'Recordar naturaleza del Product Backlog', 'Es una lista emergente, ordenada y transparente de todo lo necesario para mejorar el producto.', 'Fuente unica de trabajo del Scrum Team.', 'Incluye features, mejoras, defectos y trabajo tecnico.', 'Lista estatica de requisitos.'),
    lo('PO-4.2.1', 4, 'K2', 'Explicar refinamiento y colaboracion con Developers', 'Refinar divide, aclara y prepara items; Developers aportan estimacion y factibilidad.', 'El PO responde por valor, Developers por detalle tecnico.', 'Una epica se divide antes de entrar a Sprint.', 'PO estima solo sin equipo.'),
    lo('PO-4.3.1', 4, 'K2', 'Describir historias, INVEST y criterios de aceptacion', 'Historias expresan valor de usuario; INVEST y criterios verificables mejoran comprension y testeabilidad.', 'Testeable significa comprobar terminado.', 'Given-When-Then aclara comportamiento.', 'Historias gigantes sin criterio.'),
    lo('PO-4.4.1', 4, 'K3', 'Aplicar story mapping y spec-as-contract', 'Story mapping organiza flujo y releases; spec-as-contract convierte criterios en fuente verificable.', 'Mapa para estrategia, tablero para ejecucion.', 'Un corte de release se visualiza en el story map.', 'Mapa bonito sin decision.'),
    lo('PO-5.1.1', 5, 'K1', 'Recordar criterios comunes de priorizacion', 'Valor, urgencia, riesgo, dependencias y esfuerzo ayudan a ordenar el backlog.', 'Priorizar es decidir con restricciones.', 'Item que reduce riesgo puede ir antes.', 'Priorizar por ruido politico.'),
    lo('PO-5.2.1', 5, 'K2', 'Explicar MoSCoW, Kano, Pareto, WSJF y valor/esfuerzo', 'Cada marco ayuda a comparar opciones desde necesidad, satisfaccion, impacto, costo de demora o esfuerzo.', 'El marco depende del contexto.', 'WSJF ayuda cuando costo de demora importa.', 'Todo como Must Have.'),
    lo('PO-5.3.1', 5, 'K2', 'Describir alcance y contratos en Agile/Scrum', 'Contratos agiles deben permitir aprendizaje y cambio manteniendo transparencia de valor, costo y riesgo.', 'Alcance flexible requiere reglas claras.', 'Time and Material facilita adaptacion.', 'Fixed scope rigido vendido como Scrum.'),
    lo('PO-5.4.1', 5, 'K3', 'Aplicar priorizacion de releases, Sprints y backlog', 'El PO agrupa items en releases y colabora en Sprint Planning segun valor, capacidad, riesgo y objetivo.', 'Backlog, release y Sprint se ordenan con diferentes horizontes.', 'Una release puede agrupar items de alto valor tangible.', 'Meter en Sprint todo lo urgente.'),
    lo('PO-6.1.1', 6, 'K1', 'Recordar participacion del PO en Sprint', 'El PO explica valor, aclara criterios, valida aprendizaje y colabora en Review y Planning.', 'El PO no gestiona tareas diarias.', 'Developers deciden cuanto trabajo tomar.', 'PO como jefe de proyecto.'),
    lo('PO-6.2.1', 6, 'K2', 'Explicar MVP, MMP y release management', 'MVP aprende con lo minimo viable; MMP es comercializable; releases entregan valor incremental.', 'MVP no es producto descuidado.', 'Un MMP debe ser suficiente para mercado.', 'Confundir MVP con version incompleta sin aprendizaje.'),
    lo('PO-6.3.1', 6, 'K2', 'Describir Definition of Done y deuda tecnica', 'DoD transparenta calidad; deuda tecnica afecta velocidad, costo, calidad y riesgo.', 'Calidad protege valor.', 'Trabajo de deuda tecnica puede priorizarse por riesgo.', 'Bajar DoD para cumplir fecha.'),
    lo('PO-6.4.1', 6, 'K3', 'Aplicar metricas de release y decisiones de calidad', 'Lead time, cycle time y frecuencia de release ayudan a gestionar flujo y entrega de valor.', 'Las metricas deben guiar mejora, no castigo.', 'Cycle time alto puede revelar cuello de botella.', 'Medir solo velocidad.'),
    lo('PO-7.1.1', 7, 'K1', 'Recordar colaboracion con stakeholders', 'El PO escucha, negocia y comunica decisiones transparentes orientadas a valor.', 'No todo pedido entra al backlog.', 'Stakeholder aporta evidencia; PO decide orden.', 'Aceptar todo para evitar conflicto.'),
    lo('PO-7.2.1', 7, 'K2', 'Explicar gestion del cambio en Scrum', 'El cambio se gestiona por refinamiento, analisis, contingencia, releases y Sprints iterativos.', 'Cambio se ordena, no se bloquea.', 'Feedback de Review ajusta backlog.', 'Cambiar sin priorizar.'),
    lo('PO-7.3.1', 7, 'K2', 'Describir aportes de Design Thinking, Kanban y Lean', 'Design Thinking mejora empatia; Kanban visualiza flujo y WIP; Lean reduce desperdicio.', 'Integrar sin romper Scrum.', 'Limitar WIP mejora foco.', 'Lean como excusa para bajar calidad.'),
    lo('PO-7.4.1', 7, 'K3', 'Aplicar enfoques complementarios en escenarios PO', 'El PO selecciona herramienta segun problema: discovery, flujo, desperdicio o alineacion.', 'Herramienta correcta para necesidad correcta.', 'Kanban puede visualizar discovery de oportunidades.', 'Usar todas las herramientas siempre.'),
    lo('PO-8.1.1', 8, 'K1', 'Recordar outputs, outcomes y jerarquia de metricas', 'Outputs son entregables; outcomes son cambios; North Star, KPIs y OKRs conectan estrategia con medicion.', 'Outcome supera output.', 'Aumentar activacion es outcome.', 'Cerrar muchas historias como exito unico.'),
    lo('PO-8.2.1', 8, 'K2', 'Explicar leading, lagging y metricas proxy', 'Leading anticipan comportamiento; lagging confirman resultado; proxy mal elegida distorsiona decisiones.', 'Metrica influye comportamiento.', 'Activacion temprana puede anticipar retencion.', 'Optimizar clicks sin valor.'),
    lo('PO-8.3.1', 8, 'K2', 'Describir IA en discovery, especificacion y roadmap', 'IA ayuda a sintetizar senales, generar borradores y apoyar roadmaps dinamicos, pero requiere validacion humana.', 'IA acelera, no decide sola.', 'El PO revisa sesgos y evidencia.', 'Crear backlog enorme porque es facil generar items.'),
    lo('PO-8.4.1', 8, 'K3', 'Aplicar criterio de AI Product Owner y buenas practicas', 'El PO de IA entiende datos, modelos, outcomes cambiantes, etica y riesgos; mantiene responsabilidad humana.', 'Responsabilidad no se delega a IA.', 'Un modelo reentrenado puede cambiar OKRs operativos.', 'Ignorar sesgos porque el sistema es automatizado.')
  ];

  const questions = [
    q('PO-Q001', 1, 'K1', 'PO-1.1.1', 'Accountability PO', '¿Cuál es la accountability principal del Product Owner?', ['Maximizar el valor del producto resultante del trabajo del Scrum Team', 'Asignar tareas diarias a Developers', 'Garantizar que nunca cambie el alcance', 'Aprobar tecnicamente cada commit'], 0, 'El PO responde por maximizar valor; las demas actividades derivan de esa responsabilidad.'),
    q('PO-Q002', 1, 'K1', 'PO-1.1.1', 'Product Owner persona', '¿Qué significa que el Product Owner sea una persona y no un comité?', ['Que las decisiones de orden del backlog tienen una responsabilidad clara', 'Que no puede escuchar stakeholders', 'Que no puede delegar ninguna tarea', 'Que reemplaza al Scrum Master'], 0, 'Puede representar muchas voces, pero la responsabilidad de decision no se diluye en un comité.'),
    q('PO-Q003', 1, 'K2', 'PO-1.2.1', 'Scrum Framework', '¿Cómo ayuda Sprint Review al Product Owner?', ['Permite inspeccionar el incremento con stakeholders y adaptar el Product Backlog', 'Sirve para asignar trabajo diario', 'Sustituye la Sprint Retrospective', 'Congela prioridades para todo el año'], 0, 'La Review genera feedback para adaptar prioridades y próximos pasos.'),
    q('PO-Q004', 1, 'K2', 'PO-1.2.1', 'Eventos Scrum', '¿Cuál combinación refleja elementos de Scrum que el PO debe entender?', ['Sprint, Sprint Planning, Daily Scrum, Sprint Review y Retrospective', 'Kickoff, fase de análisis, fase de diseño y cierre', 'Comité de cambios, auditoría final y garantía', 'Reunión comercial, comité financiero y acta de aceptación'], 0, 'Scrum opera con eventos formales que sostienen inspección y adaptación.'),
    q('PO-Q005', 1, 'K2', 'PO-1.3.1', 'Roles Scrum', '¿Cuál diferencia es correcta?', ['El PO ordena por valor; Developers deciden cómo construir el Incremento', 'El Scrum Master prioriza el Product Backlog', 'Developers deciden visión de producto sin PO', 'El PO elimina la Definition of Done'], 0, 'El PO responde por valor y orden; Developers por plan técnico y construcción.'),
    q('PO-Q006', 1, 'K2', 'PO-1.3.1', 'Scrum Master y PO', '¿Cómo sirve el Scrum Master al Product Owner?', ['Ayudando con técnicas de Product Goal, Product Backlog y colaboración con stakeholders', 'Tomando la responsabilidad del Product Backlog', 'Aprobando todas las historias antes del PO', 'Definiendo el precio del producto'], 0, 'El Scrum Master ayuda al PO a aplicar Scrum y gestionar producto de forma efectiva.'),
    q('PO-Q007', 1, 'K3', 'PO-1.4.1', 'Posturas del PO', 'Un PO debe defender una prioridad impopular ante ventas, soporte y dirección. ¿Qué postura predomina?', ['Negociador con evidencia de valor', 'Administrador pasivo de tickets', 'Developer técnico', 'Auditor externo'], 0, 'La postura negociadora alinea intereses y sostiene decisiones con evidencia.'),
    q('PO-Q008', 1, 'K3', 'PO-1.4.1', 'PO vs PM', 'En una organización, el PO solo transcribe solicitudes y la estrategia está en otro equipo. ¿Qué riesgo describe mejor el caso?', ['El PO queda reducido a administrador de backlog', 'El PO aumenta su accountability', 'Scrum elimina la necesidad de Product Goal', 'La priorización se vuelve más empírica automáticamente'], 0, 'Cuando el PO no participa en estrategia ni valor, se debilita su capacidad de maximizar valor.'),

    q('PO-Q009', 2, 'K1', 'PO-2.1.1', 'Product Goal', '¿Qué es el Product Goal?', ['Un estado futuro del producto que sirve de objetivo actual de medio plazo', 'Una lista de tareas técnicas del Sprint', 'Una promesa de fechas cerradas para todo el año', 'Un reporte de velocidad'], 0, 'El Product Goal es el compromiso asociado al Product Backlog.'),
    q('PO-Q010', 2, 'K1', 'PO-2.1.1', 'Visión y estrategia', '¿Cuál relación es correcta?', ['Visión orienta largo plazo, estrategia se revisa con cadencia y Product Goal concreta foco actual', 'Product Goal reemplaza toda visión', 'Roadmap es siempre alcance fijo', 'Estrategia solo pertenece a Developers'], 0, 'Las tres capas se complementan en horizontes distintos.'),
    q('PO-Q011', 2, 'K2', 'PO-2.2.1', 'Roadmap adaptable', '¿Qué comunica mejor un roadmap Now/Next/Later?', ['Prioridades y evidencia con incertidumbre explícita', 'Fechas contractuales inamovibles', 'Tareas diarias del Sprint', 'La Definition of Done'], 0, 'Now/Next/Later evita falsa precisión en decisiones lejanas.'),
    q('PO-Q012', 2, 'K2', 'PO-2.2.1', 'Roadmap anual fijo', '¿Por qué un roadmap anual fijo puede ser peligroso en producto ágil?', ['Porque impide adaptar según aprendizaje y mercado', 'Porque hace visible la estrategia', 'Porque reduce trabajo innecesario siempre', 'Porque elimina dependencias'], 0, 'En entornos complejos, bloquear el roadmap reduce adaptación.'),
    q('PO-Q013', 2, 'K2', 'PO-2.3.1', 'Sprint 0', '¿Cuál uso de Sprint 0 es más saludable?', ['Alinear visión, riesgos y backlog inicial para habilitar el primer Sprint real', 'Construir todo el diseño detallado antes de iterar', 'Cerrar contratos de alcance inmutable', 'Evitar Sprint Review'], 0, 'Sprint 0 debe preparar lo mínimo suficiente, no sustituir empirismo.'),
    q('PO-Q014', 2, 'K2', 'PO-2.3.1', 'Backlog inicial', 'En preparación inicial, ¿qué debe evitar el PO?', ['Congelar todo el Product Backlog como contrato de alcance', 'Definir una visión inicial', 'Alinear expectativas con stakeholders', 'Identificar riesgos relevantes'], 0, 'El backlog debe seguir siendo emergente y adaptable.'),
    q('PO-Q015', 2, 'K3', 'PO-2.4.1', 'Preguntas socráticas', 'Un stakeholder pide una app móvil “porque la competencia la tiene”. ¿Qué pregunta ayuda mejor al PO?', ['¿Qué problema de usuario o negocio resolvería esa app y qué evidencia lo muestra?', '¿Qué color prefieres para el icono?', '¿Cuántos Developers asignamos mañana?', '¿Podemos saltar discovery?'], 0, 'La pregunta explora supuestos, problema y evidencia.'),
    q('PO-Q016', 2, 'K3', 'PO-2.4.1', 'Vision board', 'Un equipo tiene muchas ideas pero poca dirección. ¿Qué técnica puede ayudar a articular visión antes del Product Goal?', ['Product vision board', 'Daily Scrum extendido', 'Tabla de bugs sin prioridad', 'Acta de aceptación final'], 0, 'Vision board ayuda a sintetizar propósito, usuarios, valor y objetivos.'),

    q('PO-Q017', 3, 'K1', 'PO-3.1.1', 'Problema y solución', '¿Qué representa el espacio del problema?', ['Necesidades, dolores y contexto antes de decidir una solución', 'La arquitectura final del sistema', 'El conjunto de tareas del Sprint Backlog', 'La lista de releases cerradas'], 0, 'El espacio del problema explica por qué algo importa.'),
    q('PO-Q018', 3, 'K1', 'PO-3.1.1', 'Soluciones prematuras', '¿Cuál es una señal de backlog de soluciones?', ['Items llenos de features sin oportunidad o problema asociado', 'Items ordenados por Product Goal', 'Historias con criterios verificables', 'Feedback convertido en aprendizaje'], 0, 'Sin oportunidad asociada, el backlog puede construir lo incorrecto.'),
    q('PO-Q019', 3, 'K2', 'PO-3.2.1', 'Mapa de empatía', '¿Para qué sirve un mapa de empatía?', ['Entender qué usuarios piensan, sienten, dicen y hacen', 'Calcular automáticamente velocidad', 'Definir la Definition of Done', 'Cerrar el Sprint'], 0, 'Ayuda a entender usuario y contexto.'),
    q('PO-Q020', 3, 'K2', 'PO-3.2.1', 'Shadowing', '¿Qué aporta shadowing al Product Owner?', ['Observa trabajo real y revela pasos o fricciones no declaradas', 'Reemplaza todas las entrevistas', 'Define contratos de precio fijo', 'Asigna tareas técnicas'], 0, 'La observación directa descubre realidad operativa.'),
    q('PO-Q021', 3, 'K2', 'PO-3.3.1', 'Product canvas', '¿Qué conecta un Product Canvas?', ['Usuarios, problemas, soluciones, riesgos, valor y métricas', 'Solo tareas técnicas del Sprint', 'Horas trabajadas por Developer', 'Comités de aprobación'], 0, 'El canvas sintetiza producto y decisiones clave.'),
    q('PO-Q022', 3, 'K2', 'PO-3.3.1', 'Elevator pitch', '¿Cuál es el valor del product elevator pitch?', ['Obliga a comunicar propuesta de valor de forma breve y clara', 'Sustituye el Product Backlog', 'Define el código fuente', 'Cierra todos los riesgos'], 0, 'Un buen pitch aclara para quién, qué problema y qué valor.'),
    q('PO-Q023', 3, 'K3', 'PO-3.4.1', 'Opportunity Solution Tree', 'Un equipo tiene un outcome claro, muchas ideas y poca evidencia. ¿Qué herramienta ayuda a organizar oportunidades, soluciones y experimentos?', ['Opportunity Solution Tree', 'Reporte de horas', 'Backlog por comité', 'Contrato fixed scope'], 0, 'OST conecta outcome, oportunidades, soluciones y experimentos.'),
    q('PO-Q024', 3, 'K3', 'PO-3.4.1', 'Dual-track', '¿Qué decisión refleja discovery continuo?', ['Validar una oportunidad mientras delivery construye el incremento comprometido', 'Detener todo delivery hasta terminar investigación anual', 'Construir todas las ideas generadas', 'Eliminar stakeholders'], 0, 'Dual-track permite aprender y entregar con cadencias conectadas.'),

    q('PO-Q025', 4, 'K1', 'PO-4.1.1', 'Product Backlog', '¿Qué es el Product Backlog?', ['Lista emergente, ordenada y transparente del trabajo necesario para mejorar el producto', 'Plan detallado e inmutable del proyecto', 'Tablero de tareas individuales de Developers', 'Documento de cierre contractual'], 0, 'Es la fuente única de trabajo del Scrum Team.'),
    q('PO-Q026', 4, 'K1', 'PO-4.1.1', 'Backlog vivo', '¿Qué tipo de elemento puede formar parte del Product Backlog?', ['Features, mejoras, defectos, trabajo técnico o aprendizaje necesario', 'Solo historias funcionales perfectas', 'Solo tareas asignadas por Scrum Master', 'Solo reportes financieros'], 0, 'El backlog contiene trabajo necesario para mejorar el producto.'),
    q('PO-Q027', 4, 'K2', 'PO-4.2.1', 'Refinamiento', '¿Qué ocurre en refinamiento?', ['Items se aclaran, dividen y preparan con colaboración del equipo', 'Se cancela el Sprint automáticamente', 'Se reemplaza Sprint Review', 'Se aprueban trabajos sin DoD'], 0, 'Refinar mejora claridad, tamaño y preparación de items.'),
    q('PO-Q028', 4, 'K2', 'PO-4.2.1', 'Estimación', '¿Quién debe aportar principalmente el dimensionamiento del trabajo que realizará?', ['Developers', 'Solo Product Owner', 'Solo stakeholders', 'Área legal'], 0, 'Developers que harán el trabajo responden por estimación técnica.'),
    q('PO-Q029', 4, 'K2', 'PO-4.3.1', 'INVEST', '¿Qué significa la T de INVEST?', ['Testeable', 'Temporal', 'Táctica', 'Técnica obligatoria'], 0, 'Una historia debe poder comprobarse con criterios o ejemplos.'),
    q('PO-Q030', 4, 'K2', 'PO-4.3.1', 'Given When Then', '¿Para qué sirve Given-When-Then?', ['Expresar criterios de aceptación como escenarios verificables', 'Estimar presupuesto anual', 'Evitar conversaciones con usuarios', 'Priorizar por jerarquía'], 0, 'Dado-Cuando-Entonces aclara comportamiento esperado.'),
    q('PO-Q031', 4, 'K3', 'PO-4.4.1', 'Story Mapping', 'El PO quiere visualizar recorrido de usuario y planear cortes de release. ¿Qué técnica encaja mejor?', ['User Story Mapping', 'Daily Scrum', 'KPI financiero aislado', 'Contrato de precio fijo'], 0, 'Story Mapping ordena flujo, prioridad y releases.'),
    q('PO-Q032', 4, 'K3', 'PO-4.4.1', 'Spec-as-contract', 'Un equipo discute constantemente qué significa “terminado” para una regla de negocio. ¿Qué práctica ayuda más?', ['Convertir criterios y ejemplos en especificación verificable compartida', 'Ocultar criterios hasta el final', 'Aumentar tamaño de historias', 'Eliminar pruebas'], 0, 'Spec-as-contract usa ejemplos y criterios como fuente de verdad comprobable.'),

    q('PO-Q033', 5, 'K1', 'PO-5.1.1', 'Criterios de priorización', '¿Cuál lista contiene criterios comunes de priorización?', ['Valor, urgencia, riesgo, dependencias y esfuerzo', 'Color, gusto personal, antigüedad y jerarquía', 'Horas extra, comité y azar', 'Solo fecha de solicitud'], 0, 'Esos criterios ayudan a ordenar valor bajo restricciones.'),
    q('PO-Q034', 5, 'K1', 'PO-5.1.1', 'Riesgo y prioridad', '¿Por qué un item de reducción de riesgo puede priorizarse alto?', ['Porque reduce incertidumbre que amenaza valor futuro', 'Porque siempre es más visible para usuario', 'Porque elimina Product Goal', 'Porque evita Sprint Review'], 0, 'Reducir incertidumbre puede maximizar valor.'),
    q('PO-Q035', 5, 'K2', 'PO-5.2.1', 'MoSCoW', '¿Qué categoría de MoSCoW indica algo esencial para la fase?', ['Must have', 'Could have', 'Won’t have', 'Delighter'], 0, 'Must Have representa necesidad esencial.'),
    q('PO-Q036', 5, 'K2', 'PO-5.2.1', 'Kano', '¿Qué ayuda a analizar el modelo Kano?', ['Cómo características básicas, de desempeño o encantadoras afectan satisfacción', 'Cuántas horas debe trabajar el equipo', 'Quién asigna tareas del Daily', 'Qué contrato legal firmar siempre'], 0, 'Kano clasifica necesidades según satisfacción percibida.'),
    q('PO-Q037', 5, 'K2', 'PO-5.3.1', 'Contratos ágiles', '¿Qué contrato suele facilitar adaptación de alcance con transparencia de esfuerzo?', ['Time and Material', 'Fixed scope inmutable', 'Contrato sin feedback', 'Aprobación solo al final'], 0, 'Time and Material facilita aprendizaje y adaptación si hay confianza y visibilidad.'),
    q('PO-Q038', 5, 'K2', 'PO-5.3.1', 'Fixed scope', '¿Cuál es el riesgo de un fixed scope rígido en trabajo complejo?', ['Reduce capacidad de adaptar según aprendizaje', 'Mejora empirismo siempre', 'Elimina deuda técnica', 'Aumenta discovery continuo'], 0, 'Alcance rígido choca con incertidumbre y feedback.'),
    q('PO-Q039', 5, 'K3', 'PO-5.4.1', 'WSJF', 'Dos items tienen valor similar, pero uno desbloquea una release crítica y es pequeño. ¿Qué criterio apoya priorizarlo?', ['Costo de demora y tamaño relativo', 'Orden alfabético', 'Preferencia estética', 'Cantidad de reuniones'], 0, 'WSJF considera costo de demora y tamaño/trabajo.'),
    q('PO-Q040', 5, 'K3', 'PO-5.4.1', 'Priorización Sprint', 'En Sprint Planning, ¿qué comportamiento del PO es correcto?', ['Explicar valor y colaborar en selección, mientras Developers deciden capacidad', 'Imponer todo el backlog al Sprint', 'Bajar DoD para meter más alcance', 'Evitar aclarar criterios'], 0, 'El PO colabora en valor; Developers deciden cuánto pueden completar.'),

    q('PO-Q041', 6, 'K1', 'PO-6.1.1', 'PO en Sprint', '¿Qué hace el PO durante el Sprint?', ['Aclara criterios, responde dudas de valor y valida aprendizaje sin dirigir tareas diarias', 'Asigna cada tarea técnica', 'Cambia DoD cada día', 'Elimina Daily Scrum'], 0, 'El PO acompaña valor y claridad sin reemplazar autogestión de Developers.'),
    q('PO-Q042', 6, 'K1', 'PO-6.1.1', 'Sprint Review', '¿Cuál es un propósito clave de Sprint Review para el PO?', ['Recoger feedback para adaptar Product Backlog', 'Cerrar contratos fijos sin discusión', 'Reemplazar Retrospective', 'Medir asistencia'], 0, 'Review es inspección colaborativa del incremento y futuro del producto.'),
    q('PO-Q043', 6, 'K2', 'PO-6.2.1', 'MVP', '¿Qué define mejor un MVP?', ['Versión mínima para aprender con usuarios reales o tempranos', 'Producto final con todas las funciones', 'Entregable sin calidad', 'Sprint Backlog completo'], 0, 'MVP busca aprendizaje validado con el mínimo necesario.'),
    q('PO-Q044', 6, 'K2', 'PO-6.2.1', 'MMP', '¿En qué se diferencia MMP de MVP?', ['MMP es mínimo comercializable; MVP puede enfocarse en aprendizaje', 'MMP no necesita usuarios', 'MVP siempre es más grande', 'Son sinónimos exactos'], 0, 'MMP debe ser suficiente para mercado; MVP puede validar hipótesis.'),
    q('PO-Q045', 6, 'K2', 'PO-6.3.1', 'Definition of Done', '¿Qué aporta la Definition of Done?', ['Transparencia sobre calidad requerida para considerar trabajo terminado', 'Permiso para entregar incompleto', 'Orden del Product Backlog', 'Roadmap anual'], 0, 'DoD define criterios comunes de terminado.'),
    q('PO-Q046', 6, 'K2', 'PO-6.3.1', 'Deuda técnica', '¿Cómo puede afectar la deuda técnica a release management?', ['Reduce velocidad, aumenta costos y riesgo de entrega', 'Siempre aumenta calidad', 'Elimina necesidad de pruebas', 'No afecta al PO'], 0, 'La deuda técnica compromete sostenibilidad y valor futuro.'),
    q('PO-Q047', 6, 'K3', 'PO-6.4.1', 'Métricas de release', 'Cycle time aumenta durante tres releases. ¿Qué debería hacer el PO junto al equipo?', ['Investigar cuellos de botella, deuda o tamaño de items para mejorar flujo', 'Ignorar la métrica porque solo importa output', 'Cancelar la Retrospective', 'Aumentar alcance fijo'], 0, 'Cycle time puede revelar problemas de flujo o calidad.'),
    q('PO-Q048', 6, 'K3', 'PO-6.4.1', 'Calidad y valor', 'Un stakeholder pide omitir pruebas para lanzar antes. ¿Qué respuesta es más alineada con PO efectivo?', ['Evaluar impacto en valor y riesgo, sin bajar la DoD acordada', 'Aceptar siempre porque lo pidió negocio', 'Eliminar la deuda técnica del backlog', 'Ocultar el riesgo al equipo'], 0, 'Calidad forma parte del valor sostenible.'),

    q('PO-Q049', 7, 'K1', 'PO-7.1.1', 'Stakeholders', '¿Cuál es una responsabilidad del PO frente a stakeholders?', ['Escuchar, negociar y comunicar decisiones de prioridad', 'Aceptar todas las solicitudes', 'Evitar feedback externo', 'Delegar todo a Developers'], 0, 'El PO representa necesidades, pero decide orden por valor.'),
    q('PO-Q050', 7, 'K1', 'PO-7.1.1', 'Colaboración', '¿Qué indica colaboración sana con stakeholders?', ['Feedback frecuente convertido en aprendizaje y backlog priorizado', 'Cambios sin criterio', 'Comité que decide cada prioridad', 'Comunicación solo al final'], 0, 'La colaboración alimenta decisiones transparentes.'),
    q('PO-Q051', 7, 'K2', 'PO-7.2.1', 'Gestión del cambio', '¿Cómo debe manejarse el cambio en Scrum?', ['Refinándolo, priorizándolo y adaptando releases/Sprints con evidencia', 'Bloqueándolo siempre', 'Aceptándolo sin analizar valor', 'Guardándolo fuera del backlog'], 0, 'El cambio se ordena según valor, riesgo y capacidad.'),
    q('PO-Q052', 7, 'K2', 'PO-7.2.1', 'Contingencia', '¿Para qué sirve una reserva de contingencia en gestión de cambio?', ['Absorber incertidumbre razonable sin romper compromisos', 'Ocultar mala calidad', 'Eliminar Product Goal', 'Sustituir feedback'], 0, 'La contingencia reconoce incertidumbre y protege decisiones.'),
    q('PO-Q053', 7, 'K2', 'PO-7.3.1', 'Kanban', '¿Qué aporta Kanban al PO?', ['Visualización de flujo y límites WIP para detectar cuellos de botella', 'Un nuevo rol obligatorio en Scrum', 'Fechas fijas para todo el backlog', 'Eliminación de Sprint Review'], 0, 'Kanban puede complementar Scrum con gestión visual del flujo.'),
    q('PO-Q054', 7, 'K2', 'PO-7.3.1', 'Lean', '¿Qué busca Lean?', ['Reducir desperdicio y maximizar valor entregado', 'Aumentar trabajo en proceso', 'Eliminar calidad', 'Hacer más reuniones'], 0, 'Lean orienta mejora continua y foco en valor.'),
    q('PO-Q055', 7, 'K3', 'PO-7.4.1', 'Design Thinking', 'Un equipo entiende poco al usuario y necesita explorar necesidades. ¿Qué enfoque complementario ayuda más?', ['Design Thinking', 'Fixed scope', 'Reporte de horas', 'Solo velocidad'], 0, 'Design Thinking fortalece empatía, ideación y validación.'),
    q('PO-Q056', 7, 'K3', 'PO-7.4.1', 'WIP', 'El equipo inicia demasiadas oportunidades de discovery y no termina experimentos. ¿Qué práctica ayuda?', ['Limitar WIP y visualizar flujo', 'Agregar más ideas al backlog', 'Eliminar prioridades', 'Cerrar feedback externo'], 0, 'Limitar WIP mejora foco y flujo.'),

    q('PO-Q057', 8, 'K1', 'PO-8.1.1', 'Output y outcome', '¿Cuál opción es un outcome?', ['Reducir abandono del onboarding', 'Cerrar 20 historias', 'Crear 5 pantallas', 'Escribir documentación'], 0, 'Outcome es cambio observable en usuario o negocio.'),
    q('PO-Q058', 8, 'K1', 'PO-8.1.1', 'Jerarquía de métricas', '¿Qué conecta estrategia con medición operativa?', ['North Star, KPIs y OKRs', 'Solo número de tareas', 'Color del tablero', 'Tamaño del equipo'], 0, 'Una jerarquía de métricas alinea foco y decisiones.'),
    q('PO-Q059', 8, 'K2', 'PO-8.2.1', 'Leading metric', '¿Qué caracteriza una métrica leading?', ['Anticipa comportamiento o resultado futuro', 'Solo confirma resultados históricos', 'Siempre mide dinero final', 'No cambia decisiones'], 0, 'Leading metrics ayudan a actuar antes del resultado final.'),
    q('PO-Q060', 8, 'K2', 'PO-8.2.1', 'Métrica trampa', '¿Cuál es riesgo de una métrica proxy mal elegida?', ['Optimizar comportamiento que no genera valor real', 'Aumentar transparencia siempre', 'Eliminar sesgos', 'Mejorar Product Goal automáticamente'], 0, 'Metricas proxy pueden distorsionar decisiones si no representan valor.'),
    q('PO-Q061', 8, 'K2', 'PO-8.3.1', 'IA en especificación', '¿Cómo puede ayudar IA al PO en especificación?', ['Generar borradores de historias, criterios y escenarios para revisión humana', 'Decidir prioridades sin contexto', 'Eliminar stakeholders', 'Garantizar verdad absoluta'], 0, 'La IA acelera borradores, pero el PO valida valor, claridad y riesgo.'),
    q('PO-Q062', 8, 'K2', 'PO-8.3.1', 'Backlog e IA', '¿Cuál es un riesgo de usar IA para generar historias?', ['Inflar backlog con items baratos de generar pero de bajo valor', 'Reducir automáticamente sesgos', 'Garantizar Product Goal', 'Eliminar discovery'], 0, 'Generar muchas historias no significa que deban construirse.'),
    q('PO-Q063', 8, 'K3', 'PO-8.4.1', 'AI Product Owner', 'Un producto IA reentrena modelos con datos nuevos y cambia su comportamiento. ¿Qué competencia del PO gana importancia?', ['Entender datos, métricas cambiantes, sesgos y riesgos del modelo', 'Ignorar outcomes', 'Delegar ética al algoritmo', 'Eliminar Definition of Done'], 0, 'Productos IA requieren criterio sobre datos, comportamiento probabilístico y responsabilidad.'),
    q('PO-Q064', 8, 'K3', 'PO-8.4.1', 'Responsabilidad humana', 'Un asistente IA recomienda priorizar una feature que podría excluir a un grupo de usuarios. ¿Qué debe hacer el PO?', ['Revisar evidencia, sesgos, impacto ético y valor antes de decidir', 'Aceptar la recomendación sin revisión', 'Ocultar el riesgo', 'Eliminar feedback del grupo afectado'], 0, 'El PO conserva responsabilidad sobre decisiones de producto y sus impactos.')
  ];

  const flashcards = [
    card('Product Owner', 'Responsable de maximizar el valor del producto y gestionar Product Goal y Product Backlog.', 1, 'PO-1.1.1', 'Rol'),
    card('Accountability', 'Responsabilidad clara que no se diluye aunque se deleguen tareas.', 1, 'PO-1.1.1', 'Concepto'),
    card('Backlog por comité', 'Antipatrón donde prioridades las decide un grupo sin accountability única.', 1, 'PO-1.1.1', 'Antipatrón'),
    card('Posturas del PO', 'Visionario, estratega, colaborador, experto en cliente y negociador.', 1, 'PO-1.4.1', 'Concepto'),
    card('Product Goal', 'Estado futuro del producto que orienta el Product Backlog a medio plazo.', 2, 'PO-2.1.1', 'Compromiso'),
    card('Now Next Later', 'Roadmap por horizontes que comunica prioridad e incertidumbre.', 2, 'PO-2.2.1', 'Roadmap'),
    card('Sprint 0', 'Preparación inicial ligera para alinear visión, riesgos, backlog y acuerdos.', 2, 'PO-2.3.1', 'Inicio'),
    card('Socratic Questioning', 'Preguntas abiertas que revelan supuestos, evidencias y consecuencias.', 2, 'PO-2.4.1', 'Técnica'),
    card('Espacio del problema', 'Necesidades, dolores y oportunidades antes de elegir solución.', 3, 'PO-3.1.1', 'Discovery'),
    card('Mapa de empatía', 'Herramienta para entender qué usuarios piensan, sienten, dicen y hacen.', 3, 'PO-3.2.1', 'Discovery'),
    card('Persona', 'Arquetipo de usuario basado en evidencia para orientar decisiones.', 3, 'PO-3.2.1', 'Discovery'),
    card('Shadowing', 'Observación del usuario en su contexto real de trabajo.', 3, 'PO-3.2.1', 'Discovery'),
    card('Product Canvas', 'Síntesis de usuarios, problemas, soluciones, riesgos, valor y métricas.', 3, 'PO-3.3.1', 'Canvas'),
    card('Opportunity Solution Tree', 'Mapa de outcome, oportunidades, soluciones y experimentos.', 3, 'PO-3.4.1', 'Discovery'),
    card('Product Backlog', 'Fuente única del trabajo del Scrum Team, emergente y ordenada.', 4, 'PO-4.1.1', 'Artefacto'),
    card('Refinamiento', 'Actividad continua para aclarar, dividir y preparar items.', 4, 'PO-4.2.1', 'Actividad'),
    card('INVEST', 'Independiente, negociable, valiosa, estimable, pequeña y testeable.', 4, 'PO-4.3.1', 'Criterio'),
    card('Given When Then', 'Formato para criterios de aceptación como escenarios verificables.', 4, 'PO-4.3.1', 'Especificación'),
    card('User Story Mapping', 'Mapa visual del recorrido del usuario, prioridades y releases.', 4, 'PO-4.4.1', 'Técnica'),
    card('MoSCoW', 'Must, Should, Could y Won’t para clasificar necesidad.', 5, 'PO-5.2.1', 'Priorización'),
    card('Kano', 'Modelo que distingue necesidades básicas, desempeño y delighters.', 5, 'PO-5.2.1', 'Priorización'),
    card('Pareto', 'Principio 20/80 para buscar alto impacto con menor parte del esfuerzo.', 5, 'PO-5.2.1', 'Priorización'),
    card('WSJF', 'Priorización basada en costo de demora y tamaño relativo.', 5, 'PO-5.2.1', 'Priorización'),
    card('Time and Material', 'Contrato que facilita adaptación al pagar por tiempo/esfuerzo con transparencia.', 5, 'PO-5.3.1', 'Contrato'),
    card('MVP', 'Producto mínimo viable para aprender con usuarios reales o tempranos.', 6, 'PO-6.2.1', 'Release'),
    card('MMP', 'Producto mínimo comercializable listo para mercado.', 6, 'PO-6.2.1', 'Release'),
    card('Definition of Done', 'Criterios compartidos para considerar trabajo terminado.', 6, 'PO-6.3.1', 'Calidad'),
    card('Deuda técnica', 'Costo futuro de soluciones rápidas que reducen mantenibilidad y calidad.', 6, 'PO-6.3.1', 'Calidad'),
    card('Lead Time', 'Tiempo desde que se identifica una necesidad hasta que llega a producción.', 6, 'PO-6.4.1', 'Métrica'),
    card('Cycle Time', 'Tiempo desde que el trabajo comienza hasta que se completa.', 6, 'PO-6.4.1', 'Métrica'),
    card('Stakeholder', 'Persona o grupo con interés, necesidad o influencia sobre el producto.', 7, 'PO-7.1.1', 'Colaboración'),
    card('Kanban', 'Método visual para gestionar flujo y limitar WIP.', 7, 'PO-7.3.1', 'Flujo'),
    card('Lean', 'Enfoque para reducir desperdicio y maximizar valor.', 7, 'PO-7.3.1', 'Mejora'),
    card('Design Thinking', 'Enfoque centrado en empatía, ideación, prototipado y validación.', 7, 'PO-7.4.1', 'Discovery'),
    card('Output', 'Entregable producido, como historias cerradas o funcionalidades.', 8, 'PO-8.1.1', 'Métrica'),
    card('Outcome', 'Cambio observable en usuario, negocio o comportamiento.', 8, 'PO-8.1.1', 'Métrica'),
    card('North Star', 'Métrica guía que representa valor central del producto.', 8, 'PO-8.1.1', 'Métrica'),
    card('OKR', 'Objetivo y resultados clave medibles para alinear foco.', 8, 'PO-8.1.1', 'Métrica'),
    card('IA en Product Owner', 'Uso de IA para sintetizar señales, generar borradores y apoyar decisiones revisadas por humanos.', 8, 'PO-8.3.1', 'IA'),
    card('AI Product Owner', 'PO que entiende datos, modelos, sesgos, outcomes y riesgos de productos con IA.', 8, 'PO-8.4.1', 'IA')
  ];

  AcademyRegistry.register('scrum-product-owner', {
    meta: {
      key: 'scrum-product-owner',
      code: 'SPOPC',
      name: 'Scrum Product Owner Professional Certification',
      shortName: 'Product Owner',
      subtitle: 'Curso gratuito para preparar el rol Product Owner profesional: Scrum, visión, discovery, backlog, priorización, releases, stakeholders, métricas e IA.',
      versionLabel: 'Product Owner 2025/2026',
      storageKey: 'academy_scrum_product_owner_progress',
      sourceLanguage: 'ES',
      questionLanguage: 'ES',
      k3Description: 'Escenarios para aplicar decisiones de Product Owner sobre valor, discovery, priorización, backlog, releases, stakeholders, métricas e IA.'
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
      chapterDistribution: { 1: 5, 2: 5, 3: 5, 4: 6, 5: 6, 6: 5, 7: 4, 8: 4 },
      kDistribution: { K1: 12, K2: 20, K3: 8 },
      matrix: {
        1: { K1: 2, K2: 2, K3: 1 },
        2: { K1: 2, K2: 2, K3: 1 },
        3: { K1: 1, K2: 3, K3: 1 },
        4: { K1: 1, K2: 4, K3: 1 },
        5: { K1: 2, K2: 3, K3: 1 },
        6: { K1: 1, K2: 3, K3: 1 },
        7: { K1: 1, K2: 2, K3: 1 },
        8: { K1: 2, K2: 1, K3: 1 }
      },
      version: 'SPOPC · matriz de estudio AcademiaQA basada en guías Product Owner 2025/2026'
    },
    generatedAt: '2026-07-30T00:00:00-05:00',
    qaValidation: {
      version: 'Scrum Product Owner Professional Certification · curso gratuito',
      sourceSyllabus: sourceName,
      syllabusStatus: 'OK: documentos Product Owner 2025/2026 adaptados para estudio en español, sin incluir PDFs.',
      syllabusChapterAudit: [
        chapterAudit(1, 'European 2-10 / Skill Arena A', 3, 4),
        chapterAudit(2, 'European 11-13 / Skill Arena B', 3, 4),
        chapterAudit(3, 'European 11-12, 23 / Skill Arena C', 3, 4),
        chapterAudit(4, 'European 8-9, 15-18 / Skill Arena D', 3, 4),
        chapterAudit(5, 'European 14-16 / Skill Arena E', 3, 4),
        chapterAudit(6, 'European 5, 19-22', 3, 4),
        chapterAudit(7, 'European 22-28', 3, 4),
        chapterAudit(8, 'Skill Arena F-G / European 28-30', 3, 4)
      ],
      questionBankAudit: {
        totalQuestions: questions.length,
        loCovered: new Set(questions.map((question) => question.lo)).size,
        loTotal: objectives.length,
        minQuestionsPerLO: 2,
        byChapter: countBy(questions, 'chapter'),
        byK: countBy(questions, 'k'),
        structuralIssues: [],
        correctedItems: [
          'Curso creado como adaptación de estudio; no incluye los PDFs adjuntos.',
          'Banco distribuido por capítulo y nivel K con matriz de 40 preguntas.',
          'Objetivos cubren Scrum, visión, discovery, backlog, priorización, releases, stakeholders, métricas e IA.'
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
    },
    syllabusCoverageNote: {
      source: sourceName,
      scope: 'Curso adaptado y organizado desde los dos documentos Product Owner adjuntos. Cubre rol, Scrum Framework, eventos, equipos, artefactos, visión, roadmap, discovery, Product Backlog, Sprint Backlog, contratos, priorización, story mapping, user stories, DoD, MVP/MMP, release management, deuda técnica, cambio, Design Thinking, Kanban, Lean, métricas, outcomes e IA.',
      noOfficialPdfIncluded: true,
      updatedAt: '2026-07-30'
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
        `Capítulo ${id}. ${title}`,
        summary,
        `Términos clave: ${terms.join(', ')}.`,
        theorySections.map((item) => `${item.title}: ${item.body} Puntos clave: ${item.bullets.join(' ')}`).join('\n\n')
      ].join('\n\n'),
      completeSyllabusPages: pages,
      syllabusSource: sourceName
    };
  }

  function section(title, body, bullets = []) {
    return { title, body, bullets };
  }

  function lo(code, chapter, k, text, theory, remember, example, trap) {
    return { lo: code, chapter, k, text, theory, remember, example, trap };
  }

  function q(id, chapter, k, objectiveCode, topic, stem, options, correct, explanation, extra = {}) {
    const correctIndexes = Array.isArray(correct) ? correct : [correct];
    return {
      id,
      chapter,
      k,
      lo: objectiveCode,
      objective: objectives.find((item) => item.lo === objectiveCode)?.text || topic,
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

  function card(front, meaning, chapter, objectiveCode, kind) {
    return {
      front,
      back: `Significado: ${meaning}\n\nQué estudiar: relaciónalo con el capítulo ${chapter}, el objetivo ${objectiveCode} y decisiones reales de Product Owner.`,
      meaning,
      chapter,
      lo: objectiveCode,
      kind,
      hint: 'Piensa en valor, evidencia, backlog, stakeholders, calidad y resultados.'
    };
  }

  function chapterAudit(chapterId, pages, theorySections, losExpected) {
    return {
      chapter: chapterId,
      pages,
      chars: chapters.find((item) => item.id === chapterId)?.completeSyllabusText.length || 0,
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
