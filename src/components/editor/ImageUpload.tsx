// src/components/editor/ImageUpload.tsx
'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import toast from 'react-hot-toast'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  onRemove: () => void
}

export function ImageUpload({ value, onChange, onRemove }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  async function uploadFile(file: File) {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB')
      return
    }

    setUploading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { toast.error('Not authenticated'); return }

      const ext = file.name.split('.').pop()
      const path = `${user.id}/${Date.now()}.${ext}`

      const { error } = await supabase.storage
        .from('post-images')
        .upload(path, file, { cacheControl: '3600', upsert: false })

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('post-images')
        .getPublicUrl(path)

      onChange(publicUrl)
      toast.success('Image uploaded!')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Upload failed'
      toast.error(message)
    } finally {
      setUploading(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) uploadFile(file)
  }

  if (value) {
    return (
      <div className="relative rounded-xl overflow-hidden border border-border group">
        <div className="relative aspect-[16/7]">
          <Image src={value} alt="Featured" fill className="object-cover" />
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-3 right-3 w-8 h-8 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
        >
          <X size={14} />
        </button>
      </div>
    )
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={cn(
        'relative flex flex-col items-center justify-center gap-3',
        'aspect-[16/7] rounded-xl border-2 border-dashed cursor-pointer transition-all',
        dragOver
          ? 'border-primary bg-primary/5 scale-[1.01]'
          : 'border-border hover:border-primary/50 hover:bg-muted/50'
      )}
    >
      {uploading ? (
        <>
          <Loader2 size={24} className="text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Uploading…</p>
        </>
      ) : (
        <>
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
            {dragOver ? <Upload size={20} className="text-primary" /> : <ImageIcon size={20} className="text-muted-foreground" />}
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              {dragOver ? 'Drop to upload' : 'Upload featured image'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Drag & drop or click · PNG, JPG, WEBP · Max 5MB
            </p>
          </div>
        </>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f) }}
      />
    </div>
  )
}
