import { defaultThemeMap } from './default/defaultThemeMap.js'

import { createMemo } from './utility/createMemo.js'

import { createCssFunction } from './features/css.js'
import { createGlobalCssFunction } from './features/globalCss.js'
import { createKeyframesFunction } from './features/keyframes.js'
import { createCreateThemeFunction } from './features/createTheme.js'

import { createSheet, names as groupNames } from './sheet.js'

const createCssMap = createMemo()

export const createStitches = (config, isShadowDom = true) => {
	let didRun = false

	const instance = createCssMap(config, (initConfig) => {
		didRun = true

		initConfig = (typeof initConfig === 'object' && initConfig) || {}

		// internal configuration
		const prefix = 'prefix' in initConfig ? String(initConfig.prefix) : ''
		const media = (typeof initConfig.media === 'object' && initConfig.media) || {}
		const root = typeof initConfig.root === 'object' ? initConfig.root || null : globalThis.document || null
		const theme = (typeof initConfig.theme === 'object' && initConfig.theme) || {}
		const themeMap = (typeof initConfig.themeMap === 'object' && initConfig.themeMap) || { ...defaultThemeMap }
		const utils = (typeof initConfig.utils === 'object' && initConfig.utils) || {}

		/** External configuration. */
		const config = {
			prefix,
			media,
			theme,
			themeMap,
			utils,
		}

		/** Internal stylesheet. */
		const sheet = createSheet(root)

		const returnValue = {
			css: createCssFunction(config, sheet),
			globalCss: createGlobalCssFunction(config, sheet),
			keyframes: createKeyframesFunction(config, sheet),
			createTheme: createCreateThemeFunction(config, sheet, isShadowDom),
			reset() {
				sheet.reset()
				returnValue.theme.toString()
			},
			transplant(nextRoot) {
				const { cssRules, ownerNode } = sheet.sheet
				const style = nextRoot.appendChild(ownerNode)

				Array.from(cssRules).forEach((rule, index) => {
					style.sheet.insertRule(rule.cssText, index)
				})

				groupNames.forEach((name, index) => {
					sheet.rules[name].group = style.sheet.cssRules[index * 2 + 1]
				})
			},
			theme: {},
			sheet,
			config,
			prefix,
			getCssText: sheet.toString,
			toString: sheet.toString,
		}

		// initialize default theme
		String((returnValue.theme = returnValue.createTheme(theme)))

		return returnValue
	})

	if (!didRun) instance.reset()

	return instance
}
