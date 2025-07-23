'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
            <h1 className="text-6xl font-bold text-red-600 mb-4">
              500
            </h1>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Global Error
            </h2>
            <p className="text-gray-600 mb-8">
              A critical error occurred. Please reload the page.
            </p>
            <div className="space-y-4">
              <button
                onClick={reset}
                className="w-full bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-md transition-colors"
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
      </body>
    </html>
  )
} 