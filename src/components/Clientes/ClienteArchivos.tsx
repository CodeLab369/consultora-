// Componente para gestionar archivos PDF de clientes

import { useState, useEffect } from 'react';
import { Upload, Eye, Download, Trash2 } from 'lucide-react';
import type { Cliente, ArchivoPDF } from '../../types';
import { MESES } from '../../types';
import { obtenerArchivosCliente, guardarArchivo, eliminarArchivo } from '../../services/database';
import { leerArchivoPDF, descargarPDF, obtenerURLPDF } from '../../services/pdfService';
import { Modal } from '../common/Modal.tsx';
import { ConfirmDialog } from '../common/ConfirmDialog.tsx';
import { Notification } from '../common/Notification.tsx';
import type { NotificationType } from '../common/Notification';
import './ClienteArchivos.css';

interface ClienteArchivosProps {
  cliente: Cliente;
  onCerrar: () => void;
}

export const ClienteArchivos = ({ cliente, onCerrar }: ClienteArchivosProps) => {
  const [archivos, setArchivos] = useState<ArchivoPDF[]>([]);
  const [archivosFiltrados, setArchivosFiltrados] = useState<ArchivoPDF[]>([]);
  const [filtroAño, setFiltroAño] = useState<number | ''>('');
  const [filtroMes, setFiltroMes] = useState<number | ''>('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nombreArchivo, setNombreArchivo] = useState('');
  const [año, setAño] = useState(new Date().getFullYear());
  const [mes, setMes] = useState(new Date().getMonth());
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<File | null>(null);
  const [archivoEliminar, setArchivoEliminar] = useState<ArchivoPDF | null>(null);
  const [archivoViewer, setArchivoViewer] = useState<ArchivoPDF | null>(null);
  const [notificacion, setNotificacion] = useState<{ tipo: NotificationType; mensaje: string } | null>(null);

  useEffect(() => {
    cargarArchivos();
  }, [cliente.id]);

  useEffect(() => {
    aplicarFiltros();
  }, [archivos, filtroAño, filtroMes]);

  const cargarArchivos = async () => {
    const archivosData = await obtenerArchivosCliente(cliente.id);
    setArchivos(archivosData);
  };

  const aplicarFiltros = () => {
    let resultado = [...archivos];

    if (filtroAño !== '') {
      resultado = resultado.filter(a => a.año === filtroAño);
    }

    if (filtroMes !== '') {
      resultado = resultado.filter(a => a.mes === filtroMes);
    }

    setArchivosFiltrados(resultado);
  };

  const handleLimpiarFiltros = () => {
    setFiltroAño('');
    setFiltroMes('');
  };

  const handleNuevoArchivo = () => {
    setNombreArchivo('');
    setAño(new Date().getFullYear());
    setMes(new Date().getMonth());
    setArchivoSeleccionado(null);
    setMostrarFormulario(true);
  };

  const handleSeleccionarArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setArchivoSeleccionado(file);
      if (!nombreArchivo) {
        setNombreArchivo(file.name.replace('.pdf', ''));
      }
    } else {
      setNotificacion({ tipo: 'error', mensaje: 'Solo se permiten archivos PDF' });
    }
  };

  const handleSubirArchivo = async () => {
    if (!archivoSeleccionado) {
      setNotificacion({ tipo: 'error', mensaje: 'Seleccione un archivo PDF' });
      return;
    }

    if (!nombreArchivo.trim()) {
      setNotificacion({ tipo: 'error', mensaje: 'Ingrese un nombre para el archivo' });
      return;
    }

    try {
      const base64Data = await leerArchivoPDF(archivoSeleccionado);
      const nombreFinal = nombreArchivo.trim().endsWith('.pdf') 
        ? nombreArchivo.trim() 
        : `${nombreArchivo.trim()}.pdf`;

      const archivo: ArchivoPDF = {
        id: crypto.randomUUID(),
        clienteId: cliente.id,
        nombre: nombreFinal,
        año,
        mes,
        data: base64Data,
        fechaSubida: new Date().toISOString()
      };

      await guardarArchivo(archivo);
      setNotificacion({ tipo: 'success', mensaje: 'Archivo subido correctamente' });
      setMostrarFormulario(false);
      cargarArchivos();
    } catch (error) {
      setNotificacion({ tipo: 'error', mensaje: 'Error al subir el archivo' });
    }
  };

  const handleEliminarArchivo = async () => {
    if (archivoEliminar) {
      await eliminarArchivo(archivoEliminar.id);
      setNotificacion({ tipo: 'success', mensaje: 'Archivo eliminado' });
      setArchivoEliminar(null);
      cargarArchivos();
    }
  };

  const handleVerArchivo = (archivo: ArchivoPDF) => {
    setArchivoViewer(archivo);
  };

  const handleDescargar = (archivo: ArchivoPDF) => {
    descargarPDF(archivo.data, archivo.nombre);
    setNotificacion({ tipo: 'success', mensaje: 'Archivo descargado' });
  };

  const añosUnicos = Array.from(new Set(archivos.map(a => a.año))).sort((a, b) => b - a);

  return (
    <>
      <Modal
        isOpen={true}
        onClose={onCerrar}
        title={`Archivos PDF - ${cliente.razonSocial}`}
        size="xlarge"
      >
        <div className="cliente-archivos">
          <div className="archivos-header">
            <button className="btn-nuevo-archivo" onClick={handleNuevoArchivo}>
              <Upload size={18} />
              Subir Archivo
            </button>
          </div>

          {mostrarFormulario && (
            <div className="archivo-form">
              <h3>Subir Nuevo Archivo PDF</h3>
              
              <div className="form-row">
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

                <div className="form-field">
                  <label>Mes</label>
                  <select value={mes} onChange={(e) => setMes(Number(e.target.value))}>
                    {MESES.map((m, i) => (
                      <option key={i} value={i}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-field">
                <label>Nombre del Archivo</label>
                <input
                  type="text"
                  value={nombreArchivo}
                  onChange={(e) => setNombreArchivo(e.target.value)}
                  placeholder="Nombre descriptivo"
                />
              </div>

              <div className="form-field">
                <label>Seleccionar PDF</label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleSeleccionarArchivo}
                />
                {archivoSeleccionado && (
                  <span className="archivo-seleccionado">
                    Archivo: {archivoSeleccionado.name}
                  </span>
                )}
              </div>

              <div className="form-actions">
                <button className="btn-cancelar" onClick={() => setMostrarFormulario(false)}>
                  Cancelar
                </button>
                <button className="btn-guardar" onClick={handleSubirArchivo}>
                  Subir Archivo
                </button>
              </div>
            </div>
          )}

          {archivos.length > 0 && (
            <div className="filtros-archivos">
              <div className="form-field">
                <label>Filtrar por Año</label>
                <select value={filtroAño} onChange={(e) => setFiltroAño(e.target.value === '' ? '' : Number(e.target.value))}>
                  <option value="">Todos los años</option>
                  {añosUnicos.map(año => (
                    <option key={año} value={año}>{año}</option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>Filtrar por Mes</label>
                <select value={filtroMes} onChange={(e) => setFiltroMes(e.target.value === '' ? '' : Number(e.target.value))}>
                  <option value="">Todos los meses</option>
                  {MESES.map((mes, i) => (
                    <option key={i} value={i}>{mes}</option>
                  ))}
                </select>
              </div>

              {(filtroAño !== '' || filtroMes !== '') && (
                <button className="btn-limpiar-filtros" onClick={handleLimpiarFiltros}>
                  Limpiar Filtros
                </button>
              )}
            </div>
          )}

          <div className="archivos-lista">
            {archivos.length === 0 ? (
              <div className="archivos-vacio">
                <p>No hay archivos para este cliente</p>
              </div>
            ) : archivosFiltrados.length === 0 ? (
              <div className="archivos-vacio">
                <p>No hay archivos que coincidan con los filtros</p>
              </div>
            ) : (
              <div className="archivos-grid">
                {archivosFiltrados.map(archivo => (
                  <div key={archivo.id} className="archivo-card">
                    <div className="archivo-info">
                      <div className="archivo-nombre">{archivo.nombre}</div>
                      <div className="archivo-periodo">
                        {MESES[archivo.mes]} {archivo.año}
                      </div>
                      <div className="archivo-fecha">
                        Subido: {new Date(archivo.fechaSubida).toLocaleDateString('es-ES')}
                      </div>
                    </div>
                    <div className="archivo-acciones">
                      <button 
                        className="btn-accion-archivo btn-ver-archivo"
                        onClick={() => handleVerArchivo(archivo)}
                        title="Ver PDF"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        className="btn-accion-archivo btn-descargar-archivo"
                        onClick={() => handleDescargar(archivo)}
                        title="Descargar"
                      >
                        <Download size={18} />
                      </button>
                      <button 
                        className="btn-accion-archivo btn-eliminar-archivo"
                        onClick={() => setArchivoEliminar(archivo)}
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>

      {archivoViewer && (
        <Modal
          isOpen={true}
          onClose={() => setArchivoViewer(null)}
          title={archivoViewer.nombre}
          size="xlarge"
        >
          <div className="pdf-viewer">
            <iframe
              src={obtenerURLPDF(archivoViewer.data)}
              title={archivoViewer.nombre}
              width="100%"
              height="600px"
            />
          </div>
        </Modal>
      )}

      <ConfirmDialog
        isOpen={!!archivoEliminar}
        title="Eliminar Archivo"
        message={`¿Está seguro que desea eliminar el archivo "${archivoEliminar?.nombre}"?`}
        onConfirm={handleEliminarArchivo}
        onCancel={() => setArchivoEliminar(null)}
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
