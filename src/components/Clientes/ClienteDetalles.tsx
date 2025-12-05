// Componente para ver los detalles completos de un cliente

import type { Cliente } from '../../types';
import { Modal } from '../common/Modal.tsx';
import './ClienteDetalles.css';

interface ClienteDetallesProps {
  cliente: Cliente;
  onCerrar: () => void;
}

export const ClienteDetalles = ({ cliente, onCerrar }: ClienteDetallesProps) => {
  const seccionIdentificacion = [
    { label: 'NIT/CUR/CI', valor: cliente.nitCurCi },
    { label: 'Razón Social', valor: cliente.razonSocial },
    { label: 'Tipo de Contribuyente', valor: cliente.tipoContribuyente },
    { label: 'Tipo de Entidad', valor: cliente.tipoEntidad }
  ];

  const seccionContacto = [
    { label: 'Correo Electrónico', valor: cliente.correo },
    { label: 'Contacto', valor: cliente.contacto },
    { label: 'Dirección', valor: cliente.direccion }
  ];

  const seccionAcceso = [
    { label: 'Contraseña', valor: cliente.contrasena }
  ];

  const seccionTributaria = [
    { label: 'Administración', valor: cliente.administracion },
    { label: 'Facturación', valor: cliente.facturacion },
    { label: 'Régimen', valor: cliente.regimen },
    { label: 'Actividad', valor: cliente.actividad },
    { label: 'Consolidación', valor: cliente.consolidacion }
  ];

  const seccionGestion = [
    { label: 'Encargado', valor: cliente.encargado },
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
                <span>{campo.valor || '-'}</span>
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
                <span>{campo.valor || '-'}</span>
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
                <span>{campo.valor || '-'}</span>
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
                <span>{campo.valor || '-'}</span>
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
                <span>{campo.valor || '-'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};
