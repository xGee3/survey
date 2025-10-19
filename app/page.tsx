import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-primary-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Parking Survey
          </h1>
          <p className="text-gray-600">
            Help us improve your parking experience
          </p>
        </div>

        <div className="space-y-4 mb-8 text-left">
          <div className="flex items-start">
            <span className="text-primary-600 mr-3 text-xl">✓</span>
            <p className="text-gray-700">Takes less than 3 minutes</p>
          </div>
          <div className="flex items-start">
            <span className="text-primary-600 mr-3 text-xl">✓</span>
            <p className="text-gray-700">Your feedback matters</p>
          </div>
          <div className="flex items-start">
            <span className="text-primary-600 mr-3 text-xl">✓</span>
            <p className="text-gray-700">Completely anonymous</p>
          </div>
        </div>

        <Link href="/survey/atl-select" className="btn-primary block text-center">
          Start Survey
        </Link>

        <p className="text-sm text-gray-500 mt-6">
          Scan the QR code at your parking location to start
        </p>
      </div>
    </main>
  )
}
