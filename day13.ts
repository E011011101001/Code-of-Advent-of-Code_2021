import * as fs from 'fs'

type Coords = [number, number]
interface Fold {
  direction: 'x' | 'y'
  value: number
}

const dataset = fs.readFileSync(
  './in.txt', {
    encoding: 'utf-8'
  }
).split('\n\n').map(part => part.split('\n'))

const dots = dataset[0].map(row => row.split(',').map(str => parseInt(str))) as Coords[]
const folds = dataset[1].map(row => ({
  direction: row.split('=')[0].split(' ')[2],
  value: parseInt(row.split('=')[1])
})) as Fold[]

const fold_exec = ([i, j]: Coords, fold: Fold): Coords => [
  (fold.direction === 'y') ? i : ((i > fold.value) ? (2 * fold.value - i) : i),
  (fold.direction === 'x') ? j : ((j > fold.value) ? (2 * fold.value - j) : j)
]

function dot_equal (dot1: Coords, dot2: Coords): boolean {
  return dot1[0] === dot2[0] && dot1[1] === dot2[1]
}

console.log(`Part 1: ${
  dots
    .map(dot => fold_exec(dot, folds[0]))
    .reduce(
      (uniqueSet, dot) => uniqueSet.reduce(
        (duplicated, includedDot) => duplicated || dot_equal(dot, includedDot), false
      ) ? uniqueSet : uniqueSet.concat([dot]),
      []
    )
    .length
}`)

const paper = Array(6).fill(undefined).map(_ => Array(40).fill(' '))

dots
  .map(dot => folds.reduce((tmpDot, fold) => fold_exec(tmpDot, fold), dot))
  .reduce(
    (uniqueSet, dot) => uniqueSet.reduce(
      (duplicated, includedDot) => duplicated || dot_equal(dot, includedDot), false
    ) ? uniqueSet : uniqueSet.concat([dot]),
    []
  )
  .forEach(([i, j]) => paper[j][i] = '8')

console.log(`Part 2:
${paper.map(row => row.join('')).join('\n')}
`)
