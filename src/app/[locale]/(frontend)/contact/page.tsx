import React from 'react'
import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { ChevronDown, Clock, Headset, Mail, MapPin, Phone, Send, Wrench } from 'lucide-react'
import type { Locale } from '@/i18n/routing'
import { Container } from '@/components/ui/container'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'
import { Button } from '@/components/ui/button'
import { Checkbox, Input, Label, Select, Textarea } from '@/components/ui/field'
import { Logo } from '@/components/layout/logo'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Talk to the UT Slovakia team — sales, technical support and service centre in Bratislava. We answer within one business day.',
}

const contactCards = [
  {
    Icon: MapPin,
    title: 'Odwiedź nas',
    lines: ['Trojičné námestie 191/11', 'Tvrdošín, Žilinski, Slovakia 02744'],
  },
  {
    Icon: Phone,
    title: 'Zadzwoń do nas',
    lines: ['+42123456789 (mobile)'],
  },
  {
    Icon: Mail,
    title: 'Napisz do nas',
    lines: ['uts@uts.pl', 'contact@uts.pl'],
  },
  {
    Icon: Clock,
    title: 'Godziny otwarcia',
    lines: ['Mon–Fri: 8:00 – 16:00'],
  },
]

const departments = [
  {
    Icon: Headset,
    title: 'Sales & product advice',
    text: 'Device selection, availability, volume pricing and delivery times.',
    contact: 'sales@utslovakia.sk',
  },
  {
    Icon: Wrench,
    title: 'Service & repairs',
    text: 'RMA requests, firmware updates, calibration and spare parts.',
    contact: 'service@utslovakia.sk',
  },
]

const faqs = [
  {
    question: 'pytanie 1',
    answer: 'odpowiedź 1',
  },
  {
    question: 'pytanie 2',
    answer: 'odpowiedź 2',
  },
  {
    question: 'pytanie 3',
    answer: 'odpowiedź 3',
  },
  {
    question: 'pytanie 4',
    answer: 'odpowiedź 4',
  },
]

interface PageProps {
  params: Promise<{ locale: Locale }>
}

export default async function ContactPage({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <>
      {/* Page header */}
      <div className="border-b border-line bg-white">
        <Container className="py-8 lg:py-10">
          <Breadcrumbs items={[{ label: 'Contact' }]} />
          <h1 className="font-display mt-4 text-3xl font-semibold tracking-tight text-navy-900 sm:text-4xl">
            Porozmawiaj z nami!
          </h1>
          <p className="mt-2 max-w-2xl text-[15px] text-slate-500">
            Pytania dotyczące sprzętu czy porady przy zakupie. Odpowiadamy najszybciej jak to
            możliwe.
          </p>
        </Container>
      </div>

      <Container className="py-10 lg:py-14">
        {/* Contact cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {contactCards.map(({ Icon, title, lines }) => (
            <div key={title} className="rounded-2xl border border-line bg-white p-6 shadow-card">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                <Icon className="size-5" aria-hidden />
              </span>
              <h2 className="font-display mt-4 text-base font-semibold text-navy-900">{title}</h2>
              <div className="mt-2 space-y-0.5">
                {lines.map((line) => (
                  <p key={line} className="text-sm text-slate-500">
                    {line}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 flex flex-col items-center gap-3 justify-center">
          {/* Form (visual only) */}
          {/* <div className="rounded-3xl border border-line bg-white p-6 shadow-card sm:p-8">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-navy-900">
              Send us a message
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Include your machine type and currency if you&apos;re asking about a specific device.
            </p>

            <form className="mt-6 grid gap-5 sm:grid-cols-2" aria-label="Contact form">
              <div>
                <Label htmlFor="contact-name">Full name</Label>
                <Input id="contact-name" name="name" placeholder="Ján Novák" autoComplete="name" />
              </div>
              <div>
                <Label htmlFor="contact-company">Company (optional)</Label>
                <Input id="contact-company" name="company" placeholder="Novák Amusement s.r.o." />
              </div>
              <div>
                <Label htmlFor="contact-email">Email</Label>
                <Input
                  id="contact-email"
                  name="email"
                  type="email"
                  placeholder="jan.novak@example.com"
                  autoComplete="email"
                />
              </div>
              <div>
                <Label htmlFor="contact-phone">Phone (optional)</Label>
                <Input id="contact-phone" name="phone" type="tel" placeholder="+421 900 000 000" />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="contact-topic">Topic</Label>
                <Select id="contact-topic" name="topic" defaultValue="sales">
                  <option value="sales">Product & sales enquiry</option>
                  <option value="service">Service / repair (RMA)</option>
                  <option value="firmware">Firmware & currency updates</option>
                  <option value="partnership">Partnership & volume pricing</option>
                  <option value="other">Something else</option>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="contact-message">Message</Label>
                <Textarea
                  id="contact-message"
                  name="message"
                  placeholder="Hello, we operate 40 self-service car washes and are looking to retrofit contactless payments…"
                />
              </div>
              <label className="flex items-start gap-2.5 text-xs leading-relaxed text-slate-500 sm:col-span-2">
                <Checkbox className="mt-0.5" />I agree to the processing of my personal data for the
                purpose of handling this enquiry, in line with the privacy policy.
              </label>
              <div className="sm:col-span-2">
                <Button variant="primary" size="lg" className="w-full sm:w-auto">
                  <Send aria-hidden />
                  Send message
                </Button>
              </div>
            </form>
          </div> */}

          {/* Departments + map placeholder */}
          {/* <div className="pattern-chevron-dark relative flex min-h-64 flex-1 flex-col items-center justify-center overflow-hidden rounded-2xl bg-navy-950 p-8 text-center shadow-card">
            <div
              className="absolute top-1/2 left-1/2 size-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-600/25 blur-3xl"
              aria-hidden
            />

            <Logo className="w-md border border-white" />

            <p className="font-display relative mt-4 text-lg font-semibold text-white">
              Kopčianska 92/D, Bratislava
            </p>
            <p className="relative mt-1 text-sm text-slate-400">
              5 min from the D2 highway · parking on site
            </p>
            <span className="relative mt-5 inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10">
              Open in maps
            </span>
          </div> */}
          <Logo className="w-md border border-white rounded-4xl p-5 bg-white shadow-card" />
          <p className="text-sm text-slate-500"> VAT number: SK 2120871324</p>
        </div>

        {/* FAQ */}
        <div className="mt-16 lg:mt-10">
          <h2 className="font-display text-center text-2xl font-semibold tracking-tight text-navy-900 sm:text-3xl">
            Najczęściej zadawane pytania
          </h2>
          <div className="mx-auto mt-8 max-w-3xl space-y-3">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-2xl border border-line bg-white px-6 py-4 shadow-card"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-semibold text-navy-900 [&::-webkit-details-marker]:hidden">
                  {faq.question}
                  <ChevronDown
                    className="size-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180"
                    aria-hidden
                  />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-500">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </Container>
    </>
  )
}
