import * as fs from 'fs'

const dataset = fs.readFileSync(
  './in.txt', {
    encoding: 'utf-8'
  }
).split('\n').map(row => row.split(' | ').map(str => str.split(' ')))

console.log(`Part 1: ${
  dataset.map(row => row[1]).reduce((sum, row) => sum + row.filter(ch => [2, 3, 4, 7].indexOf(ch.length) >= 0).length, 0)
}`)

/*
Frequency:
a: 8
b: 6
c: 8
d: 7
e: 4
f: 9
g: 7

0 abcefg 467889 42
1 cf 89 17
2 acdeg 47788 34
3 acdfg 77889 39
4 bcdf 6789  30
5 abdfg 67789 37
6 abdefg 467789 41
7 acf 889 25
8 abcdefg 4677889 49
9 abcdfg 677889 45
*/

const decodeMap: number[] = []
decodeMap[42] = 0
decodeMap[17] = 1
decodeMap[34] = 2
decodeMap[39] = 3
decodeMap[30] = 4
decodeMap[37] = 5
decodeMap[41] = 6
decodeMap[25] = 7
decodeMap[49] = 8
decodeMap[45] = 9

class Decoder {
  private alphaCount!: {[alpha: string]: number}

  decode (segments: string): number {
    return decodeMap[segments.split('').reduce((sum, segment) => sum + this.alphaCount[segment], 0)]
  }

  constructor (encodedPtns: string[]) {
    this.alphaCount = {}

    //count segments
    encodedPtns.forEach(ptn => {
      for (let ch of ptn) {
        if (this.alphaCount[ch]) {
          ++this.alphaCount[ch]
        } else {
          this.alphaCount[ch] = 1
        }
      }
    })
  }
}

console.log(`Part 2: ${
  dataset.reduce((sumOfAll, currentLine) => {
    const decoder = new Decoder(currentLine[0])
    return sumOfAll + currentLine[1].reduce((digitsToDec, segments) => digitsToDec * 10 + decoder.decode(segments), 0)
  }, 0)
}`)

