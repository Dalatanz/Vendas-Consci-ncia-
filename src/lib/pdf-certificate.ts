import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function buildCertificatePdf(input: {
  studentName: string;
  title: string;
  issuedAt: Date;
}) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]);
  const titleFont = await pdf.embedFont(StandardFonts.HelveticaBold);
  const bodyFont = await pdf.embedFont(StandardFonts.Helvetica);

  page.drawText("Universidade Vendas Consciência", {
    x: 50,
    y: 780,
    size: 20,
    font: titleFont,
    color: rgb(0.1, 0.1, 0.1),
  });
  page.drawText("Certificado de conclusão", {
    x: 50,
    y: 740,
    size: 14,
    font: bodyFont,
    color: rgb(0.3, 0.3, 0.3),
  });
  page.drawText(input.title, {
    x: 50,
    y: 680,
    size: 16,
    font: titleFont,
    color: rgb(0, 0, 0),
  });
  page.drawText(`Aluno(a): ${input.studentName}`, {
    x: 50,
    y: 620,
    size: 12,
    font: bodyFont,
  });
  page.drawText(`Emitido em: ${input.issuedAt.toLocaleDateString("pt-BR")}`, {
    x: 50,
    y: 590,
    size: 11,
    font: bodyFont,
    color: rgb(0.35, 0.35, 0.35),
  });
  page.drawText("Documento eletrônico UVC — válido conforme registro interno.", {
    x: 50,
    y: 120,
    size: 9,
    font: bodyFont,
    color: rgb(0.45, 0.45, 0.45),
  });

  const bytes = await pdf.save();
  return Buffer.from(bytes);
}
