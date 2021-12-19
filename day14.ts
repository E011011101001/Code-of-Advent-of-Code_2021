import * as fs from 'fs'
import { Z_DEFAULT_COMPRESSION } from 'zlib'

interface FreqState {
  pairCount: {
    [key: string]: {
      [key: string]: number
    }
  }
  elementCount: {
    [key: string]: number
  }
}

const deduplicate = <T>(arr: Array<T>) => arr.filter((item, index) => arr.indexOf(item) === index)

const times = (repeatTime: number) => ({
  do: (callback: (index: number) => void) => {
    Array(repeatTime).fill(undefined).forEach((_, i) => callback(i))
  }
})

const dataset = fs.readFileSync(
  './in.txt', {
    encoding: 'utf-8'
  }
).split('\n\n')

const template = dataset[0]
const insertRules = dataset[1].split('\n').map(row => ({
  match: row.split(' -> ')[0],
  insertion: row.split(' -> ')[1]
}))

const elements = deduplicate(insertRules.map(rule => rule.insertion))

const get_empty_state = () => {
  const emptyState: FreqState = {
    pairCount: {},
    elementCount: {}
  }
  elements.forEach(firstEl => {
    emptyState.pairCount[firstEl] = {}
    emptyState.elementCount[firstEl] = 0
    elements.forEach(secondEl => emptyState.pairCount[firstEl][secondEl] = 0)
  })
  return emptyState
}

const get_init_state = () => {
  const initState = get_empty_state()
  times(template.length - 1).do(i => ++initState.pairCount[template[i]][template[i + 1]])
  template.split('').forEach(element => ++initState.elementCount[element])
  return initState
}

const do_one_step = (prevState: FreqState) => {
  const nextState = get_empty_state()
  nextState.elementCount = prevState.elementCount
  insertRules.forEach(rule => {
    const matchTimes = prevState.pairCount[rule.match[0]][rule.match[1]]
    nextState.pairCount[rule.match[0]][rule.insertion] += matchTimes
    nextState.pairCount[rule.insertion][rule.match[1]] += matchTimes
    nextState.elementCount[rule.insertion] += matchTimes
  })
  return nextState
}

const result_after_steps =  (steps: number): number => {
  const finalState = (Array(steps) as undefined[])
    .fill(undefined)
    .reduce(previousState => do_one_step(previousState), get_init_state())

  const elementCounts = elements
    .map(element => finalState.elementCount[element])
    .sort((a, b) => a - b)

  return elementCounts[elementCounts.length - 1] - elementCounts[0]
}

console.log(`Part 1: ${
  result_after_steps(10)
}
Part 2: ${
  result_after_steps(40)
}`)
