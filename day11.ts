import * as fs from 'fs'

type Coords = [number, number]

const dataset = fs.readFileSync(
  './in.txt', {
    encoding: 'utf-8'
  }
).split('\n').map(row => row.split('').map(str => parseInt(str)))

const ajacent_locs = (i: number, j: number): Coords[] => ([
  [i - 1, j - 1],
  [i - 1, j],
  [i - 1, j + 1],
  [i, j - 1],
  [i, j + 1],
  [i + 1, j - 1],
  [i + 1, j],
  [i + 1, j + 1]
] as Coords[]).filter(([x, y]) => x >= 0 && x <= 9 && y >= 0 && y <= 9)

const coordsMap = Array(10).fill(undefined).map((_, i) => Array(10).fill(undefined).map((_, j) => [i, j])).reduce((merged, cur) => merged.concat(cur))

let levelMap: number[][] = dataset

function flash (flashTimes = 0): number {
  const flashLocs = coordsMap.filter(([i, j]) => levelMap[i][j] > 9)
  if (!flashLocs.length) {
    return flashTimes
  }

  const flashed = flashLocs.reduce((flashed: Coords[], [i, j]) => flashed.concat(ajacent_locs(i, j)), [])
  flashLocs.forEach(([i, j]) => levelMap[i][j] = 0)
  flashed.forEach(([i, j]) => {
    if (levelMap[i][j]) {
      ++levelMap[i][j]
    }
  })
  return flash(flashTimes + flashLocs.length)
}

let step = 0, flashCnt = 0, allFlashStep = 0

function do_one_step () {
  levelMap = levelMap.map(row => row.map(level => level + 1))
  const flashedTimes = flash()
  if (flashedTimes === 100 && allFlashStep === 0) {
    allFlashStep = step
  }
  return flashedTimes
}


for (step = 1; step <= 100; ++step) {
  flashCnt += do_one_step()
}

console.log(`Part 1: ${flashCnt}`)

while (allFlashStep === 0) {
  do_one_step()
  ++step
}

console.log(`Part 2: ${allFlashStep}`)


