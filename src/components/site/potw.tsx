'use client'

import { useState } from 'react'
import type { Problem } from '@/lib/potw'

export function ProblemOfTheWeek({ problem }: { problem: Problem }) {
  const [revealed, setRevealed] = useState(false)
  return (
    <div className="sv-week">
      <p className="sv-week-statement">{problem.statement}</p>
      <p className="sv-week-tag">{problem.tag}</p>
      {revealed ? (
        <div className="sv-week-answer">
          <p className="sv-week-value">Answer: {problem.answer}</p>
          <p>{problem.solution}</p>
        </div>
      ) : null}
      <button type="button" className="sv-button sv-button-small" aria-expanded={revealed} onClick={() => setRevealed((v) => !v)}>
        {revealed ? 'Hide the answer' : 'Show the answer'}
      </button>
    </div>
  )
}
