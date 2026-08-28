import { PDFDocument } from 'npm:pdf-lib@1.17.1';
import {
  CERTIFICATE_LEGAL_NOTICE,
  createCertificatePdf,
  preparationCourseName
} from '../supabase/functions/_shared/certificate-pdf.ts';

const OUTPUT_PATH = new URL('../output/pdf/Constancia-QAvance-Muestra.pdf', import.meta.url);
const LOGO_PATH = new URL('../assets/img/qavance-logo.png', import.meta.url);
const CODE = 'ACQA-123456789ABC';
const VALIDATION_URL = `https://academiaqaoficial.com/validar-certificado/?codigo=${CODE}`;

function pngDataUrl(bytes: Uint8Array): string {
  let binary = '';
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  }
  return `data:image/png;base64,${btoa(binary)}`;
}

await Deno.mkdir(new URL('../output/pdf/', import.meta.url), { recursive: true });
const pdfBytes = await createCertificatePdf({
  code: CODE,
  fullName: 'Javier Chilatra',
  documentType: 'CC',
  documentNumber: '1234567890',
  courseName: 'ISTQB® Certified Tester Foundation Level 4.0 (CTFL)',
  estimatedHours: 40,
  startedAt: '2026-08-01T15:00:00.000Z',
  completedAt: '2026-08-25T15:00:00.000Z',
  issuedAt: '2026-08-25T15:00:00.000Z',
  validationUrl: VALIDATION_URL,
  logoUrl: pngDataUrl(await Deno.readFile(LOGO_PATH)),
  modules: [
    { order: 1, title: 'Fundamentos de la Prueba' },
    { order: 2, title: 'Pruebas a lo largo del Ciclo de Vida' },
    { order: 3, title: 'Pruebas Estáticas' },
    { order: 4, title: 'Análisis y Diseño de Pruebas' },
    { order: 5, title: 'Gestión de las Actividades de Prueba' },
    { order: 6, title: 'Herramientas de Prueba' }
  ]
});

await Deno.writeFile(OUTPUT_PATH, pdfBytes);
const document = await PDFDocument.load(pdfBytes);
if (document.getPageCount() !== 2) throw new Error('La constancia debe tener exactamente dos páginas.');
if (preparationCourseName('Curso de Preparación para Scrum Master') !== 'Curso de Preparación para Scrum Master') {
  throw new Error('El prefijo del curso no debe duplicarse.');
}
if (!CERTIFICATE_LEGAL_NOTICE.includes('Decreto 1075 de 2015')) {
  throw new Error('El deslinde legal obligatorio no está configurado.');
}

console.log(`Constancia PDF verificada: 2 páginas, ${pdfBytes.length} bytes.`);
