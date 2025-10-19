'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Location } from '@/types'

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLocations()
  }, [])

  const fetchLocations = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('locations')
      .select('*')
      .order('name')

    if (data) {
      setLocations(data)
    }
    setLoading(false)
  }

  const generateQRCodeURL = (slug: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`${baseUrl}/survey/${slug}`)}`
  }

  const downloadQRCode = (slug: string, name: string) => {
    const url = generateQRCodeURL(slug)
    const a = document.createElement('a')
    a.href = url
    a.download = `${slug}-qr-code.png`
    a.click()
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
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {locations.map((location) => {
                const surveyUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/survey/${location.slug}`
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

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          QR Code Instructions
        </h2>
        <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
          <li>Click &quot;Download QR&quot; to get a QR code for each location</li>
          <li>Print the QR codes and place them at the respective parking locations</li>
          <li>When customers scan the QR code, they&apos;ll be directed to the survey for that specific location</li>
          <li>Each QR code is unique to its parking location for accurate tracking</li>
        </ul>
      </div>
    </div>
  )
}
