'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export default function TokenVerificationForm() {
  const searchParams = useSearchParams()
  const tokenIdFromUrl = searchParams.get('tokenId')

  const [tokenInfo, setTokenInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    tokenId: '',
    ticker: '',
    projectName: '',
    description: '',
    website: '',
    logoUrl: '',
    contactInfo: '',
    email: '',
    links: '',
    submitterName: '',
    agreed: false,
  })

  useEffect(() => {
    if (tokenIdFromUrl) {
      setLoading(true)
      fetch(`https://api-server-lovelace.mintlayer.org/api/v2/token/${tokenIdFromUrl}`)
        .then((res) => {
          if (!res.ok) throw new Error('Token not found')
          return res.json()
        })
        .then((data) => {
          setTokenInfo(data)
          setLoading(false)

          // Автозаполнение формы:
          setFormData((prev) => ({
            ...prev,
            tokenId: data.token_id,
            ticker: data.ticker || '',
            projectName: data.ticker || '',
            description: '', // остаётся пустым — пользователь сам заполняет
          }))
        })
        .catch((err) => {
          console.error(err)
          setError('Unable to load token information')
          setLoading(false)
        })
    }
  }, [tokenIdFromUrl])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target as any
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
  
    const { tokenId, ticker, projectName, description, email, agreed } = formData
  
    if (!tokenId || !ticker || !projectName || !description || !email || !agreed) {
      alert('Please fill in all required fields and agree to the terms.')
      return
    }
  
    const TELEGRAM_BOT_TOKEN = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN!
    const TELEGRAM_CHAT_ID = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID!
  
    const message = `
🟦 *New token verification request*
🔹 *Token ID:* ${formData.tokenId}
🔹 *Ticker:* ${formData.ticker}
🔹 *Project Name:* ${formData.projectName}
🔹 *Description:* ${formData.description}
🔹 *Website:* ${formData.website || '-'}
🔹 *Logo:* ${formData.logoUrl || '-'}
🔹 *Contact Info:* ${formData.contactInfo || '-'}
🔹 *Additional Links:* ${formData.links || '-'}
🔹 *Submitter:* ${formData.submitterName || '-'}
📧 *Email:* ${formData.email}
`
  
    try {
      const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'Markdown',
        }),
      })
  
      if (res.ok) {
        alert('Request submitted successfully!')
        // Reset form after successful submission
        setFormData({
          tokenId: '',
          ticker: '',
          projectName: '',
          description: '',
          website: '',
          logoUrl: '',
          contactInfo: '',
          email: '',
          links: '',
          submitterName: '',
          agreed: false,
        })
      } else {
        alert('Error sending to Telegram.')
      }
    } catch (error) {
      console.error('Telegram error:', error)
      alert('Connection error with Telegram.')
    }
  }

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-md mt-10">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">
        Token Verification Request
      </h2>
      
      {tokenIdFromUrl && (
        <div className="bg-white p-4 border border-gray-300 rounded-lg mb-6">
          <h3 className="font-semibold text-lg mb-3">Token Information:</h3>

          {loading && <p className="text-gray-500">Loading...</p>}
          {error && <p className="text-red-500">{error}</p>}

          {tokenInfo && (
            <ul className="text-sm text-gray-700 space-y-1">
              <li><strong>Token ID:</strong> {tokenInfo.token_id}</li>
              <li><strong>Ticker:</strong> {tokenInfo.ticker}</li>
              <li><strong>Total supply:</strong> {tokenInfo.total_supply}</li>
              <li><strong>Frozen:</strong> {tokenInfo.frozen ? 'yes' : 'no'}</li>
              <li><strong>Locked:</strong> {tokenInfo.locked ? 'yes' : 'no'}</li>
            </ul>
          )}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block font-medium mb-1">Token ID *</label>
          <input
            type="text"
            name="tokenId"
            value={formData.tokenId}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Token Symbol (Ticker) *</label>
          <input
            type="text"
            name="ticker"
            value={formData.ticker}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Project Name *</label>
          <input
            type="text"
            name="projectName"
            value={formData.projectName}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Project Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Website (if available)</label>
          <input
            type="url"
            name="website"
            value={formData.website}
            onChange={handleChange}
            placeholder="https://example.com"
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Token Logo (URL)</label>
          <input
            type="url"
            name="logoUrl"
            value={formData.logoUrl}
            onChange={handleChange}
            placeholder="https://example.com/logo.png"
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">
            Contact Information (Telegram, Discord, X, etc.)
          </label>
          <textarea
            name="contactInfo"
            value={formData.contactInfo}
            onChange={handleChange}
            rows={2}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">
            Additional Links (GitHub, Docs, Whitepaper)
          </label>
          <textarea
            name="links"
            value={formData.links}
            onChange={handleChange}
            rows={2}
            placeholder="https://github.com/project&#10;https://docs.project.com"
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Your Name (if different from project)</label>
          <input
            type="text"
            name="submitterName"
            value={formData.submitterName}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Contact Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            name="agreed"
            checked={formData.agreed}
            onChange={handleChange}
            className="mt-1 accent-primary-100"
            required
          />
          <label className="text-sm text-gray-700">
            I agree to the <a href="/terms" className="text-primary-100 underline">terms and conditions</a>
          </label>
        </div>

        <button
          type="submit"
          className="w-full bg-primary-100 hover:bg-primary-110 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          Submit Request
        </button>
      </form>
    </div>
  )
} 