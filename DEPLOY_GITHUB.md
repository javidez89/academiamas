# Publicar en GitHub Pages

## Repositorio oficial

- Repositorio: `javidez89/academiamas`
- Rama prevista: `main`
- Página oficial: `https://academiaqaoficial.com/`

## Publicar desde la rama `main`

1. Verifica que `index.html`, `assets/`, `courses/`, `.nojekyll` y la documentación estén en la raíz del repositorio.
2. Confirma que no se incluyeron PDFs oficiales ni credenciales.
3. Crea un commit con los cambios revisados.
4. Sube la rama `main` a GitHub.
5. En GitHub, abre **Settings > Pages**.
6. En **Build and deployment**, selecciona:
   - **Source:** Deploy from a branch
   - **Branch:** `main`
   - **Folder:** `/ (root)`
7. Guarda la configuración y espera el despliegue.

## Estructura en la raíz

```text
index.html
.nojekyll
assets/
courses/
README.md
SECURITY.md
ARCHITECTURE.md
NOTICE.md
```

No subas una carpeta contenedora adicional. GitHub Pages debe encontrar `index.html` directamente en la raíz configurada.

## Actualizaciones futuras

Para publicar una nueva versión, reemplaza únicamente los archivos modificados, valida el front y crea un commit claro. GitHub Pages volverá a desplegar automáticamente después del push.

## Gobierno CI/CD

Toda actualización debe entrar a `main` mediante pull request y superar los checks obligatorios de GitHub Actions. La estrategia de ramas, versionamiento, pruebas, despliegue y rollback está definida en [`docs/CI_CD_GOVERNANCE.md`](docs/CI_CD_GOVERNANCE.md).
