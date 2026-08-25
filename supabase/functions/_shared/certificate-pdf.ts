import { PDFDocument, StandardFonts, rgb } from 'npm:pdf-lib@1.17.1';
import QRCode from 'npm:qrcode@1.5.4';

const PAGE_WIDTH = 842;
const PAGE_HEIGHT = 595;
const NAVY = rgb(0.035, 0.145, 0.32);
const BLUE = rgb(0.02, 0.55, 0.92);
const TEXT = rgb(0.12, 0.16, 0.22);
const MUTED = rgb(0.36, 0.40, 0.47);

export type CertificatePdfInput = {
  code: string;
  fullName: string;
  documentType: string;
  documentNumber: string;
  courseName: string;
  estimatedHours: number;
  startedAt: string;
  completedAt: string;
  issuedAt: string;
  validationUrl: string;
  logoUrl: string;
};

function dateLabel(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Fecha no disponible';
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Bogota'
  }).format(date);
}

function bytesFromDataUrl(value: string): Uint8Array {
  const encoded = value.split(',')[1] || '';
  const binary = atob(encoded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function pdfSafe(value: unknown): string {
  return String(value || '')
    .normalize('NFC')
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .trim();
}

export async function createCertificatePdf(input: CertificatePdfInput): Promise<Uint8Array> {
  const document = await PDFDocument.create();
  document.setTitle(`Certificado ${input.code}`);
  document.setAuthor('AcademiaQA');
  document.setSubject(`Certificado de finalización de ${input.courseName}`);
  document.setKeywords(['AcademiaQA', 'certificado de finalización', input.courseName]);
  document.setCreationDate(new Date(input.issuedAt));

  const page = document.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const regular = await document.embedFont(StandardFonts.Helvetica);
  const bold = await document.embedFont(StandardFonts.HelveticaBold);

  const centered = (textValue: unknown, y: number, size: number, font = regular, color = TEXT, maxWidth = 750) => {
    const text = pdfSafe(textValue);
    let fittedSize = size;
    while (fittedSize > 10 && font.widthOfTextAtSize(text, fittedSize) > maxWidth) fittedSize -= 1;
    const width = font.widthOfTextAtSize(text, fittedSize);
    page.drawText(text, { x: (PAGE_WIDTH - width) / 2, y, size: fittedSize, font, color });
  };

  page.drawRectangle({ x: 18, y: 18, width: PAGE_WIDTH - 36, height: PAGE_HEIGHT - 36, borderColor: NAVY, borderWidth: 6 });
  page.drawRectangle({ x: 27, y: 27, width: PAGE_WIDTH - 54, height: PAGE_HEIGHT - 54, borderColor: BLUE, borderWidth: 1.2 });

  try {
    const logoResponse = await fetch(input.logoUrl, { signal: AbortSignal.timeout(8_000) });
    if (logoResponse.ok) {
      const logo = await document.embedPng(await logoResponse.arrayBuffer());
      const size = logo.scaleToFit(210, 92);
      page.drawImage(logo, { x: (PAGE_WIDTH - size.width) / 2, y: 486, width: size.width, height: size.height });
    }
  } catch {
    centered('AcademiaQA', 520, 28, bold, NAVY);
  }

  centered('CERTIFICADO DE FINALIZACIÓN', 438, 29, bold, NAVY);
  centered('AcademiaQA certifica que', 403, 14, regular, TEXT);
  centered(input.fullName.toUpperCase(), 358, 25, bold, NAVY, 700);
  centered(`Identificación ${input.documentType}: ${input.documentNumber}`, 329, 13, regular, MUTED);
  centered('completó satisfactoriamente el curso', 286, 14, regular, TEXT);
  centered(input.courseName, 244, 22, bold, NAVY, 690);
  centered(
    `Intensidad estimada: ${Number(input.estimatedHours).toLocaleString('es-CO')} horas · ${dateLabel(input.startedAt)} a ${dateLabel(input.completedAt)}`,
    210,
    12,
    regular,
    MUTED,
    680
  );
  centered(`Emitido el ${dateLabel(input.issuedAt)}`, 184, 12, regular, MUTED);

  const qrDataUrl = await QRCode.toDataURL(input.validationUrl, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 360,
    color: { dark: '#092552', light: '#FFFFFF' }
  });
  const qr = await document.embedPng(bytesFromDataUrl(qrDataUrl));
  page.drawImage(qr, { x: 665, y: 52, width: 98, height: 98 });
  page.drawText('ESCANEA PARA VERIFICAR', { x: 648, y: 40, size: 8, font: bold, color: NAVY });

  page.drawText(`CÓDIGO: ${input.code}`, { x: 58, y: 120, size: 13, font: bold, color: NAVY });
  page.drawText('Verificación pública:', { x: 58, y: 96, size: 9, font: regular, color: MUTED });
  page.drawText(input.validationUrl, { x: 58, y: 82, size: 8, font: regular, color: BLUE });
  page.drawText('Certificado de finalización emitido por AcademiaQA.', { x: 58, y: 57, size: 8.5, font: bold, color: TEXT });
  page.drawText('No equivale a una certificación oficial de ISTQB, CertiProf ni de otra entidad certificadora.', {
    x: 58,
    y: 43,
    size: 8,
    font: regular,
    color: MUTED
  });

  return document.save();
}
