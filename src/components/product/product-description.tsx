import React from 'react'

export type Block =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }

// A short line ending with a colon, e.g. "Technical specifications:"
const isHeading = (line: string) => /^[^:]{1,50}:$/.test(line)

/**
 * Turns plain-text descriptions (paragraphs separated by blank lines, "Heading:" lines,
 * one-item-per-line lists) into structured blocks.
 */
export function parseDescription(text: string): Block[] {
  const blocks: Block[] = []
  let lines: string[] = []
  const flush = () => {
    if (lines.length === 1) blocks.push({ type: 'paragraph', text: lines[0] })
    else if (lines.length > 1) blocks.push({ type: 'list', items: lines })
    lines = []
  }
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim()
    if (!line) flush()
    else if (isHeading(line)) {
      flush()
      blocks.push({ type: 'heading', text: line.slice(0, -1) })
    } else lines.push(line)
  }
  flush()
  return blocks
}

export function ProductDescription({ text }: { text: string }) {
  return (
    <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-slate-600">
      {parseDescription(text).map((block, i) => {
        if (block.type === 'heading')
          return (
            <h3 key={i} className="pt-2 text-base font-semibold text-navy-900">
              {block.text}
            </h3>
          )
        if (block.type === 'paragraph') return <p key={i}>{block.text}</p>
        return (
          <ul key={i} className="list-disc space-y-1 pl-5 marker:text-slate-300">
            {block.items.map((item, j) => {
              const [label, ...rest] = item.split(': ')
              return (
                <li key={j}>
                  {rest.length ? (
                    <>
                      <span className="font-medium text-navy-900">{label}:</span> {rest.join(': ')}
                    </>
                  ) : (
                    item
                  )}
                </li>
              )
            })}
          </ul>
        )
      })}
    </div>
  )
}
