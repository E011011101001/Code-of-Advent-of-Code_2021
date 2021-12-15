import * as fs from 'fs'

const points: {[key: string]: number} = {
  ')': 3,
  ']': 57,
  '}': 1197,
  '>': 25137
}

const completionPoints: {[key: string]: number} = {
  ')': 1,
  ']': 2,
  '}': 3,
  '>': 4
}

const pairs: {[key: string]: string} = {
  '(': ')',
  '[': ']',
  '{': '}',
  '<': '>'
}

const dataset = fs.readFileSync(
  './in.txt', {
    encoding: 'utf-8'
  }
).split('\n').map(row => row.split(''))

const parsed = dataset.map(row => row.reduce((state, char) => {
    if (!state.error) {
      if (Object.keys(pairs).indexOf(char) >= 0) {
        // opening
        state.stack.push(char)
      } else if (pairs[state.stack.pop()] !== char) {
        state.stack.push(char)
        state.error = true
      }
    }
    return state
  }, {
    stack: [] as string[],
    error: false
  }))

console.log(`Part 1: ${
  parsed
    .filter(row => row.error)
    .map(row => points[row.stack.at(-1)])
    .reduce((a, b) => a + b)
}`)

const scores = parsed
  .filter(row => !row.error)
  .map(row => row.stack.reverse())
  .map(stack => stack.map(openingChar => completionPoints[pairs[openingChar]]))
  .map(row => row.reduce((score, point) => 5 * score + point, 0))
  .sort((a, b) => a - b)

console.log(`Part 2: ${
  scores[(scores.length - 1) / 2]
}`)