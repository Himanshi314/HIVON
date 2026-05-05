export type UserRole = 'viewer' | 'author' | 'admin'

export interface Profile {
  id: string
  name: string
  email: string
  role: UserRole
  avatar_url?: string
  created_at: string
}

export interface Post {
  id: string
  title: string
  slug: string
  body: string
  image_url?: string
  author_id: string
  summary?: string
  tags?: string[]
  reading_time?: number
  published: boolean
  created_at: string
  updated_at: string
  author?: Profile
  comment_count?: number
}

export interface Comment {
  id: string
  post_id: string
  user_id: string
  comment_text: string
  created_at: string
  author?: Profile
}

export interface PaginatedResult<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ApiResponse<T = void> {
  data?: T
  error?: string
  success: boolean
}
