import type { AuthConfig } from '@/types/auth'

export type ApplyAuthResult = { ok: true } | { ok: false; message: string }

export function encodeBasicCredentials(username: string, password: string): string {
  const bytes = new TextEncoder().encode(`${username}:${password}`)
  let binary = ''
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }
  return btoa(binary)
}

export function applyAuth(headers: Headers, auth: AuthConfig): ApplyAuthResult {
  switch (auth.type) {
    case 'none':
      return { ok: true }
    case 'bearer': {
      const token = auth.token.trim()
      if (!token) {
        return { ok: false, message: 'Bearer token is empty. Add a token or choose No Auth.' }
      }
      headers.set('authorization', `Bearer ${token}`)
      return { ok: true }
    }
    case 'basic': {
      if (!auth.username) {
        return { ok: false, message: 'Basic Auth requires a username.' }
      }
      if (auth.username.includes(':')) {
        return { ok: false, message: 'Basic Auth usernames cannot contain a colon.' }
      }
      headers.set('authorization', `Basic ${encodeBasicCredentials(auth.username, auth.password)}`)
      return { ok: true }
    }
  }
}
