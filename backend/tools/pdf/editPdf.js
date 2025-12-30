import PDFDocument from "pdfkit";

export async function editPDF(fileBuffer, newText) {
  const pdfDoc = await PDFDocument.load(fileBuffer);
  const font = await pdfDoc.embedFont(StandardFonts.CourierBold);

  const firstPage = pdfDoc.getPages()[0];
  firstPage.drawText(newText, {
    x: 50,
    y: 700,
    size: 18,
    font,
    color: rgb(0.2, 0.8, 0.2),
  });

  return await pdfDoc.save();
}