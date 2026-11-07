export const AUTH_TYPES = ['none', 'bearer', 'basic'] as const

export type AuthType = (typeof AUTH_TYPES)[number]

export type AuthConfig =
  { type: 'none' } | { type: 'bearer'; token: string } | { type: 'basic'; username: string; password: string }
