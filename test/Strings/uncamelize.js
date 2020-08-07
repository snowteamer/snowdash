/* eslint-env node */
const {uncamelize} = require("../../cjs/Strings");

const testCases = {
	"99Bottles": "99 bottles",
	"AString": "A string",
	"BFG9000": "BFG 9000",
	"Class": "Class",
	"GL11Version": "GL 11 version",
	"HTML": "HTML",
	"May5": "May 5",
	"MyClass": "My class",
	"PDFLoader": "PDF loader",
	"SimpleXMLParser": "Simple XML parser",
	"complémentCirconstanciel": "complément circonstanciel",
	"français": "français",
	"lowercase": "lowercase",
};

for(const key in testCases) {
	const camelCasedString = key;
	const expected = testCases[key];
	const actual = uncamelize(camelCasedString);

	if(actual !== expected) {
		console.warn(
			"Test failed in 'Strings.uncamelize()': for argument '%s', expected '%s', but got '%s'.",
			camelCasedString,
			expected,
			actual
		);
	}
}
