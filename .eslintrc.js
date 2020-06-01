/* eslint-env node */
module.exports = {
	"extends": [
		"eslint:recommended",
		"plugin:jsdoc/recommended",
		"plugin:unicorn/recommended",
	],
	"env": {
		"es6": true,
	},
	"parserOptions": {
		"ecmaVersion": 2020,
		"sourceType": "module",
	},
	"plugins": ["jsdoc", "unicorn"],
	"root": true,
	"rules": {
		"jsdoc/check-alignment": 1, // rec
		"jsdoc/check-examples": 1,
		"jsdoc/check-param-names": 1, // rec
		"jsdoc/check-tag-names": [
			1, // rec
			{
				// "modifies" is recognized by GCC.
				// "template" is recognized by TS.
				"definedTags": ["modifies", "note", "template"],
			},
		],
		"jsdoc/check-types": 1, // rec
		"jsdoc/implements-on-classes": 1, // rec
		"jsdoc/newline-after-description": 1, // rec
		"jsdoc/no-undefined-types": [
			"warn", // rec
			{
				// Some TypeScript types.
				"definedTypes": [
					"never",
					"unknown",
					"ArrayLike",
					"Iterable",
					"Iterator",
					"PropertyDescriptor",
					"PropertyKey",
					"Record",
				],
			},
		],
		"jsdoc/require-description": 0,
		"jsdoc/require-description-complete-sentence": 1,
		"jsdoc/require-example": 0,
		"jsdoc/require-hyphen-before-param-description": 1,
		"jsdoc/require-param-description": 0, // rec
		"jsdoc/require-property-description": 0, // rec
		"jsdoc/require-returns-description": 0, // rec

		"unicorn/explicit-length-check": "off",
		"unicorn/filename-case": "off",
		"unicorn/no-reduce": "off",
		"unicorn/no-useless-undefined": "off",
		"unicorn/prevent-abbreviations": [
			"error",
			{
				"whitelist": {
					"acc": true,
					"arg": true,
					"args": true,
					"thisArg": true,
				},
			},
		],

		// Possible Errors
		// http://eslint.org/docs/rules/#possible-errors
		// ---------------------------------------------
		"no-constant-condition": [
			"error", // rec
			{
				"checkLoops": false,
			},
		],
		"no-loss-of-precision": "error",
		"no-return-assign": [
			"error",
			"except-parens",
		],

		// Best Practices
		// http://eslint.org/docs/rules/#best-practices
		// --------------------------------------------
		"consistent-return": "error",
		"default-case": "error",
		"default-case-last": "error",
		"default-param-last": "error",
		"no-eval": "error",
		"no-eq-null": "error",
		"no-implicit-coercion": [
			"error",
			{"allow": ["!!", "~"]},
		],
		"no-implied-eval": "error",
		"no-invalid-this": "error",
		"radix": "error",
		"wrap-iife": [
			"error",
			"outside",
			{"functionPrototypeMethods": true}, // changed
		],

		// Stylistic Issues
		// http://eslint.org/docs/rules/#stylistic-issues
		// ----------------------------------------------
		"array-bracket-newline": [
			"error",
			{"multiline": true}, // "always": true
		],
		"array-bracket-spacing": ["error", "never"],
		"brace-style": [
			"warn",
			// "1tbs",
			// {"allowSingleLine": false}
		],
		"camelcase": "error",
		"comma-dangle": [
			"error",
			{
				"arrays": "always-multiline",
				"objects": "always-multiline",
				"imports": "always-multiline",
				"exports": "always-multiline",
				// Not leaving "functions" as "never" is for ES2017 or higher.
				"functions": "always-multiline",
			}, // "never"
		],
		"comma-spacing": "error",
		"comma-style": [
			"error",
			// "last",
			// "exceptions": {},
		],
		"computed-property-spacing": "error",
		"eol-last": "error",
		"indent": [
			"error",
			"tab", // 4
			{
				"MemberExpression": 0, // 1
				"SwitchCase": 1, // 0
				"flatTernaryExpressions": true, // false
				"ignoredNodes": ["ConditionalExpression"], // undefined
			},
		],
		"keyword-spacing": [
			"error",
			{
				"after": true,
				"overrides": {
					"catch": { after: false },
					"for": {after: false },
					"if": { after: false },
					"switch": { after: false },
					"while": { after: false },
				},
			},
		],
		"linebreak-style": [
			"error",
			"unix",
		],
		"max-len": "error",
		"new-cap": "error",
		"no-continue": "off",
		"no-lonely-if": "error",
		"no-multiple-empty-lines": "off",
		"no-nested-ternary": "warn",
		"no-plusplus": "off",
		"no-tabs": [
			"error",
			{"allowIndentationTabs": true}, // {"allowIndentationTabs": false}
		],
		"no-trailing-spaces": [
			"error",
			// {"skipBlankLines": false, "ignoreComments": false}
		],
		"object-curly-spacing": [
			"off", // "off"
			// "never",
			// {}
		],
		"operator-linebreak": [
			"error",
			"before", // "after"
			{
				"overrides": {
					"=": "after",
				}, // { "overrides": { "?": "before", ":": "before" }
			},
		],
		"padded-blocks": [
			"off", // "off",
			// "always",
			// {}
		],
		"quotes": [
			"error",
			// "double"
			// {avoidEscape: undefined, allowTemplateLiterals: undefined}
		],
		"quote-props": [
			"off",
			// "always"
		],
		"semi": [
			"error",
			"always",
		],
		"semi-style": [
			"error",
			// "last",
		],
		"sort-vars": [
			"error",
			// { "ignoreCase": false }
		],
		// EcmaScript 6
		// https://eslint.org/docs/rules/#ecmascript-6
		// --------------------------------------------
		"arrow-body-style": "error",
		"arrow-parens": "error",
		"arrow-spacing": "error",
		"generator-star-spacing": ["error", "after"],
		"no-confusing-arrow": [
			"warn",
			{
				"allowParens": true,
			},
		],
		"no-var": "error",
		"object-shorthand": "error",
		"prefer-const": "error",
		"prefer-template": "error",
	},
	"settings": {
		"jsdoc": {
			"mode": "typescript",
		},
	},
};
