// Servicio para compresión de archivos en formato ZIP

import JSZip from 'jszip';
import type { Cliente, ArchivoPDF } from '../types';
import { MESES } from '../types';

export const crearZIP = async (
  clientes: Cliente[],
  archivos: ArchivoPDF[],
  año: number,
  mes: number
): Promise<Blob> => {
  const zip = new JSZip();

  for (const cliente of clientes) {
    const archivosCliente = archivos.filter(
      a => a.clienteId === cliente.id && a.año === año && a.mes === mes
    );

    if (archivosCliente.length > 0) {
      const carpetaCliente = zip.folder(cliente.razonSocial);
      
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

  return await zip.generateAsync({ type: 'blob' });
};

export const descargarZIP = (blob: Blob, nombreUsuario: string, mes: number, año: number): void => {
  const nombreMes = MESES[mes];
  const nombreArchivo = `Clientes_${nombreUsuario}_${nombreMes}_${año}.zip`;
  
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nombreArchivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
