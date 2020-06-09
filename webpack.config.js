/* eslint-env node */
const path = require("path");

module.exports = {

	entry: "./esm/core.js",
	output: {
		filename: "core.js",
		globalObject: "this",
		path: path.join(__dirname, "dist"),

		library: "core",
		libraryTarget: "umd",
	},
	mode: "development",
};
