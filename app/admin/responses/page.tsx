'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import type { SurveyResponse, Location } from '@/types'

export default function ResponsesPage() {
  const [responses, setResponses] = useState<(SurveyResponse & { locations: Location })[]>([])
  const [loading, setLoading] = useState(true)
  const [filterLocation, setFilterLocation] = useState<string>('all')
  const [locations, setLocations] = useState<Location[]>([])

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

    // Fetch responses
    const { data: responsesData } = await supabase
      .from('survey_responses')
      .select(`
        *,
        locations (*)
      `)
      .order('created_at', { ascending: false })

    if (responsesData) {
      setResponses(responsesData as any)
    }

    setLoading(false)
  }

  const exportToCSV = () => {
    const filteredData = filterLocation === 'all'
      ? responses
      : responses.filter(r => r.locations.slug === filterLocation)

    if (filteredData.length === 0) {
      alert('No data to export')
      return
    }

    const headers = [
      'Date',
      'Location',
      'Traveler Type',
      'Parking Preference',
      'Usage Frequency',
      'Exit Method',
      'Exit Time',
      'Cashier Efficient',
      'Cleanliness Surface',
      'Cleanliness Stairs',
      'Cleanliness Elevators',
      'Overall Experience',
      'Comments',
      'First Name',
      'Phone',
      'Email',
    ]

    const csvRows = [
      headers.join(','),
      ...filteredData.map(response => [
        format(new Date(response.created_at), 'yyyy-MM-dd HH:mm:ss'),
        `"${response.locations.name}"`,
        response.traveler_type,
        response.parking_preference,
        response.usage_frequency,
        response.exit_method,
        response.exit_time,
        response.cashier_efficient ?? '',
        response.cleanliness_surface,
        response.cleanliness_stairs,
        response.cleanliness_elevators,
        response.overall_experience,
        `"${response.comments || ''}"`,
        `"${response.first_name}"`,
        response.phone || '',
        response.email || '',
      ].join(','))
    ]

    const csvContent = csvRows.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `survey-responses-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const filteredResponses = filterLocation === 'all'
    ? responses
    : responses.filter(r => r.locations.slug === filterLocation)

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
        <h1 className="text-3xl font-bold text-gray-900">Survey Responses</h1>
        <button onClick={exportToCSV} className="btn-primary">
          Export to CSV
        </button>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filter by Location
        </label>
        <select
          value={filterLocation}
          onChange={(e) => setFilterLocation(e.target.value)}
          className="input-field max-w-xs"
        >
          <option value="all">All Locations</option>
          {locations.map(location => (
            <option key={location.id} value={location.slug}>
              {location.name}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Overall Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Traveler Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredResponses.length > 0 ? (
                filteredResponses.map((response) => (
                  <tr key={response.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(response.created_at), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {response.locations.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {response.first_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        {response.overall_experience} / 4
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                      {response.traveler_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => alert('View details: ' + JSON.stringify(response, null, 2))}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No responses found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        Showing {filteredResponses.length} response{filteredResponses.length !== 1 ? 's' : ''}
      </div>
    </div>
  )
}
