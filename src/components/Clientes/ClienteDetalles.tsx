// Componente para ver los detalles completos de un cliente

import type { Cliente } from '../../types';
import { Modal } from '../common/Modal.tsx';
import './ClienteDetalles.css';

interface ClienteDetallesProps {
  cliente: Cliente;
  onCerrar: () => void;
}

export const ClienteDetalles = ({ cliente, onCerrar }: ClienteDetallesProps) => {
  const campos = [
    { label: 'NIT/CUR/CI', valor: cliente.nitCurCi },
    { label: 'Razón Social', valor: cliente.razonSocial },
    { label: 'Correo Electrónico', valor: cliente.correo },
    { label: 'Contraseña', valor: cliente.contrasena },
    { label: 'Tipo de Contribuyente', valor: cliente.tipoContribuyente },
    { label: 'Tipo de Entidad', valor: cliente.tipoEntidad },
    { label: 'Contacto', valor: cliente.contacto },
    { label: 'Administración', valor: cliente.administracion },
    { label: 'Facturación', valor: cliente.facturacion },
    { label: 'Régimen', valor: cliente.regimen },
    { label: 'Actividad', valor: cliente.actividad },
    { label: 'Consolidación', valor: cliente.consolidacion },
    { label: 'Encargado', valor: cliente.encargado },
    { label: 'Dirección', valor: cliente.direccion }
  ];

  return (
    <Modal
      isOpen={true}
      onClose={onCerrar}
      title="Detalles del Cliente"
      size="large"
    >
      <div className="cliente-detalles">
        {campos.map((campo, index) => (
          <div key={index} className="detalle-item">
            <strong>{campo.label}:</strong>
            <span>{campo.valor || '-'}</span>
          </div>
        ))}
        <div className="detalle-item">
          <strong>Fecha de Creación:</strong>
          <span>{new Date(cliente.fechaCreacion).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</span>
        </div>
      </div>
    </Modal>
  );
};
