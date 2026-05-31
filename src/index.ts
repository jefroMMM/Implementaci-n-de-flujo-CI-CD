import { serve } from '@hono/node-server'
import { app } from './app.js'

const port = Number(process.env.PORT ?? 3000)

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`cicd-vps-demo listening on http://0.0.0.0:${info.port}`)
})
