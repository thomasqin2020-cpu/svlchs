export interface Problem {
  statement: string
  tag: string
  answer: string
  solution: string
}

export const POTW_PROBLEMS: Problem[] = [
  {
    statement: 'What is the smallest positive integer n for which n(n + 1) is a multiple of 1000?',
    tag: 'Number theory',
    answer: '375',
    solution: 'n and n + 1 share no common factor, so 8 must divide one of them and 125 the other. The two splits give n = 375 (since 375 × 376 = 141000) and n = 624, so the smallest is 375.',
  },
  {
    statement: 'A rectangle has perimeter 46 and a diagonal of length 17. What is the area of the rectangle?',
    tag: 'Geometry',
    answer: '120',
    solution: 'With l + w = 23 and l² + w² = 17² = 289, squaring the sum gives 2lw = 529 − 289 = 240. The area is 120, and the sides turn out to be 8 and 15.',
  },
  {
    statement: 'In how many different ways can a 2 × 10 grid be completely covered by ten 1 × 2 dominoes?',
    tag: 'Counting',
    answer: '89',
    solution: 'The leftmost column is either one vertical domino, leaving a 2 × 9 grid, or two stacked horizontals, leaving a 2 × 8. The counts follow the Fibonacci pattern 1, 2, 3, 5, 8, and so on, reaching 89 at length 10.',
  },
  {
    statement: 'The real number x satisfies x + 1/x = 4. What is the value of x³ + 1/x³?',
    tag: 'Algebra',
    answer: '52',
    solution: 'Cube the given equation: (x + 1/x)³ = x³ + 1/x³ + 3(x + 1/x). So x³ + 1/x³ = 64 − 12 = 52.',
  },
  {
    statement: 'Two standard six-sided dice are rolled. What is the probability that the product of the two numbers rolled is a multiple of 6?',
    tag: 'Probability',
    answer: '5/12',
    solution: 'Count the failures: the product misses a factor of 2 in 9 outcomes, misses a factor of 3 in 16, and misses both in 4. So 9 + 16 − 4 = 21 outcomes fail, and 15/36 = 5/12 succeed.',
  },
  {
    statement: 'The numbers 1 through 10 are written on a board. Each move, you erase two numbers a and b and write a + b + 1. After nine moves one number remains. What is it?',
    tag: 'Invariants',
    answer: '64',
    solution: 'Every move raises the total on the board by exactly 1, whichever pair you erase. The sum starts at 55, so after nine moves the survivor is 55 + 9 = 64.',
  },
]

function isoWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  const day = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - day)
  const yearStart = Date.UTC(d.getUTCFullYear(), 0, 1)
  return Math.ceil(((d.getTime() - yearStart) / 86400000 + 1) / 7)
}

/** The problem for this ISO week, so the whole club sees the same one. */
export function problemOfTheWeek(now: Date = new Date()): Problem {
  return POTW_PROBLEMS[isoWeekNumber(now) % POTW_PROBLEMS.length]
}
