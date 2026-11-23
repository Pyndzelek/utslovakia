/**
 * Validation for the contact page's inquiry form. Pure (no server or DOM APIs), so the
 * server action, the form's error rendering and the unit tests share one definition.
 */

export const INQUIRY_FIELDS = ['name', 'email', 'phone', 'company', 'message'] as const
export type InquiryField = (typeof INQUIRY_FIELDS)[number]

export type InquiryValues = Record<InquiryField, string>

export type InquiryErrorCode = 'required' | 'invalidEmail' | 'invalidPhone' | 'tooShort' | 'tooLong'

export type InquiryErrors = Partial<Record<InquiryField, InquiryErrorCode>>

/** Longest accepted value per field — also the inputs' `maxLength`. */
export const INQUIRY_MAX_LENGTH: Record<InquiryField, number> = {
  name: 120,
  email: 200,
  phone: 40,
  company: 160,
  message: 4000,
}

/** A message shorter than this can't describe what the visitor needs. */
export const INQUIRY_MIN_MESSAGE_LENGTH = 10

const REQUIRED: readonly InquiryField[] = ['name', 'email', 'message']
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE_PATTERN = /^\+?[\d\s()./-]{6,}$/

/**
 * Trims the submitted values and checks them. `raw` is anything with string-ish entries
 * (e.g. `Object.fromEntries(formData)`); non-strings count as empty.
 */
export function validateInquiry(raw: Record<string, unknown>): {
  values: InquiryValues
  errors: InquiryErrors
} {
  const values = Object.fromEntries(
    INQUIRY_FIELDS.map((field) => {
      const value = raw[field]
      return [field, typeof value === 'string' ? value.trim() : '']
    }),
  ) as InquiryValues

  const errors: InquiryErrors = {}
  for (const field of INQUIRY_FIELDS) {
    const value = values[field]
    if (!value) {
      if (REQUIRED.includes(field)) errors[field] = 'required'
    } else if (value.length > INQUIRY_MAX_LENGTH[field]) {
      errors[field] = 'tooLong'
    } else if (field === 'email' && !EMAIL_PATTERN.test(value)) {
      errors[field] = 'invalidEmail'
    } else if (field === 'phone' && !PHONE_PATTERN.test(value)) {
      errors[field] = 'invalidPhone'
    } else if (field === 'message' && value.length < INQUIRY_MIN_MESSAGE_LENGTH) {
      errors[field] = 'tooShort'
    }
  }

  return { values, errors }
}
