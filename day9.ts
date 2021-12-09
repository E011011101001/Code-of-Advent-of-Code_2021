import * as fs from 'fs'
import { pipeline } from 'stream'

const dataset = fs.readFileSync(
  './in.txt', {
    encoding: 'utf-8'
  }
).split('\n').map(row => row.split('').map(ch => parseInt(ch)))

const heightMap = dataset.map(row => (row.push(10), row.unshift(10), row))

heightMap.push(Array(heightMap[0].length).fill(10))
heightMap.unshift(Array(heightMap[0].length).fill(10))

const MapWithLowMarked = heightMap.map(row => row.map(point => ({
  height: point,
  low: false
}))).map((row, i) => row.map((point, j) => {
  if (point.height !== 10) {
    if (
      point.height < heightMap[i - 1][j] &&
      point.height < heightMap[i + 1][j] &&
      point.height < heightMap[i][j - 1] &&
      point.height < heightMap[i][j + 1]
    ) {
      point.low = true
    }
  }
  return point
}))

console.log(`Part 1: ${
  MapWithLowMarked.reduce((sum, row) => sum + row.reduce((sum, point) => point.low ? (sum + point.height + 1) : sum, 0), 0)
}`)

const isIncluded = heightMap.map(row => row.map(point => false))

console.log(`Part 2: ${
  MapWithLowMarked.reduce(
    (basinSizes, row, i) => basinSizes.concat(row.reduce(
      (basinSizes, point, j) => {
        if (point.low) {
          let basinSize = 0
          isIncluded[i][j] = true
          const searchStack: [number, number][] = [[i, j]]
          while (searchStack.length) {
            ++basinSize
            const [i, j] = searchStack.shift()
            const higherLocs = ([
              [i - 1, j],
              [i + 1, j],
              [i, j - 1],
              [i, j + 1]
            ] as [number, number][]).filter(coords => {
              const [x, y] = coords
              if (heightMap[x][y] < 9 /* bounds checking included*/ && !isIncluded[x][y]) {
                return heightMap[x][y] >= heightMap[i][j]
              }
              return false
            })
            higherLocs.forEach(([x, y]) => isIncluded[x][y] = true)
            searchStack.push(...higherLocs)
          }
          basinSizes.push(basinSize)
          return basinSizes
        } else {
          return basinSizes
        }
      }
    , [] as number[]))
  , [] as number[]).sort((a, b) => b - a).slice(0, 3).reduce((mul, size) => mul * size)
}`)
