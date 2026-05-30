const pdfParse = require('pdf-parse');
console.log('require("pdf-parse") is type:', typeof pdfParse);
if (typeof pdfParse === 'object') {
  console.log('pdfParse keys:', Object.keys(pdfParse));
  console.log('pdfParse.default type:', typeof pdfParse.default);
}
