'use client'

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  confirmVariant?: 'danger' | 'primary'
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Hapus',
  confirmVariant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[400px] border-destructive/20 bg-background shadow-none">
        <DialogHeader className="flex flex-row items-center gap-4 space-y-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <DialogTitle className="text-xl font-bold tracking-tight">
              {title}
            </DialogTitle>
          </div>
        </DialogHeader>
        <div className="py-4">
          <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
            {message}
          </DialogDescription>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="ghost"
            onClick={onCancel}
            className="rounded-xl font-semibold cursor-pointer"
          >
            Batal
          </Button>
          <Button
            variant={confirmVariant === 'danger' ? 'destructive' : 'default'}
            onClick={onConfirm}
            className="rounded-xl font-bold px-6 shadow-none cursor-pointer"
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
