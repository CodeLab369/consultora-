// Componente para ver los detalles completos de un cliente

import type { Cliente } from '../../types';
import { Modal } from '../common/Modal.tsx';
import './ClienteDetalles.css';

interface ClienteDetallesProps {
  cliente: Cliente;
  onCerrar: () => void;
}

export const ClienteDetalles = ({ cliente, onCerrar }: ClienteDetallesProps) => {
  const formatearValor = (valor: string | undefined) => {
    if (!valor || valor.trim() === '') {
      return 'No especificado';
    }
    return valor;
  };

  const seccionIdentificacion = [
    { label: 'NIT/CUR/CI', valor: formatearValor(cliente.nitCurCi) },
    { label: 'Razón Social', valor: formatearValor(cliente.razonSocial) },
    { label: 'Tipo de Contribuyente', valor: formatearValor(cliente.tipoContribuyente) },
    { label: 'Tipo de Entidad', valor: formatearValor(cliente.tipoEntidad) }
  ];

  const seccionContacto = [
    { label: 'Correo Electrónico', valor: formatearValor(cliente.correo) },
    { label: 'Contacto', valor: formatearValor(cliente.contacto) },
    { label: 'Dirección', valor: formatearValor(cliente.direccion) }
  ];

  const seccionAcceso = [
    { label: 'Contraseña', valor: formatearValor(cliente.contrasena) }
  ];

  const seccionTributaria = [
    { label: 'Administración', valor: formatearValor(cliente.administracion) },
    { label: 'Facturación', valor: formatearValor(cliente.facturacion) },
    { label: 'Régimen', valor: formatearValor(cliente.regimen) },
    { label: 'Actividad', valor: formatearValor(cliente.actividad) },
    { label: 'Consolidación', valor: formatearValor(cliente.consolidacion) }
  ];

  const seccionGestion = [
    { label: 'Encargado', valor: formatearValor(cliente.encargado) },
    { label: 'Fecha de Creación', valor: new Date(cliente.fechaCreacion).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}
  ];

  return (
    <Modal
      isOpen={true}
      onClose={onCerrar}
      title="Detalles del Cliente"
      size="large"
    >
      <div className="cliente-detalles">
        <div className="detalle-seccion">
          <h3 className="seccion-titulo">Identificación</h3>
          <div className="seccion-contenido">
            {seccionIdentificacion.map((campo, index) => (
              <div key={index} className="detalle-item">
                <strong>{campo.label}</strong>
                <span className={!campo.valor || campo.valor === 'No especificado' ? 'valor-vacio' : ''}>
                  {campo.valor}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="detalle-seccion">
          <h3 className="seccion-titulo">Información de Contacto</h3>
          <div className="seccion-contenido">
            {seccionContacto.map((campo, index) => (
              <div key={index} className="detalle-item">
                <strong>{campo.label}</strong>
                <span className={!campo.valor || campo.valor === 'No especificado' ? 'valor-vacio' : ''}>
                  {campo.valor}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="detalle-seccion">
          <h3 className="seccion-titulo">Acceso</h3>
          <div className="seccion-contenido">
            {seccionAcceso.map((campo, index) => (
              <div key={index} className="detalle-item">
                <strong>{campo.label}</strong>
                <span className={!campo.valor || campo.valor === 'No especificado' ? 'valor-vacio' : ''}>
                  {campo.valor}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="detalle-seccion">
          <h3 className="seccion-titulo">Información Tributaria</h3>
          <div className="seccion-contenido">
            {seccionTributaria.map((campo, index) => (
              <div key={index} className="detalle-item">
                <strong>{campo.label}</strong>
                <span className={!campo.valor || campo.valor === 'No especificado' ? 'valor-vacio' : ''}>
                  {campo.valor}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="detalle-seccion">
          <h3 className="seccion-titulo">Gestión</h3>
          <div className="seccion-contenido">
            {seccionGestion.map((campo, index) => (
              <div key={index} className="detalle-item">
                <strong>{campo.label}</strong>
                <span>{campo.valor}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};
