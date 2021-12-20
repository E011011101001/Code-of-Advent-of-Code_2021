import * as fs from 'fs'

type Coords = [number, number]

const dataset = fs.readFileSync(
  './in.txt', {
    encoding: 'utf-8'
  }
).split('\n').map(row => row.split('').map(str => parseInt(str)))

const oneTileLength = dataset.length

const realMap = Array(oneTileLength * 5).fill(undefined).map(
  (_, i) => Array(oneTileLength * 5).fill(undefined).map(
    (_, j) => (dataset[i % oneTileLength][j % oneTileLength] + Math.floor(i / oneTileLength) + Math.floor(j / oneTileLength) - 1) % 9 + 1
  )
).map(row => row.map(risk => ({
  risk,
  lowestTotalRisk: Infinity,
  determined: false
})))

const origin: Coords = [0, 0]
const target: Coords = [realMap.length - 1, realMap.length - 1]

const ajacents = (i: number, j: number): Coords[] => ([
  [i - 1, j],
  [i + 1, j],
  [i, j - 1],
  [i, j + 1]
] as Coords[])
  .filter(([x, y]) => x >= 0 && x < realMap.length && y >= 0 && y < realMap.length)
  .filter(([x, y]) => !realMap[x][y].determined)

let neighbors: Coords[] = [origin]
realMap[origin[0]][origin[1]].lowestTotalRisk = 0

while (neighbors.length) {
  neighbors = neighbors.sort(
    ([i1, j1], [i2, j2]) => realMap[i1][j1].lowestTotalRisk - realMap[i2][j2].lowestTotalRisk
  )
  const [i, j] = neighbors.shift()
  if (i === target[0] && j === target[1]) {
    break
  }
  realMap[i][j].determined = true
  ajacents(i, j).forEach(([x, y]) => {
    if (realMap[x][y].lowestTotalRisk === Infinity) {
      neighbors.push([x, y])
    }
    realMap[x][y].lowestTotalRisk = Math.min(
      realMap[x][y].lowestTotalRisk,
      realMap[x][y].risk + realMap[i][j].lowestTotalRisk
    )
  })
}

console.log(`Part 1: ${
  realMap[oneTileLength - 1][oneTileLength - 1].lowestTotalRisk
}`)

console.log(`Part 2: ${
  realMap[target[0]][target[1]].lowestTotalRisk
}`)
