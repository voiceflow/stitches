import { stringify as stringifyWithoutCircularStructs } from 'flatted'

const stringify = (value) => stringifyWithoutCircularStructs(value)

export const createMemo = () => {
	const cache = Object.create(null)

	return (value, apply, ...args) => {
		const vjson = stringify(value)

		return vjson in cache ? cache[vjson] : (cache[vjson] = apply(value, ...args))
	}
}
