import * as fs from 'fs'

/*
 * The reverse funtion of the following:
 * function x_after_steps (vx0: number, steps: number): number {
 *   if (steps >= vx0) {
 *      return (vx0 + 1) * vx0 / 2
 *   } else {
 *     return (vx0 * 2 - steps + 1) * steps / 2
 *   }
 * }
 */
function vx0_by_x_step (x: number, steps: number): number | undefined {
  if (steps * (steps + 1) >= 2 * x) {
    const vx0 = Math.floor(Math.sqrt(2 * x))
    if (vx0 * (vx0 + 1) === 2 * x) {
      return vx0
    }
  } else if ((x * 2) % steps === 0) {
    const tmp = x * 2 / steps - 1 + steps
    if (tmp % 2 === 0) {
      return tmp / 2
    }
  }
  return undefined
}

const input = fs.readFileSync(
  './in.txt', {
    encoding: 'utf-8'
  }
)

const [xMin, xMax] = input
  .slice(input.indexOf('=') + 1, input.indexOf(','))
  .split('..')
  .map(str => parseInt(str))

const [yMin, yMax] = input
  .slice(input.lastIndexOf('=') + 1)
  .split('..')
  .map(str => parseInt(str))

if (yMin >= 0) {
  console.error(`I've only figured out the Part 1 answer when yMin < 0`)
  process.exit(1)
}

const vy0Max = -1 - yMin
console.log(`Part 1: ${(1 + vy0Max) * vy0Max / 2}`)

const possibleVy0WithSteps: {
  vy0: number,
  steps: number[]
}[] = []

for (let vy0 = yMin; vy0 <= vy0Max; ++vy0) {
  let steps = 0
  let y = 0
  const possibleSteps: number[] = []
  do {
    y += vy0 - steps
    ++steps
    if (y <= yMax && y >= yMin) {
      possibleSteps.push(steps)
    }
  } while (y >= yMin)
  if (possibleSteps.length) {
    possibleVy0WithSteps.push({
      vy0,
      steps: possibleSteps
    })
  }
}

const vx0CountAtStepCache: number[][] = []

function possible_vx0s_at_step (step: number): number[] {
  if (vx0CountAtStepCache[step] === undefined) {
    vx0CountAtStepCache[step] = []
    for (let x = xMin; x <= xMax; ++x) {
      const vx0 = vx0_by_x_step(x, step)
      if (vx0) {
        vx0CountAtStepCache[step].push(vx0)
      }
    }
  }
  return vx0CountAtStepCache[step]
}

const possiblePairs = possibleVy0WithSteps
  .map(vy0AndSteps => {
    let vx0s: number[] = []
    vy0AndSteps.steps.forEach(step => {
      const newvx0s = possible_vx0s_at_step(step)
      vx0s = vx0s.concat(newvx0s)
    })
    vx0s = vx0s.filter((vx0, i) => i === vx0s.indexOf(vx0))
    return {
      vx0s,
      vy0: vy0AndSteps.vy0,
      steps: vy0AndSteps.steps
    }
  })

console.log(`Part 2: ${
  possiblePairs.reduce((count, pair) => count + pair.vx0s.length, 0)
}`)

