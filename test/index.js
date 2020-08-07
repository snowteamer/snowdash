/* eslint-env node */

const core = require("../dist/core");
const fs = require("fs");


fs.readdir(__dirname, (err, files) => {
    
    if(err) {
        console.log(err.message);
        return;
    }
    
    for(const file of files) {

        const subjectFunction = core.Arrays[file];

        const {
            matcher,
            testCases,
            invariants,
            setUp,
            tearDown,
        } = require(file);

        for(const testCase of testCases) {
            const {args, expected} = testCase;
            const actual = subjectFunction(...args);
        
            if(actual !== expected) {
                console.warn(
                    "Test failed in 'Strings.uncamelize()': for argument '%s', expected '%s', but got '%s'.",
                    args,
                    expected,
                    actual
                );
            }
        }
    }
    
});