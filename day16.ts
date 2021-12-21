import * as fs from 'fs'
import tools from './eoltools'

interface LiteralPacket {
  version: number,
  typeID: string,
  isLiteral: true
  bitGroups: string[],
}

interface OperatorPacket {
  version: number,
  typeID: string,
  isLiteral: false,
  lengthTypeID: '0' | '1'
  subPackets: Packet[]
}

type Packet = LiteralPacket | OperatorPacket

class BitStream {
  private _bits!: string
  private _bitsRead!: number
  constructor (hexStr: string) {
    this._bits = hexStr.split('').map(str => parseInt(str, 16).toString(2).padStart(4, '0')).join('')
    this._bitsRead = 0
  }

  get_bits (length: number): string {
    const res = this._bits.slice(0, length)
    this._bits = this._bits.slice(length)
    this._bitsRead += length
    return res
  }

  get bitsRead () {
    return this._bitsRead
  }
}

const messageHex = fs.readFileSync(
  './in.txt', {
    encoding: 'utf-8'
  }
)

const message = new BitStream(messageHex)

// parse one sub-packet each time
function parse_one_packet (): Packet {
  const versionBits = message.get_bits(3)
  const version = parseInt(versionBits, 2)
  const typeID = message.get_bits(3)
  const isLiteral = parseInt(typeID, 2) === 4
  if (isLiteral === true) {
    const bitGroups: string[] = []
    while (true) {
      const nextGroup = message.get_bits(5)
      bitGroups.push(nextGroup.slice(1)) // discarding the prefix bit
      if (nextGroup[0] === '0') {
        break
      }
    }
    return {
      version,
      typeID,
      isLiteral,
      bitGroups
    }
  } else {
    const lengthTypeID = message.get_bits(1) as '0' | '1'
    const subPackets: Packet[] = []
    if (lengthTypeID === '0') {
      const subPacketLength = parseInt(message.get_bits(15), 2)
      const bitsReadWhenStart = message.bitsRead
      while (message.bitsRead - bitsReadWhenStart < subPacketLength) {
        subPackets.push(parse_one_packet())
      }
    } else {
      const subPacketCount = parseInt(message.get_bits(11), 2)
      tools.times(subPacketCount).do(_ => {
        subPackets.push(parse_one_packet())
      })
    }
    return {
      version,
      typeID,
      isLiteral,
      lengthTypeID,
      subPackets
    }
  }
}

const messagePacket = parse_one_packet()

function packet_version_sum (sum: number, currentPacket: Packet): number {
  if (currentPacket.isLiteral === true) {
    return sum + currentPacket.version
  } else {
    return sum + currentPacket.subPackets.reduce(packet_version_sum, currentPacket.version)
  }
}

console.log(`Part 1: ${
  packet_version_sum(0, messagePacket)
}`)

function calculate_packet_value (packet: Packet): number {
  if (packet.isLiteral === true) {
    return parseInt(packet.bitGroups.join(''), 2)
  }
  const packetValues = packet.subPackets.map(subpacket => calculate_packet_value(subpacket))
  switch (parseInt(packet.typeID, 2)) {
    case 0:
      return packetValues.reduce((sum, value) => sum + value)
    case 1:
      return packetValues.reduce((mul, value) => mul * value)
    case 2:
      return packetValues.reduce((min, value) => Math.min(min, value))
    case 3:
      return packetValues.reduce((max, value) => Math.max(max, value))
    case 5:
      return (packetValues[0] > packetValues[1]) ? 1 : 0
    case 6:
      return (packetValues[0] < packetValues[1]) ? 1 : 0
    case 7:
      return (packetValues[0] === packetValues[1]) ? 1 : 0
  }
}

console.log(`Part 2: ${
  calculate_packet_value(messagePacket)
}`)
