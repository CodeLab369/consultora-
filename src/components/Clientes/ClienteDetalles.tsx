// Componente para ver los detalles completos de un cliente

import { useState } from 'react';
import { Edit, Copy, Check } from 'lucide-react';
import type { Cliente } from '../../types';
import { Modal } from '../common/Modal.tsx';
import './ClienteDetalles.css';

interface ClienteDetallesProps {
  cliente: Cliente;
  onCerrar: () => void;
  onEditar?: () => void;
}

export const ClienteDetalles = ({ cliente, onCerrar, onEditar }: ClienteDetallesProps) => {
  const [copiado, setCopiado] = useState<string | null>(null);

  const copiarAlPortapapeles = async (texto: string, campo: string) => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(campo);
      setTimeout(() => setCopiado(null), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onCerrar}
      title="Detalles del Cliente"
      size="large"
    >
      <div className="cliente-form">
        <div className="form-grid">
          <div className="form-field form-field-with-copy">
            <label>NIT/CUR/CI</label>
            <div className="input-with-copy">
              <input
                type="text"
                value={cliente.nitCurCi || ''}
                readOnly
                className="input-readonly"
              />
              <button
                className="btn-copy"
                onClick={() => copiarAlPortapapeles(cliente.nitCurCi, 'nit')}
                title="Copiar NIT/CUR/CI"
              >
                {copiado === 'nit' ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>

          <div className="form-field">
            <label>Razón Social</label>
            <input
              type="text"
              value={cliente.razonSocial || ''}
              readOnly
              className="input-readonly"
            />
          </div>

          <div className="form-field form-field-with-copy">
            <label>Correo Electrónico</label>
            <div className="input-with-copy">
              <input
                type="text"
                value={cliente.correo || ''}
                readOnly
                className="input-readonly"
              />
              <button
                className="btn-copy"
                onClick={() => copiarAlPortapapeles(cliente.correo, 'correo')}
                title="Copiar Correo"
              >
                {copiado === 'correo' ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>

          <div className="form-field form-field-with-copy">
            <label>Contraseña</label>
            <div className="input-with-copy">
              <input
                type="text"
                value={cliente.contrasena || ''}
                readOnly
                className="input-readonly"
              />
              <button
                className="btn-copy"
                onClick={() => copiarAlPortapapeles(cliente.contrasena, 'contrasena')}
                title="Copiar Contraseña"
              >
                {copiado === 'contrasena' ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>

          <div className="form-field">
            <label>Tipo de Contribuyente</label>
            <input
              type="text"
              value={cliente.tipoContribuyente || ''}
              readOnly
              className="input-readonly"
            />
          </div>

          <div className="form-field">
            <label>Tipo de Entidad</label>
            <input
              type="text"
              value={cliente.tipoEntidad || ''}
              readOnly
              className="input-readonly"
            />
          </div>

          <div className="form-field">
            <label>Contacto</label>
            <input
              type="text"
              value={cliente.contacto || ''}
              readOnly
              className="input-readonly"
            />
          </div>

          <div className="form-field">
            <label>Administración</label>
            <input
              type="text"
              value={cliente.administracion || ''}
              readOnly
              className="input-readonly"
            />
          </div>

          <div className="form-field">
            <label>Facturación</label>
            <input
              type="text"
              value={cliente.facturacion || ''}
              readOnly
              className="input-readonly"
            />
          </div>

          <div className="form-field">
            <label>Régimen</label>
            <input
              type="text"
              value={cliente.regimen || ''}
              readOnly
              className="input-readonly"
            />
          </div>

          <div className="form-field">
            <label>Consolidación</label>
            <input
              type="text"
              value={cliente.consolidacion || ''}
              readOnly
              className="input-readonly"
            />
          </div>

          <div className="form-field">
            <label>Encargado</label>
            <input
              type="text"
              value={cliente.encargado || ''}
              readOnly
              className="input-readonly"
            />
          </div>

          <div className="form-field form-field-full">
            <label>Actividad</label>
            <input
              type="text"
              value={cliente.actividad || ''}
              readOnly
              className="input-readonly"
            />
          </div>

          <div className="form-field form-field-full">
            <label>Dirección</label>
            <textarea
              value={cliente.direccion || ''}
              readOnly
              className="input-readonly"
              rows={3}
            />
          </div>

          <div className="form-field form-field-full">
            <label>Fecha de Creación</label>
            <input
              type="text"
              value={new Date(cliente.fechaCreacion).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
              readOnly
              className="input-readonly"
            />
          </div>
        </div>

        {onEditar && (
          <div className="detalle-footer">
            <button className="btn-editar-detalle" onClick={() => {
              onCerrar();
              onEditar();
            }}>
              <Edit size={20} />
              <span>Editar Cliente</span>
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};
