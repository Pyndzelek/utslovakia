/** Longest query we search on, and the most words taken from it. */
const MAX_QUERY_LENGTH = 100
const MAX_WORDS = 8

/**
 * Splits a catalogue search query into the words every result must contain.
 *
 * Anything that isn't a letter or digit separates words, so `19"`, `UBA-10` and `USB/RS232`
 * match however the product text punctuates them — and no SQL `LIKE` wildcard (`%`, `_`) or
 * escape character can reach the database pattern. Diacritics are kept: the database folds
 * them (`unaccent`) on both sides, so they match with or without.
 */
export function searchWords(query: string | undefined): string[] {
  const words = (query ?? '')
    .slice(0, MAX_QUERY_LENGTH)
    .normalize('NFC') // keep "ś" one letter even if typed as "s" + combining accent
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean)
  return [...new Set(words)].slice(0, MAX_WORDS)
}

/** Letters `NFD` doesn't split into base + accent, folded the way Postgres' `unaccent` does. */
const FOLD_EXTRA: Record<string, string> = { ł: 'l', đ: 'd', ø: 'o', ß: 'ss', æ: 'ae', œ: 'oe' }

/** Lowercase `ch` without its diacritics; combining marks fold to nothing. */
function foldChar(ch: string): string {
  const lower = ch.toLowerCase()
  return FOLD_EXTRA[lower] ?? lower.normalize('NFD').replace(/\p{M}/gu, '')
}

const fold = (text: string) => Array.from(text, foldChar).join('')

export interface HighlightSegment {
  text: string
  match: boolean
}

/**
 * Splits `text` into segments, marking every occurrence of any of `words` (from `searchWords`).
 *
 * Matching ignores case and diacritics on both sides — like the database search — so
 * "wyswietlacz" marks "Wyświetlacz" and "łącznik" marks "Lacznik". Overlapping or touching
 * matches merge into one segment.
 */
export function highlightMatches(text: string, words: string[]): HighlightSegment[] {
  // Folded text, plus the original [start, end) of the character behind each folded position.
  let folded = ''
  const starts: number[] = []
  const ends: number[] = []
  let index = 0
  for (const ch of text) {
    const f = foldChar(ch)
    for (let i = 0; i < f.length; i++) {
      starts.push(index)
      ends.push(index + ch.length)
    }
    folded += f
    index += ch.length
  }

  const ranges: [number, number][] = []
  for (const word of new Set(words.map(fold).filter(Boolean))) {
    for (let at = folded.indexOf(word); at !== -1; at = folded.indexOf(word, at + 1)) {
      let end = ends[at + word.length - 1]
      // Take trailing combining accents (decomposed input) along with their letter.
      while (end < text.length && /\p{M}/u.test(text[end])) end++
      ranges.push([starts[at], end])
    }
  }
  if (ranges.length === 0) return text ? [{ text, match: false }] : []

  ranges.sort((a, b) => a[0] - b[0])
  const merged: [number, number][] = [ranges[0]]
  for (const [start, end] of ranges.slice(1)) {
    const last = merged[merged.length - 1]
    if (start <= last[1]) last[1] = Math.max(last[1], end)
    else merged.push([start, end])
  }

  const segments: HighlightSegment[] = []
  let cursor = 0
  for (const [start, end] of merged) {
    if (start > cursor) segments.push({ text: text.slice(cursor, start), match: false })
    segments.push({ text: text.slice(start, end), match: true })
    cursor = end
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor), match: false })
  return segments
}
