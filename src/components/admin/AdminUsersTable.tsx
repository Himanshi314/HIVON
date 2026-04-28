// src/components/admin/AdminUsersTable.tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import { RoleBadge } from '@/components/ui/Badge'
import toast from 'react-hot-toast'
import type { UserRole } from '@/types'

interface User {
  id: string
  name: string
  email: string
  role: UserRole
  created_at: string
}

export function AdminUsersTable({ users: initial, currentUserId }: { users: User[]; currentUserId: string }) {
  const [users, setUsers] = useState(initial)
  const [updating, setUpdating] = useState<string | null>(null)
  const supabase = createClient()

  async function changeRole(userId: string, newRole: UserRole) {
    if (userId === currentUserId) { toast.error("You can't change your own role"); return }
    setUpdating(userId)
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId)
    if (error) {
      toast.error('Failed to update role')
    } else {
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole } : u))
      toast.success(`Role updated to ${newRole}`)
    }
    setUpdating(null)
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">User</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Email</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Joined</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.length === 0 && (
              <tr><td colSpan={4} className="text-center py-10 text-muted-foreground">No users</td></tr>
            )}
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold flex-shrink-0">
                      {user.name?.charAt(0).toUpperCase() ?? '?'}
                    </div>
                    <span className="font-medium text-foreground">{user.name}</span>
                    {user.id === currentUserId && (
                      <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">you</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3.5 text-muted-foreground hidden sm:table-cell">{user.email}</td>
                <td className="px-4 py-3.5 text-muted-foreground hidden md:table-cell">{formatDate(user.created_at)}</td>
                <td className="px-4 py-3.5">
                  {user.id === currentUserId ? (
                    <RoleBadge role={user.role} />
                  ) : (
                    <select
                      value={user.role}
                      disabled={updating === user.id}
                      onChange={(e) => changeRole(user.id, e.target.value as UserRole)}
                      className="text-xs border border-border rounded-lg px-2 py-1 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 cursor-pointer"
                    >
                      <option value="viewer">Viewer</option>
                      <option value="author">Author</option>
                      <option value="admin">Admin</option>
                    </select>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
