'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { hasLocale } from 'next-intl'
import { routing } from '@/i18n/routing'
import { getProductBySlug } from '@/lib/data/products'
import { getSiteSettings } from '@/lib/data/site-settings'
import { formTokenAge } from '@/lib/form-token'
import { validateInquiry, type InquiryErrors, type InquiryValues } from '@/lib/inquiry'
import { SITE_URL } from '@/lib/site'

export interface InquiryFormState {
  status: 'idle' | 'success' | 'error'
  /** Per-field problems, shown under the inputs. */
  errors?: InquiryErrors
  /** A problem with the submission as a whole. */
  formError?: 'expired' | 'tooFast' | 'rateLimited' | 'failed'
  /** What the visitor typed, handed back so a rejected form keeps its contents. */
  values?: InquiryValues
}

/** A person needs longer than this to fill in three fields; a script doesn't wait. */
const MIN_FILL_TIME_MS = 3000
const RATE_WINDOW_MS = 10 * 60 * 1000
/** Inquiries accepted per e-mail address / in total within `RATE_WINDOW_MS`. */
const MAX_PER_EMAIL = 3
const MAX_TOTAL = 30

const text = (value: FormDataEntryValue | null) => (typeof value === 'string' ? value : '')

/**
 * Stores an inquiry from the contact page's form in the `inquiries` collection and, when an
 * e-mail provider is configured, notifies the team. Used with `useActionState`, so it also
 * works as a plain form post without JavaScript.
 */
export async function submitInquiry(
  _previous: InquiryFormState,
  formData: FormData,
): Promise<InquiryFormState> {
  const { values, errors } = validateInquiry(Object.fromEntries(formData))

  // Validation comes first: an incomplete form must never look like it was sent.
  if (Object.keys(errors).length > 0) return { status: 'error', errors, values }

  // Only a filled honeypot — a field no visitor can see — gets a fake "success", so the script
  // has nothing to adapt to. The timing check can hit people too (autofill, or a form that has
  // just re-rendered after a language switch), so it asks for another try instead.
  if (text(formData.get('website'))) return { status: 'success' }
  const age = formTokenAge(formData.get('token'))
  if (age === null) return { status: 'error', formError: 'expired', values }
  if (age < MIN_FILL_TIME_MS) return { status: 'error', formError: 'tooFast', values }

  const requestedLocale = text(formData.get('locale'))
  const locale = hasLocale(routing.locales, requestedLocale)
    ? requestedLocale
    : routing.defaultLocale

  try {
    const payload = await getPayload({ config })

    const since = new Date(Date.now() - RATE_WINDOW_MS).toISOString()
    const [fromEmail, total] = await Promise.all([
      payload.count({
        collection: 'inquiries',
        where: { email: { equals: values.email }, createdAt: { greater_than: since } },
      }),
      payload.count({ collection: 'inquiries', where: { createdAt: { greater_than: since } } }),
    ])
    if (fromEmail.totalDocs >= MAX_PER_EMAIL || total.totalDocs >= MAX_TOTAL) {
      return { status: 'error', formError: 'rateLimited', values }
    }

    // The product comes from the URL the form was opened with; unknown slugs are just dropped.
    const productSlug = text(formData.get('product')).slice(0, 200)
    const product = productSlug ? await getProductBySlug(productSlug, locale) : undefined
    const variantId = text(formData.get('variant'))
    const variant = variantId
      ? product?.variants?.find((option) => option.id === variantId)
      : undefined

    const inquiry = await payload.create({
      collection: 'inquiries',
      data: {
        status: 'new',
        name: values.name,
        email: values.email,
        phone: values.phone || undefined,
        company: values.company || undefined,
        message: values.message,
        product: product?.id,
        variant: variant?.modelName,
        locale,
      },
    })

    if (process.env.RESEND_API_KEY) {
      // The inquiry is already saved; a mail problem must not turn that into an error.
      try {
        const settings = await getSiteSettings(locale)
        const to = process.env.INQUIRY_NOTIFY_EMAIL || settings.emails?.[0]?.email
        if (to) {
          const lines = [
            `Od: ${values.name} <${values.email}>`,
            values.phone && `Telefon: ${values.phone}`,
            values.company && `Firma: ${values.company}`,
            product &&
              `Produkt: ${product.title}${variant ? ` (${variant.modelName})` : ''}${product.sku ? ` — SKU ${product.sku}` : ''}`,
            '',
            values.message,
            '',
            `Panel: ${SITE_URL}/admin/collections/inquiries/${inquiry.id}`,
          ].filter((line): line is string => typeof line === 'string')

          await payload.sendEmail({
            to,
            replyTo: values.email,
            subject: `Nowe zapytanie ze strony: ${product?.title ?? values.name}`,
            text: lines.join('\n'),
          })
        }
      } catch (error) {
        payload.logger.error({ err: error }, 'Inquiry saved, but the notification e-mail failed')
      }
    }

    return { status: 'success' }
  } catch (error) {
    console.error('submitInquiry failed', error)
    return { status: 'error', formError: 'failed', values }
  }
}
