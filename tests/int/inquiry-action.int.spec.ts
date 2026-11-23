import { beforeEach, describe, expect, it, vi } from 'vitest'

const { create, count } = vi.hoisted(() => ({ create: vi.fn(), count: vi.fn() }))

vi.mock('payload', () => ({ getPayload: async () => ({ create, count }) }))
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('@/lib/data/products', () => ({ getProductBySlug: vi.fn() }))
vi.mock('@/lib/data/site-settings', () => ({ getSiteSettings: vi.fn() }))

import { submitInquiry } from '@/app/[locale]/(frontend)/contact/actions'
import { createFormToken } from '@/lib/form-token'

const complete = {
  name: 'Jan Kowalski',
  email: 'jan@example.com',
  message: 'Do you have the ICT A7 in stock?',
  locale: 'pl',
}

/** Submits the form as if it had been open for `openFor` ms. */
function submit(fields: Record<string, string>, openFor = 60_000) {
  const formData = new FormData()
  formData.set('token', createFormToken(Date.now() - openFor))
  for (const [name, value] of Object.entries(fields)) formData.set(name, value)
  return submitInquiry({ status: 'idle' }, formData)
}

describe('submitInquiry', () => {
  beforeEach(() => {
    vi.stubEnv('RESEND_API_KEY', '')
    create.mockReset().mockResolvedValue({ id: 1 })
    count.mockReset().mockResolvedValue({ totalDocs: 0 })
  })

  it('stores a complete inquiry', async () => {
    expect(await submit(complete)).toEqual({ status: 'success' })
    expect(create).toHaveBeenCalledOnce()
  })

  it.each([0, 60_000])('rejects an empty form opened %i ms ago', async (openFor) => {
    const state = await submit({}, openFor)
    expect(state).toMatchObject({
      status: 'error',
      errors: { name: 'required', email: 'required', message: 'required' },
    })
    expect(create).not.toHaveBeenCalled()
  })

  it('asks for another try, keeping the text, when a complete form is sent too fast', async () => {
    const state = await submit(complete, 500)
    expect(state).toMatchObject({
      status: 'error',
      formError: 'tooFast',
      values: { message: complete.message },
    })
    expect(create).not.toHaveBeenCalled()
  })

  it('discards a filled honeypot without storing it', async () => {
    expect(await submit({ ...complete, website: 'https://spam.example' })).toEqual({
      status: 'success',
    })
    expect(create).not.toHaveBeenCalled()
  })

  it('rejects a form without a valid token', async () => {
    expect(await submit({ ...complete, token: 'forged' })).toMatchObject({ formError: 'expired' })
    expect(create).not.toHaveBeenCalled()
  })

  it('reports a failed save instead of success', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    create.mockRejectedValue(new Error('relation "inquiries" does not exist'))
    expect(await submit(complete)).toMatchObject({ status: 'error', formError: 'failed' })
  })
})
