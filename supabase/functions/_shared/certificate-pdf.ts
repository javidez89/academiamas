import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'npm:pdf-lib@1.17.1';
import QRCode from 'npm:qrcode@1.5.4';

const PAGE_WIDTH = 842;
const PAGE_HEIGHT = 595;
const NAVY = rgb(0.035, 0.145, 0.32);
const BLUE = rgb(0.02, 0.55, 0.92);
const TEXT = rgb(0.12, 0.16, 0.22);
const MUTED = rgb(0.36, 0.40, 0.47);
const PALE_BLUE = rgb(0.93, 0.97, 1);
const INSTRUCTOR_NAME = 'Javier Chilatra';
const INSTRUCTOR_ROLE = 'Instructor';
const MODALITY = 'Modalidad: Virtual (E-Learning) / Autoestudio';

export const CERTIFICATE_LEGAL_NOTICE = 'Constancia emitida por QAvance con el objetivo de actualizar y profundizar conocimientos. No equivale a una credencial oficial de ISTQB, ni de otra entidad certificadora. Formación impartida en la modalidad de Educación Informal con base en el Decreto 1075 de 2015 de la República de Colombia.';

export type CertificateModule = {
  order: number;
  title: string;
};

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
  signatureUrl?: string;
  modules: CertificateModule[];
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

export function preparationCourseName(value: unknown): string {
  const name = pdfSafe(value).replace(/^Curso de Preparación para\s+/i, '');
  return `Curso de Preparación para ${name}`;
}

function fittedSize(text: string, font: PDFFont, preferredSize: number, maxWidth: number, minimumSize = 8): number {
  let size = preferredSize;
  while (size > minimumSize && font.widthOfTextAtSize(text, size) > maxWidth) size -= 0.5;
  return size;
}

function centered(
  page: PDFPage,
  textValue: unknown,
  y: number,
  size: number,
  font: PDFFont,
  color = TEXT,
  maxWidth = 750,
  minimumSize = 8
) {
  const text = pdfSafe(textValue);
  const actualSize = fittedSize(text, font, size, maxWidth, minimumSize);
  const width = font.widthOfTextAtSize(text, actualSize);
  page.drawText(text, { x: (PAGE_WIDTH - width) / 2, y, size: actualSize, font, color });
}

function splitLongToken(token: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const pieces: string[] = [];
  let current = '';
  for (const character of token) {
    const candidate = `${current}${character}`;
    if (current && font.widthOfTextAtSize(candidate, size) > maxWidth) {
      pieces.push(current);
      current = character;
    } else {
      current = candidate;
    }
  }
  if (current) pieces.push(current);
  return pieces;
}

