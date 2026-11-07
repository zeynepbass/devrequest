import { useEffect, useState } from 'react'

export function useElapsedTime(startedAt: number, intervalMs = 100): number {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), intervalMs)
    return () => window.clearInterval(timer)
  }, [intervalMs])

  return Math.max(0, now - startedAt)
}
