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
  try {
    const pdfDoc = await PDFDocument.create();

    for (const archivo of archivos) {
      try {
        // Convertir base64 a bytes de manera más eficiente
        const binaryString = atob(archivo.data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        // Cargar el PDF con opciones para mayor compatibilidad
        const pdf = await PDFDocument.load(bytes, { 
          ignoreEncryption: true,
          updateMetadata: false 
        });
        
        // Copiar todas las páginas del PDF
        const pageCount = pdf.getPageCount();
        const pageIndices = Array.from({ length: pageCount }, (_, i) => i);
        const copiedPages = await pdfDoc.copyPages(pdf, pageIndices);
        
        // Agregar cada página al documento final
        copiedPages.forEach((page) => {
          pdfDoc.addPage(page);
        });
        
        console.log(`✓ Procesado: ${archivo.nombre} (${pageCount} página${pageCount !== 1 ? 's' : ''})`);
      } catch (error) {
        console.error(`✗ Error al procesar ${archivo.nombre}:`, error);
        throw new Error(`No se pudo procesar el archivo "${archivo.nombre}". Verifica que sea un PDF válido.`);
      }
    }

    // Guardar el PDF final con optimización
    const pdfBytes = await pdfDoc.save({ 
      useObjectStreams: false 
    });
    
    // Convertir a base64 de manera eficiente usando chunks
    const chunkSize = 0x8000; // 32KB chunks
    let base64 = '';
    for (let i = 0; i < pdfBytes.length; i += chunkSize) {
      const chunk = pdfBytes.slice(i, i + chunkSize);
      base64 += String.fromCharCode.apply(null, Array.from(chunk));
    }
    
    return btoa(base64);
  } catch (error) {
    console.error('Error general al unir PDFs:', error);
    throw error;
  }
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
