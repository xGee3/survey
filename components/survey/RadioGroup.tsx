'use client'

interface RadioOption {
  value: string
  label: string
  description?: string
}

interface RadioGroupProps {
  name: string
  options: RadioOption[]
  value: string
  onChange: (value: string) => void
  error?: string
}

export default function RadioGroup({ name, options, value, onChange, error }: RadioGroupProps) {
  return (
    <div className="space-y-3">
      {options.map((option) => (
        <label key={option.value} className="radio-option">
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange(e.target.value)}
            className="w-5 h-5 text-primary-600 focus:ring-2 focus:ring-primary-500 flex-shrink-0"
          />
          <div className="ml-3 flex-1">
            <span className="text-base font-medium text-gray-900">{option.label}</span>
            {option.description && (
              <p className="text-sm text-gray-500">{option.description}</p>
            )}
          </div>
        </label>
      ))}
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  )
}
