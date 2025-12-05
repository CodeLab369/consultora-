// Tipos principales de la aplicación

export interface Cliente {
  id: string;
  nitCurCi: string;
  correo: string;
  contrasena: string;
  razonSocial: string;
  tipoContribuyente: string;
  tipoEntidad: string;
  contacto: string;
  etiquetas: string[];
  administracion: string;
  facturacion: string;
  regimen: string;
  actividad: string;
  consolidacion: string;
  encargado: string;
  direccion: string;
  fechaCreacion: string;
}

export interface Nota {
  id: string;
  clienteId: string;
  contenido: string;
  fecha: string;
}

export interface ArchivoPDF {
  id: string;
  clienteId: string;
  nombre: string;
  año: number;
  mes: number;
  data: string; // Base64
  fechaSubida: string;
}

export interface PDFUnido {
  id: string;
  nombre: string;
  data: string; // Base64
  fechaCreacion: string;
  clientesIds: string[];
}

export interface Credenciales {
  usuario: string;
  contrasena: string;
}

export interface Etiqueta {
  id: string;
  nombre: string;
  color: string;
  fechaCreacion: string;
}

export interface OpcionesListas {
  tipoContribuyente: string[];
  tipoEntidad: string[];
  administracion: string[];
  facturacion: string[];
  regimen: string[];
  consolidacion: string[];
  encargado: string[];
}

export type Seccion = 'clientes' | 'unir' | 'comprimir' | 'ajustes';

export const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const OPCIONES_INICIALES: OpcionesListas = {
  tipoContribuyente: ['Natural', 'Jurídica', 'Extranjera'],
  tipoEntidad: ['Privada', 'Pública', 'Mixta', 'ONG'],
  administracion: ['Centralizada', 'Descentralizada', 'Autónoma'],
  facturacion: ['Electrónica', 'Manual', 'Computarizada'],
  regimen: ['General', 'Simplificado', 'Especial'],
  consolidacion: ['Mensual', 'Trimestral', 'Anual'],
  encargado: ['Contador Principal', 'Contador Auxiliar', 'Administrador']
};
