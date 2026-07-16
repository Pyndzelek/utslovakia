import React from 'react'
import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { ChevronDown, Clock, Headset, Mail, MapPin, Phone, Send, Wrench } from 'lucide-react'
import type { Locale } from '@/i18n/routing'
import { Container } from '@/components/ui/container'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'
import { Button } from '@/components/ui/button'
import { Checkbox, Input, Label, Select, Textarea } from '@/components/ui/field'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Talk to the UT Slovakia team — sales, technical support and service centre in Bratislava. We answer within one business day.',
}

const contactCards = [
  {
    Icon: MapPin,
    title: 'Visit us',
    lines: ['Kopčianska 92/D', '851 01 Bratislava, Slovakia'],
  },
  {
    Icon: Phone,
    title: 'Call us',
    lines: ['+421 2 5478 9630', '+421 911 482 267 (mobile)'],
  },
  {
    Icon: Mail,
    title: 'Write to us',
    lines: ['sales@utslovakia.sk', 'service@utslovakia.sk'],
  },
  {
    Icon: Clock,
    title: 'Opening hours',
    lines: ['Mon–Fri: 8:00 – 16:30', 'Warehouse pickup until 15:30'],
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
    question: 'How quickly do you ship?',
    answer:
      'Orders placed before 14:00 leave our Bratislava warehouse the same working day. Delivery within Slovakia is next-day; most EU destinations take 2–3 working days.',
  },
  {
    question: 'Can you pre-configure devices before shipping?',
    answer:
      'Yes. Tell us your machine type and currency requirements and we will flash the correct firmware and currency tables free of charge, so the unit is plug-and-play on arrival.',
  },
  {
    question: 'Do you repair devices bought elsewhere?',
    answer:
      'We do. Our service centre handles all brands we distribute regardless of where the unit was purchased. Send us the model and fault description for a repair quote.',
  },
  {
    question: 'Do you offer volume or distributor pricing?',
    answer:
      'Volume discounts start at five units and we run partner terms for operators and OEMs. Contact sales with your expected quantities and we will prepare an offer.',
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
            Talk to a human who knows the hardware
          </h1>
          <p className="mt-2 max-w-2xl text-[15px] text-slate-500">
            Sales, technical questions or a repair — one message reaches the right engineer. We
            answer within one business day.
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

        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_420px] lg:gap-14">
          {/* Form (visual only) */}
          <div className="rounded-3xl border border-line bg-white p-6 shadow-card sm:p-8">
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
                <Checkbox className="mt-0.5" />
                I agree to the processing of my personal data for the purpose of handling this
                enquiry, in line with the privacy policy.
              </label>
              <div className="sm:col-span-2">
                <Button variant="primary" size="lg" className="w-full sm:w-auto">
                  <Send aria-hidden />
                  Send message
                </Button>
              </div>
            </form>
          </div>

          {/* Departments + map placeholder */}
          <div className="flex flex-col gap-5">
            {departments.map(({ Icon, title, text, contact }) => (
              <div key={title} className="rounded-2xl border border-line bg-white p-6 shadow-card">
                <div className="flex items-start gap-4">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <div>
                    <h3 className="font-display text-base font-semibold text-navy-900">{title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-500">{text}</p>
                    <a
                      href={`mailto:${contact}`}
                      className="mt-2 inline-block text-sm font-semibold text-brand-700 underline-offset-2 hover:underline"
                    >
                      {contact}
                    </a>
                  </div>
                </div>
              </div>
            ))}

            {/* Map placeholder */}
            <div className="pattern-chevron-dark relative flex min-h-64 flex-1 flex-col items-center justify-center overflow-hidden rounded-2xl bg-navy-950 p-8 text-center shadow-card">
              <div
                className="absolute top-1/2 left-1/2 size-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-600/25 blur-3xl"
                aria-hidden
              />
              <span className="relative flex size-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-glow">
                <MapPin className="size-6" aria-hidden />
              </span>
              <p className="font-display relative mt-4 text-lg font-semibold text-white">
                Kopčianska 92/D, Bratislava
              </p>
              <p className="relative mt-1 text-sm text-slate-400">
                5 min from the D2 highway · parking on site
              </p>
              <span className="relative mt-5 inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10">
                Open in maps
              </span>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 lg:mt-20">
          <h2 className="font-display text-center text-2xl font-semibold tracking-tight text-navy-900 sm:text-3xl">
            Frequently asked questions
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
