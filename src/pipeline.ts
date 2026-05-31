export type PipelineStep = {
  id: string
  title: string
  detail: string
  command: string
}

export const pipelineSteps: PipelineStep[] = [
  {
    id: 'checkout',
    title: 'Checkout del repositorio',
    detail: 'GitHub Actions descarga el codigo fuente de la rama principal.',
    command: 'actions/checkout',
  },
  {
    id: 'dependencies',
    title: 'Instalacion de dependencias',
    detail: 'El runner instala dependencias con npm ci usando package-lock.json.',
    command: 'npm ci',
  },
  {
    id: 'validation',
    title: 'Validacion automatica',
    detail: 'Se ejecutan pruebas y compilacion TypeScript antes de desplegar.',
    command: 'npm test && npm run build',
  },
  {
    id: 'package',
    title: 'Empaquetado',
    detail: 'Se genera un archivo tar.gz con el codigo necesario para la VPS.',
    command: 'tar -czf deploy-package.tgz',
  },
  {
    id: 'deploy',
    title: 'Despliegue SSH',
    detail: 'El paquete se copia por SSH y Docker Compose actualiza el servicio.',
    command: 'docker compose up -d --build',
  },
]
