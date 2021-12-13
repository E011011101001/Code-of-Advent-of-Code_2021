import * as fs from 'fs'

type Coord = [number, number]

const dataset = fs.readFileSync(
  './in.txt', {
    encoding: 'utf-8'
  }
).split('\n').map(row => row.split('').map(ch => parseInt(ch)))

const heightMap = dataset.map(row => (row.push(10), row.unshift(10), row))

heightMap.push(Array(heightMap[0].length).fill(10))
heightMap.unshift(Array(heightMap[0].length).fill(10))

const adjacent_coords = (i: number, j: number) => [
  [i - 1, j],
  [i + 1, j],
  [i, j - 1],
  [i, j + 1]
]
const coordsOfLow = heightMap.reduce(
  (coordsOfLow, row, i) => coordsOfLow.concat(row.reduce(
    (coordsOfLow, locHeight, j) => (
      locHeight !== 10 && adjacent_coords(i, j).reduce((isLow, [x, y]) => isLow && locHeight < heightMap[x][y], true)
    ) ? (coordsOfLow.concat([[i, j]])) : (coordsOfLow), [] as [number, number][]
  )), [] as [number, number][]
)

console.log(`Part 1: ${
  coordsOfLow.reduce((sum, [i, j]) => sum + heightMap[i][j] + 1, 0)
}`)

const converge = (includedLocs: Set<string>, [i, j]: Coord): Set<string> => adjacent_coords(i, j).filter(
    ([x, y]) => heightMap[x][y] < 9 && !includedLocs.has([x, y].join(',')) && heightMap[x][y] >= heightMap[i][j]
  ).reduce(converge, includedLocs.add([i, j].join(',')))

console.log(`Part 2: ${
  coordsOfLow
    .map(coords => [coords].reduce(converge, new Set<string>()).size)
    .sort((a, b) => b - a)
    .slice(0, 3)
    .reduce((mul, size) => mul * size)
}`)