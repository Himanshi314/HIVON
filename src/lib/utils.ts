// src/lib/utils.ts
// Shared utility functions

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import slugify from 'slugify'
import { formatDistanceToNow, format } from 'date-fns'

// Merge Tailwind classes safely (handles conflicts)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate a URL-safe slug from a title
export function generateSlug(title: string): string {
  return slugify(title, {
    lower: true,
    strict: true,
    trim: true,
  })
}

// Estimate reading time from raw text/HTML
export function getReadingTime(text: string): number {
  const plainText = text.replace(/<[^>]+>/g, '')
  const wordCount = plainText.trim().split(/\s+/).length
  const wordsPerMinute = 200
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute))
}

// Format date as "2 hours ago" or "Jan 12, 2025"
export function formatDate(dateString: string, relative = false): string {
  const date = new Date(dateString)
  if (relative) {
    return formatDistanceToNow(date, { addSuffix: true })
  }
  return format(date, 'MMM d, yyyy')
}

// Truncate text with ellipsis
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '…'
}

// Strip HTML tags from content (for summaries / previews)
export function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
}

// Capitalize first letter
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// Build full Supabase storage URL for an image path
export function getStorageUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  return `${base}/storage/v1/object/public/post-images/${path}`
}
