# Implementacion de flujo CI/CD hacia VPS

Proyecto demostrativo para validar y desplegar una aplicacion Node.js en una VPS usando GitHub Actions, SSH y Docker Compose.

La carpeta `week-14` se mantiene como referencia del curso. La implementacion desplegable esta en la raiz del repositorio y no copia el ejemplo directamente.

## Arquitectura

```mermaid
flowchart LR
    Dev[Desarrollador] -->|git push main| Repo[Repositorio GitHub]
    Repo --> Runner[GitHub Actions runner]
    Runner -->|npm ci, test, build| Validacion[Validacion CI]
    Runner -->|scp deploy-package.tgz| VPS[VPS 20.49.8.87]
    VPS --> Compose[Docker Compose]
    Compose --> Container[Contenedor Node.js]
    Browser[Navegador] -->|http://20.49.8.87| Container
```

Componentes principales:

| Componente | Funcion |
| --- | --- |
| App Node.js + Hono | Servicio HTTP con pagina de evidencia, `/health` y `/api/pipeline`. |
| GitHub Actions | Ejecuta validacion automatica y despliegue al hacer push a `main`. |
| SSH + SCP | Copia el paquete de despliegue hacia la VPS usando GitHub Secrets. |
| Docker Compose | Construye y reinicia el contenedor en la VPS. |
| VPS Azure | Servidor `20.49.8.87`, usuario esperado `azureuser`, puerto publico `80`. |

## Aplicacion

Endpoints disponibles:

| Ruta | Descripcion |
| --- | --- |
| `/` | Pagina HTML para mostrar evidencia visual del despliegue. |
| `/health` | JSON de salud del servicio, commit y uptime. |
| `/api/pipeline` | JSON con los pasos del pipeline CI/CD. |

## Flujo CI/CD

El workflow esta en `.github/workflows/deploy.yml` y se ejecuta con:

| Evento | Resultado |
| --- | --- |
| `push` a `main` | Valida, empaqueta, copia a la VPS y despliega. |
| `workflow_dispatch` | Permite ejecutar manualmente desde GitHub Actions. |

Pasos principales del pipeline:

1. `actions/checkout@v4`
2. `actions/setup-node@v4`
3. `npm ci`
4. `npm test`
5. `npm run build`
6. Crear `deploy-package.tgz`
7. Copiar el paquete a la VPS con `appleboy/scp-action`
8. Ejecutar `docker compose up -d --build` por SSH
9. Verificar `http://20.49.8.87/health` con `curl`

## GitHub Secrets

Configura estos secrets en el repositorio de GitHub:

| Secret | Valor |
| --- | --- |
| `VPS_HOST` | `20.49.8.87` |
| `VPS_USER` | `azureuser` |
| `VPS_SSH_KEY` | Contenido completo de `C:\Users\JefroMM\Downloads\vm-app-ia-01_key.pem` |

Opcion con interfaz web:

1. Entrar al repositorio en GitHub.
2. Ir a `Settings > Secrets and variables > Actions`.
3. Crear `VPS_HOST`, `VPS_USER` y `VPS_SSH_KEY`.
4. En `VPS_SSH_KEY`, pegar el contenido completo del archivo `.pem`, incluyendo las lineas `BEGIN` y `END`.

Opcion con GitHub CLI:

```powershell
gh secret set VPS_HOST --body "20.49.8.87"
gh secret set VPS_USER --body "azureuser"
Get-Content "C:\Users\JefroMM\Downloads\vm-app-ia-01_key.pem" -Raw | gh secret set VPS_SSH_KEY
```

Otra opcion es abrir GitHub y pegar manualmente el contenido completo de la llave en `Settings > Secrets and variables > Actions > New repository secret`.

No subas el archivo `.pem` al repositorio. El `.gitignore` ya bloquea `*.pem`, `.env`, llaves y archivos comunes de credenciales.

## Preparar la VPS

Conectarse a la VPS:

```powershell
ssh -i "C:\Users\JefroMM\Downloads\vm-app-ia-01_key.pem" azureuser@20.49.8.87
```

Instalar dependencias necesarias en Ubuntu/Debian:

```bash
sudo apt-get update
curl -fsSL https://get.docker.com | sh
sudo apt-get install -y rsync
sudo mkdir -p /opt/cicd-vps-demo
sudo chown -R azureuser:azureuser /opt/cicd-vps-demo
docker --version
docker compose version
```

Si el usuario no puede ejecutar Docker sin `sudo`, el workflow sigue usando `sudo docker compose`. En Azure normalmente `azureuser` tiene permisos de `sudo` sin password.

Revisar firewall o reglas de red:

```bash
sudo ufw status
```

En Azure, confirma que el grupo de seguridad permita entrada TCP para:

| Puerto | Uso |
| --- | --- |
| `22` | SSH |
| `80` | Aplicacion web |

## Ejecutar localmente

Instalar dependencias:

```powershell
npm install
```

Ejecutar pruebas:

```powershell
npm test
```

Compilar TypeScript:

```powershell
npm run build
```

Levantar en modo desarrollo:

```powershell
npm run dev
```

Probar endpoints locales:

```powershell
curl http://localhost:3000/health
curl http://localhost:3000/api/pipeline
```

## Probar con Docker local

```powershell
docker compose up -d --build
curl http://localhost/health
docker compose logs -f app
docker compose down
```

## Desplegar

Despues de configurar los GitHub Secrets y preparar la VPS:

```powershell
git status
git add README.md ENTREGA_CICD.md .gitignore .dockerignore .github/workflows/deploy.yml package.json package-lock.json tsconfig.json vitest.config.ts Dockerfile compose.yml src test
git commit -m "Implement CI/CD deployment to VPS"
git push origin main
```

Si el curso exige subir tambien `week-14`, agregala de forma explicita con `git add week-14`. En esta implementacion se uso como referencia y no fue modificada.

Luego entra a `Actions` en GitHub y revisa la ejecucion del workflow `CI/CD deploy to VPS`.

Cuando finalice correctamente, valida:

```powershell
curl http://20.49.8.87/health
```

Tambien puedes abrir:

```text
http://20.49.8.87/
```

## Evidencia esperada para el video

Checklist sugerido para una grabacion de maximo 3 minutos:

1. Mostrar la VPS creada o utilizada en Azure.
2. Mostrar que el puerto `80` esta permitido para la aplicacion.
3. Mostrar el repositorio en GitHub.
4. Mostrar el archivo `.github/workflows/deploy.yml`.
5. Mostrar una ejecucion exitosa del pipeline en GitHub Actions.
6. Mostrar evidencia de validacion: `npm test` y `npm run build` en el job.
7. Mostrar evidencia de despliegue: pasos SCP, SSH y `docker compose up -d --build`.
8. Mostrar la aplicacion funcionando en `http://20.49.8.87/`.
9. Mostrar `http://20.49.8.87/health` devolviendo `status: ok`.

## Seguridad

Reglas aplicadas:

| Riesgo | Mitigacion |
| --- | --- |
| Llave `.pem` subida al repo | `.gitignore` bloquea `*.pem`. |
| Secretos escritos en YAML | El workflow usa `secrets.VPS_HOST`, `secrets.VPS_USER` y `secrets.VPS_SSH_KEY`. |
| Archivos `.env` versionados | `.gitignore` bloquea `.env` y `.env.*`. |
| Despliegue manual inseguro | El pipeline usa SSH con llave privada guardada como GitHub Secret. |

Nota: se encontro en `week-14/README.md` un texto de ejemplo con `-----BEGIN OPENSSH PRIVATE KEY-----...`; es documentacion ilustrativa, no una llave real.
