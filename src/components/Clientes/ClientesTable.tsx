// Componente de tabla de clientes con paginación

import { useState, useEffect } from 'react';
import { Eye, FileText, Upload, Edit, Trash2, Tag } from 'lucide-react';
import type { Cliente, Etiqueta } from '../../types';
import { ClienteDetalles } from './ClienteDetalles.tsx';
import { ClienteNotas } from './ClienteNotas.tsx';
import { ClienteArchivos } from './ClienteArchivos.tsx';
import { ClienteEtiquetas } from './ClienteEtiquetas.tsx';
import { ConfirmDialog } from '../common/ConfirmDialog.tsx';
import { Notification } from '../common/Notification.tsx';
import type { NotificationType } from '../common/Notification';
import { eliminarCliente, actualizarCliente, obtenerEtiquetas } from '../../services/database';
import './ClientesTable.css';

interface ClientesTableProps {
  clientes: Cliente[];
  onEditar: (cliente: Cliente) => void;
  onActualizar: () => void;
}

export const ClientesTable = ({ clientes, onEditar, onActualizar }: ClientesTableProps) => {
  const [paginaActual, setPaginaActual] = useState(1);
  const [filasPorPagina, setFilasPorPagina] = useState(5);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [mostrarDetalles, setMostrarDetalles] = useState(false);
  const [mostrarNotas, setMostrarNotas] = useState(false);
  const [mostrarArchivos, setMostrarArchivos] = useState(false);
  const [mostrarEtiquetas, setMostrarEtiquetas] = useState(false);
  const [mostrarConfirmEliminar, setMostrarConfirmEliminar] = useState(false);
  const [notificacion, setNotificacion] = useState<{ tipo: NotificationType; mensaje: string } | null>(null);
  const [etiquetasMap, setEtiquetasMap] = useState<Map<string, Etiqueta>>(new Map());

  useEffect(() => {
    cargarEtiquetas();
  }, []);

  const cargarEtiquetas = async () => {
    const etqs = await obtenerEtiquetas();
    const map = new Map(etqs.map(e => [e.id, e]));
    setEtiquetasMap(map);
  };

  const totalPaginas = Math.ceil(clientes.length / filasPorPagina);
  const indiceInicio = (paginaActual - 1) * filasPorPagina;
  const clientesPaginados = clientes.slice(indiceInicio, indiceInicio + filasPorPagina);

  const handleCambiarPagina = (nuevaPagina: number) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setPaginaActual(nuevaPagina);
    }
  };

  const handleCambiarFilasPorPagina = (filas: number) => {
    setFilasPorPagina(filas);
    setPaginaActual(1);
  };

  const handleVerDetalles = (cliente: Cliente) => {
    setClienteSeleccionado(cliente);
    setMostrarDetalles(true);
  };

  const handleVerNotas = (cliente: Cliente) => {
    setClienteSeleccionado(cliente);
    setMostrarNotas(true);
  };

  const handleVerArchivos = (cliente: Cliente) => {
    setClienteSeleccionado(cliente);
    setMostrarArchivos(true);
  };

  const handleEtiquetas = (cliente: Cliente) => {
    setClienteSeleccionado(cliente);
    setMostrarEtiquetas(true);
  };

  const handleGuardarEtiquetas = async (etiquetas: string[]) => {
    if (clienteSeleccionado) {
      const clienteActualizado = {
        ...clienteSeleccionado,
        etiquetas
      };
      await actualizarCliente(clienteActualizado);
      setMostrarEtiquetas(false);
      setClienteSeleccionado(null);
      setNotificacion({ tipo: 'success', mensaje: 'Etiquetas actualizadas' });
      onActualizar();
    }
  };

  const handleEliminar = (cliente: Cliente) => {
    setClienteSeleccionado(cliente);
    setMostrarConfirmEliminar(true);
  };

  const confirmarEliminar = async () => {
    if (clienteSeleccionado) {
      await eliminarCliente(clienteSeleccionado.id);
      setMostrarConfirmEliminar(false);
      setClienteSeleccionado(null);
      setNotificacion({ tipo: 'success', mensaje: 'Cliente eliminado correctamente' });
      onActualizar();
    }
  };

  if (clientes.length === 0) {
    return (
      <div className="empty-state">
        <p>No se encontraron clientes</p>
      </div>
    );
  }

  return (
    <>
      <div className="table-container">
        <table className="clientes-table">
          <thead>
            <tr>
              <th>NIT/CUR/CI</th>
              <th>Razón Social</th>
              <th>Etiquetas</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientesPaginados.map((cliente) => (
              <tr key={cliente.id}>
                <td>{cliente.nitCurCi}</td>
                <td>{cliente.razonSocial}</td>
                <td>
                  <div className="etiquetas-cell">
                    {cliente.etiquetas && cliente.etiquetas.length > 0 ? (
                      <div className="etiquetas-badges">
                        {cliente.etiquetas.slice(0, 3).map(etiqId => {
                          const etiqueta = etiquetasMap.get(etiqId);
                          return etiqueta ? (
                            <span 
                              key={etiqId}
                              className="etiqueta-badge"
                              style={{ backgroundColor: etiqueta.color }}
                            >
                              {etiqueta.nombre}
                            </span>
                          ) : null;
                        })}
                        {cliente.etiquetas.length > 3 && (
                          <span className="etiquetas-mas">+{cliente.etiquetas.length - 3}</span>
                        )}
                      </div>
                    ) : (
                      <span className="sin-etiquetas">Sin etiquetas</span>
                    )}
                  </div>
                </td>
                <td>
                  <div className="acciones">
                    <button
                      className="btn-accion btn-ver"
                      onClick={() => handleVerDetalles(cliente)}
                      title="Ver detalles"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      className="btn-accion btn-notas"
                      onClick={() => handleVerNotas(cliente)}
                      title="Notas"
                    >
                      <FileText size={18} />
                    </button>
                    <button
                      className="btn-accion btn-archivos"
                      onClick={() => handleVerArchivos(cliente)}
                      title="Archivos"
                    >
                      <Upload size={18} />
                    </button>
                    <button
                      className="btn-accion btn-etiquetas"
                      onClick={() => handleEtiquetas(cliente)}
                      title="Gestionar etiquetas"
                    >
                      <Tag size={18} />
                    </button>
                    <button
                      className="btn-accion btn-editar"
                      onClick={() => onEditar(cliente)}
                      title="Editar"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      className="btn-accion btn-eliminar"
                      onClick={() => handleEliminar(cliente)}
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="table-footer">
          <div className="filas-selector">
            <span>Mostrar:</span>
            <select
              value={filasPorPagina}
              onChange={(e) => handleCambiarFilasPorPagina(Number(e.target.value))}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={50}>50</option>
            </select>
            <span>por página</span>
          </div>

          <div className="pagination">
            <button
              onClick={() => handleCambiarPagina(paginaActual - 1)}
              disabled={paginaActual === 1}
            >
              Anterior
            </button>
            <span>
              Página {paginaActual} de {totalPaginas}
            </span>
            <button
              onClick={() => handleCambiarPagina(paginaActual + 1)}
              disabled={paginaActual === totalPaginas}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {clienteSeleccionado && (
        <>
          {mostrarDetalles && (
            <ClienteDetalles
              cliente={clienteSeleccionado}
              onCerrar={() => setMostrarDetalles(false)}
              onEditar={() => {
                setMostrarDetalles(false);
                onEditar(clienteSeleccionado);
              }}
            />
          )}
          {mostrarNotas && (
            <ClienteNotas
              cliente={clienteSeleccionado}
              onCerrar={() => setMostrarNotas(false)}
            />
          )}
          {mostrarArchivos && (
            <ClienteArchivos
              cliente={clienteSeleccionado}
              onCerrar={() => setMostrarArchivos(false)}
            />
          )}
          {mostrarEtiquetas && (
            <ClienteEtiquetas
              cliente={clienteSeleccionado}
              onClose={() => setMostrarEtiquetas(false)}
              onSave={handleGuardarEtiquetas}
            />
          )}
        </>
      )}

      <ConfirmDialog
        isOpen={mostrarConfirmEliminar}
        title="Eliminar Cliente"
        message={`¿Está seguro que desea eliminar al cliente "${clienteSeleccionado?.razonSocial}"? Esta acción eliminará también todas sus notas y archivos.`}
        onConfirm={confirmarEliminar}
        onCancel={() => setMostrarConfirmEliminar(false)}
        confirmText="Eliminar"
        cancelText="Cancelar"
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
