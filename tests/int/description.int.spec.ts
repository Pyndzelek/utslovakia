import { describe, expect, it } from 'vitest'
import { parseDescription } from '@/components/product/product-description'

describe('parseDescription', () => {
  it('splits paragraphs, headings and one-item-per-line lists', () => {
    const text = [
      'Reliable bill acceptor for vending.',
      '',
      'Technical specifications:',
      'Voltage: 12 V',
      'Interface: ccTalk',
      '',
      'Ships worldwide.',
    ].join('\n')

    expect(parseDescription(text)).toEqual([
      { type: 'paragraph', text: 'Reliable bill acceptor for vending.' },
      { type: 'heading', text: 'Technical specifications' },
      { type: 'list', items: ['Voltage: 12 V', 'Interface: ccTalk'] },
      { type: 'paragraph', text: 'Ships worldwide.' },
    ])
  })

  it('handles Windows line endings and surrounding whitespace', () => {
    expect(parseDescription('  One  \r\n\r\n  Two  ')).toEqual([
      { type: 'paragraph', text: 'One' },
      { type: 'paragraph', text: 'Two' },
    ])
  })

  it('does not treat long sentences ending in a colon as headings', () => {
    const long = `${'x'.repeat(60)}:`
    expect(parseDescription(long)).toEqual([{ type: 'paragraph', text: long }])
  })
})
