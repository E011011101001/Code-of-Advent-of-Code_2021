import * as fs from 'fs'
import * as _ from 'lodash'
import { StringStream, times } from './eoltools'

const dataset = fs.readFileSync('in.txt', 'utf-8').split('\n')

class RegularNumber {
  public type: 'regular' = 'regular'
  public value: number = undefined
  public parent!: SnailfishNumber

  constructor (n: number, parent: SnailfishNumber) {
    this.value = n
    this.parent = parent
  }

  public get magnitude () {
    return this.value
  }
}

class SnailfishNumber {
  public type: 'snailfish' = 'snailfish'
  private _left: RegularNumber | SnailfishNumber | null = null
  private _right: RegularNumber | SnailfishNumber | null = null
  private _parent: SnailfishNumber | null = null
  private _depth: number = 0

  constructor (inputStream?: StringStream) {
    if (!inputStream) {
      return
    }

    inputStream.get_by_length(1) // the beginning '['
    if (inputStream.peak() === '[') {
      this._left = new SnailfishNumber(inputStream)
      this._left._mount_to(this)
    } else {
      this._left = new RegularNumber(parseInt(inputStream.get_by_length(1)), this)
    }

    inputStream.get_by_length(1) // ','

    if (inputStream.peak() === '[') {
      this._right = new SnailfishNumber(inputStream)
      this._right._mount_to(this)
    } else {
      this._right = new RegularNumber(parseInt(inputStream.get_by_length(1)), this)
    }

    inputStream.get_by_length(1)
  }

  private _traverse (
      callback: (sn: SnailfishNumber, depth: number) => unknown,
      depth: number = 0,
      shouldContinue: boolean = true
    ): boolean {
    if (this._left.type === 'snailfish') {
      if (!this._left._traverse(callback, depth + 1)) {
        return false
      }
    }
    if (callback(this, depth) === false) {
      return false
    }
    if (this._right.type === 'snailfish') {
      return this._right._traverse(callback, depth + 1)
    }
    return true
  }

  private _mount_to (parent: SnailfishNumber) {
    this._parent = parent
    this._traverse(sn => sn._depth += parent._depth + 1)
  }

  private get _rightmost_leaf (): RegularNumber {
    if (this._right.type === 'regular') {
      return this._right
    } else {
      return this._right._rightmost_leaf
    }
  }

  private get _leftmost_leaf (): RegularNumber {
    if (this._left.type === 'regular') {
      return this._left
    } else {
      return this._left._leftmost_leaf
    }
  }

  private get _left_regular (): RegularNumber | null {
    if (this._parent === null) {
      return null
    }
    if (this._parent._right === this) {
      if (this._parent._left.type === 'regular') {
        return this._parent._left
      } else {
        return this._parent._left._rightmost_leaf
      }
    } else {
      return this._parent._left_regular
    }
  }

  private get _right_regular (): RegularNumber | null {
    if (this._parent === null) {
      return null
    }
    if (this._parent._left === this) {
      if (this._parent._right.type === 'regular') {
        return this._parent._right
      } else {
        return this._parent._right._leftmost_leaf
      }
    } else {
      return this._parent._right_regular
    }
  }

  private _explode (): void {
    if (this._left.type !== 'regular' || this._right.type !== 'regular' || this._parent === null) {
      console.error('Wrong snailfish number to explode!')
      process.exit(1)
    }
    if (this._left_regular !== null) {
      this._left_regular.value += this._left.value
    }
    if (this._right_regular !== null) {
      this._right_regular.value += this._right.value
    }

    const replacer = new RegularNumber(0, this._parent)
    if (this._parent._left === this) {
      this._parent._left = replacer
    } else {
      this._parent._right = replacer
    }
  }

  private _split_left (): void {
    if (this._left.type !== 'regular' || this._left.value < 10) {
      console.error('Wrong regular number to split!')
      process.exit(1)
    }
    const newPair = new SnailfishNumber()
    newPair._left = new RegularNumber(Math.floor(this._left.value / 2), this)
    newPair._right = new RegularNumber(Math.ceil(this._left.value / 2), this)

    this._left = newPair
    newPair._mount_to(this)
  }

  private _split_right (): void {
    if (this._right.type !== 'regular' || this._right.value < 10) {
      console.error('Wrong regular number to split!')
      process.exit(1)
    }
    const newPair = new SnailfishNumber()
    newPair._left = new RegularNumber(Math.floor(this._right.value / 2), this)
    newPair._right = new RegularNumber(Math.ceil(this._right.value / 2), this)

    this._right = newPair
    newPair._mount_to(this)
  }

  private _reduce (): void {
    let hasExploded: boolean
    let hasSplited: boolean

    do {
      hasExploded = false
      hasSplited = false
      // explode
      this._traverse(sn => {
        if (sn._depth >= 4 && sn._left.type === 'regular' && sn._right.type === 'regular') {
          sn._explode()
          hasExploded = true
          return false
        }
      })
      if (!hasExploded) {
        // Split
        this._traverse(sn => {
          if (sn._left.type === 'regular' && sn._left.value >= 10) {
            sn._split_left()
            hasSplited = true
            return false
          } else if (sn._right.type === 'regular' && sn._right.value >= 10) {
            sn._split_right()
            hasSplited = true
            return false
          }
        })
      }
    } while (hasExploded || hasSplited)
  }

  public add (sn: SnailfishNumber): SnailfishNumber {
    const newRoot = new SnailfishNumber()
    newRoot._left = this
    newRoot._right = sn
    this._mount_to(newRoot)
    sn._mount_to(newRoot)

    newRoot._reduce()
    return newRoot
  }

  public get magnitude (): number {
    return 3 * this._left.magnitude + 2 * this._right.magnitude
  }
}

const originalSnailfishNumbers = dataset.map(numberStr => new SnailfishNumber(new StringStream(numberStr)))

console.log(`Part 1: ${
  _.cloneDeep(originalSnailfishNumbers)
    .reduce((sn, nextSn) => sn.add(nextSn))
    .magnitude
}`)

console.log(`Part 2: ${
  Math.max(...
    originalSnailfishNumbers
      .map((sn1, i) => Math.max(...
        originalSnailfishNumbers
          .filter((_, j) => i !== j)
          .map(sn2 => _.cloneDeep(sn1).add(_.cloneDeep(sn2)).magnitude)
      ))
  )
}`)