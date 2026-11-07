import { Loader2Icon, SendHorizontalIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SendButtonProps {
  loading: boolean
  onCancel: () => void
}

export function SendButton({ loading, onCancel }: SendButtonProps) {
  if (loading) {
    return (
      <Button key="cancel" type="button" variant="secondary" className="h-10 min-w-28 gap-2" onClick={onCancel}>
        <Loader2Icon className="animate-spin" />
        Cancel
      </Button>
    )
  }

  return (
    <Button
      key="send"
      type="submit"
      aria-keyshortcuts="Meta+Enter Control+Enter"
      className="h-10 min-w-28 gap-2 font-semibold"
    >
      Send
      <SendHorizontalIcon />
    </Button>
  )
}
