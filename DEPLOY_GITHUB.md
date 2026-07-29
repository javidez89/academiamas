# Publicar en GitHub Pages

## Opción recomendada: publicar desde la rama `main`

1. Crea un repositorio nuevo en GitHub.
2. Usa un nombre corto, por ejemplo: `istqb-academia`.
3. Déjalo **Public** para utilizar GitHub Pages con la configuración más sencilla.
4. No marques opciones que agreguen archivos automáticamente si ya vas a subir este paquete.
5. Extrae `ISTQB_ACADEMIA_GITHUB_PAGES_READY.zip` en tu computador.
6. En el repositorio, selecciona **Add file → Upload files**.
7. Sube **el contenido extraído**, de modo que `index.html`, `assets/` y `courses/` queden en la raíz del repositorio.
8. Confirma la carga con **Commit changes**.
9. Abre **Settings → Pages**.
10. En **Build and deployment**, selecciona:
    - **Source:** Deploy from a branch
    - **Branch:** `main`
    - **Folder:** `/ (root)`
11. Guarda la configuración.
12. Espera a que GitHub complete el despliegue y abre la URL mostrada en Pages.

La dirección normalmente tendrá esta forma:

```text
https://TU-USUARIO.github.io/istqb-academia/
```

## Estructura que debe quedar en la raíz

```text
index.html
.nojekyll
assets/
courses/
README.md
SECURITY.md
ARCHITECTURE.md
```

No subas la carpeta contenedora como un único nivel adicional. Si el repositorio termina con una ruta como `ISTQB_ACADEMIA_GITHUB_PAGES_READY/index.html`, Pages no encontrará la página inicial en la raíz.

## Actualizaciones futuras

Para publicar una nueva versión, reemplaza únicamente los archivos modificados y crea un nuevo commit. GitHub Pages volverá a desplegar el sitio automáticamente.

## Dominio personalizado

Puedes configurarlo más adelante desde **Settings → Pages → Custom domain**. No agregues un archivo `CNAME` hasta tener definido el dominio y sus registros DNS.
