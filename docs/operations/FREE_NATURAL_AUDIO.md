# Audio natural sin costo en QAvance

## Objetivo

QAvance usa Azure Speech Free F0 para preparar una sola vez cada narración con la voz femenina colombiana `es-CO-SalomeNeural`. El MP3 se almacena de forma privada en Supabase Storage y se reutiliza por hash mientras el texto no cambie.

Los estudiantes nunca generan audio nuevo. Si un archivo todavía no existe, el reproductor usa la voz en español disponible en el dispositivo. Esto evita consumo imprevisto y mantiene el curso funcional durante la generación gradual del catálogo.

## Garantías de costo

- El recurso de Azure debe permanecer en el nivel **Free F0**.
- La base de datos impide reservar más de 500.000 caracteres por mes UTC.
- Solo `service_role` puede reservar y ejecutar generaciones.
- Un usuario autenticado solo puede descargar audios ya almacenados de cursos en los que esté inscrito.
- Las llaves de Azure y `service_role` nunca se incluyen en HTML o JavaScript público.
- Un error del proveedor conserva la reserva de manera conservadora y no reintenta automáticamente durante el mismo ciclo.

La cuota oficial de Azure Speech F0 es de 0,5 millones de caracteres de texto a voz por mes. El servicio también limita F0 a 20 transacciones por 60 segundos. El generador espera 3,2 segundos después de cada archivo nuevo.

## Configuración inicial

1. Crear en Azure un recurso Speech con nivel **Free F0**.
2. Copiar la región y una de las llaves del recurso.
3. Guardarlas como secretos de la Edge Function:

```powershell
npx --yes supabase@2.116.0 secrets set `
  AZURE_SPEECH_KEY="VALOR_PRIVADO" `
  AZURE_SPEECH_REGION="REGION_DEL_RECURSO" `
  --project-ref sysdlcsdvvbaybhqfivj
```

4. Aplicar primero la migración del presupuesto y después desplegar la función:

```powershell
npx --yes supabase@2.116.0 db push --dry-run --project-ref sysdlcsdvvbaybhqfivj
npx --yes supabase@2.116.0 db push --project-ref sysdlcsdvvbaybhqfivj
npx --yes supabase@2.116.0 functions deploy course-audio --project-ref sysdlcsdvvbaybhqfivj
```

## Plan y generación administrativa

El plan no requiere secretos y no llama al proveedor:

```powershell
npm run audio:cache-plan
```

Para generar un lote pequeño, definir temporalmente las credenciales administrativas solo en la terminal:

```powershell
$env:SUPABASE_URL="https://sysdlcsdvvbaybhqfivj.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="VALOR_PRIVADO"
npm run audio:cache-generate -- --limit 20
Remove-Item Env:SUPABASE_SERVICE_ROLE_KEY
```

Para continuar el catálogo completo en un mes con cuota disponible:

```powershell
npm run audio:cache-generate
```

El lote termina automáticamente cuando la base rechaza el siguiente segmento por falta de caracteres. Volver a ejecutar el mes siguiente: los archivos existentes responden `HIT` y no vuelven a generarse.

El catálogo actual requiere tres ciclos gratuitos:

| Ciclo | Segmentos | Caracteres |
| --- | ---: | ---: |
| 1 | 238 | 499.448 |
| 2 | 341 | 499.063 |
| 3 | 97 | 67.834 |

## Cursos futuros y cambios de contenido

1. Añadir o modificar el curso en `courses/catalog.js` y `courses/{key}/course-data.js`.
2. Ejecutar `npm run generate:audio-manifest`.
3. Desplegar la nueva versión de `course-audio` junto con el manifiesto.
4. Ejecutar `npm run audio:cache-plan` y luego el lote administrativo.

El identificador del archivo incluye proveedor, voz, formato, versión y texto normalizado. Un texto sin cambios reutiliza siempre el mismo MP3. Solo el contenido nuevo o editado consume caracteres.

## Verificación operativa

La consulta debe ejecutarse con acceso administrativo, nunca desde el navegador:

```sql
select
  usage_month,
  reserved_characters,
  completed_characters,
  limit_characters,
  limit_characters - reserved_characters as remaining_characters
from private.course_audio_monthly_usage
order by usage_month desc;
```

Pruebas locales obligatorias:

```powershell
npm run generate:audio-manifest
npm run audio:cache-plan
npm run test:unit
npm run test:audio
npm run test:home-advantages
npm run test:seo
```

Referencias oficiales:

- https://azure.microsoft.com/pricing/details/speech/
- https://learn.microsoft.com/azure/ai-services/speech-service/rest-text-to-speech
- https://learn.microsoft.com/azure/ai-services/speech-service/language-support
- https://learn.microsoft.com/azure/ai-services/speech-service/speech-services-quotas-and-limits
