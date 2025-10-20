'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Location } from '@/types'

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [baseUrl, setBaseUrl] = useState('')
  const [editingUrl, setEditingUrl] = useState(false)
  const [tempUrl, setTempUrl] = useState('')
  const [selectedQR, setSelectedQR] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const supabase = createClient()

    // Fetch locations
    const { data: locationsData } = await supabase
      .from('locations')
      .select('*')
      .order('name')

    if (locationsData) {
      setLocations(locationsData)
    }

    // Fetch QR base URL from settings
    const { data: settingsData, error: settingsError } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'qr_base_url')
      .maybeSingle()

    const defaultUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // If settings table doesn't exist or setting not found, use default
    if (settingsError) {
      console.warn('Could not load QR base URL from database:', settingsError.message)
      console.warn('Using default URL. Please run the database migration to enable universal URL storage.')
      setBaseUrl(defaultUrl)
      setTempUrl(defaultUrl)
    } else {
      const loadedUrl = settingsData?.value || defaultUrl
      setBaseUrl(loadedUrl)
      setTempUrl(loadedUrl)
    }

    setLoading(false)
  }

  const handleSaveUrl = async () => {
    setSaving(true)
    try {
      // Remove trailing slash if present
      const cleanUrl = tempUrl.replace(/\/$/, '')

      if (!cleanUrl) {
        alert('Please enter a valid URL')
        setSaving(false)
        return
      }

      const supabase = createClient()

      // First, try to check if settings table exists by attempting to select
      const { data: existingSettings, error: selectError } = await supabase
        .from('settings')
        .select('*')
        .eq('key', 'qr_base_url')
        .maybeSingle()

      // If there's an error and it's because the table doesn't exist
      if (selectError && selectError.code === '42P01') {
        alert(`❌ Database Error: The settings table doesn't exist yet.\n\nPlease run the migration SQL in your Supabase dashboard:\n\n1. Go to Supabase SQL Editor\n2. Run the migration from: supabase/migration_settings.sql\n\nError: ${selectError.message}`)
        setSaving(false)
        return
      }

      // Update or insert the setting in the database
      const { error: upsertError } = await supabase
        .from('settings')
        .upsert({
          key: 'qr_base_url',
          value: cleanUrl,
          description: 'Base URL for QR code generation',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'key'
        })

      if (upsertError) {
        console.error('Error saving URL:', upsertError)
        alert(`❌ Failed to save URL.\n\nError: ${upsertError.message}\n\nPlease check:\n1. Settings table exists (run migration)\n2. You are logged in as admin\n3. Database permissions are correct`)
        return
      }

      setBaseUrl(cleanUrl)
      setEditingUrl(false)
      alert('✓ URL saved successfully!\n\nThis setting is now saved in the database and will be available on all devices (mobile, computer, tablet) when you log in.')
    } catch (error: any) {
      console.error('Error:', error)
      alert(`❌ An unexpected error occurred.\n\nError: ${error?.message || 'Unknown error'}\n\nPlease try again or check the console for details.`)
    } finally {
      setSaving(false)
    }
  }

  const generateQRCodeURL = (slug: string, size: number = 300) => {
    const surveyUrl = `${baseUrl}/survey/${slug}`
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(surveyUrl)}`
  }

  const downloadQRCode = (slug: string, name: string) => {
    // Generate higher resolution QR code for download (600x600)
    const surveyUrl = `${baseUrl}/survey/${slug}`
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(surveyUrl)}`
    const a = document.createElement('a')
    a.href = url
    a.download = `${slug}-qr-code.png`
    a.click()
  }

  const downloadAllQRCodes = () => {
    locations.forEach((location, index) => {
      setTimeout(() => {
        downloadQRCode(location.slug, location.name)
      }, index * 500) // Stagger downloads by 500ms
    })
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Parking Locations</h1>
        <button
          onClick={downloadAllQRCodes}
          className="btn-primary"
        >
          Download All QR Codes
        </button>
      </div>

      {/* Base URL Configuration */}
      <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              QR Code Base URL
            </h3>
            {editingUrl ? (
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={tempUrl}
                  onChange={(e) => setTempUrl(e.target.value)}
                  placeholder="https://yourdomain.com"
                  className="input-field flex-1"
                />
                <button
                  onClick={handleSaveUrl}
                  disabled={saving}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    setEditingUrl(false)
                    setTempUrl(baseUrl)
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <code className="text-sm text-gray-700 bg-white px-3 py-1 rounded border">
                  {baseUrl}
                </code>
                <button
                  onClick={() => setEditingUrl(true)}
                  className="text-primary-600 hover:text-primary-900 font-medium text-sm"
                >
                  Change
                </button>
              </div>
            )}
            {baseUrl.includes('localhost') && (
              <p className="text-xs text-yellow-700 mt-2">
                ⚠️ Warning: QR codes are pointing to localhost. Users won&apos;t be able to scan these on their phones. Update to your production URL: <strong>https://parkatlsurvey.vercel.app</strong> (not the git deployment URL)
              </p>
            )}
            {baseUrl.includes('git-') && baseUrl.includes('projects.vercel.app') && (
              <p className="text-xs text-yellow-700 mt-2">
                ⚠️ Warning: You&apos;re using a git deployment URL. This may require login. Use your main production URL instead: <strong>https://parkatlsurvey.vercel.app</strong>
              </p>
            )}
            <p className="text-xs text-green-700 mt-2">
              ✅ Universal Storage: This URL is stored in the database and will work on all devices (computer, phone, tablet) when you log in.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Survey URL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  QR Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {locations.map((location) => {
                const surveyUrl = `${baseUrl}/survey/${location.slug}`
                return (
                  <tr key={location.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {location.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {location.slug}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <a
                        href={surveyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-900 underline"
                      >
                        {surveyUrl}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {selectedQR === location.slug ? (
                        <button
                          onClick={() => setSelectedQR(null)}
                          className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                        >
                          Hide Preview
                        </button>
                      ) : (
                        <button
                          onClick={() => setSelectedQR(location.slug)}
                          className="text-primary-600 hover:text-primary-900 text-sm font-medium"
                        >
                          Show Preview
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => downloadQRCode(location.slug, location.name)}
                        className="text-primary-600 hover:text-primary-900 font-medium"
                      >
                        Download QR
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR Code Preview Modal */}
      {selectedQR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                QR Code Preview
              </h3>
              <button
                onClick={() => setSelectedQR(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="text-center">
              <img
                src={generateQRCodeURL(selectedQR, 400)}
                alt="QR Code Preview"
                className="mx-auto border rounded-lg shadow-sm"
              />
              <p className="text-sm text-gray-600 mt-4">
                {baseUrl}/survey/{selectedQR}
              </p>
              <button
                onClick={() => {
                  const location = locations.find(l => l.slug === selectedQR)
                  if (location) downloadQRCode(selectedQR, location.name)
                }}
                className="btn-primary w-full mt-4"
              >
                Download This QR Code
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          QR Code Instructions
        </h2>
        <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
          <li>First, set the correct base URL above (your production domain, not localhost)</li>
          <li>Click &quot;Show Preview&quot; to see what the QR code looks like before downloading</li>
          <li>Click &quot;Download QR&quot; to get a high-resolution (600x600) QR code for each location</li>
          <li>Or click &quot;Download All QR Codes&quot; to download all at once</li>
          <li>Print the QR codes and place them at the respective parking locations</li>
          <li>When customers scan the QR code, they&apos;ll be directed to the survey for that specific location</li>
          <li>Each QR code is unique to its parking location for accurate tracking</li>
        </ul>
      </div>
    </div>
  )
}
