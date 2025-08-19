'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Play, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function StartLearningButton({ resource, onStart, completed = false }) {
  const handleClick = async (e) => {
    e.stopPropagation()
    try {
      if (onStart) await onStart(resource)
    } catch (err) {
      toast.error('Failed to open content')
    }
  }

  if (completed) {
    return (
      <Button
        className="w-full rounded-xl font-semibold text-sm bg-emerald-600 hover:bg-emerald-700 text-white border-0 flex items-center justify-center"
        disabled
        title="Completed"
      >
        <CheckCircle className="mr-1 h-4 w-4" />
        Completed
      </Button>
    )
  }

  return (
    <Button
      className="w-full rounded-xl font-semibold text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 transition-all hover:scale-105 flex items-center justify-center"
      onClick={handleClick}
    >
      <Play className="mr-1 h-4 w-4" />
      Start Learning! 🚀
    </Button>
  )
}