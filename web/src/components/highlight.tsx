/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { Fragment, useMemo } from 'react'

type HighlightProps = {
  text: string
  /** Case-insensitive query; every occurrence is highlighted. */
  query?: string
  className?: string
}

/**
 * Renders `text` with every case-insensitive occurrence of `query`
 * emphasized. Falls back to plain text when the query is empty.
 */
export function Highlight({ text, query, className }: HighlightProps) {
  const parts = useMemo(() => {
    const needle = query?.trim()
    if (!needle) return null
    const lowerText = text.toLowerCase()
    const lowerNeedle = needle.toLowerCase()
    if (!lowerText.includes(lowerNeedle)) return null

    const segments: Array<{ text: string; hit: boolean }> = []
    let cursor = 0
    let index = lowerText.indexOf(lowerNeedle, cursor)
    while (index !== -1) {
      if (index > cursor) {
        segments.push({ text: text.slice(cursor, index), hit: false })
      }
      segments.push({ text: text.slice(index, index + needle.length), hit: true })
      cursor = index + needle.length
      index = lowerText.indexOf(lowerNeedle, cursor)
    }
    if (cursor < text.length) {
      segments.push({ text: text.slice(cursor), hit: false })
    }
    return segments
  }, [text, query])

  if (!parts) {
    return <span className={className}>{text}</span>
  }

  return (
    <span className={className}>
      {parts.map((part, partIndex) =>
        part.hit ? (
          <mark
            key={partIndex}
            className='bg-primary/15 text-primary rounded-sm px-0.5 font-semibold'
          >
            {part.text}
          </mark>
        ) : (
          <Fragment key={partIndex}>{part.text}</Fragment>
        )
      )}
    </span>
  )
}
