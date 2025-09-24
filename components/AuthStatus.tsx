'use client'

import { useAuth } from './AuthProvider'
import LogoutButton from './LogoutButton'
import Link from 'next/link'

export default function AuthStatus() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center space-x-4">
        <div className="animate-pulse h-8 w-20 bg-gray-200 rounded"></div>
      </div>
    )
  }

  if (user) {
    return (
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-700">
          Welcome, {user.email}
        </span>
        <LogoutButton />
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-4">
      <Link
        href="/auth/login"
        className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
      >
        Sign in
      </Link>
      <Link
        href="/auth/signup"
        className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded-md"
      >
        Sign up
      </Link>
    </div>
  )
}