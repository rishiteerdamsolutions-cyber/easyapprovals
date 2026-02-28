import { PDFDocument, StandardFonts } from 'pdf-lib';

interface InvoiceItem {
  categoryName: string;
  serviceName: string;
  qty: number;
  amount: number;
  total: number;
}

interface InvoiceData {
  orderId: string;
  date: string;
  items: InvoiceItem[];
  grandTotal: number;
  firmName?: string;
  gstin?: string;
  address?: string;
}

export async function generateInvoicePDF(data: InvoiceData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const page = pdfDoc.addPage([595, 842]);
  const { width, height } = page.getSize();
  let y = height - 50;

  const drawText = (text: string, x: number, yPos: number, size = 12, bold = false) => {
    const f = bold ? fontBold : font;
    page.drawText(text, { x, y: yPos, size, font: f });
  };

  drawText(data.firmName || 'Easy Approval', 50, y, 18, true);
  y -= 8;
  if (data.gstin) {
    drawText(`GSTIN: ${data.gstin}`, 50, y, 10);
    y -= 6;
  }
  if (data.address) {
    drawText(data.address, 50, y, 10);
    y -= 6;
  }
  y -= 16;

  drawText(`Invoice`, 50, y, 16, true);
  y -= 8;
  drawText(`Order ID: ${data.orderId}`, 50, y, 11);
  y -= 6;
  drawText(`Date: ${data.date}`, 50, y, 11);
  y -= 20;

  const colX = [50, 120, 220, 320, 400, 500];
  const headers = ['S.No', 'Category', 'Service', 'Qty', 'Amount', 'Total'];
  headers.forEach((h, i) => drawText(h, colX[i], y, 10, true));
  y -= 12;

  data.items.forEach((item, idx) => {
    drawText(String(idx + 1), colX[0], y, 9);
    drawText(item.categoryName.slice(0, 18), colX[1], y, 9);
    drawText(item.serviceName.slice(0, 25), colX[2], y, 9);
    drawText(String(item.qty), colX[3], y, 9);
    drawText(`₹${item.amount.toLocaleString()}`, colX[4], y, 9);
    drawText(`₹${item.total.toLocaleString()}`, colX[5], y, 9);
    y -= 10;
  });

  y -= 10;
  drawText(`Grand Total: ₹${data.grandTotal.toLocaleString()}`, 400, y, 12, true);

  return pdfDoc.save();
}
