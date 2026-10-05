import { describe, expect, it } from 'vitest'
import { highlightMatches, searchWords } from '@/lib/search'

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

/** Renders segments as a string with the matches in [brackets], for compact assertions. */
const marked = (text: string, query: string) =>
  highlightMatches(text, searchWords(query))
    .map((segment) => (segment.match ? `[${segment.text}]` : segment.text))
    .join('')

describe('highlightMatches', () => {
  it('marks every occurrence, ignoring case', () => {
    expect(marked('Monitor dotykowy MONITOR', 'monitor')).toBe('[Monitor] dotykowy [MONITOR]')
  })

  it('ignores diacritics on both sides', () => {
    expect(marked('Wyświetlacz LCD', 'wyswietlacz')).toBe('[Wyświetlacz] LCD')
    expect(marked('Lacznik kablowy', 'łącznik')).toBe('[Lacznik] kablowy')
    expect(marked('Łącznik kablowy', 'lacz')).toBe('[Łącz]nik kablowy')
  })

  it('keeps decomposed accents inside the marked letter', () => {
    const decomposed = 'Wyświetlacz'.normalize('NFD')
    expect(marked(decomposed, 'wys')).toBe(`[${'Wyś'.normalize('NFD')}]wietlacz`)
  })

  it('marks several words and merges overlapping or touching matches', () => {
    expect(marked('Touch screen monitor', 'touch monitor')).toBe('[Touch] screen [monitor]')
    expect(marked('Akceptor banknotów', 'akcep ceptor')).toBe('[Akceptor] banknotów')
    expect(marked('UBA-10-SS', 'uba 10')).toBe('[UBA]-[10]-SS')
    expect(marked('abcdef', 'abc def')).toBe('[abcdef]')
  })

  it('returns the text unmarked when nothing matches', () => {
    expect(highlightMatches('Monitor', ['xyz'])).toEqual([{ text: 'Monitor', match: false }])
    expect(highlightMatches('Monitor', [])).toEqual([{ text: 'Monitor', match: false }])
    expect(highlightMatches('', ['a'])).toEqual([])
  })
})
