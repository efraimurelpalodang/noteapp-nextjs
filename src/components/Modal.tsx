'use client'

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] overflow-hidden p-0 gap-0 border-primary/20 bg-background shadow-2xl">
        <DialogHeader className="p-6 bg-muted/30 border-b">
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="p-6">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  )
}
