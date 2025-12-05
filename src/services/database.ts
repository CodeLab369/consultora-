// Servicio de base de datos usando IndexedDB para almacenamiento offline

import localforage from 'localforage';
import type { Cliente, Nota, ArchivoPDF, PDFUnido, Credenciales, OpcionesListas, Etiqueta } from '../types';
import { OPCIONES_INICIALES } from '../types';

// Configurar localforage
localforage.config({
  name: 'ConsultoraDB',
  version: 1.0,
  storeName: 'consultora_store'
});

// Stores separados
const clientesStore = localforage.createInstance({ name: 'clientes' });
const notasStore = localforage.createInstance({ name: 'notas' });
const archivosStore = localforage.createInstance({ name: 'archivos' });
const pdfUnidosStore = localforage.createInstance({ name: 'pdfUnidos' });
const configStore = localforage.createInstance({ name: 'config' });
const etiquetasStore = localforage.createInstance({ name: 'etiquetas' });

// Inicializar credenciales por defecto
export const inicializarCredenciales = async (): Promise<void> => {
  const credenciales = await configStore.getItem<Credenciales>('credenciales');
  if (!credenciales) {
    await configStore.setItem('credenciales', {
      usuario: 'Nestor',
      contrasena: '1005'
    });
  }
};

// Inicializar opciones de listas
export const inicializarOpciones = async (): Promise<void> => {
  const opciones = await configStore.getItem<OpcionesListas>('opciones');
  if (!opciones) {
    await configStore.setItem('opciones', OPCIONES_INICIALES);
  }
};

// CLIENTES
export const obtenerClientes = async (): Promise<Cliente[]> => {
  const clientes: Cliente[] = [];
  await clientesStore.iterate<Cliente, void>((value) => {
    clientes.push(value);
  });
  return clientes.sort((a, b) => a.razonSocial.localeCompare(b.razonSocial));
};

export const obtenerCliente = async (id: string): Promise<Cliente | null> => {
  return await clientesStore.getItem<Cliente>(id);
};

export const guardarCliente = async (cliente: Cliente): Promise<void> => {
  await clientesStore.setItem(cliente.id, cliente);
};

export const eliminarCliente = async (id: string): Promise<void> => {
  await clientesStore.removeItem(id);
  // Eliminar notas y archivos asociados
  const notas = await obtenerNotasCliente(id);
  for (const nota of notas) {
    await eliminarNota(nota.id);
  }
  const archivos = await obtenerArchivosCliente(id);
  for (const archivo of archivos) {
    await eliminarArchivo(archivo.id);
  }
};

// NOTAS
export const obtenerNotasCliente = async (clienteId: string): Promise<Nota[]> => {
  const notas: Nota[] = [];
  await notasStore.iterate<Nota, void>((value) => {
    if (value.clienteId === clienteId) {
      notas.push(value);
    }
  });
  return notas.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
};

export const guardarNota = async (nota: Nota): Promise<void> => {
  await notasStore.setItem(nota.id, nota);
};

export const eliminarNota = async (id: string): Promise<void> => {
  await notasStore.removeItem(id);
};

// ARCHIVOS PDF
export const obtenerArchivosCliente = async (clienteId: string): Promise<ArchivoPDF[]> => {
  const archivos: ArchivoPDF[] = [];
  await archivosStore.iterate<ArchivoPDF, void>((value) => {
    if (value.clienteId === clienteId) {
      archivos.push(value);
    }
  });
  return archivos.sort((a, b) => {
    if (a.año !== b.año) return b.año - a.año;
    return b.mes - a.mes;
  });
};

export const obtenerArchivo = async (id: string): Promise<ArchivoPDF | null> => {
  return await archivosStore.getItem<ArchivoPDF>(id);
};

export const guardarArchivo = async (archivo: ArchivoPDF): Promise<void> => {
  await archivosStore.setItem(archivo.id, archivo);
};

export const eliminarArchivo = async (id: string): Promise<void> => {
  await archivosStore.removeItem(id);
};

