import { KeyRoundIcon, ShieldCheckIcon, ShieldOffIcon } from 'lucide-react'
import { useId } from 'react'
import { EmptyState } from '@/components/shared/empty-state'
import { SecretInput } from '@/components/shared/secret-input'
import { SegmentedControl } from '@/components/shared/segmented-control'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { AuthConfig, AuthType } from '@/types/auth'

const AUTH_OPTIONS = [
  { value: 'none', label: 'No Auth' },
  { value: 'bearer', label: 'Bearer Token' },
  { value: 'basic', label: 'Basic Auth' },
] as const satisfies readonly { value: AuthType; label: string }[]

function createAuth(type: AuthType): AuthConfig {
  switch (type) {
    case 'none':
      return { type: 'none' }
    case 'bearer':
      return { type: 'bearer', token: '' }
    case 'basic':
      return { type: 'basic', username: '', password: '' }
  }
}

interface AuthPanelProps {
  auth: AuthConfig
  onChange: (auth: AuthConfig) => void
}

export function AuthPanel({ auth, onChange }: AuthPanelProps) {
  const fieldId = useId()

  return (
    <div className="flex flex-col gap-4">
      <SegmentedControl
        label="Authorization type"
        value={auth.type}
        options={AUTH_OPTIONS}
        onChange={(type) => {
          if (type !== auth.type) {
            onChange(createAuth(type))
          }
        }}
        className="self-start"
      />

      {auth.type === 'none' ? (
        <EmptyState
          icon={<ShieldOffIcon />}
          title="No authorization"
          description="This request is sent without an Authorization header."
          className="rounded-lg border border-dashed"
        />
      ) : null}

      {auth.type === 'bearer' ? (
        <div className="grid max-w-xl gap-2">
          <Label htmlFor={`${fieldId}-token`}>Token</Label>
          <SecretInput
            id={`${fieldId}-token`}
            value={auth.token}
            placeholder="eyJhbGciOi..."
            onChange={(event) => onChange({ ...auth, token: event.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            Sent as <code className="font-mono text-foreground/80">Authorization: Bearer &lt;token&gt;</code>
          </p>
        </div>
      ) : null}

      {auth.type === 'basic' ? (
        <div className="grid max-w-xl gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor={`${fieldId}-username`}>Username</Label>
            <Input
              id={`${fieldId}-username`}
              value={auth.username}
              autoComplete="off"
              spellCheck={false}
              className="font-mono text-[13px]"
              onChange={(event) => onChange({ ...auth, username: event.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`${fieldId}-password`}>Password</Label>
            <SecretInput
              id={`${fieldId}-password`}
              value={auth.password}
              onChange={(event) => onChange({ ...auth, password: event.target.value })}
            />
          </div>
        </div>
      ) : null}

      {auth.type !== 'none' ? (
        <p className="flex max-w-xl items-start gap-2 rounded-md border bg-surface px-3 py-2 text-xs text-muted-foreground">
          {auth.type === 'bearer' ? (
            <KeyRoundIcon className="mt-px size-3.5 shrink-0 text-primary" />
          ) : (
            <ShieldCheckIcon className="mt-px size-3.5 shrink-0 text-primary" />
          )}
          Credentials stay in memory for this session and are never written to request history.
        </p>
      ) : null}
    </div>
  )
}
