export default {
  deduplicate: <T>(arr: Array<T>) => arr.filter((item, index) => arr.indexOf(item) === index),
  times: (repeatTime: number) => ({
    do: (callback: (index: number) => void) => {
      Array(repeatTime).fill(undefined).forEach((_, i) => callback(i))
    }
  })
}