function wrapText(textValue: unknown, font: PDFFont, size: number, maxWidth: number): string[] {
  const text = pdfSafe(textValue);
  if (!text) return [];
  const tokens = text.split(/\s+/).flatMap((token) => (
    font.widthOfTextAtSize(token, size) > maxWidth ? splitLongToken(token, font, size, maxWidth) : [token]
  ));
  const lines: string[] = [];
  let current = '';
  for (const token of tokens) {
    const candidate = current ? `${current} ${token}` : token;
    if (current && font.widthOfTextAtSize(candidate, size) > maxWidth) {
      lines.push(current);
      current = token;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function centeredParagraph(
  page: PDFPage,
  textValue: unknown,
  firstLineY: number,
  size: number,
  lineHeight: number,
  font: PDFFont,
  color: ReturnType<typeof rgb>,
  maxWidth: number,
  maxLines = 3
) {
  const lines = wrapText(textValue, font, size, maxWidth).slice(0, maxLines);
  lines.forEach((line, index) => centered(page, line, firstLineY - index * lineHeight, size, font, color, maxWidth));
}

function drawFrame(page: PDFPage) {
  page.drawRectangle({ x: 18, y: 18, width: PAGE_WIDTH - 36, height: PAGE_HEIGHT - 36, borderColor: NAVY, borderWidth: 6 });
  page.drawRectangle({ x: 27, y: 27, width: PAGE_WIDTH - 54, height: PAGE_HEIGHT - 54, borderColor: BLUE, borderWidth: 1.2 });
}

async function remoteImage(document: PDFDocument, value?: string) {
  if (!value) return null;
  const response = await fetch(value, { signal: AbortSignal.timeout(8_000) });
  if (!response.ok) return null;
  const bytes = await response.arrayBuffer();
  const contentType = String(response.headers.get('content-type') || '').toLowerCase();
  if (contentType.includes('jpeg') || /\.jpe?g(?:\?|$)/i.test(value)) return document.embedJpg(bytes);
  return document.embedPng(bytes);
}

function drawLegalNotice(page: PDFPage, font: PDFFont) {
  const lines = wrapText(CERTIFICATE_LEGAL_NOTICE, font, 6.7, 746);
  lines.forEach((line, index) => {
    const width = font.widthOfTextAtSize(line, 6.7);
    page.drawText(line, { x: (PAGE_WIDTH - width) / 2, y: 52 - index * 8.2, size: 6.7, font, color: MUTED });
  });
}

async function drawBrand(document: PDFDocument, page: PDFPage, logoUrl: string, bold: PDFFont) {
  try {
    const logo = await remoteImage(document, logoUrl);
    if (logo) {
      const size = logo.scaleToFit(190, 68);
      page.drawImage(logo, { x: (PAGE_WIDTH - size.width) / 2, y: 505, width: size.width, height: size.height });
      return;
    }
  } catch {
    // The text fallback keeps the document usable if the remote asset is unavailable.
  }
  centered(page, 'QAvance', 530, 27, bold, NAVY);
}

async function drawSignature(document: PDFDocument, page: PDFPage, signatureUrl: string | undefined, regular: PDFFont, bold: PDFFont) {
  try {
    const signature = await remoteImage(document, signatureUrl);
    if (signature) {
      const size = signature.scaleToFit(150, 42);
      page.drawImage(signature, { x: (PAGE_WIDTH - size.width) / 2, y: 113, width: size.width, height: size.height });
    }
  } catch {
    // An empty signing area is intentional until a digitized signature is configured.
  }
  page.drawLine({ start: { x: 326, y: 108 }, end: { x: 516, y: 108 }, thickness: 0.8, color: NAVY });
  centered(page, INSTRUCTOR_NAME, 92, 10.5, bold, NAVY, 190);
  centered(page, INSTRUCTOR_ROLE, 79, 8.5, regular, MUTED, 190);
}

function drawModules(page: PDFPage, modules: CertificateModule[], regular: PDFFont, bold: PDFFont) {
  const normalized = modules
    .map((module, index) => ({ order: Number(module.order) || index + 1, title: pdfSafe(module.title) }))
    .filter((module) => module.title)
    .sort((left, right) => left.order - right.order);
  const columns = normalized.length > 9 ? 2 : 1;
  const rowsPerColumn = Math.max(1, Math.ceil(normalized.length / columns));
  const columnWidth = columns === 1 ? 700 : 348;
  const left = columns === 1 ? 71 : 58;
  const availableHeight = 340;
  const rowHeight = Math.min(42, availableHeight / rowsPerColumn);
  const titleSize = rowsPerColumn > 10 ? 9 : rowsPerColumn > 8 ? 10.5 : 11.5;

  normalized.forEach((module, index) => {
    const column = Math.floor(index / rowsPerColumn);
    const row = index % rowsPerColumn;
    const x = left + column * (columnWidth + 24);
    const y = 406 - row * rowHeight;
    page.drawRectangle({ x, y: y - 5, width: 52, height: 23, color: PALE_BLUE, borderColor: BLUE, borderWidth: 0.7 });
    page.drawText(`Módulo ${module.order}`, { x: x + 6, y: y + 3, size: 7.6, font: bold, color: NAVY });
    const titleX = x + 66;
    const titleWidth = columnWidth - 66;
    const lines = wrapText(module.title, regular, titleSize, titleWidth).slice(0, 2);
    lines.forEach((line, lineIndex) => {
      page.drawText(line, { x: titleX, y: y + 7 - lineIndex * (titleSize + 2), size: titleSize, font: regular, color: TEXT });
    });
    page.drawLine({ start: { x, y: y - 10 }, end: { x: x + columnWidth, y: y - 10 }, thickness: 0.35, color: rgb(0.78, 0.84, 0.91) });
  });
}

export async function createCertificatePdf(input: CertificatePdfInput): Promise<Uint8Array> {
  const document = await PDFDocument.create();
  const courseName = preparationCourseName(input.courseName);
  document.setTitle(`Constancia ${input.code}`);
  document.setAuthor('QAvance');
  document.setSubject(`Constancia de participación y aprobación de ${courseName}`);
  document.setKeywords(['QAvance', 'constancia de participación y aprobación', courseName]);
  document.setCreationDate(new Date(input.issuedAt));

  const regular = await document.embedFont(StandardFonts.Helvetica);
  const bold = await document.embedFont(StandardFonts.HelveticaBold);
  const page = document.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  drawFrame(page);
  await drawBrand(document, page, input.logoUrl, bold);

  centered(page, 'CONSTANCIA DE PARTICIPACIÓN Y APROBACIÓN', 458, 25, bold, NAVY, 770, 18);
  centered(page, 'QAvance hace constar que', 421, 14, regular, TEXT);
  centered(page, input.fullName.toUpperCase(), 379, 24, bold, NAVY, 700, 16);
  centered(page, `Identificación ${input.documentType}: ${input.documentNumber}`, 350, 12.5, regular, MUTED);
  centered(page, 'participó y aprobó satisfactoriamente el programa:', 317, 13.5, regular, TEXT);
  centeredParagraph(page, courseName, 285, 18, 21, bold, NAVY, 700, 2);
  centered(page, MODALITY, 235, 11.5, regular, TEXT);
  centered(
    page,
    `Intensidad estimada: ${Number(input.estimatedHours).toLocaleString('es-CO')} horas | ${dateLabel(input.startedAt)} a ${dateLabel(input.completedAt)}`,
    211,
    11,
    regular,
    MUTED,
    700
  );
  centered(page, `Emitida el ${dateLabel(input.issuedAt)}`, 190, 11, regular, MUTED);

  const qrDataUrl = await QRCode.toDataURL(input.validationUrl, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 360,
    color: { dark: '#092552', light: '#FFFFFF' }
  });
  const qr = await document.embedPng(bytesFromDataUrl(qrDataUrl));
  page.drawImage(qr, { x: 682, y: 86, width: 76, height: 76 });
  page.drawText('ESCANEA PARA VALIDAR', { x: 672, y: 73, size: 7.2, font: bold, color: NAVY });

  page.drawText(`CÓDIGO: ${pdfSafe(input.code)}`, { x: 58, y: 151, size: 11, font: bold, color: NAVY });
  page.drawText('Validación pública:', { x: 58, y: 133, size: 8, font: regular, color: MUTED });
  const validationLines = wrapText(input.validationUrl, regular, 6.6, 255).slice(0, 2);
  validationLines.forEach((line, index) => page.drawText(line, { x: 58, y: 120 - index * 8, size: 6.6, font: regular, color: BLUE }));

  await drawSignature(document, page, input.signatureUrl, regular, bold);
  drawLegalNotice(page, regular);

  const syllabusPage = document.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  drawFrame(syllabusPage);
  await drawBrand(document, syllabusPage, input.logoUrl, bold);
  centered(syllabusPage, 'Contenido Académico (Syllabus)', 468, 25, bold, NAVY, 760, 18);
  centeredParagraph(syllabusPage, courseName, 440, 13, 16, regular, MUTED, 720, 2);
  drawModules(syllabusPage, input.modules, regular, bold);
  syllabusPage.drawText(`CÓDIGO: ${pdfSafe(input.code)}`, { x: 58, y: 55, size: 8, font: bold, color: NAVY });
  syllabusPage.drawText(pdfSafe(input.validationUrl), { x: 58, y: 41, size: 6.8, font: regular, color: BLUE });
  syllabusPage.drawText('Página 2 de 2', { x: 726, y: 41, size: 7.5, font: regular, color: MUTED });

  return document.save();
}
