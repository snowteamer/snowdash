/* eslint-env node */
const path = require("path");

module.exports = {

	entry: "./esm/snowdash.js",
	output: {
		filename: "snowdash.js",
		globalObject: "this",
		path: path.join(__dirname, "dist"),

		library: "snowdash",
		libraryTarget: "umd",
	},
	mode: "development",
};
