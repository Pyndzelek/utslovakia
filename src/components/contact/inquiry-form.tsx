'use client'

import React, { useActionState, useEffect, useId, useRef, useState } from 'react'
import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'
import { CircleCheck, Loader2, Package, Send, X } from 'lucide-react'
import { submitInquiry, type InquiryFormState } from '@/app/[locale]/(frontend)/contact/actions'
import { buttonVariants } from '@/components/ui/button'
import { Input, Label, Textarea } from '@/components/ui/field'
import { INQUIRY_MAX_LENGTH, type InquiryField } from '@/lib/inquiry'
import { cn } from '@/lib/utils'

/** The product (and variant) the form was opened for, from the product page's quote button. */
export interface InquiryProduct {
  slug: string
  title: string
  sku?: string | null
  imageUrl?: string | null
  variantId?: string
  variantName?: string
}

interface InquiryFormProps {
  /** Signed render-time stamp from `createFormToken()` (see src/lib/form-token.ts). */
  token: string
  product?: InquiryProduct
  className?: string
}

const INITIAL_STATE: InquiryFormState = { status: 'idle' }

/** Contact page inquiry form; submissions are stored in the CMS by `submitInquiry`. */
export function InquiryForm(props: InquiryFormProps) {
  // Remounting clears the action state, which is how "send another" starts a fresh form.
  const [formKey, setFormKey] = useState(0)
  return <InquiryFormInner key={formKey} {...props} onReset={() => setFormKey((key) => key + 1)} />
}

function InquiryFormInner({
  token,
  product,
  className,
  onReset,
}: InquiryFormProps & { onReset: () => void }) {
  const t = useTranslations('contact.form')
  const locale = useLocale()
  const id = useId()
  const [state, formAction, pending] = useActionState(submitInquiry, INITIAL_STATE)
  const [attached, setAttached] = useState(Boolean(product))
  const rootRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const successRef = useRef<HTMLHeadingElement>(null)

  // Arriving from a product's "Ask for a quote" button: bring the form into view.
  useEffect(() => {
    if (!product) return
    const frame = requestAnimationFrame(() =>
      rootRef.current?.scrollIntoView({ block: 'start', behavior: 'auto' }),
    )
    return () => cancelAnimationFrame(frame)
  }, [product])

  // After a submit, move focus to what changed: the confirmation or the first invalid field.
  useEffect(() => {
    if (state.status === 'success') successRef.current?.focus()
    else if (state.status === 'error' && state.errors) {
      formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
    }
  }, [state])

  if (state.status === 'success') {
    return (
      <div
        ref={rootRef}
        className={cn(
          'flex scroll-mt-28 flex-col items-center rounded-3xl border border-line bg-white px-6 py-14 text-center shadow-card',
          className,
        )}
      >
        <span className="flex size-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CircleCheck className="size-7" aria-hidden />
        </span>
        <h3
          ref={successRef}
          tabIndex={-1}
          className="font-display mt-5 text-xl font-semibold text-balance text-navy-900"
        >
          {t('successTitle')}
        </h3>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-600" role="status">
          {t('successText')}
        </p>
        <button
          type="button"
          onClick={onReset}
          className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'mt-6')}
        >
          {t('sendAnother')}
        </button>
      </div>
    )
  }

  const field = (name: InquiryField) => {
    const error = state.errors?.[name]
    return {
      id: `${id}-${name}`,
      name,
      maxLength: INQUIRY_MAX_LENGTH[name],
      // React resets the form after the action; these bring the typed values back.
      defaultValue: state.values?.[name] ?? '',
      'aria-invalid': error ? (true as const) : undefined,
      'aria-describedby': error ? `${id}-${name}-error` : undefined,
    }
  }
  const errorFor = (name: InquiryField) => {
    const error = state.errors?.[name]
    return error ? (
      <p id={`${id}-${name}-error`} className="mt-1.5 text-xs font-medium text-rose-600">
        {t(`errors.${error}`)}
      </p>
    ) : null
  }
  const optional = <span className="font-normal text-slate-400"> ({t('optional')})</span>

  return (
    <div
      ref={rootRef}
      className={cn(
        'scroll-mt-28 rounded-3xl border border-line bg-white p-6 shadow-card sm:p-8',
        className,
      )}
    >
      <form ref={formRef} action={formAction} noValidate className="space-y-5">
        <input type="hidden" name="token" value={token} />
        <input type="hidden" name="locale" value={locale} />
        {/* Honeypot: invisible to people and assistive tech, irresistible to form-filling bots. */}
        <div className="hidden" aria-hidden>
          <label htmlFor={`${id}-website`}>Website</label>
          <input id={`${id}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        {product && attached && (
          <div className="flex items-center gap-3 rounded-2xl border border-brand-100 bg-brand-50 p-3">
            <input type="hidden" name="product" value={product.slug} />
            {product.variantId && <input type="hidden" name="variant" value={product.variantId} />}
            <span className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line bg-white">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt=""
                  fill
                  sizes="48px"
                  className="object-contain p-1"
                />
              ) : (
                <Package className="size-5 text-slate-400" aria-hidden />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold tracking-[0.12em] text-brand-700 uppercase">
                {t('productLabel')}
              </p>
              <p className="truncate text-sm font-semibold text-navy-900">{product.title}</p>
              {(product.variantName || product.sku) && (
                <p className="truncate text-xs text-slate-500">
                  {[product.variantName, product.sku].filter(Boolean).join(' · ')}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setAttached(false)}
              aria-label={t('removeProduct')}
              className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-white hover:text-navy-900"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor={`${id}-name`}>{t('name')}</Label>
            <Input {...field('name')} type="text" autoComplete="name" required />
            {errorFor('name')}
          </div>
          <div>
            <Label htmlFor={`${id}-email`}>{t('email')}</Label>
            <Input {...field('email')} type="email" autoComplete="email" required />
            {errorFor('email')}
          </div>
          <div>
            <Label htmlFor={`${id}-phone`}>
              {t('phone')}
              {optional}
            </Label>
            <Input {...field('phone')} type="tel" autoComplete="tel" />
            {errorFor('phone')}
          </div>
          <div>
            <Label htmlFor={`${id}-company`}>
              {t('company')}
              {optional}
            </Label>
            <Input {...field('company')} type="text" autoComplete="organization" />
            {errorFor('company')}
          </div>
        </div>

        <div>
          <Label htmlFor={`${id}-message`}>{t('message')}</Label>
          <Textarea {...field('message')} rows={5} placeholder={t('messagePlaceholder')} required />
          {errorFor('message')}
        </div>

        {/* Announced when it appears; field-level messages are tied to their inputs instead. */}
        <div role="alert">
          {state.status === 'error' && (
            <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {state.formError ? t(`errors.${state.formError}`) : t('errors.summary')}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <button
            type="submit"
            disabled={pending}
            className={buttonVariants({ variant: 'primary', size: 'lg' })}
          >
            {pending ? <Loader2 className="animate-spin" aria-hidden /> : <Send aria-hidden />}
            {pending ? t('sending') : t('submit')}
          </button>
          <p className="max-w-xs text-xs leading-relaxed text-slate-500">{t('privacy')}</p>
        </div>
      </form>
    </div>
  )
}
