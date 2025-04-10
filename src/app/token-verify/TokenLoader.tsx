'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

const TokenLoader = ({ setFormData }: { setFormData: Function }) => {
  const searchParams = useSearchParams()
  const tokenId = searchParams.get('tokenId')

  const [tokenInfo, setTokenInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!tokenId || typeof tokenId !== 'string') return

    setLoading(true)

    fetch(`https://api-server-lovelace.mintlayer.org/api/v2/token/${tokenId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Token not found')
        return res.json()
      })
      .then((data) => {
        setTokenInfo(data)
        setFormData((prev: any) => ({
          ...prev,
          tokenId: data.token_id,
          ticker: data.token_ticker?.string || '',
          projectName: data.token_ticker?.string || '',
          description: '',
        }))
        setLoading(false)
      })
      .catch((err) => {
        console.error('Token fetch error:', err)
        setError('Error loading token or token not found')
        setLoading(false)
      })
  }, [tokenId, setFormData])

  if (!tokenId) return null

  return (
    <div className="mt-6 p-4 border border-gray-300 rounded-md bg-white">
      <h3 className="font-semibold text-lg mb-2">Token Information</h3>

      {loading && <p className="text-gray-500">Loading data...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {tokenInfo && (
        <ul className="text-sm text-gray-800 space-y-1">
          <li><strong>Token ID:</strong> {tokenInfo.token_id || '—'}</li>
          <li><strong>Ticker:</strong> {tokenInfo.token_ticker?.string || '—'}</li>
          <li><strong>Total Supply:</strong> {tokenInfo.total_supply?.Fixed?.atoms || '—'}</li>
          <li><strong>Circulating Supply:</strong> {tokenInfo.circulating_supply?.atoms || '—'}</li>
          <li><strong>Decimals:</strong> {tokenInfo.number_of_decimals ?? '—'}</li>
          <li><strong>Frozen:</strong> {tokenInfo.frozen === true ? 'yes' : tokenInfo.frozen === false ? 'no' : '—'}</li>
          <li><strong>Locked:</strong> {tokenInfo.is_locked === true ? 'yes' : tokenInfo.is_locked === false ? 'no' : '—'}</li>
          <li><strong>Freezable:</strong> {tokenInfo.is_token_freezable === true ? 'yes' : tokenInfo.is_token_freezable === false ? 'no' : '—'}</li>
          <li><strong>Unfreezable:</strong> {tokenInfo.is_token_unfreezable === true ? 'yes' : tokenInfo.is_token_unfreezable === false ? 'no' : '—'}</li>
          <li><strong>Authority:</strong> {tokenInfo.authority || '—'}</li>
          <li>
            <strong>Metadata URI:</strong>{' '}
            {tokenInfo.metadata_uri?.string ? (
              <a
                href={tokenInfo.metadata_uri.string}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                {tokenInfo.metadata_uri.string}
              </a>
            ) : '—'}
          </li>
        </ul>
      )}
    </div>
  )
}

export default TokenLoader 