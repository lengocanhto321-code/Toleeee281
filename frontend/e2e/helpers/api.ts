import { Page } from '@playwright/test'

const BASE_URL = 'http://localhost:8000'

export async function getAuthToken(page: Page): Promise<string | null> {
  return page.evaluate(() => {
    const raw = localStorage.getItem('auth-storage')
    if (!raw) return null
    let p = JSON.parse(raw)
    if (typeof p === 'string') p = JSON.parse(p)
    const s = p.state || p
    return s.accessToken || null
  })
}

export async function makeGetRequest(page: Page, token: string, path: string): Promise<any> {
  return page.evaluate(async ({ baseUrl, p, tkn }) => {
    const res = await fetch(`${baseUrl}${p}`, {
      headers: { Authorization: `Bearer ${tkn}` },
    })
    return res.json()
  }, { baseUrl: BASE_URL, p: path, tkn: token })
}

export async function makePostRequest(page: Page, token: string, path: string, body?: any): Promise<any> {
  return page.evaluate(async ({ baseUrl, p, tkn, b }) => {
    const res = await fetch(`${baseUrl}${p}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tkn}`, 'Content-Type': 'application/json' },
      body: b ? JSON.stringify(b) : undefined,
    })
    if (!res.ok) throw new Error(`POST ${p} failed: ${res.status} ${await res.text()}`)
    return res.status === 204 ? null : res.json()
  }, { baseUrl: BASE_URL, p: path, tkn: token, b: body })
}

export async function makePutRequest(page: Page, token: string, path: string, body?: any): Promise<any> {
  return page.evaluate(async ({ baseUrl, p, tkn, b }) => {
    const res = await fetch(`${baseUrl}${p}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${tkn}`, 'Content-Type': 'application/json' },
      body: b ? JSON.stringify(b) : undefined,
    })
    if (!res.ok) throw new Error(`PUT ${p} failed: ${res.status} ${await res.text()}`)
    return res.status === 204 ? null : res.json()
  }, { baseUrl: BASE_URL, p: path, tkn: token, b: body })
}