export const obtenerTodosArchivos = async (): Promise<ArchivoPDF[]> => {
  const archivos: ArchivoPDF[] = [];
  await archivosStore.iterate<ArchivoPDF, void>((value) => {
    archivos.push(value);
  });
  return archivos;
};

// PDFs UNIDOS
export const obtenerPDFsUnidos = async (): Promise<PDFUnido[]> => {
  const pdfs: PDFUnido[] = [];
  await pdfUnidosStore.iterate<PDFUnido, void>((value) => {
    pdfs.push(value);
  });
  return pdfs.sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime());
};

export const guardarPDFUnido = async (pdf: PDFUnido): Promise<void> => {
  await pdfUnidosStore.setItem(pdf.id, pdf);
};

export const eliminarPDFUnido = async (id: string): Promise<void> => {
  await pdfUnidosStore.removeItem(id);
};

// CREDENCIALES
export const obtenerCredenciales = async (): Promise<Credenciales> => {
  const cred = await configStore.getItem<Credenciales>('credenciales');
  return cred || { usuario: 'Nestor', contrasena: '1005' };
};

export const actualizarCredenciales = async (credenciales: Credenciales): Promise<void> => {
  await configStore.setItem('credenciales', credenciales);
};

// OPCIONES DE LISTAS
export const obtenerOpciones = async (): Promise<OpcionesListas> => {
  const opciones = await configStore.getItem<OpcionesListas>('opciones');
  return opciones || OPCIONES_INICIALES;
};

export const actualizarOpciones = async (opciones: OpcionesListas): Promise<void> => {
  await configStore.setItem('opciones', opciones);
};

// BACKUP Y RESTAURACIÓN
export const crearBackup = async (): Promise<string> => {
  const clientes = await obtenerClientes();
  const archivos = await obtenerTodosArchivos();
  const pdfsUnidos = await obtenerPDFsUnidos();
  const credenciales = await obtenerCredenciales();
  const opciones = await obtenerOpciones();
  
  const notas: Nota[] = [];
  await notasStore.iterate<Nota, void>((value) => {
    notas.push(value);
  });

  const backup = {
    version: '1.0',
    fecha: new Date().toISOString(),
    clientes,
    notas,
    archivos,
    pdfsUnidos,
    credenciales,
    opciones
  };

  return JSON.stringify(backup);
};

export const restaurarBackup = async (backupJson: string): Promise<void> => {
  const backup = JSON.parse(backupJson);

  // Limpiar stores
  await clientesStore.clear();
  await notasStore.clear();
  await archivosStore.clear();
  await pdfUnidosStore.clear();

  // Restaurar datos
  for (const cliente of backup.clientes) {
    await guardarCliente(cliente);
  }
  for (const nota of backup.notas) {
    await guardarNota(nota);
  }
  for (const archivo of backup.archivos) {
    await guardarArchivo(archivo);
  }
  for (const pdf of backup.pdfsUnidos) {
    await guardarPDFUnido(pdf);
  }
  
  await actualizarCredenciales(backup.credenciales);
  await actualizarOpciones(backup.opciones);
};

// ETIQUETAS
export const obtenerEtiquetas = async (): Promise<Etiqueta[]> => {
  const etiquetas: Etiqueta[] = [];
  await etiquetasStore.iterate<Etiqueta, void>((value) => {
    etiquetas.push(value);
  });
  return etiquetas.sort((a, b) => a.nombre.localeCompare(b.nombre));
};

export const guardarEtiqueta = async (etiqueta: Etiqueta): Promise<void> => {
  await etiquetasStore.setItem(etiqueta.id, etiqueta);
};

export const eliminarEtiqueta = async (id: string): Promise<void> => {
  await etiquetasStore.removeItem(id);
  // Eliminar etiqueta de todos los clientes
  const clientes = await obtenerClientes();
  for (const cliente of clientes) {
    if (cliente.etiquetas?.includes(id)) {
      cliente.etiquetas = cliente.etiquetas.filter(e => e !== id);
      await guardarCliente(cliente);
    }
  }
};
