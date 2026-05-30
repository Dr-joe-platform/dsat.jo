import pdfParse from 'pdf-parse';
console.log('pdfParse type:', typeof pdfParse);
if (typeof pdfParse === 'object') {
  console.log('pdfParse keys:', Object.keys(pdfParse));
  console.log('pdfParse.default type:', typeof pdfParse.default);
  console.log('pdfParse.PDFParse type:', typeof pdfParse.PDFParse);
}
