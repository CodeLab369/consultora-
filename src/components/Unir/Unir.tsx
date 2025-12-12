// Componente de la sección Unir PDFs

import { useState, useEffect, useMemo } from 'react';
import { Search, FileText, Eye, Download, Trash2 } from 'lucide-react';
import type { Cliente, ArchivoPDF, PDFUnido } from '../../types';
import { MESES } from '../../types';
import { obtenerClientes, obtenerArchivosCliente, guardarPDFUnido, obtenerPDFsUnidos, eliminarPDFUnido, agregarPDFUnidoACliente } from '../../services/database';
import { unirPDFs, descargarPDF, obtenerURLPDF } from '../../services/pdfService';
import { Modal } from '../common/Modal.tsx';
import { ConfirmDialog } from '../common/ConfirmDialog.tsx';
import { Notification } from '../common/Notification.tsx';
import type { NotificationType } from '../common/Notification';
import './Unir.css';

interface PDFViewerModalUnidosProps {
  pdf: PDFUnido;
  onClose: () => void;
}

const PDFViewerModalUnidos = ({ pdf, onClose }: PDFViewerModalUnidosProps) => {
  const pdfURL = useMemo(() => {
    return obtenerURLPDF(pdf.data);
  }, [pdf.data]);

  useEffect(() => {
    return () => {
      if (pdfURL) {
        window.URL.revokeObjectURL(pdfURL);
      }
    };
  }, [pdfURL]);

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={pdf.nombre}
      size="xlarge"
    >
      <div className="pdf-viewer">
        <iframe
          src={pdfURL}
          title={pdf.nombre}
          width="100%"
          height="600px"
        />
      </div>
    </Modal>
  );
};

