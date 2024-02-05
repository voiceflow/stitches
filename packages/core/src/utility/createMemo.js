const stringifyReplacer = (name, data) => (typeof data === 'function' ? { '()': Function.prototype.toString.call(data) } : data)

const stringify = (value) => JSON.stringify(stringifyWithoutCycles(value), stringifyReplacer)
function stringifyWithoutCycles(obj) {
	var seenObjects = new Set()

	function detect(obj) {
		if (obj && typeof obj === 'object') {
			if (seenObjects.has(obj)) {
				return '[Cyclic Reference]'
			}

			seenObjects.add(obj)

			var result = Array.isArray(obj) ? [] : {}

			for (var key in obj) {
				if (obj.hasOwnProperty(key)) {
					var value = obj[key]
					if (typeof value === 'object') {
						result[key] = detect(value)
						if (result[key] === '[Cyclic Reference]') {
							return result
						}
					} else {
						result[key] = value
					}
				}
			}

			return result
		}

		return obj
	}

	var result = detect(obj)
	return JSON.stringify(result, null, 2)
}
export const createMemo = () => {
	const cache = Object.create(null)

	return (value, apply, ...args) => {
		console.log('value', value)

		const vjson = stringify(value)

		return vjson in cache ? cache[vjson] : (cache[vjson] = apply(value, ...args))
	}
}
