import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { surveySchema } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { locationSlug, ...surveyData } = body

    // Validate the survey data
    const validatedData = surveySchema.parse(surveyData)

    const supabase = await createClient()

    // Get location by slug
    const { data: location, error: locationError } = await supabase
      .from('locations')
      .select('id')
      .eq('slug', locationSlug)
      .single()

    if (locationError || !location) {
      return NextResponse.json(
        { error: 'Invalid location' },
        { status: 400 }
      )
    }

    // Get client IP address
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown'

    // Insert survey response
    const { error: insertError } = await supabase
      .from('survey_responses')
      .insert({
        location_id: location.id,
        traveler_type: validatedData.traveler_type,
        parking_preference: validatedData.parking_preference,
        usage_frequency: validatedData.usage_frequency,
        exit_method: validatedData.exit_method,
        exit_time: validatedData.exit_time,
        cashier_efficient: validatedData.cashier_efficient ?? null,
        cleanliness_surface: validatedData.cleanliness_surface,
        cleanliness_stairs: validatedData.cleanliness_stairs,
        cleanliness_elevators: validatedData.cleanliness_elevators,
        overall_experience: validatedData.overall_experience,
        comments: validatedData.comments || null,
        first_name: validatedData.first_name,
        phone: validatedData.phone || null,
        email: validatedData.email || null,
        ip_address: ip,
      })

    if (insertError) {
      console.error('Error inserting survey:', insertError)
      return NextResponse.json(
        { error: 'Failed to submit survey' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, message: 'Survey submitted successfully' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error processing survey:', error)
    return NextResponse.json(
      { error: 'Invalid survey data' },
      { status: 400 }
    )
  }
}
