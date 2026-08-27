# Etapa 1: línea base y trazabilidad

Fecha de captura: 27 de agosto de 2026 (UTC).

## Alcance

Esta etapa congela una línea base reproducible antes de reemplazar el progreso calculado en el navegador por eventos verificados en servidor. No modifica la base de datos de producción, no despliega funciones y no contiene datos personales.

## Puntos de retorno

- Producción anterior verificada (`main`): `e8838cb6eb51f5a7d094449f259b54d3779525a4`.
- Rama remota al iniciar: `177b97b32929aab996cbce9cb83c4915e3c008e4`.
- Front 0.19.0 verificado localmente: `f3fe549e03d22c010cd5e4c04de660566c4f182e`.
- Rama de trabajo: `codex/server-authoritative-progress`.

## Fotografía sanitaria de Supabase

- Proyecto `ACTIVE_HEALTHY`, región `sa-east-1`, PostgreSQL `17.6.1.155`.
- Huella lógica de esquemas `public` y `private`: `82d9a6cb3217778b301281bb5e06a7bd`.
- 21 migraciones aplicadas; última versión `20260826013814`.
- 111 usuarios y 111 perfiles; no se exportaron nombres, correos ni identificadores.
- 131 inscripciones, 126 filas de progreso y 17 sesiones de actividad.
- 12 órdenes de constancia y 4 constancias emitidas.
- 0 objetos de audio almacenados.

El snapshot estructurado se conserva en `supabase/baselines/2026-08-27-production.json` y se valida con `npm run test:migration-baseline`.

## Reconciliación

- Se añadieron al repositorio las dos migraciones de perfiles que existían únicamente en el historial remoto.
- Se alinearon 15 marcas de tiempo locales con sus versiones aplicadas en producción.
- Se restauró el contenido histórico original de `certificates_payments`; sus endurecimientos posteriores siguen separados en las migraciones siguientes.
- Las 21 migraciones versionadas tienen la misma huella normalizada que el historial remoto.
- No se usó `migration repair`, `db push`, `apply_migration` ni ninguna escritura contra producción.
- El replay completo con `supabase db reset` queda pendiente porque este equipo no tiene instalados Supabase CLI ni Docker. La igualdad de historial y contenido sí quedó validada automáticamente; no se utilizó producción como sustituto de una base local.

## Alertas conservadas

- `course_audio_usage` tiene RLS sin políticas: funciona como denegación por defecto y requiere revisión junto con la corrección del servicio de audio.
- `public_learning_activity_summary()` es `SECURITY DEFINER` y ejecutable por roles públicos: su exposición agregada se revisará al construir los agregados autoritativos.
- La protección de contraseñas filtradas está desactivada; el acceso actual es Google OAuth, pero la configuración debe revisarse antes de habilitar contraseña.
- Hay dos índices aún sin uso observado; no se eliminan sin evidencia de carga suficiente.

## Criterio de salida

La etapa queda lista para aprobación cuando el auditor de migraciones, la suite estática, las pruebas funcionales y el estado Git sean verdes. La Etapa 2 no debe iniciar ni desplegarse sin aprobación explícita.
