import { z } from 'zod'

export const surveySchema = z.object({
  traveler_type: z.enum(['leisure', 'business'], {
    required_error: 'Please select traveler type',
  }),
  parking_preference: z.enum(['self_park', 'shuttle_service'], {
    required_error: 'Please select parking preference',
  }),
  usage_frequency: z.enum(['5_or_fewer', 'more_than_5'], {
    required_error: 'Please select usage frequency',
  }),
  exit_method: z.enum(['automated', 'cashier', 'pay_on_foot'], {
    required_error: 'Please select exit method',
  }),
  exit_time: z.enum(['1_4_minutes', '5_9_minutes', '10_plus_minutes'], {
    required_error: 'Please select exit time',
  }),
  cashier_efficient: z.boolean().optional(),
  cleanliness_surface: z.number().min(1).max(4, {
    message: 'Please rate cleanliness',
  }),
  cleanliness_stairs: z.number().min(1).max(4, {
    message: 'Please rate cleanliness',
  }),
  cleanliness_elevators: z.number().min(1).max(4, {
    message: 'Please rate cleanliness',
  }),
  overall_experience: z.number().min(1).max(4, {
    message: 'Please rate your overall experience',
  }),
  comments: z.string().optional(),
  first_name: z.string().min(1, {
    message: 'Please enter your first name',
  }),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
})

export type SurveyFormValues = z.infer<typeof surveySchema>
