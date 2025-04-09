'use client'

import { useState } from 'react'

export default function TokenVerificationForm() {
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
            className="mt-1"
            required
          />
          <label className="text-sm text-gray-700">
            I agree to the <a href="/terms" className="text-blue-600 underline">terms and conditions</a>
          </label>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
        >
          Submit Request
        </button>
      </form>
    </div>
  )
} 