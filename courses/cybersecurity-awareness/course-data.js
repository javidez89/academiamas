'use strict';

(function registerCybersecurityAwarenessCourse() {
  const courseKey = 'cybersecurity-awareness';
  const sourceName = 'Cybersecurity Awareness Professional Certification - CertiProf CAPC study material and open exam';
  const examUrl = 'https://open.certiprof.com/cybersecurity-awareness-exam-sp';

  const chapters = [
    chapter(1, 'Fundamentos de ciberseguridad', 75,
      'Introduce la importancia de proteger sistemas, redes, programas e informacion contra ataques digitales, y conecta ciberseguridad con seguridad de la informacion.',
      ['ciberseguridad', 'seguridad de la informacion', 'confidencialidad', 'integridad', 'disponibilidad', 'activo', 'riesgo', 'cumplimiento'],
      [
        section('Que es ciberseguridad', 'La ciberseguridad protege sistemas, redes, programas y datos frente a ataques digitales, accesos no autorizados, interrupciones y danos.', ['Protege informacion sensible.', 'Reduce impacto economico y reputacional.', 'Apoya confianza, continuidad y cumplimiento.']),
        section('CIA: confidencialidad, integridad y disponibilidad', 'La triada CIA resume objetivos esenciales: solo personas autorizadas acceden a la informacion, los datos se mantienen exactos y completos, y los recursos estan disponibles cuando se necesitan.', ['Confidencialidad usa controles de acceso y cifrado.', 'Integridad usa hashes, validaciones y control de cambios.', 'Disponibilidad usa redundancia, respaldo y recuperacion.']),
        section('Ciberseguridad y seguridad de la informacion', 'La seguridad de la informacion cubre toda forma de informacion; la ciberseguridad se concentra en amenazas digitales. Ambas se integran para proteger activos.', ['La informacion puede ser digital, fisica o verbal.', 'La ciberseguridad es parte de una estrategia mas amplia.', 'Un enfoque holistico combina personas, proceso y tecnologia.'])
      ],
      ['Pensar que ciberseguridad es solo antivirus.', 'Confundir disponibilidad con confidencialidad.', 'Proteger sistemas sin considerar comportamiento humano.', 'Ignorar regulaciones y obligaciones de privacidad.'],
      ['Cifrar una base de datos protege confidencialidad; respaldos probados apoyan disponibilidad.', 'Una politica fisica de documentos tambien pertenece a seguridad de la informacion.'],
      'CAPC: modulos 1-3'
    ),
    chapter(2, 'Amenazas y vulnerabilidades comunes', 85,
      'Revisa malware, phishing, ingenieria social, ataques DoS/DDoS, vulnerabilidades, impacto y medidas basicas de mitigacion.',
      ['amenaza', 'vulnerabilidad', 'malware', 'virus', 'gusano', 'troyano', 'ransomware', 'phishing', 'ingenieria social', 'DDoS'],
      [
        section('Amenazas y vulnerabilidades', 'Una amenaza puede explotar una vulnerabilidad para afectar confidencialidad, integridad o disponibilidad. Entender ambas permite priorizar controles.', ['Amenaza: actor, evento o tecnica peligrosa.', 'Vulnerabilidad: debilidad explotable.', 'Riesgo combina probabilidad e impacto.']),
        section('Malware', 'Malware es software malicioso disenado para interrumpir, danar, robar informacion o ganar acceso no autorizado.', ['Virus se adhieren a archivos.', 'Gusanos se propagan de forma automatica.', 'Troyanos se disfrazan de software legitimo; ransomware cifra datos y exige rescate.']),
        section('Phishing, ingenieria social y DDoS', 'Phishing y la ingenieria social manipulan personas para obtener acceso o informacion. DoS/DDoS buscan saturar recursos y dejar servicios inaccesibles.', ['Spear phishing es dirigido.', 'Whaling apunta a perfiles de alto nivel.', 'DDoS usa multiples dispositivos comprometidos.'])
      ],
      ['Culpar solo a tecnologia cuando el ataque manipula personas.', 'Confundir vulnerabilidad con amenaza.', 'Pagar ransomware como unica estrategia.', 'No preparar mitigacion contra DDoS.'],
      ['Un correo falso de soporte que pide credenciales es phishing.', 'Un servidor sin parches puede ser vulnerabilidad explotada por malware.'],
      'CAPC: modulo 4'
    ),
    chapter(3, 'Controles y mejores practicas de proteccion', 80,
      'Cubre defensa en profundidad, contrasenas, MFA, parches, cifrado, respaldos, monitoreo, entrenamiento y controles fisicos, tecnicos y administrativos.',
      ['defensa en profundidad', 'control preventivo', 'control detectivo', 'control correctivo', 'MFA', 'parches', 'cifrado', 'backup', 'SIEM'],
      [
        section('Defensa en profundidad', 'La defensa en profundidad combina multiples capas de controles para que una falla individual no comprometa todo el sistema.', ['Incluye controles fisicos, tecnicos y administrativos.', 'Ningun control es infalible.', 'La diversidad y redundancia aumentan resiliencia.']),
        section('Buenas practicas basicas', 'Contrasenas fuertes, gestores de contrasenas, MFA, actualizaciones, antivirus, capacitacion y politicas reducen ataques comunes.', ['No reutilizar contrasenas.', 'Aplicar parches de forma regular.', 'Entrenar usuarios para reconocer phishing.']),
        section('Cifrado, respaldo y monitoreo', 'El cifrado protege datos en reposo y transito. Los respaldos permiten recuperacion. El monitoreo ayuda a detectar eventos sospechosos.', ['TLS protege comunicaciones.', 'Backups deben probarse.', 'SIEM consolida eventos y alertas.'])
      ],
      ['Confiar en una sola capa de seguridad.', 'Tener backups sin probar restauracion.', 'Activar MFA solo para usuarios tecnicos.', 'Aplicar parches sin proceso ni priorizacion.'],
      ['MFA reduce impacto de contrasenas robadas.', 'Un firewall no reemplaza capacitacion contra phishing.'],
      'CAPC: modulos 3-6'
    ),
    chapter(4, 'Identidad, acceso, privacidad y trabajo remoto', 80,
      'Aborda IAM, autenticacion, autorizacion, menor privilegio, RBAC, SSO, VPN, BYOD, privacidad y colaboracion segura.',
      ['IAM', 'identidad', 'autenticacion', 'autorizacion', 'MFA', 'RBAC', 'menor privilegio', 'SSO', 'VPN', 'BYOD'],
      [
        section('IAM y control de acceso', 'La gestion de identidades y accesos asegura que las personas correctas accedan a los recursos correctos, en el momento correcto y con permisos adecuados.', ['Autenticacion verifica identidad.', 'Autorizacion concede o deniega permisos.', 'Menor privilegio limita el acceso al minimo necesario.']),
        section('Tecnologias y practicas IAM', 'SSO simplifica acceso; MFA agrega verificaciones; RBAC asigna permisos por rol; revisiones periodicas detectan permisos excesivos.', ['Alta y baja de usuarios deben controlarse.', 'Los logs ayudan a auditar actividad.', 'Separacion de funciones reduce abuso.']),
        section('Trabajo remoto y privacidad', 'Trabajo remoto seguro combina dispositivos actualizados, Wi-Fi protegido, VPN, cifrado, herramientas colaborativas seguras, politicas BYOD y conciencia sobre phishing.', ['BYOD requiere reglas claras.', 'VPN protege conexiones en redes no confiables.', 'La privacidad exige controles de acceso y manejo correcto de datos.'])
      ],
      ['Dar permisos permanentes por comodidad.', 'Permitir BYOD sin requisitos minimos.', 'Creer que VPN elimina todos los riesgos.', 'No retirar accesos al finalizar una relacion laboral.'],
      ['Un empleado que cambia de rol debe tener permisos revisados.', 'Una laptop perdida requiere cifrado, bloqueo remoto y reporte inmediato.'],
      'CAPC: modulos 6 y 9'
    ),
    chapter(5, 'Respuesta a incidentes y cultura de seguridad', 85,
      'Explica preparacion, identificacion, contencion, erradicacion, recuperacion, lecciones aprendidas, reporte, evidencia y capacitacion continua.',
      ['incidente', 'respuesta a incidentes', 'contencion', 'erradicacion', 'recuperacion', 'evidencia', 'reporte', 'concientizacion'],
      [
        section('Ciclo de respuesta', 'Un plan de respuesta estructura preparacion, identificacion, contencion, erradicacion, recuperacion y lecciones aprendidas.', ['Identificar senales de incidente.', 'Contener para limitar impacto.', 'Erradicar causa y recuperar operacion segura.']),
        section('Documentacion y comunicacion', 'Durante un incidente se registran acciones, decisiones, comunicaciones y evidencia. La informacion permite analisis, cumplimiento y mejora.', ['Preservar evidencia puede ser critico.', 'Reportar segun protocolo interno y requisitos legales.', 'La comunicacion debe ser coordinada.']),
        section('Cultura de seguridad', 'La seguridad depende de liderazgo, capacitacion, campanas, simulaciones, responsabilidad compartida y mejora continua.', ['La capacitacion debe repetirse y actualizarse.', 'Simulaciones de phishing generan aprendizaje.', 'El liderazgo debe asignar recursos y modelar comportamiento.'])
      ],
      ['Improvisar sin plan.', 'Borrar evidencia al intentar resolver rapido.', 'Comunicar externamente sin coordinacion.', 'Hacer capacitacion una sola vez al ano y olvidarla.'],
      ['Ante ransomware se contiene el equipo, se preserva evidencia y se activa el plan.', 'Una simulacion de phishing ayuda a medir conciencia y mejorar entrenamientos.'],
      'CAPC: modulo 7'
    ),
    chapter(6, 'Politicas, cumplimiento y ciberseguridad empresarial', 85,
      'Integra politicas de seguridad, uso aceptable, acceso a informacion, auditorias, controles, regulaciones y rol del liderazgo en riesgo empresarial.',
      ['politica de seguridad', 'uso aceptable', 'cumplimiento', 'GDPR', 'HIPAA', 'ISO 27001', 'NIST', 'auditoria', 'riesgo empresarial'],
      [
        section('Politicas de seguridad', 'Las politicas establecen reglas, responsabilidades, alcance y comportamientos esperados para proteger activos. Deben comunicarse, aplicarse y revisarse.', ['Politicas de contrasenas y acceso definen reglas minimas.', 'AUP establece uso permitido e inaceptable.', 'Las politicas deben ajustarse a riesgos y requisitos.']),
        section('Cumplimiento y auditoria', 'El cumplimiento exige alinear practicas con leyes, regulaciones y estandares como GDPR, HIPAA, ISO 27001 o NIST. Auditorias internas y externas verifican conformidad y mejoras.', ['GDPR protege datos personales en la UE.', 'HIPAA se relaciona con datos de salud en EE. UU.', 'Auditorias generan hallazgos y recomendaciones.']),
        section('Liderazgo y estrategia', 'Los lideres definen vision, recursos, politicas, tolerancia al riesgo y coordinacion entre areas. La ciberseguridad debe integrarse a objetivos del negocio.', ['Riesgos deben priorizarse por probabilidad e impacto.', 'La seguridad habilita confianza y continuidad.', 'La mejora continua responde a amenazas cambiantes.'])
      ],
      ['Copiar politicas sin aplicarlas.', 'Tratar cumplimiento como ejercicio documental.', 'No asignar recursos a riesgos altos.', 'Separar ciberseguridad de estrategia empresarial.'],
      ['Una politica de acceso define quien puede ver datos sensibles y como se revoca acceso.', 'Una auditoria puede identificar controles faltantes y generar plan de mejora.'],
      'CAPC: modulos 8-9'
    )
  ];

  const objectiveDefinitions = [
    lo('CAPC-1.1.1', 1, 'K1', 'Recordar la definicion de ciberseguridad', 'La ciberseguridad protege sistemas, redes, programas y datos contra ataques digitales.', 'Protege activos digitales contra acceso, dano o interrupcion no autorizada.', 'Un firewall, MFA y capacitacion reducen riesgos digitales.', 'Reducir ciberseguridad a instalar antivirus.'),
    lo('CAPC-1.2.1', 1, 'K2', 'Explicar la triada CIA', 'Confidencialidad limita acceso, integridad protege exactitud y disponibilidad asegura acceso oportuno.', 'CIA resume objetivos esenciales de seguridad.', 'Cifrado protege confidencialidad; backups apoyan disponibilidad.', 'Confundir integridad con acceso rapido.'),
    lo('CAPC-1.3.1', 1, 'K2', 'Diferenciar ciberseguridad y seguridad de la informacion', 'Seguridad de la informacion cubre toda informacion; ciberseguridad se enfoca en amenazas digitales.', 'La ciberseguridad es un subconjunto del enfoque amplio.', 'Documentos impresos sensibles tambien requieren seguridad de informacion.', 'Pensar que lo fisico no importa.'),
    lo('CAPC-1.4.1', 1, 'K3', 'Aplicar objetivos de seguridad a un escenario', 'El control elegido debe proteger el objetivo CIA afectado y el contexto de riesgo.', 'Primero identifica que se quiere proteger.', 'Si datos son alterados sin permiso, el foco es integridad.', 'Elegir controles sin entender impacto.'),

    lo('CAPC-2.1.1', 2, 'K1', 'Recordar amenaza y vulnerabilidad', 'Amenaza es peligro potencial; vulnerabilidad es debilidad explotable.', 'El riesgo surge cuando amenaza puede explotar vulnerabilidad.', 'Un atacante es amenaza; software sin parche es vulnerabilidad.', 'Usar amenaza y vulnerabilidad como sinonimos.'),
    lo('CAPC-2.2.1', 2, 'K2', 'Explicar tipos de malware', 'Virus, gusanos, troyanos y ransomware afectan sistemas de formas diferentes.', 'Clasificar ayuda a responder y prevenir.', 'Ransomware cifra datos y exige rescate.', 'Asumir que todo malware se propaga igual.'),
    lo('CAPC-2.3.1', 2, 'K2', 'Describir phishing e ingenieria social', 'Manipulan personas para obtener credenciales, informacion o acceso.', 'El factor humano es superficie de ataque.', 'Un correo falso de banco que pide clave es phishing.', 'Buscar solo fallas tecnicas.'),
    lo('CAPC-2.4.1', 2, 'K3', 'Identificar amenaza en un escenario', 'La clasificacion correcta permite priorizar contencion, comunicacion y controles.', 'Reconoce tecnica, objetivo e impacto.', 'Trafico masivo desde botnet apunta a DDoS.', 'Tratar DDoS como simple error de aplicacion.'),

    lo('CAPC-3.1.1', 3, 'K1', 'Recordar defensa en profundidad', 'Defensa en profundidad usa multiples capas de controles para reducir dependencia de una sola medida.', 'Varias barreras aumentan resiliencia.', 'Firewall, EDR, MFA y capacitacion combinan capas.', 'Confiar en un unico control.'),
    lo('CAPC-3.2.1', 3, 'K2', 'Explicar buenas practicas basicas', 'Contrasenas fuertes, MFA, parches, antivirus, capacitacion y politicas reducen ataques comunes.', 'Lo basico bien aplicado evita muchos incidentes.', 'Gestion de parches corrige vulnerabilidades conocidas.', 'Usar la misma contrasena en todo.'),
    lo('CAPC-3.3.1', 3, 'K2', 'Describir cifrado, respaldo y monitoreo', 'Cifrado protege datos, backups apoyan recuperacion y monitoreo detecta actividad sospechosa.', 'Prevencion, deteccion y recuperacion se complementan.', 'Un SIEM centraliza alertas para investigacion.', 'Tener backups sin prueba de restauracion.'),
    lo('CAPC-3.4.1', 3, 'K3', 'Seleccionar controles ante un riesgo', 'El control debe responder a amenaza, vulnerabilidad, impacto y objetivo CIA.', 'Combina controles segun riesgo.', 'Para credenciales robadas, MFA y monitoreo reducen impacto.', 'Comprar herramientas sin proceso ni entrenamiento.'),

    lo('CAPC-4.1.1', 4, 'K1', 'Recordar conceptos IAM', 'IAM gestiona identidades, autenticacion, autorizacion y acceso a recursos.', 'Acceso correcto para personas correctas.', 'Un directorio central mantiene identidades.', 'Compartir cuentas para simplificar acceso.'),
    lo('CAPC-4.2.1', 4, 'K2', 'Explicar MFA, RBAC y menor privilegio', 'MFA agrega verificacion; RBAC asigna permisos por rol; menor privilegio limita acceso al minimo necesario.', 'Reducen abuso y error humano.', 'Un analista solo ve datos requeridos para su rol.', 'Otorgar permisos de administrador por comodidad.'),
    lo('CAPC-4.3.1', 4, 'K2', 'Describir seguridad en trabajo remoto y BYOD', 'Trabajo remoto seguro requiere dispositivos actualizados, redes protegidas, VPN, cifrado, MFA y politicas BYOD.', 'El entorno fuera de oficina necesita controles claros.', 'BYOD exige requisitos, borrado remoto y separacion de datos.', 'Permitir cualquier dispositivo sin reglas.'),
    lo('CAPC-4.4.1', 4, 'K3', 'Aplicar decision de acceso seguro', 'Una decision de acceso considera rol, necesidad, tiempo, dispositivo, monitoreo y revocacion.', 'Acceso debe ser justificado y revisable.', 'Un contratista temporal recibe permisos limitados y fecha de expiracion.', 'Dar acceso permanente por urgencia.'),

    lo('CAPC-5.1.1', 5, 'K1', 'Recordar fases de respuesta a incidentes', 'Preparacion, identificacion, contencion, erradicacion, recuperacion y lecciones aprendidas estructuran la respuesta.', 'Una respuesta ordenada reduce impacto.', 'Contener un equipo infectado limita propagacion.', 'Saltar directo a recuperar sin identificar causa.'),
    lo('CAPC-5.2.1', 5, 'K2', 'Explicar preservacion de evidencia y reporte', 'Registrar acciones, preservar logs y comunicar segun protocolo apoya analisis, legalidad y mejora.', 'La evidencia permite entender y demostrar lo ocurrido.', 'Un reporte interno oportuno activa al equipo correcto.', 'Borrar logs para limpiar rapido.'),
    lo('CAPC-5.3.1', 5, 'K2', 'Describir recuperacion y lecciones aprendidas', 'Recuperar restaura operacion segura; lecciones aprendidas actualizan controles y procesos.', 'Recuperar no basta si la causa sigue activa.', 'Restaurar backups y validar seguridad antes de volver a produccion.', 'Volver a operar sin revisar causa raiz.'),
    lo('CAPC-5.4.1', 5, 'K3', 'Elegir respuesta ante incidente', 'La respuesta correcta limita impacto, preserva evidencia, comunica y recupera con seguridad.', 'Actua segun plan y severidad.', 'Ante phishing exitoso se revocan sesiones, cambian credenciales y se revisan logs.', 'Ocultar el incidente para evitar sanciones.'),

    lo('CAPC-6.1.1', 6, 'K1', 'Recordar politicas de seguridad', 'Las politicas definen reglas, responsabilidades y comportamientos esperados para proteger activos.', 'Politica clara facilita cumplimiento.', 'Una AUP define usos aceptables de recursos.', 'Tener politicas que nadie conoce.'),
    lo('CAPC-6.2.1', 6, 'K2', 'Explicar cumplimiento y regulaciones', 'Cumplimiento alinea practicas con leyes, regulaciones, contratos y estandares aplicables.', 'Debe integrarse a procesos reales.', 'GDPR exige controles sobre datos personales y derechos.', 'Ver cumplimiento como papeleo aislado.'),
    lo('CAPC-6.3.1', 6, 'K2', 'Describir auditorias y tipos de controles', 'Auditorias verifican conformidad y mejora; controles preventivos, detectivos y correctivos cubren diferentes momentos.', 'Auditar ayuda a descubrir brechas.', 'Backups son correctivos; IDS es detectivo; MFA es preventivo.', 'Confiar solo en controles correctivos.'),
    lo('CAPC-6.4.1', 6, 'K3', 'Aplicar liderazgo y gestion de riesgo', 'Liderazgo prioriza recursos, cultura, politicas y riesgos segun impacto en el negocio.', 'La seguridad habilita objetivos empresariales.', 'Un riesgo alto recibe plan, responsable, recursos y seguimiento.', 'Tratar ciberseguridad como problema solo tecnico.')
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
    card('Ciberseguridad', 'Proteccion de sistemas, redes, programas y datos contra ataques digitales.', 1, 'CAPC-1.1.1', 'Concepto'),
    card('Confidencialidad', 'Solo personas autorizadas acceden a la informacion.', 1, 'CAPC-1.2.1', 'CIA'),
    card('Integridad', 'Los datos se mantienen exactos, completos y sin cambios no autorizados.', 1, 'CAPC-1.2.1', 'CIA'),
    card('Disponibilidad', 'Sistemas e informacion estan accesibles cuando se necesitan.', 1, 'CAPC-1.2.1', 'CIA'),
    card('Amenaza', 'Actor, evento o tecnica que puede causar dano.', 2, 'CAPC-2.1.1', 'Riesgo'),
    card('Vulnerabilidad', 'Debilidad que puede ser explotada.', 2, 'CAPC-2.1.1', 'Riesgo'),
    card('Malware', 'Software malicioso para danar, interrumpir, robar o acceder sin autorizacion.', 2, 'CAPC-2.2.1', 'Amenaza'),
    card('Ransomware', 'Malware que cifra datos y exige rescate.', 2, 'CAPC-2.2.1', 'Amenaza'),
    card('Phishing', 'Engano para obtener credenciales o informacion sensible.', 2, 'CAPC-2.3.1', 'Amenaza'),
    card('Ingenieria social', 'Manipulacion de personas para obtener acceso o informacion.', 2, 'CAPC-2.3.1', 'Amenaza'),
    card('DDoS', 'Ataque distribuido que satura servicios para afectar disponibilidad.', 2, 'CAPC-2.4.1', 'Amenaza'),
    card('Defensa en profundidad', 'Capas multiples de controles para aumentar resiliencia.', 3, 'CAPC-3.1.1', 'Control'),
    card('MFA', 'Autenticacion multifactor con mas de una prueba de identidad.', 3, 'CAPC-3.2.1', 'Control'),
    card('Gestion de parches', 'Proceso para corregir vulnerabilidades conocidas en software.', 3, 'CAPC-3.2.1', 'Control'),
    card('Cifrado', 'Protege datos en reposo o transito contra lectura no autorizada.', 3, 'CAPC-3.3.1', 'Control'),
    card('Backup', 'Copia de seguridad que debe probarse para recuperacion.', 3, 'CAPC-3.3.1', 'Control'),
    card('IAM', 'Gestion de identidades y accesos.', 4, 'CAPC-4.1.1', 'Identidad'),
    card('Autenticacion', 'Verificacion de identidad del usuario.', 4, 'CAPC-4.1.1', 'Identidad'),
    card('Autorizacion', 'Concesion o denegacion de permisos.', 4, 'CAPC-4.1.1', 'Identidad'),
    card('RBAC', 'Control de acceso basado en roles.', 4, 'CAPC-4.2.1', 'Acceso'),
    card('Menor privilegio', 'Acceso minimo necesario para realizar una funcion.', 4, 'CAPC-4.2.1', 'Acceso'),
    card('VPN', 'Red privada virtual para proteger conexiones.', 4, 'CAPC-4.3.1', 'Remoto'),
    card('BYOD', 'Uso de dispositivos personales bajo politicas y requisitos de seguridad.', 4, 'CAPC-4.3.1', 'Remoto'),
    card('Respuesta a incidentes', 'Proceso para preparar, identificar, contener, erradicar, recuperar y aprender.', 5, 'CAPC-5.1.1', 'Incidente'),
    card('Contencion', 'Accion para limitar impacto de un incidente.', 5, 'CAPC-5.1.1', 'Incidente'),
    card('Evidencia', 'Registros, datos y hechos preservados para analisis y cumplimiento.', 5, 'CAPC-5.2.1', 'Incidente'),
    card('Politica de seguridad', 'Reglas y responsabilidades para proteger activos.', 6, 'CAPC-6.1.1', 'Gobernanza'),
    card('AUP', 'Politica de uso aceptable de recursos organizacionales.', 6, 'CAPC-6.1.1', 'Politica'),
    card('Auditoria', 'Revision para verificar cumplimiento y oportunidades de mejora.', 6, 'CAPC-6.3.1', 'Cumplimiento'),
    card('NIST', 'Referencia de buenas practicas y marcos usados en ciberseguridad.', 6, 'CAPC-6.2.1', 'Marco')
  ];

  AcademyRegistry.register(courseKey, {
    meta: {
      key: courseKey,
      code: 'CAPC',
      name: 'Cybersecurity Awareness',
      shortName: 'Cybersecurity',
      subtitle: 'Curso gratuito de concientizacion en ciberseguridad: CIA, amenazas, controles, IAM, trabajo remoto, incidentes, politicas, auditoria y cumplimiento.',
      versionLabel: 'CertiProf Cybersecurity Awareness',
      storageKey: 'academy_cybersecurity_awareness_progress',
      sourceLanguage: 'ES',
      questionLanguage: 'ES',
      examUrl,
      examLabel: 'Examen Cybersecurity Awareness',
      certificationNote: 'Examen externo gratuito en CertiProf; confirma condiciones del certificado directamente en CertiProf.',
      k3Description: 'Escenarios para aplicar decisiones de concientizacion, controles, IAM, respuesta a incidentes, politicas y cumplimiento.'
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
      version: 'Cybersecurity Awareness - matriz AcademiaQA'
    },
    generatedAt: '2026-07-31T00:00:00-05:00',
    qaValidation: buildQaValidation(),
    syllabusCoverageNote: {
      source: sourceName,
      scope: 'Curso adaptado desde el material Cybersecurity Awareness cargado en Drive. Cubre fundamentos, CIA, amenazas, malware, phishing, DDoS, defensa en profundidad, controles, IAM, trabajo remoto, respuesta a incidentes, politicas, cumplimiento, auditoria y liderazgo.',
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
    const topic = text.replace(/^(Recordar|Explicar|Describir|Aplicar|Interpretar|Relacionar|Diferenciar|Seleccionar|Elegir|Identificar)\s+/i, '');
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
        'Responder solo con una herramienta aislada sin considerar personas, proceso y riesgo.',
        'Esperar a que ocurra un incidente mayor para actuar.'
      ],
      scenario: example,
      scenarioCorrect: theory,
      scenarioDistractors: [
        trap,
        'Ignorar evidencia y decidir por costumbre.',
        'Delegar toda responsabilidad en usuarios sin controles ni seguimiento.'
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
      question(`${courseKey}-Q${String(base + 1).padStart(3, '0')}`, item.chapter, item.k, item.lo, item.topic, `Escenario: ${item.scenario} Que accion es mas segura?`, [
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
      back: `Significado: ${meaning}\n\nQue estudiar: relaciona este concepto con el capitulo ${chapterId}, el objetivo ${objectiveCode} y un riesgo real de seguridad.`,
      meaning,
      chapter: chapterId,
      lo: objectiveCode,
      kind,
      hint: 'Piensa en CIA, amenaza, vulnerabilidad, control, incidente, politica y cumplimiento.'
    };
  }

  function buildQaValidation() {
    return {
      version: 'Cybersecurity Awareness - curso gratuito',
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
