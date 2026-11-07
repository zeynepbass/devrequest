import { Trash2Icon } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface ClearHistoryDialogProps {
  count: number
  onConfirm: () => void
}

export function ClearHistoryDialog({ count, onConfirm }: ClearHistoryDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="xs"
          disabled={count === 0}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2Icon />
          Clear
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Clear request history?</DialogTitle>
          <DialogDescription>
            {count === 1 ? 'One saved request' : `${count} saved requests`} will be removed from this browser. This
            cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm()
              setOpen(false)
            }}
          >
            Clear history
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
