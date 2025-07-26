'use client'

import { useEffect, useState } from 'react'

interface Props {
  metadataUrl: string
}

export default function TokenMetadataViewer({ metadataUrl }: Props) {
  const [error, setError] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [json, setJson] = useState<any | null>(null)
  const [imageError, setImageError] = useState(false)

  const normalizeIpfsUrl = (url: string) => {
    if (url.startsWith('ipfs://')) {
      return url.replace('ipfs://', 'https://ipfs.io/ipfs/')
    }
    return url
  }

  useEffect(() => {
    if (!metadataUrl) return

    const url = normalizeIpfsUrl(metadataUrl)

    fetch(url)
      .then(async (res) => {
        const contentType = res.headers.get('Content-Type') || ''
        if (contentType.includes('application/json')) {
          const data = await res.json()
          setJson(data)
        } else if (contentType.includes('image/')) {
          setImagePreview(url)
          setError('Received image instead of JSON metadata')
        } else {
          throw new Error(`Unexpected content type: ${contentType}`)
        }
      })
      .catch((err) => {
        console.error('Metadata fetch error:', err)
        setError(err.message)
      })
  }, [metadataUrl])

  return (
    <div className="mt-6 bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-2">Metadata</h3>
      <p className="text-sm text-gray-600 break-all">
        <a
          href={normalizeIpfsUrl(metadataUrl)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          {metadataUrl}
        </a>
      </p>

      {error && (
        <p className="text-red-600 bg-red-50 border border-red-200 rounded p-3 mt-3 text-sm">
          Failed to load metadata: {error}
        </p>
      )}

      {imagePreview && !imageError && (
        <div className="mt-4">
          <p className="text-sm text-gray-700 mb-1">Image found instead of JSON:</p>
          <img
            src={imagePreview}
            alt="Token metadata image"
            className="w-48 h-auto border rounded shadow"
            onError={() => setImageError(true)}
          />
        </div>
      )}

      {imageError && (
        <p className="text-gray-500 italic mt-2">Preview not available</p>
      )}

      {json && (
        <pre className="mt-4 text-sm bg-gray-50 p-3 rounded border border-gray-100 overflow-auto max-h-96">
          {JSON.stringify(json, null, 2)}
        </pre>
      )}
    </div>
  )
} 