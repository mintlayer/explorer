'use client'

import { useEffect } from 'react'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error('App error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">
          Oops!
        </h1>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Something went wrong
        </h2>
        <p className="text-gray-600 mb-8">
          An unexpected error occurred. Please try again.
        </p>
        <div className="space-y-4">
          <button
            onClick={reset}
            className="w-full bg-primary-100 hover:bg-primary-110 text-white px-6 py-3 rounded-md transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-3 rounded-md transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  )
} 