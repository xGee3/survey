'use client'

interface RatingScaleProps {
  name: string
  value: number | undefined
  onChange: (value: number) => void
  min?: number
  max?: number
  labels?: { value: number; label: string }[]
  error?: string
}

export default function RatingScale({
  name,
  value,
  onChange,
  min = 1,
  max = 4,
  labels,
  error,
}: RatingScaleProps) {
  const options = Array.from({ length: max - min + 1 }, (_, i) => min + i)

  return (
    <div>
      <div className="grid grid-cols-4 gap-2">
        {options.map((option) => {
          const label = labels?.find((l) => l.value === option)
          return (
            <label key={option} className="rating-button">
              <input
                type="radio"
                name={name}
                value={option}
                checked={value === option}
                onChange={() => onChange(option)}
                className="sr-only"
              />
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold mb-1">{option}</span>
                {label && <span className="text-xs">{label.label}</span>}
              </div>
            </label>
          )
        })}
      </div>
      {labels && labels.length > 0 && (
        <div className="flex justify-between mt-2 px-1">
          <span className="text-xs text-gray-500">Worst</span>
          <span className="text-xs text-gray-500">Best</span>
        </div>
      )}
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  )
}