export const Unir = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [archivos, setArchivos] = useState<ArchivoPDF[]>([]);
  const [archivosFiltrados, setArchivosFiltrados] = useState<ArchivoPDF[]>([]);
  const [archivosSeleccionados, setArchivosSeleccionados] = useState<string[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroAño, setFiltroAño] = useState<number | ''>('');
  const [filtroMes, setFiltroMes] = useState<number | ''>('');
  const [nombrePDFUnido, setNombrePDFUnido] = useState('');
  const [pdfsUnidos, setPdfsUnidos] = useState<PDFUnido[]>([]);
  const [pdfViewer, setPdfViewer] = useState<PDFUnido | null>(null);
  const [pdfEliminar, setPdfEliminar] = useState<PDFUnido | null>(null);
  const [pdfParaAsignar, setPdfParaAsignar] = useState<PDFUnido | null>(null);
  const [pdfRecienUnido, setPdfRecienUnido] = useState<{pdf: PDFUnido, cliente: Cliente | null, año: number | '', mes: number | ''} | null>(null);
  const [clienteDestino, setClienteDestino] = useState<string>('');
  const [añoDestino, setAñoDestino] = useState<number>(new Date().getFullYear());
  const [mesDestino, setMesDestino] = useState<number>(new Date().getMonth());
  const [cargando, setCargando] = useState(false);
  const [notificacion, setNotificacion] = useState<{ tipo: NotificationType; mensaje: string } | null>(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [archivos, filtroAño, filtroMes]);

  const cargarDatos = async () => {
    const clientesData = await obtenerClientes();
    const pdfsData = await obtenerPDFsUnidos();
    setClientes(clientesData);
    setPdfsUnidos(pdfsData);
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

  const handleSeleccionarCliente = async (cliente: Cliente) => {
    setClienteSeleccionado(cliente);
    setArchivosSeleccionados([]);
    setFiltroAño('');
    setFiltroMes('');
    const archivosData = await obtenerArchivosCliente(cliente.id);
    setArchivos(archivosData);
  };

  const handleLimpiarFiltros = () => {
    setFiltroAño('');
    setFiltroMes('');
  };

  const handleToggleArchivo = (archivoId: string) => {
    setArchivosSeleccionados(prev =>
      prev.includes(archivoId)
        ? prev.filter(id => id !== archivoId)
        : [...prev, archivoId]
    );
  };

  const handleUnirPDFs = async () => {
    if (archivosSeleccionados.length < 2) {
      setNotificacion({ tipo: 'error', mensaje: 'Seleccione al menos 2 archivos para unir' });
      return;
    }

    if (!nombrePDFUnido.trim()) {
      setNotificacion({ tipo: 'error', mensaje: 'Ingrese un nombre para el PDF unido' });
      return;
    }

    setCargando(true);
    try {
      // Mantener el orden de selección de los archivos
      const archivosAUnir = archivosSeleccionados
        .map(id => archivosFiltrados.find(a => a.id === id))
        .filter((a): a is ArchivoPDF => a !== undefined);
      
      setNotificacion({ 
        tipo: 'info', 
        mensaje: `Uniendo ${archivosAUnir.length} archivo${archivosAUnir.length !== 1 ? 's' : ''}...` 
      });
      
      const pdfData = await unirPDFs(archivosAUnir);
      
      const nombreFinal = nombrePDFUnido.trim().endsWith('.pdf')
        ? nombrePDFUnido.trim()
        : `${nombrePDFUnido.trim()}.pdf`;

      const pdfUnido: PDFUnido = {
        id: crypto.randomUUID(),
        nombre: nombreFinal,
        data: pdfData,
        fechaCreacion: new Date().toISOString(),
        clientesIds: []
      };

      // Mostrar diálogo de confirmación si hay cliente y periodo seleccionados
      if (clienteSeleccionado && (filtroAño !== '' || filtroMes !== '')) {
        setPdfRecienUnido({
          pdf: pdfUnido,
          cliente: clienteSeleccionado,
          año: filtroAño,
          mes: filtroMes
        });
        setNotificacion({ 
          tipo: 'success', 
          mensaje: 'PDF unido correctamente' 
        });
      } else {
        // Si no hay cliente/periodo, guardar directamente en la lista
        await guardarPDFUnido(pdfUnido);
        setNotificacion({ 
          tipo: 'success', 
          mensaje: `${archivosAUnir.length} PDF${archivosAUnir.length !== 1 ? 's' : ''} unido${archivosAUnir.length !== 1 ? 's' : ''} correctamente` 
        });
        cargarDatos();
      }
      
      setNombrePDFUnido('');
      setArchivosSeleccionados([]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al unir los PDFs';
      setNotificacion({ tipo: 'error', mensaje: errorMessage });
      console.error('Error detallado:', error);
    } finally {
      setCargando(false);
    }
  };

  const handleEliminarPDF = async () => {
    if (pdfEliminar) {
      await eliminarPDFUnido(pdfEliminar.id);
      setNotificacion({ tipo: 'success', mensaje: 'PDF eliminado' });
      setPdfEliminar(null);
      cargarDatos();
    }
  };

  const handleConfirmarAsignacion = async () => {
    if (!pdfRecienUnido) return;

    setCargando(true);
    try {
      const { pdf, cliente, año, mes } = pdfRecienUnido;
      
      if (!cliente || año === '' || mes === '') {
        setNotificacion({ tipo: 'error', mensaje: 'Datos incompletos para la asignación' });
        return;
      }

      // Agregar el PDF directamente al cliente
      await agregarPDFUnidoACliente(pdf, cliente.id, año, mes);
      setNotificacion({ 
        tipo: 'success', 
        mensaje: `PDF asignado a ${cliente.razonSocial} - ${MESES[mes]} ${año}` 
      });
      
      setPdfRecienUnido(null);
      cargarDatos();
    } catch (error) {
      setNotificacion({ tipo: 'error', mensaje: 'Error al asignar el PDF' });
    } finally {
      setCargando(false);
    }
  };

  const handleRechazarAsignacion = async () => {
    if (!pdfRecienUnido) return;

    setCargando(true);
    try {
      // Guardar en la lista de PDFs unidos sin asignar a cliente
      await guardarPDFUnido(pdfRecienUnido.pdf);
      setNotificacion({ 
        tipo: 'success', 
        mensaje: 'PDF guardado en la lista de PDFs unidos' 
      });
      
      setPdfRecienUnido(null);
      cargarDatos();
    } catch (error) {
      setNotificacion({ tipo: 'error', mensaje: 'Error al guardar el PDF' });
    } finally {
      setCargando(false);
    }
  };

  const handleDescargarPDF = (pdf: PDFUnido) => {
    descargarPDF(pdf.data, pdf.nombre);
    setNotificacion({ tipo: 'success', mensaje: 'PDF descargado' });
  };

  const handleAsignarPDFACliente = async () => {
    if (!pdfParaAsignar || !clienteDestino) {
      setNotificacion({ tipo: 'error', mensaje: 'Seleccione un cliente de destino' });
      return;
    }

    setCargando(true);
    try {
      await agregarPDFUnidoACliente(pdfParaAsignar, clienteDestino, añoDestino, mesDestino);
      setNotificacion({ tipo: 'success', mensaje: 'PDF agregado al cliente correctamente' });
      setPdfParaAsignar(null);
      setClienteDestino('');
    } catch (error) {
      setNotificacion({ tipo: 'error', mensaje: 'Error al agregar el PDF al cliente' });
    } finally {
      setCargando(false);
    }
  };

  const clientesFiltrados = clientes.filter(c =>
    c.razonSocial.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.nitCurCi.toLowerCase().includes(busqueda.toLowerCase())
  );

  const añosUnicos = Array.from(new Set(archivos.map(a => a.año))).sort((a, b) => b - a);

  return (
    <div className="unir-section">
      <div className="unir-content">
        <div className="unir-panel">
          <h2>Seleccionar Cliente</h2>
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
            {clientesFiltrados.map(cliente => (
              <button
                key={cliente.id}
                className={`cliente-item ${clienteSeleccionado?.id === cliente.id ? 'cliente-item-active' : ''}`}
                onClick={() => handleSeleccionarCliente(cliente)}
              >
                <div className="cliente-nombre">{cliente.razonSocial}</div>
                <div className="cliente-nit">{cliente.nitCurCi}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="unir-panel">
          <h2>Archivos del Cliente</h2>
          {clienteSeleccionado ? (
            <>
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

              <div className="archivos-seleccion">
                {archivos.length === 0 ? (
                  <div className="empty-message">
                    Este cliente no tiene archivos
                  </div>
                ) : archivosFiltrados.length === 0 ? (
                  <div className="empty-message">
                    No hay archivos que coincidan con los filtros
                  </div>
                ) : (
                  archivosFiltrados.map(archivo => {
                    const seleccionIndex = archivosSeleccionados.indexOf(archivo.id);
                    const estaSeleccionado = seleccionIndex !== -1;
                    return (
                      <label key={archivo.id} className={`archivo-checkbox ${estaSeleccionado ? 'selected' : ''}`}>
                        <input
                          type="checkbox"
                          checked={estaSeleccionado}
                          onChange={() => handleToggleArchivo(archivo.id)}
                        />
                        {estaSeleccionado && (
                          <span className="orden-badge">{seleccionIndex + 1}</span>
                        )}
                        <span>{archivo.nombre}</span>
                      </label>
                    );
                  })
                )}
              </div>

              {archivos.length > 0 && (
                <div className="unir-form">
                  <div className="form-field">
                    <label>Nombre del PDF Unido</label>
                    <input
                      type="text"
                      value={nombrePDFUnido}
                      onChange={(e) => setNombrePDFUnido(e.target.value)}
                      placeholder="Ej: Reporte Completo"
                    />
                  </div>
                  <button
                    className="btn-unir"
                    onClick={handleUnirPDFs}
                    disabled={cargando || archivosSeleccionados.length < 2}
                  >
                    <FileText size={20} />
                    {cargando ? 'Uniendo...' : `Unir PDFs (${archivosSeleccionados.length})`}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="empty-message">
              Seleccione un cliente para ver sus archivos
            </div>
          )}
        </div>
      </div>

      <div className="pdfs-unidos-section">
        <h2>PDFs Unidos</h2>
        {pdfsUnidos.length === 0 ? (
          <div className="empty-message">
            No hay PDFs unidos
          </div>
        ) : (
          <div className="pdfs-grid">
            {pdfsUnidos.map(pdf => (
              <div key={pdf.id} className="pdf-card">
                <div className="pdf-info">
                  <div className="pdf-nombre">{pdf.nombre}</div>
                  <div className="pdf-fecha">
                    {new Date(pdf.fechaCreacion).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
                <div className="pdf-acciones">
                  <button onClick={() => setPdfViewer(pdf)} title="Ver PDF">
                    <Eye size={18} />
                  </button>
                  <button onClick={() => handleDescargarPDF(pdf)} title="Descargar">
                    <Download size={18} />
                  </button>
                  <button onClick={() => setPdfParaAsignar(pdf)} title="Asignar a cliente">
                    <FileText size={18} />
                  </button>
                  <button onClick={() => setPdfEliminar(pdf)} title="Eliminar">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {pdfViewer && (
        <PDFViewerModalUnidos
          pdf={pdfViewer}
          onClose={() => setPdfViewer(null)}
        />
      )}

      {pdfRecienUnido && (
        <ConfirmDialog
          isOpen={true}
          title="Asignar PDF al Cliente"
          message={`¿Desea asignar el PDF "${pdfRecienUnido.pdf.nombre}" a ${pdfRecienUnido.cliente?.razonSocial}${pdfRecienUnido.año !== '' && pdfRecienUnido.mes !== '' ? ` - ${MESES[pdfRecienUnido.mes]} ${pdfRecienUnido.año}` : ''}?`}
          onConfirm={handleConfirmarAsignacion}
          onCancel={handleRechazarAsignacion}
          confirmText="Sí, asignar al cliente"
          cancelText="No, guardar en lista"
          type="info"
        />
      )}

      <ConfirmDialog
        isOpen={!!pdfEliminar}
        title="Eliminar PDF"
        message={`¿Está seguro que desea eliminar "${pdfEliminar?.nombre}"?`}
        onConfirm={handleEliminarPDF}
        onCancel={() => setPdfEliminar(null)}
        confirmText="Eliminar"
        type="danger"
      />

      {pdfParaAsignar && (
        <Modal
          isOpen={true}
          onClose={() => {
            setPdfParaAsignar(null);
            setClienteDestino('');
          }}
          title="Asignar PDF a Cliente"
          size="medium"
        >
          <div className="asignar-pdf-form">
            <p className="pdf-asignar-nombre">
              <strong>PDF:</strong> {pdfParaAsignar.nombre}
            </p>
            
            <div className="form-field">
              <label>Cliente de destino</label>
              <select
                value={clienteDestino}
                onChange={(e) => setClienteDestino(e.target.value)}
              >
                <option value="">Seleccione un cliente</option>
                {clientes.map(cliente => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.razonSocial}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Año</label>
              <input
                type="number"
                value={añoDestino}
                onChange={(e) => setAñoDestino(Number(e.target.value))}
                min="2000"
                max="2100"
              />
            </div>

            <div className="form-field">
              <label>Mes</label>
              <select
                value={mesDestino}
                onChange={(e) => setMesDestino(Number(e.target.value))}
              >
                {MESES.map((mes, index) => (
                  <option key={index} value={index}>
                    {mes}
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-buttons">
              <button
                className="btn-cancelar"
                onClick={() => {
                  setPdfParaAsignar(null);
                  setClienteDestino('');
                }}
              >
                Cancelar
              </button>
              <button
                className="btn-confirmar"
                onClick={handleAsignarPDFACliente}
                disabled={!clienteDestino || cargando}
              >
                {cargando ? 'Asignando...' : 'Asignar'}
              </button>
            </div>
          </div>
        </Modal>
      )}

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
