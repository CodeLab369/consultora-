// Servicio para compresión de archivos en formato ZIP

import JSZip from 'jszip';
import type { Cliente, ArchivoPDF } from '../types';
import { MESES } from '../types';

export const crearZIP = async (
  clientes: Cliente[],
  archivos: ArchivoPDF[],
  año: number,
  mes: number,
  modoPeriodo: 'mes' | 'gestion' = 'mes'
): Promise<Blob> => {
  const zip = new JSZip();

  for (const cliente of clientes) {
    let archivosCliente: ArchivoPDF[];
    
    if (modoPeriodo === 'gestion') {
      // Comprimir todos los archivos del año
      archivosCliente = archivos.filter(
        a => a.clienteId === cliente.id && a.año === año
      );
    } else {
      // Comprimir solo el mes específico
      archivosCliente = archivos.filter(
        a => a.clienteId === cliente.id && a.año === año && a.mes === mes
      );
    }

    if (archivosCliente.length > 0) {
      const carpetaCliente = zip.folder(cliente.razonSocial);
      
      if (modoPeriodo === 'gestion') {
        // Organizar por meses dentro de cada cliente
        const archivosPorMes = archivosCliente.reduce((acc, archivo) => {
          if (!acc[archivo.mes]) {
            acc[archivo.mes] = [];
          }
          acc[archivo.mes].push(archivo);
          return acc;
        }, {} as Record<number, ArchivoPDF[]>);

        // Crear carpetas por mes
        for (const [mesNum, archivosDelMes] of Object.entries(archivosPorMes)) {
          const nombreMes = MESES[Number(mesNum)];
          const carpetaMes = carpetaCliente?.folder(nombreMes);
          
          for (const archivo of archivosDelMes) {
            const byteCharacters = atob(archivo.data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            carpetaMes?.file(archivo.nombre, byteArray);
          }
        }
      } else {
        // Modo mes: archivos directamente en carpeta del cliente
        for (const archivo of archivosCliente) {
          const byteCharacters = atob(archivo.data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          carpetaCliente?.file(archivo.nombre, byteArray);
        }
      }
    }
  }

  return await zip.generateAsync({ type: 'blob' });
};

export const descargarZIP = (blob: Blob, nombreUsuario: string, mes: number | null, año: number): void => {
  let nombreArchivo: string;
  
  if (mes === null) {
    nombreArchivo = `Clientes_${nombreUsuario}_Gestion_${año}.zip`;
  } else {
    const nombreMes = MESES[mes];
    nombreArchivo = `Clientes_${nombreUsuario}_${nombreMes}_${año}.zip`;
  }
  
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nombreArchivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
