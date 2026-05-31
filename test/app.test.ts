import { describe, expect, it } from 'vitest'
import { app } from '../src/app.js'

describe('cicd-vps-demo app', () => {
  it('returns a healthy JSON response', async () => {
    const res = await app.request('/health')
    const body = (await res.json()) as {
      status: string
      service: string
      uptimeSeconds: number
    }

    expect(res.status).toBe(200)
    expect(body.status).toBe('ok')
    expect(body.service).toBe('cicd-vps-demo')
    expect(body.uptimeSeconds).toBeGreaterThanOrEqual(0)
  })

  it('exposes the CI/CD pipeline steps', async () => {
    const res = await app.request('/api/pipeline')
    const body = (await res.json()) as { steps: { id: string }[] }

    expect(res.status).toBe(200)
    expect(body.steps.map((step) => step.id)).toEqual([
      'checkout',
      'dependencies',
      'validation',
      'package',
      'deploy',
    ])
  })

  it('renders a deployment evidence page', async () => {
    const res = await app.request('/')
    const html = await res.text()

    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toMatch(/text\/html/)
    expect(html).toContain('Aplicacion desplegada por CI/CD')
    expect(html).toContain('20.49.8.87')
  })
})
