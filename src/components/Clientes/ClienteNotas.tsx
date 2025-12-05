// Componente para gestionar notas de clientes

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import type { Cliente, Nota } from '../../types';
import { obtenerNotasCliente, guardarNota, eliminarNota } from '../../services/database';
import { Modal } from '../common/Modal.tsx';
import { ConfirmDialog } from '../common/ConfirmDialog.tsx';
import { Notification } from '../common/Notification.tsx';
import type { NotificationType } from '../common/Notification';
import './ClienteNotas.css';

interface ClienteNotasProps {
  cliente: Cliente;
  onCerrar: () => void;
}

export const ClienteNotas = ({ cliente, onCerrar }: ClienteNotasProps) => {
  const [notas, setNotas] = useState<Nota[]>([]);
  const [notaEditar, setNotaEditar] = useState<Nota | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [contenido, setContenido] = useState('');
  const [notaEliminar, setNotaEliminar] = useState<Nota | null>(null);
  const [notificacion, setNotificacion] = useState<{ tipo: NotificationType; mensaje: string } | null>(null);

  useEffect(() => {
    cargarNotas();
  }, [cliente.id]);

  const cargarNotas = async () => {
    const notasData = await obtenerNotasCliente(cliente.id);
    setNotas(notasData);
  };

  const handleNuevaNota = () => {
    setNotaEditar(null);
    setContenido('');
    setMostrarFormulario(true);
  };

  const handleEditarNota = (nota: Nota) => {
    setNotaEditar(nota);
    setContenido(nota.contenido);
    setMostrarFormulario(true);
  };

  const handleGuardarNota = async () => {
    if (!contenido.trim()) {
      setNotificacion({ tipo: 'error', mensaje: 'El contenido de la nota no puede estar vacío' });
      return;
    }

    const nota: Nota = {
      id: notaEditar?.id || crypto.randomUUID(),
      clienteId: cliente.id,
      contenido: contenido.trim(),
      fecha: notaEditar?.fecha || new Date().toISOString()
    };

    await guardarNota(nota);
    setNotificacion({ 
      tipo: 'success', 
      mensaje: notaEditar ? 'Nota actualizada' : 'Nota creada'
    });
    setMostrarFormulario(false);
    setContenido('');
    setNotaEditar(null);
    cargarNotas();
  };

  const handleEliminarNota = async () => {
    if (notaEliminar) {
      await eliminarNota(notaEliminar.id);
      setNotificacion({ tipo: 'success', mensaje: 'Nota eliminada' });
      setNotaEliminar(null);
      cargarNotas();
    }
  };

  return (
    <>
      <Modal
        isOpen={true}
        onClose={onCerrar}
        title={`Notas - ${cliente.razonSocial}`}
        size="large"
      >
        <div className="cliente-notas">
          <div className="notas-header">
            <button className="btn-nueva-nota" onClick={handleNuevaNota}>
              <Plus size={18} />
              Nueva Nota
            </button>
          </div>

          {mostrarFormulario && (
            <div className="nota-form">
              <textarea
                value={contenido}
                onChange={(e) => setContenido(e.target.value)}
                placeholder="Escribe tu nota aquí..."
                rows={4}
                autoFocus
              />
              <div className="nota-form-actions">
                <button className="btn-cancelar" onClick={() => setMostrarFormulario(false)}>
                  Cancelar
                </button>
                <button className="btn-guardar" onClick={handleGuardarNota}>
                  Guardar
                </button>
              </div>
            </div>
          )}

          <div className="notas-lista">
            {notas.length === 0 ? (
              <div className="notas-vacio">
                <p>No hay notas para este cliente</p>
              </div>
            ) : (
              notas.map(nota => (
                <div key={nota.id} className="nota-item">
                  <div className="nota-contenido">{nota.contenido}</div>
                  <div className="nota-footer">
                    <span className="nota-fecha">
                      {new Date(nota.fecha).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    <div className="nota-acciones">
                      <button onClick={() => handleEditarNota(nota)}>
                        <Edit size={16} />
                      </button>
                      <button onClick={() => setNotaEliminar(nota)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!notaEliminar}
        title="Eliminar Nota"
        message="¿Está seguro que desea eliminar esta nota?"
        onConfirm={handleEliminarNota}
        onCancel={() => setNotaEliminar(null)}
        confirmText="Eliminar"
        type="danger"
      />

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
