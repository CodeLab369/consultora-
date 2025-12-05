// Formulario para agregar/editar clientes

import { useState, useEffect } from 'react';
import type { Cliente, OpcionesListas } from '../../types';
import { guardarCliente } from '../../services/database';
import { Modal } from '../common/Modal.tsx';
import { Notification } from '../common/Notification.tsx';
import type { NotificationType } from '../common/Notification';
import './ClienteForm.css';

interface ClienteFormProps {
  cliente?: Cliente;
  opciones: OpcionesListas;
  onGuardar: () => void;
  onCancelar: () => void;
}

export const ClienteForm = ({ cliente, opciones, onGuardar, onCancelar }: ClienteFormProps) => {
  const [formData, setFormData] = useState<Omit<Cliente, 'id' | 'fechaCreacion'>>({
    nitCurCi: '',
    correo: '',
    contrasena: '',
    razonSocial: '',
    tipoContribuyente: opciones.tipoContribuyente[0] || '',
    tipoEntidad: opciones.tipoEntidad[0] || '',
    contacto: '',
    administracion: opciones.administracion[0] || '',
    facturacion: opciones.facturacion[0] || '',
    regimen: opciones.regimen[0] || '',
    actividad: '',
    consolidacion: opciones.consolidacion[0] || '',
    encargado: opciones.encargado[0] || '',
    direccion: ''
  });
  const [notificacion, setNotificacion] = useState<{ tipo: NotificationType; mensaje: string } | null>(null);

  useEffect(() => {
    if (cliente) {
      setFormData({
        nitCurCi: cliente.nitCurCi,
        correo: cliente.correo,
        contrasena: cliente.contrasena,
        razonSocial: cliente.razonSocial,
        tipoContribuyente: cliente.tipoContribuyente,
        tipoEntidad: cliente.tipoEntidad,
        contacto: cliente.contacto,
        administracion: cliente.administracion,
        facturacion: cliente.facturacion,
        regimen: cliente.regimen,
        actividad: cliente.actividad,
        consolidacion: cliente.consolidacion,
        encargado: cliente.encargado,
        direccion: cliente.direccion
      });
    }
  }, [cliente]);

  const handleChange = (campo: keyof typeof formData, valor: string) => {
    setFormData(prev => ({ ...prev, [campo]: valor }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nitCurCi || !formData.razonSocial || !formData.correo) {
      setNotificacion({ tipo: 'error', mensaje: 'Complete los campos obligatorios' });
      return;
    }

    const clienteData: Cliente = {
      id: cliente?.id || crypto.randomUUID(),
      ...formData,
      fechaCreacion: cliente?.fechaCreacion || new Date().toISOString()
    };

    await guardarCliente(clienteData);
    setNotificacion({ 
      tipo: 'success', 
      mensaje: cliente ? 'Cliente actualizado correctamente' : 'Cliente creado correctamente'
    });
    setTimeout(() => {
      onGuardar();
    }, 1000);
  };

  return (
    <>
      <Modal
        isOpen={true}
        onClose={onCancelar}
        title={cliente ? 'Editar Cliente' : 'Nuevo Cliente'}
        size="large"
      >
        <form onSubmit={handleSubmit} className="cliente-form">
          <div className="form-grid">
            <div className="form-field">
              <label>NIT/CUR/CI *</label>
              <input
                type="text"
                value={formData.nitCurCi}
                onChange={(e) => handleChange('nitCurCi', e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label>Razón Social *</label>
              <input
                type="text"
                value={formData.razonSocial}
                onChange={(e) => handleChange('razonSocial', e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label>Correo Electrónico *</label>
              <input
                type="email"
                value={formData.correo}
                onChange={(e) => handleChange('correo', e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label>Contraseña</label>
              <input
                type="text"
                value={formData.contrasena}
                onChange={(e) => handleChange('contrasena', e.target.value)}
              />
            </div>

            <div className="form-field">
              <label>Tipo de Contribuyente</label>
              <select
                value={formData.tipoContribuyente}
                onChange={(e) => handleChange('tipoContribuyente', e.target.value)}
              >
                {opciones.tipoContribuyente.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Tipo de Entidad</label>
              <select
                value={formData.tipoEntidad}
                onChange={(e) => handleChange('tipoEntidad', e.target.value)}
              >
                {opciones.tipoEntidad.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Contacto</label>
              <input
                type="text"
                value={formData.contacto}
                onChange={(e) => handleChange('contacto', e.target.value)}
              />
            </div>

            <div className="form-field">
              <label>Administración</label>
              <select
                value={formData.administracion}
                onChange={(e) => handleChange('administracion', e.target.value)}
              >
                {opciones.administracion.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Facturación</label>
              <select
                value={formData.facturacion}
                onChange={(e) => handleChange('facturacion', e.target.value)}
              >
                {opciones.facturacion.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Régimen</label>
              <select
                value={formData.regimen}
                onChange={(e) => handleChange('regimen', e.target.value)}
              >
                {opciones.regimen.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Consolidación</label>
              <select
                value={formData.consolidacion}
                onChange={(e) => handleChange('consolidacion', e.target.value)}
              >
                {opciones.consolidacion.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Encargado</label>
              <select
                value={formData.encargado}
                onChange={(e) => handleChange('encargado', e.target.value)}
              >
                {opciones.encargado.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="form-field form-field-full">
              <label>Actividad</label>
              <input
                type="text"
                value={formData.actividad}
                onChange={(e) => handleChange('actividad', e.target.value)}
              />
            </div>

            <div className="form-field form-field-full">
              <label>Dirección</label>
              <textarea
                value={formData.direccion}
                onChange={(e) => handleChange('direccion', e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancelar" onClick={onCancelar}>
              Cancelar
            </button>
            <button type="submit" className="btn-guardar">
              {cliente ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </Modal>

      {notificacion && (
        <Notification
          type={notificacion.tipo}
          message={notificacion.mensaje}
          onClose={() => setNotificacion(null)}
        />
      )}
    </>
  );
};
