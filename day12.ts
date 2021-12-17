import * as fs from 'fs'

const dataset = fs.readFileSync(
  './in.txt', {
    encoding: 'utf-8'
  }
).split('\n').map(row => row.split('-'))

interface Cave {
  name: string
  size: 'big' | 'small'
  ajacent: Cave[]
}

const caveListRaw = dataset.reduce((caveList, connection) => caveList.concat(connection))

const caveList: Cave[] = caveListRaw.filter((caveName, i) => caveListRaw.indexOf(caveName) === i).map(caveName => ({
  name: caveName,
  size: (caveName === caveName.toUpperCase()) ? 'big' : 'small',
  ajacent: [] as Cave[]
}))

const startCave = caveList.find(cave => cave.name === 'start')
const endCave = caveList.find(cave => cave.name === 'end')

function connect (end1: string, end2: string): void {
  const cave1 = caveList.find(cave => cave.name === end1)
  const cave2 = caveList.find(cave => cave.name === end2)
  cave1.ajacent.push(cave2)
  cave2.ajacent.push(cave1)
}

dataset.forEach(connection => connect(connection[0], connection[1]))

let pathCnt = 0

function find_path (presentCave: Cave, visited: Set<Cave>, path: string[]): void {
  if (presentCave === endCave) {
    ++pathCnt
  }
  const nextCaves = presentCave.ajacent.filter(cave => cave.size === 'big' || !visited.has(cave))
  nextCaves.forEach(nextCave => {
    if (nextCave.size === 'small') {
      visited.add(nextCave)
    }
    find_path(nextCave, visited, path.concat(nextCave.name))
  })
  visited.delete(presentCave)
}

find_path(startCave, new Set<Cave>([startCave]), ['start'])

console.log(`Part 1: ${pathCnt}`)

function find_path2 (presentCave: Cave, visited: Set<Cave>, theOnlyOne: Cave | undefined, path: string[]): void {
  if (presentCave === endCave) {
    ++pathCnt
  } else {
    presentCave.ajacent.forEach(nextCave => {
      if (nextCave.size === 'small') {
        if (visited.has(nextCave)) {
          if (!theOnlyOne && nextCave !== startCave) {
            find_path2(nextCave, visited, nextCave, path.concat(nextCave.name))
          }
          return
        }
        visited.add(nextCave)
      }
      find_path2(nextCave, visited, theOnlyOne, path.concat(nextCave.name))
    })
  }
  if (presentCave !== theOnlyOne) {
    visited.delete(presentCave)
  }
}

pathCnt = 0
find_path2(startCave, new Set<Cave>([startCave]), undefined, ['start'])

console.log(pathCnt)
