// Componente de la sección Comprimir

import { useState, useEffect } from 'react';
import { Search, FolderArchive } from 'lucide-react';
import type { Cliente, ArchivoPDF } from '../../types';
import { MESES } from '../../types';
import { obtenerClientes, obtenerTodosArchivos } from '../../services/database';
import { crearZIP, descargarZIP } from '../../services/zipService';
import { Notification } from '../common/Notification.tsx';
import type { NotificationType } from '../common/Notification';
import './Comprimir.css';

export const Comprimir = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [archivos, setArchivos] = useState<ArchivoPDF[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [clientesSeleccionados, setClientesSeleccionados] = useState<string[]>([]);
  const [año, setAño] = useState(new Date().getFullYear());
  const [mes, setMes] = useState(new Date().getMonth());
  const [modoSeleccion, setModoSeleccion] = useState<'uno' | 'varios' | 'todos'>('uno');
  const [modoPeriodo, setModoPeriodo] = useState<'mes' | 'gestion'>('mes');
  const [cargando, setCargando] = useState(false);
  const [notificacion, setNotificacion] = useState<{ tipo: NotificationType; mensaje: string } | null>(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const clientesData = await obtenerClientes();
    const archivosData = await obtenerTodosArchivos();
    setClientes(clientesData);
    setArchivos(archivosData);
  };

  const clientesFiltrados = clientes.filter(c =>
    c.razonSocial.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.nitCurCi.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleToggleCliente = (clienteId: string) => {
    if (modoSeleccion === 'uno') {
      setClientesSeleccionados([clienteId]);
    } else {
      setClientesSeleccionados(prev =>
        prev.includes(clienteId)
          ? prev.filter(id => id !== clienteId)
          : [...prev, clienteId]
      );
    }
  };

  const handleComprimir = async () => {
    let clientesAComprimir: Cliente[] = [];

    if (modoSeleccion === 'todos') {
      clientesAComprimir = clientes;
    } else {
      clientesAComprimir = clientes.filter(c => clientesSeleccionados.includes(c.id));
    }

    if (clientesAComprimir.length === 0) {
      setNotificacion({ tipo: 'error', mensaje: 'Seleccione al menos un cliente' });
      return;
    }

    setCargando(true);
    try {
      let archivosFiltrados: ArchivoPDF[] = [];
      
      if (modoPeriodo === 'mes') {
        // Comprimir solo un mes específico
        archivosFiltrados = archivos.filter(a =>
          clientesAComprimir.some(c => c.id === a.clienteId) &&
          a.año === año &&
          a.mes === mes
        );
      } else {
        // Comprimir gestión completa (todo el año)
        archivosFiltrados = archivos.filter(a =>
          clientesAComprimir.some(c => c.id === a.clienteId) &&
          a.año === año
        );
      }

      if (archivosFiltrados.length === 0) {
        setNotificacion({ 
          tipo: 'warning', 
          mensaje: `No hay archivos para ${modoPeriodo === 'mes' ? 'el período' : 'la gestión'} seleccionado` 
        });
        setCargando(false);
        return;
      }

      const blob = await crearZIP(clientesAComprimir, archivosFiltrados, año, mes, modoPeriodo);
      
      if (modoPeriodo === 'gestion') {
        descargarZIP(blob, 'Nestor', null, año);
      } else {
        descargarZIP(blob, 'Nestor', mes, año);
      }
      
      setNotificacion({ tipo: 'success', mensaje: 'Archivo ZIP creado correctamente' });
    } catch (error) {
      setNotificacion({ tipo: 'error', mensaje: 'Error al crear el archivo ZIP' });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="comprimir-section">
      <div className="comprimir-content">
        <div className="comprimir-panel">
          <h2>Opciones de Compresión</h2>

          <div className="modo-seleccion">
            <label className="radio-label">
              <input
                type="radio"
                name="modo"
                checked={modoSeleccion === 'uno'}
                onChange={() => {
                  setModoSeleccion('uno');
                  setClientesSeleccionados([]);
                }}
              />
              <span>Un solo cliente</span>
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="modo"
                checked={modoSeleccion === 'varios'}
                onChange={() => {
                  setModoSeleccion('varios');
                  setClientesSeleccionados([]);
                }}
              />
              <span>Varios clientes</span>
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="modo"
                checked={modoSeleccion === 'todos'}
                onChange={() => setModoSeleccion('todos')}
              />
              <span>Todos los clientes</span>
            </label>
          </div>

          <div className="modo-periodo">
            <label className="radio-label">
              <input
                type="radio"
                name="periodo"
                checked={modoPeriodo === 'mes'}
                onChange={() => setModoPeriodo('mes')}
              />
              <span>Un mes específico</span>
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="periodo"
                checked={modoPeriodo === 'gestion'}
                onChange={() => setModoPeriodo('gestion')}
              />
              <span>Gestión completa (año entero)</span>
            </label>
          </div>

          <div className="periodo-seleccion">
            <div className="form-field">
              <label>Año</label>
              <input
                type="number"
                value={año}
                onChange={(e) => setAño(Number(e.target.value))}
                min="2000"
                max="2100"
                placeholder="Ej: 2024"
              />
            </div>

            {modoPeriodo === 'mes' && (
              <div className="form-field">
                <label>Mes</label>
                <select value={mes} onChange={(e) => setMes(Number(e.target.value))}>
                  {MESES.map((m, i) => (
                    <option key={i} value={i}>{m}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <button
            className="btn-comprimir"
            onClick={handleComprimir}
            disabled={cargando || (modoSeleccion !== 'todos' && clientesSeleccionados.length === 0)}
          >
            <FolderArchive size={20} />
            {cargando ? 'Comprimiendo...' : 'Crear ZIP'}
          </button>
        </div>

        {modoSeleccion !== 'todos' && (
          <div className="comprimir-panel">
            <h2>Seleccionar Clientes</h2>
            <div className="search-box">
              <Search size={20} />
              <input
                type="text"
                placeholder="Buscar cliente..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <div className="clientes-lista">
              {clientesFiltrados.map(cliente => {
                const archivosCliente = archivos.filter(
                  a => a.clienteId === cliente.id && a.año === año && a.mes === mes
                ).length;

                return (
                  <label key={cliente.id} className="cliente-checkbox">
                    <input
                      type={modoSeleccion === 'uno' ? 'radio' : 'checkbox'}
                      name="cliente"
                      checked={clientesSeleccionados.includes(cliente.id)}
                      onChange={() => handleToggleCliente(cliente.id)}
                    />
                    <div className="cliente-info">
                      <div className="cliente-nombre">{cliente.razonSocial}</div>
                      <div className="cliente-detalles">
                        <span className="cliente-nit">{cliente.nitCurCi}</span>
                        <span className="cliente-archivos">
                          {archivosCliente} archivo{archivosCliente !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {modoSeleccion === 'todos' && (
          <div className="comprimir-panel">
            <h2>Resumen</h2>
            <div className="resumen-info">
              <div className="resumen-item">
                <strong>Total de Clientes:</strong>
                <span>{clientes.length}</span>
              </div>
              <div className="resumen-item">
                <strong>Período:</strong>
                <span>{MESES[mes]} {año}</span>
              </div>
              <div className="resumen-item">
                <strong>Archivos a comprimir:</strong>
                <span>
                  {archivos.filter(a => a.año === año && a.mes === mes).length}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {notificacion && (
        <Notification
          type={notificacion.tipo}
          message={notificacion.mensaje}
          onClose={() => setNotificacion(null)}
        />
      )}
    </div>
  );
};
