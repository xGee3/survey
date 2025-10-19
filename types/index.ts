export interface Location {
  id: string
  name: string
  slug: string
  qr_code_url: string | null
  created_at: string
}

export interface SurveyResponse {
  id: string
  location_id: string
  traveler_type: 'leisure' | 'business'
  parking_preference: 'self_park' | 'shuttle_service'
  usage_frequency: '5_or_fewer' | 'more_than_5'
  exit_method: 'automated' | 'cashier' | 'pay_on_foot'
  exit_time: '1_4_minutes' | '5_9_minutes' | '10_plus_minutes'
  cashier_efficient: boolean | null
  cleanliness_surface: number
  cleanliness_stairs: number
  cleanliness_elevators: number
  overall_experience: number
  comments: string | null
  first_name: string
  phone: string | null
  email: string | null
  created_at: string
  ip_address: string | null
}

export interface SurveyFormData {
  traveler_type: 'leisure' | 'business'
  parking_preference: 'self_park' | 'shuttle_service'
  usage_frequency: '5_or_fewer' | 'more_than_5'
  exit_method: 'automated' | 'cashier' | 'pay_on_foot'
  exit_time: '1_4_minutes' | '5_9_minutes' | '10_plus_minutes'
  cashier_efficient?: boolean
  cleanliness_surface: number
  cleanliness_stairs: number
  cleanliness_elevators: number
  overall_experience: number
  comments?: string
  first_name: string
  phone?: string
  email?: string
}
