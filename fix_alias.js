const fs = require('fs');
let code = fs.readFileSync('src/lib/questions-data.ts', 'utf8');

// remove lines with ALL_TEST_QUESTIONS['ENG_TEST_
code = code.replace(/ALL_TEST_QUESTIONS\['ENG_TEST_\d'\] = .*;\n/g, '');

code += `
ALL_TEST_QUESTIONS['ENG_TEST_1'] = ENG_TEST_1_DATA;
ALL_TEST_QUESTIONS['ENG_TEST_2'] = ALL_TEST_QUESTIONS['TEST_2'];
ALL_TEST_QUESTIONS['ENG_TEST_3'] = ALL_TEST_QUESTIONS['TEST_1'];
ALL_TEST_QUESTIONS['ENG_TEST_4'] = ALL_TEST_QUESTIONS['TEST_2'];
`;

fs.writeFileSync('src/lib/questions-data.ts', code);
console.log('Fixed aliases');
