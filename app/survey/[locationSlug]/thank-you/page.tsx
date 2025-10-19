import Link from 'next/link'

export default function ThankYouPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Thank You!</h1>
          <p className="text-lg text-gray-600">
            Your feedback has been successfully submitted
          </p>
        </div>

        <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 mb-8">
          <p className="text-gray-700">
            We appreciate you taking the time to share your parking experience with
            us. Your feedback helps us improve our services.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Safe travels and we look forward to serving you again soon!
          </p>
        </div>

        <Link href="/" className="btn-primary inline-block mt-6">
          Return to Home
        </Link>
      </div>
    </main>
  )
}
