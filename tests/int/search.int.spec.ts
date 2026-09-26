import { describe, expect, it } from 'vitest'
import { searchWords } from '@/lib/search'

describe('searchWords', () => {
  it('splits on whitespace and punctuation, lowercased', () => {
    expect(searchWords('  Touch   Screen ')).toEqual(['touch', 'screen'])
    expect(searchWords('UBA-10-SS')).toEqual(['uba', '10', 'ss'])
    expect(searchWords('Monitor 19″ USB/RS232')).toEqual(['monitor', '19', 'usb', 'rs232'])
  })

  it('keeps diacritics as part of the word', () => {
    expect(searchWords('Wyświetlacz DOTYKOWY')).toEqual(['wyświetlacz', 'dotykowy'])
    // "s" + combining acute (NFD) is normalized to one letter instead of splitting the word
    expect(searchWords('wyświetlacz')).toEqual(['wyświetlacz'])
  })

  it('never lets LIKE wildcards or escapes through', () => {
    expect(searchWords('100% a_b \\x')).toEqual(['100', 'a', 'b', 'x'])
  })

  it('drops duplicates and caps the number of words', () => {
    expect(searchWords('JCM jcm Jcm')).toEqual(['jcm'])
    expect(searchWords('a b c d e f g h i j')).toHaveLength(8)
  })

  it('returns nothing for empty or punctuation-only input', () => {
    expect(searchWords(undefined)).toEqual([])
    expect(searchWords('   ')).toEqual([])
    expect(searchWords('--/"')).toEqual([])
  })
})
