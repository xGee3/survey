'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { surveySchema, type SurveyFormValues } from '@/lib/validation'
import ProgressBar from '@/components/survey/ProgressBar'
import RadioGroup from '@/components/survey/RadioGroup'
import RatingScale from '@/components/survey/RatingScale'

export default function SurveyPage() {
  const params = useParams()
  const router = useRouter()
  const locationSlug = params.locationSlug as string

  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [locationName, setLocationName] = useState('')

  const totalSteps = 10

  const {
    register,
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
    trigger,
  } = useForm<SurveyFormValues>({
    resolver: zodResolver(surveySchema),
    mode: 'onChange',
  })

  const formValues = watch()

  // Load location data
  useEffect(() => {
    async function fetchLocation() {
      try {
        const response = await fetch(`/api/locations/${locationSlug}`)
        if (response.ok) {
          const data = await response.json()
          setLocationName(data.name)
        }
      } catch (error) {
        console.error('Failed to load location:', error)
      }
    }
    fetchLocation()
  }, [locationSlug])

  // Load saved progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`survey-${locationSlug}`)
    if (saved) {
      try {
        const data = JSON.parse(saved)
        Object.entries(data).forEach(([key, value]) => {
          setValue(key as keyof SurveyFormValues, value as any)
        })
      } catch (error) {
        console.error('Failed to load saved progress:', error)
      }
    }
  }, [locationSlug, setValue])

  // Save progress to localStorage
  useEffect(() => {
    if (Object.keys(formValues).length > 0) {
      localStorage.setItem(`survey-${locationSlug}`, JSON.stringify(formValues))
    }
  }, [formValues, locationSlug])

  const validateAndNext = async (fields: (keyof SurveyFormValues)[]) => {
    const isValid = await trigger(fields)
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const onSubmit = async (data: SurveyFormValues) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/survey/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, locationSlug }),
      })

      if (response.ok) {
        localStorage.removeItem(`survey-${locationSlug}`)
        router.push(`/survey/${locationSlug}/thank-you`)
      } else {
        alert('Failed to submit survey. Please try again.')
      }
    } catch (error) {
      console.error('Submission error:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const goBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <main className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          {locationName && (
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {locationName}
              </h1>
              <p className="text-gray-600">Parking Survey</p>
            </div>
          )}

          <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Step 1: Traveler Type */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  What type of traveler are you?
                </h2>
                <RadioGroup
                  name="traveler_type"
                  value={formValues.traveler_type || ''}
                  onChange={(value) => setValue('traveler_type', value as any)}
                  options={[
                    { value: 'leisure', label: 'Leisure' },
                    { value: 'business', label: 'Business' },
                  ]}
                  error={errors.traveler_type?.message}
                />
                <button
                  type="button"
                  onClick={() => validateAndNext(['traveler_type'])}
                  className="btn-primary w-full"
                >
                  Continue
                </button>
              </div>
            )}

            {/* Step 2: Parking Preference */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  What is your parking preference?
                </h2>
                <RadioGroup
                  name="parking_preference"
                  value={formValues.parking_preference || ''}
                  onChange={(value) => setValue('parking_preference', value as any)}
                  options={[
                    { value: 'self_park', label: 'Self Park' },
                    { value: 'shuttle_service', label: 'Shuttle Service' },
                  ]}
                  error={errors.parking_preference?.message}
                />
                <div className="flex gap-3">
                  <button type="button" onClick={goBack} className="btn-secondary flex-1">
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => validateAndNext(['parking_preference'])}
                    className="btn-primary flex-1"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Usage Frequency */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  How often do you use this parking facility?
                </h2>
                <RadioGroup
                  name="usage_frequency"
                  value={formValues.usage_frequency || ''}
                  onChange={(value) => setValue('usage_frequency', value as any)}
                  options={[
                    { value: '5_or_fewer', label: '5 times or fewer per year' },
                    { value: 'more_than_5', label: 'More than 5 times per year' },
                  ]}
                  error={errors.usage_frequency?.message}
                />
                <div className="flex gap-3">
                  <button type="button" onClick={goBack} className="btn-secondary flex-1">
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => validateAndNext(['usage_frequency'])}
                    className="btn-primary flex-1"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Exit Method */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Which exit method did you use?
                </h2>
                <RadioGroup
                  name="exit_method"
                  value={formValues.exit_method || ''}
                  onChange={(value) => setValue('exit_method', value as any)}
                  options={[
                    { value: 'automated', label: 'Automated express exit' },
                    { value: 'cashier', label: 'Cashier-staffed booth' },
                    { value: 'pay_on_foot', label: 'Pay-on-Foot machines' },
                  ]}
                  error={errors.exit_method?.message}
                />
                <div className="flex gap-3">
                  <button type="button" onClick={goBack} className="btn-secondary flex-1">
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => validateAndNext(['exit_method'])}
                    className="btn-primary flex-1"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Step 5: Exit Time */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  How long did it take to exit the parking facility?
                </h2>
                <RadioGroup
                  name="exit_time"
                  value={formValues.exit_time || ''}
                  onChange={(value) => setValue('exit_time', value as any)}
                  options={[
                    { value: '1_4_minutes', label: '1-4 minutes' },
                    { value: '5_9_minutes', label: '5-9 minutes' },
                    { value: '10_plus_minutes', label: '10+ minutes' },
                  ]}
                  error={errors.exit_time?.message}
                />
                <div className="flex gap-3">
                  <button type="button" onClick={goBack} className="btn-secondary flex-1">
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => validateAndNext(['exit_time'])}
                    className="btn-primary flex-1"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Step 6: Cashier Rating (Conditional) */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {formValues.exit_method === 'cashier'
                    ? 'Was the cashier efficient, pleasant and professional?'
                    : 'Skip to next question'}
                </h2>
                {formValues.exit_method === 'cashier' ? (
                  <RadioGroup
                    name="cashier_efficient"
                    value={formValues.cashier_efficient === true ? 'yes' : formValues.cashier_efficient === false ? 'no' : ''}
                    onChange={(value) => setValue('cashier_efficient', value === 'yes')}
                    options={[
                      { value: 'yes', label: 'Yes' },
                      { value: 'no', label: 'No' },
                    ]}
                  />
                ) : (
                  <p className="text-gray-600">This question only applies to cashier exits.</p>
                )}
                <div className="flex gap-3">
                  <button type="button" onClick={goBack} className="btn-secondary flex-1">
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(7)}
                    className="btn-primary flex-1"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Step 7: Cleanliness Ratings */}
            {currentStep === 7 && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Rate the cleanliness of:
                  </h2>
                  <p className="text-sm text-gray-600 mb-6">1 = Worst, 4 = Best</p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Surface area / Walkways
                  </h3>
                  <RatingScale
                    name="cleanliness_surface"
                    value={formValues.cleanliness_surface}
                    onChange={(value) => setValue('cleanliness_surface', value)}
                    error={errors.cleanliness_surface?.message}
                  />
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Stairwells</h3>
                  <RatingScale
                    name="cleanliness_stairs"
                    value={formValues.cleanliness_stairs}
                    onChange={(value) => setValue('cleanliness_stairs', value)}
                    error={errors.cleanliness_stairs?.message}
                  />
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Elevators</h3>
                  <RatingScale
                    name="cleanliness_elevators"
                    value={formValues.cleanliness_elevators}
                    onChange={(value) => setValue('cleanliness_elevators', value)}
                    error={errors.cleanliness_elevators?.message}
                  />
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={goBack} className="btn-secondary flex-1">
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => validateAndNext(['cleanliness_surface', 'cleanliness_stairs', 'cleanliness_elevators'])}
                    className="btn-primary flex-1"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Step 8: Overall Experience */}
            {currentStep === 8 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Rate your overall parking experience
                  </h2>
                  <p className="text-sm text-gray-600 mb-6">1 = Worst, 4 = Best</p>
                </div>
                <RatingScale
                  name="overall_experience"
                  value={formValues.overall_experience}
                  onChange={(value) => setValue('overall_experience', value)}
                  error={errors.overall_experience?.message}
                />
                <div className="flex gap-3">
                  <button type="button" onClick={goBack} className="btn-secondary flex-1">
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => validateAndNext(['overall_experience'])}
                    className="btn-primary flex-1"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Step 9: Comments */}
            {currentStep === 9 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Additional comments (optional)
                </h2>
                <textarea
                  {...register('comments')}
                  rows={5}
                  className="input-field resize-none"
                  placeholder="Share any additional feedback..."
                />
                <div className="flex gap-3">
                  <button type="button" onClick={goBack} className="btn-secondary flex-1">
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(10)}
                    className="btn-primary flex-1"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Step 10: Contact Info */}
            {currentStep === 10 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Contact Information
                  </h2>
                  <p className="text-sm text-gray-600">
                    We&apos;d love to follow up with you about your experience
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    {...register('first_name')}
                    type="text"
                    className="input-field"
                    placeholder="Enter your first name"
                  />
                  {errors.first_name && (
                    <p className="text-sm text-red-600 mt-1">{errors.first_name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number (optional)
                  </label>
                  <input
                    {...register('phone')}
                    type="tel"
                    className="input-field"
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email (optional)
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    className="input-field"
                    placeholder="your.email@example.com"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={goBack} className="btn-secondary flex-1">
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary flex-1"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Survey'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </main>
  )
}
