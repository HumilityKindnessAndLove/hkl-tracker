import Link from 'next/link'

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Authentication Error
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            There was an error authenticating your account. This could be because:
          </p>
          <ul className="mt-4 text-left text-sm text-gray-600 space-y-2">
            <li>• The confirmation link has expired</li>
            <li>• The confirmation link has already been used</li>
            <li>• There was a network error</li>
          </ul>
          <div className="mt-6">
            <Link
              href="/auth/login"
              className="text-indigo-600 hover:text-indigo-500 font-medium"
            >
              Try signing in again
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}