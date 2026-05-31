import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { pipelineSteps } from './pipeline.js'

const startedAt = Date.now()
const serviceName = 'cicd-vps-demo'

function shortSha(value: string) {
  return value.length > 7 ? value.slice(0, 7) : value
}

export const app = new Hono()

app.use('*', logger())

app.get('/', (c) => {
  const sha = process.env.GIT_SHA ?? 'local'
  const target = process.env.PUBLIC_HOST ?? '20.49.8.87'

  return c.html(`<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>CI/CD VPS Demo ${shortSha(sha)}</title>
    <style>
      :root {
        color: #17211b;
        background: #f4efe4;
        font-family: Georgia, "Times New Roman", serif;
      }

      body {
        margin: 0;
        min-height: 100vh;
        background:
          radial-gradient(circle at 15% 15%, rgba(231, 129, 63, 0.20), transparent 28rem),
          radial-gradient(circle at 85% 10%, rgba(37, 107, 86, 0.18), transparent 30rem),
          linear-gradient(135deg, #fbf6ea 0%, #e8dfcb 100%);
      }

      main {
        width: min(920px, calc(100% - 2rem));
        margin: 0 auto;
        padding: 4rem 0;
      }

      .card {
        border: 1px solid rgba(23, 33, 27, 0.16);
        border-radius: 28px;
        padding: clamp(1.5rem, 4vw, 3rem);
        background: rgba(255, 252, 244, 0.82);
        box-shadow: 0 24px 70px rgba(52, 40, 23, 0.18);
        backdrop-filter: blur(12px);
      }

      .eyebrow {
        margin: 0 0 1rem;
        color: #b2542a;
        font: 700 0.78rem/1.2 Verdana, sans-serif;
        letter-spacing: 0.18em;
        text-transform: uppercase;
      }

      h1 {
        margin: 0;
        max-width: 760px;
        font-size: clamp(2.4rem, 6vw, 5.2rem);
        line-height: 0.95;
      }

      .summary {
        margin: 1.4rem 0 2rem;
        max-width: 700px;
        font: 1.1rem/1.7 Verdana, sans-serif;
      }

      .meta,
      .links {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        margin: 1.5rem 0;
      }

      .pill,
      a {
        border-radius: 999px;
        padding: 0.65rem 0.9rem;
        background: #17211b;
        color: #fffaf0;
        font: 700 0.85rem/1 Verdana, sans-serif;
        text-decoration: none;
      }

      ol {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 1rem;
        margin: 2rem 0 0;
        padding: 0;
        list-style: none;
      }

      li {
        border-left: 4px solid #b2542a;
        padding: 1rem;
        background: rgba(255, 255, 255, 0.55);
        border-radius: 18px;
      }

      strong {
        display: block;
        margin-bottom: 0.45rem;
        font: 700 0.95rem/1.35 Verdana, sans-serif;
      }

      code {
        font-family: "Courier New", monospace;
      }
    </style>
  </head>
  <body>
    <main>
      <section class="card">
        <p class="eyebrow">GitHub Actions hacia Azure VPS</p>
        <h1>Aplicacion desplegada por CI/CD</h1>
        <p class="summary">
          Este servicio Node.js valida pruebas, compila TypeScript y actualiza un contenedor
          Docker en la VPS <strong>${target}</strong> cada vez que se hace push a <code>main</code>.
        </p>
        <div class="meta">
          <span class="pill">Servicio: ${serviceName}</span>
          <span class="pill">Commit: ${shortSha(sha)}</span>
          <span class="pill">Puerto publico: 80</span>
        </div>
        <div class="links">
          <a href="/health">Ver healthcheck</a>
          <a href="/api/pipeline">Ver pipeline JSON</a>
        </div>
        <ol>
          ${pipelineSteps
            .map(
              (step) => `<li><strong>${step.title}</strong>${step.detail}<br /><code>${step.command}</code></li>`,
            )
            .join('\n          ')}
        </ol>
      </section>
    </main>
  </body>
</html>`)
})

app.get('/health', (c) =>
  c.json({
    status: 'ok',
    service: serviceName,
    sha: process.env.GIT_SHA ?? 'local',
    environment: process.env.NODE_ENV ?? 'development',
    uptimeSeconds: Math.round((Date.now() - startedAt) / 1000),
    timestamp: new Date().toISOString(),
  }),
)

app.get('/api/pipeline', (c) =>
  c.json({
    service: serviceName,
    steps: pipelineSteps,
  }),
)
