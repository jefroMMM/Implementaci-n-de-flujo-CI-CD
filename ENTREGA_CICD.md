# Entrega CI/CD

## Datos del estudiante

Nombre completo: [ESCRIBIR MI NOMBRE COMPLETO]

## Descripcion de la arquitectura

La solucion usa una aplicacion Node.js con Hono, empaquetada en un contenedor Docker y ejecutada en una VPS publica.

El repositorio en GitHub contiene el codigo fuente, pruebas automatizadas, Dockerfile, Docker Compose y el workflow de GitHub Actions.

La VPS `20.49.8.87` recibe el paquete de despliegue por SSH/SCP. En el servidor, Docker Compose reconstruye la imagen y reinicia el contenedor que expone la aplicacion en el puerto `80`.

La arquitectura se mantiene simple para que sea facil de explicar en video: GitHub recibe los cambios, GitHub Actions valida el proyecto y luego publica la version actualizada en la VPS. La aplicacion expone una pagina principal, un endpoint de salud y un endpoint con el resumen del pipeline.

## Explicacion del pipeline CI/CD

El workflow `.github/workflows/deploy.yml` se ejecuta al hacer push a la rama `main`.

Etapas del pipeline:

1. Checkout del repositorio.
2. Instalacion de dependencias con `npm ci`.
3. Ejecucion de pruebas con `npm test`.
4. Compilacion de TypeScript con `npm run build`.
5. Creacion del paquete `deploy-package.tgz`.
6. Copia del paquete hacia la VPS usando SSH.
7. Ejecucion remota de `docker compose up -d --build`.
8. Smoke test contra `http://20.49.8.87/health`.

La validacion y el build se ejecutan antes del despliegue para evitar publicar cambios rotos. El despliegue usa los secrets de GitHub para conectarse por SSH a la VPS sin exponer credenciales en el repositorio.

## Descripcion de la VPS y entorno de despliegue

VPS utilizada:

| Campo | Valor |
| --- | --- |
| IP publica | `20.49.8.87` |
| Usuario SSH esperado | `azureuser` |
| Puerto SSH | `22` |
| Puerto de aplicacion | `80` |
| Directorio de despliegue | `/opt/cicd-vps-demo` |
| Runtime | Docker + Docker Compose |

Secrets requeridos en GitHub:

| Secret | Descripcion |
| --- | --- |
| `VPS_HOST` | IP publica de la VPS. |
| `VPS_USER` | Usuario SSH de la VPS. |
| `VPS_SSH_KEY` | Contenido de la llave privada `.pem`. |

El entorno de despliegue requerido es una VPS Ubuntu con acceso SSH, Docker y Docker Compose instalados, ademas de salida a internet para que el workflow pueda descargar dependencias y ejecutar la verificacion final por HTTP.

## Enlaces

Enlace al repositorio publico: https://github.com/jefroMMM/Implementaci-n-de-flujo-CI-CD

Enlace al video en Google Drive: [PEGAR ENLACE DEL VIDEO AQUÍ]

## Checklist del video de maximo 3 minutos

1. Mostrar la VPS creada o utilizada.
2. Mostrar la aplicacion corriendo en la VPS.
3. Mostrar el repositorio en GitHub.
4. Mostrar el archivo `.github/workflows/deploy.yml`.
5. Mostrar la ejecucion exitosa del pipeline.
6. Mostrar evidencia de validacion, build o despliegue.
7. Mostrar el resultado final funcionando en el servidor.
8. Mostrar el endpoint `/health` respondiendo `status: ok`.
