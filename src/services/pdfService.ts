// Servicio para manipulación de archivos PDF

import { PDFDocument } from 'pdf-lib';
import type { ArchivoPDF } from '../types';

export const leerArchivoPDF = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const unirPDFs = async (archivos: ArchivoPDF[]): Promise<string> => {
  const pdfDoc = await PDFDocument.create();

  for (const archivo of archivos) {
    try {
      const pdfBytes = Uint8Array.from(atob(archivo.data), c => c.charCodeAt(0));
      const pdf = await PDFDocument.load(pdfBytes);
      const copiedPages = await pdfDoc.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => pdfDoc.addPage(page));
    } catch (error) {
      console.error(`Error al procesar archivo ${archivo.nombre}:`, error);
    }
  }

  const pdfBytes = await pdfDoc.save();
  return btoa(String.fromCharCode(...pdfBytes));
};

export const descargarPDF = (base64Data: string, nombreArchivo: string): void => {
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nombreArchivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const obtenerURLPDF = (base64Data: string): string => {
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: 'application/pdf' });
  return window.URL.createObjectURL(blob);
};
