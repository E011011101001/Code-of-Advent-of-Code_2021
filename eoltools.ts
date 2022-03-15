export const deduplicate = <T>(arr: Array<T>) => arr.filter((item, index) => arr.indexOf(item) === index)

export const times = (repeatTime: number) => ({
  do: (callback: (index: number) => void) => {
    Array(repeatTime).fill(undefined).forEach((_, i) => callback(i))
  }
})

export class StringStream {
  private _raw!: string
  private _read!: string

  constructor (str: string) {
    this._raw = str
    this._read = ''
  }

  public get_by_length (length: number): string {
    const res = this._raw.slice(0, length)
    this._raw = this._raw.slice(length)
    this._read += res
    return res
  }

  public peak (): string {
    if (this._raw.length) {
      return this._raw[0]
    } else {
      return ''
    }
  }
}
