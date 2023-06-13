/* eslint-env node */
"use strict";

const {equals} = require("../../cjs/JsonObjects");

const testCases = [
	[],
	[0, 1, 2],
	[0, 1, []],
	[0, 1, [], {}],
	{},
	{"one": 1},
	{"one": 1, "two": 2},
	{"array": []},
	{"array": [0, 1, 2]},
	{"array": [0, 1, []]},
	{"arrays": [[0, 1, []], [0, 1, []]]},
	{"object": {}},
	{"objects": [{}, {}]},
];

for(const testCase of testCases) {
	const expected = true;
	const actual = equals(testCase, testCase);

	if(actual !== expected) {
		console.warn(
			"Test failed in 'JsonObjects.equals()': for argument '%s', expected '%s', but got '%s'.",
			JSON.stringify(testCase),
			expected,
			actual
		);
	}
}

for(const testCase of testCases) {
	const expected = true;
	const actual = equals(testCase, JSON.parse(JSON.stringify(testCase)));

	if(actual !== expected) {
		console.warn(
			"Test failed in 'JsonObjects.equals()': for argument '%s', expected '%s', but got '%s'.",
			JSON.stringify(testCase),
			expected,
			actual
		);
	}
}

for(const testCase of testCases) {
	const expected = false;
	const actual = equals(testCase, {...JSON.parse(JSON.stringify(testCase)), "extraprop": 0});

	if(actual !== expected) {
		console.warn(
			"Test failed in 'JsonObjects.equals()': for argument '%s', expected '%s', but got '%s'.",
			JSON.stringify(testCase),
			expected,
			actual
		);
	}
}

for(const testCase of testCases) {
	const expected = false;
	const actual = equals(testCase, {...JSON.parse(JSON.stringify(testCase)), "0": "extravalue"});

	if(actual !== expected) {
		console.warn(
			"Test failed in 'JsonObjects.equals()': for argument '%s', expected '%s', but got '%s'.",
			JSON.stringify(testCase),
			expected,
			actual
		);
	}
}
