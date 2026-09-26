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
