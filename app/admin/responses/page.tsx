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
  const [selectedResponses, setSelectedResponses] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)
  const [viewingResponse, setViewingResponse] = useState<(SurveyResponse & { locations: Location }) | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

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

  const handleDeleteResponse = async (responseId: string) => {
    setDeleting(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('survey_responses')
        .delete()
        .eq('id', responseId)

      if (error) {
        console.error('Error deleting response:', error)
        alert('Failed to delete response. Please try again.')
        return
      }

      // Remove from local state
      setResponses(prev => prev.filter(r => r.id !== responseId))
      setConfirmDelete(null)
      alert('Response deleted successfully')
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to delete response. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedResponses.size === 0) {
      alert('No responses selected')
      return
    }

    if (!confirm(`Are you sure you want to delete ${selectedResponses.size} response(s)? This action cannot be undone.`)) {
      return
    }

    setDeleting(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('survey_responses')
        .delete()
        .in('id', Array.from(selectedResponses))

      if (error) {
        console.error('Error deleting responses:', error)
        alert('Failed to delete responses. Please try again.')
        return
      }

      // Remove from local state
      setResponses(prev => prev.filter(r => !selectedResponses.has(r.id)))
      setSelectedResponses(new Set())
      alert(`${selectedResponses.size} response(s) deleted successfully`)
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to delete responses. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  const toggleSelectResponse = (responseId: string) => {
    setSelectedResponses(prev => {
      const newSet = new Set(prev)
      if (newSet.has(responseId)) {
        newSet.delete(responseId)
      } else {
        newSet.add(responseId)
      }
      return newSet
    })
  }

  const toggleSelectAll = () => {
    if (selectedResponses.size === filteredResponses.length) {
      setSelectedResponses(new Set())
    } else {
      setSelectedResponses(new Set(filteredResponses.map(r => r.id)))
    }
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Survey Responses</h1>
          {selectedResponses.size > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              {selectedResponses.size} response(s) selected
            </p>
          )}
        </div>
        <div className="flex gap-3">
          {selectedResponses.size > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={deleting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : `Delete Selected (${selectedResponses.size})`}
            </button>
          )}
          <button onClick={exportToCSV} className="btn-primary">
            Export to CSV
          </button>
        </div>
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
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={filteredResponses.length > 0 && selectedResponses.size === filteredResponses.length}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </th>
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedResponses.has(response.id)}
                        onChange={() => toggleSelectResponse(response.id)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </td>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-3">
                        <button
                          onClick={() => setViewingResponse(response)}
                          className="text-primary-600 hover:text-primary-900 font-medium"
                        >
                          View
                        </button>
                        <button
                          onClick={() => setConfirmDelete(response.id)}
                          className="text-red-600 hover:text-red-900 font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
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

      {/* Response Detail Modal */}
      {viewingResponse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Survey Response Details</h3>
              <button
                onClick={() => setViewingResponse(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Date</p>
                  <p className="text-sm text-gray-900">{format(new Date(viewingResponse.created_at), 'MMM d, yyyy h:mm a')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Location</p>
                  <p className="text-sm text-gray-900">{viewingResponse.locations.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p className="text-sm text-gray-900">{viewingResponse.first_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p className="text-sm text-gray-900">{viewingResponse.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-sm text-gray-900">{viewingResponse.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Traveler Type</p>
                  <p className="text-sm text-gray-900 capitalize">{viewingResponse.traveler_type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Parking Preference</p>
                  <p className="text-sm text-gray-900 capitalize">{viewingResponse.parking_preference.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Usage Frequency</p>
                  <p className="text-sm text-gray-900">{viewingResponse.usage_frequency.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Exit Method</p>
                  <p className="text-sm text-gray-900 capitalize">{viewingResponse.exit_method.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Exit Time</p>
                  <p className="text-sm text-gray-900">{viewingResponse.exit_time.replace('_', '-')} minutes</p>
                </div>
                {viewingResponse.exit_method === 'cashier' && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Cashier Efficient</p>
                    <p className="text-sm text-gray-900">{viewingResponse.cashier_efficient ? 'Yes' : 'No'}</p>
                  </div>
                )}
              </div>
              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-500 mb-2">Ratings</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Overall Experience</p>
                    <p className="text-lg font-semibold text-gray-900">{viewingResponse.overall_experience} / 4</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Cleanliness - Surface</p>
                    <p className="text-lg font-semibold text-gray-900">{viewingResponse.cleanliness_surface} / 4</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Cleanliness - Stairs</p>
                    <p className="text-lg font-semibold text-gray-900">{viewingResponse.cleanliness_stairs} / 4</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Cleanliness - Elevators</p>
                    <p className="text-lg font-semibold text-gray-900">{viewingResponse.cleanliness_elevators} / 4</p>
                  </div>
                </div>
              </div>
              {viewingResponse.comments && (
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-gray-500 mb-2">Comments</p>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{viewingResponse.comments}</p>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => setViewingResponse(null)} className="btn-primary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this response? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                disabled={deleting}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteResponse(confirmDelete)}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
