import { useCallback } from 'react'
import { toast } from 'sonner'

export function useClipboard() {
  return useCallback(async (text: string, successMessage = 'Copied to clipboard') => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(successMessage)
      return true
    } catch {
      toast.error('Clipboard access was denied by the browser.')
      return false
    }
  }, [])
}
