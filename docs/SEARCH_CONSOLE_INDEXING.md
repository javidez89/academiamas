# Indexación en Google Search Console

## Propiedad y sitemap

La propiedad canónica es `https://academiaqaoficial.com/` y el sitemap que debe enviarse es:

```text
https://academiaqaoficial.com/sitemap.xml
```

No se debe enviar la URL de GitHub Pages ni URLs con `#`.

## Secuencia de publicación

1. Desplegar la versión aprobada en `main` y confirmar que `CNAME` conserva `academiaqaoficial.com`.
2. Verificar que `/robots.txt`, `/sitemap.xml`, `/cursos/`, una página de curso y una página de capítulo respondan HTTP 200.
3. En Search Console, abrir **Sitemaps**, enviar `sitemap.xml` y confirmar estado correcto.
4. Usar **Inspección de URLs** y solicitar indexación de una muestra prioritaria.
5. Revisar semanalmente el informe **Indexación > Páginas** y Core Web Vitals.

## URLs prioritarias

```text
https://academiaqaoficial.com/
https://academiaqaoficial.com/cursos/
https://academiaqaoficial.com/curso/ctfl/
https://academiaqaoficial.com/curso/ctfl/capitulo/1/
https://academiaqaoficial.com/curso/ctai/
https://academiaqaoficial.com/curso/ct-genai/
```

Google decide cuándo rastrear e indexar. Solicitar indexación no garantiza inclusión ni posición. Si aparece **Rastreada: actualmente sin indexar**, se debe mejorar contenido y enlazado antes de repetir solicitudes masivas.

## Seguimiento

- Comparar páginas enviadas e indexadas.
- Revisar canonical elegido por Google.
- Corregir 404, redirecciones inesperadas y páginas duplicadas.
- No bloquear todo el sitio con `robots.txt` durante un rollback.
