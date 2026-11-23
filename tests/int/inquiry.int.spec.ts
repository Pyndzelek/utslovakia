import { describe, expect, it } from 'vitest'
import { createFormToken, formTokenAge } from '@/lib/form-token'
import { INQUIRY_MAX_LENGTH, validateInquiry } from '@/lib/inquiry'

const valid = {
  name: 'Jan Kowalski',
  email: 'jan@example.com',
  message: 'Do you have the ICT A7 in stock?',
}

describe('validateInquiry', () => {
  it('accepts a complete inquiry and trims its values', () => {
    const { values, errors } = validateInquiry({
      ...valid,
      name: '  Jan Kowalski ',
      phone: ' +421 2 5478 9630 ',
    })
    expect(errors).toEqual({})
    expect(values).toEqual({
      name: 'Jan Kowalski',
      email: 'jan@example.com',
      phone: '+421 2 5478 9630',
      company: '',
      message: 'Do you have the ICT A7 in stock?',
    })
  })

  it('requires name, e-mail and message, but not phone or company', () => {
    expect(validateInquiry({}).errors).toEqual({
      name: 'required',
      email: 'required',
      message: 'required',
    })
  })

  it('treats non-string entries (e.g. an uploaded file) as empty', () => {
    expect(validateInquiry({ ...valid, name: new Blob(['x']) }).errors).toEqual({
      name: 'required',
    })
  })

  it('rejects malformed e-mail addresses and phone numbers', () => {
    expect(validateInquiry({ ...valid, email: 'jan@example' }).errors).toEqual({
      email: 'invalidEmail',
    })
    expect(validateInquiry({ ...valid, phone: 'call me' }).errors).toEqual({
      phone: 'invalidPhone',
    })
  })

  it('rejects a message too short to act on, and anything over the field limit', () => {
    expect(validateInquiry({ ...valid, message: 'hi' }).errors).toEqual({ message: 'tooShort' })
    expect(
      validateInquiry({ ...valid, company: 'x'.repeat(INQUIRY_MAX_LENGTH.company + 1) }).errors,
    ).toEqual({ company: 'tooLong' })
  })
})

describe('form token', () => {
  it("reports a signed token's age", () => {
    const token = createFormToken(1_000_000)
    expect(formTokenAge(token, 1_004_500)).toBe(4500)
  })

  it('rejects missing, malformed and tampered tokens', () => {
    const [timestamp, signature] = createFormToken(1_000_000).split('.')
    expect(formTokenAge(null)).toBeNull()
    expect(formTokenAge('')).toBeNull()
    expect(formTokenAge('not-a-token')).toBeNull()
    // Back-dating the timestamp to skip the minimum fill time breaks the signature.
    expect(formTokenAge(`${Number(timestamp) - 60_000}.${signature}`)).toBeNull()
    expect(formTokenAge(`${timestamp}.${signature.slice(0, -2)}xx`)).toBeNull()
  })
})
