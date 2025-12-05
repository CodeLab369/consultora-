// Componente de la sección Unir PDFs

import { useState, useEffect } from 'react';
import { Search, FileText, Eye, Download, Trash2 } from 'lucide-react';
import type { Cliente, ArchivoPDF, PDFUnido } from '../../types';
import { obtenerClientes, obtenerArchivosCliente, guardarPDFUnido, obtenerPDFsUnidos, eliminarPDFUnido } from '../../services/database';
import { unirPDFs, descargarPDF, obtenerURLPDF } from '../../services/pdfService';
import { Modal } from '../common/Modal.tsx';
import { ConfirmDialog } from '../common/ConfirmDialog.tsx';
import { Notification } from '../common/Notification.tsx';
import type { NotificationType } from '../common/Notification';
import './Unir.css';

export const Unir = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [archivos, setArchivos] = useState<ArchivoPDF[]>([]);
  const [archivosSeleccionados, setArchivosSeleccionados] = useState<string[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [nombrePDFUnido, setNombrePDFUnido] = useState('');
  const [pdfsUnidos, setPdfsUnidos] = useState<PDFUnido[]>([]);
  const [pdfViewer, setPdfViewer] = useState<PDFUnido | null>(null);
  const [pdfEliminar, setPdfEliminar] = useState<PDFUnido | null>(null);
  const [cargando, setCargando] = useState(false);
  const [notificacion, setNotificacion] = useState<{ tipo: NotificationType; mensaje: string } | null>(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const clientesData = await obtenerClientes();
    const pdfsData = await obtenerPDFsUnidos();
    setClientes(clientesData);
    setPdfsUnidos(pdfsData);
  };

  const clientesFiltrados = clientes.filter(c =>
    c.razonSocial.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.nitCurCi.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleSeleccionarCliente = async (cliente: Cliente) => {
    setClienteSeleccionado(cliente);
    setArchivosSeleccionados([]);
    const archivosData = await obtenerArchivosCliente(cliente.id);
    setArchivos(archivosData);
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
      const archivosAUnir = archivos.filter(a => archivosSeleccionados.includes(a.id));
      const pdfData = await unirPDFs(archivosAUnir);
      
      const nombreFinal = nombrePDFUnido.trim().endsWith('.pdf')
        ? nombrePDFUnido.trim()
        : `${nombrePDFUnido.trim()}.pdf`;

      const pdfUnido: PDFUnido = {
        id: crypto.randomUUID(),
        nombre: nombreFinal,
        data: pdfData,
        fechaCreacion: new Date().toISOString(),
        clientesIds: clienteSeleccionado ? [clienteSeleccionado.id] : []
      };

      await guardarPDFUnido(pdfUnido);
      setNotificacion({ tipo: 'success', mensaje: 'PDFs unidos correctamente' });
      setNombrePDFUnido('');
      setArchivosSeleccionados([]);
      cargarDatos();
    } catch (error) {
      setNotificacion({ tipo: 'error', mensaje: 'Error al unir los PDFs' });
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

  const handleDescargarPDF = (pdf: PDFUnido) => {
    descargarPDF(pdf.data, pdf.nombre);
    setNotificacion({ tipo: 'success', mensaje: 'PDF descargado' });
  };

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
              <div className="archivos-seleccion">
                {archivos.length === 0 ? (
                  <div className="empty-message">
                    Este cliente no tiene archivos
                  </div>
                ) : (
                  archivos.map(archivo => (
                    <label key={archivo.id} className="archivo-checkbox">
                      <input
                        type="checkbox"
                        checked={archivosSeleccionados.includes(archivo.id)}
                        onChange={() => handleToggleArchivo(archivo.id)}
                      />
                      <span>{archivo.nombre}</span>
                    </label>
                  ))
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
        <Modal
          isOpen={true}
          onClose={() => setPdfViewer(null)}
          title={pdfViewer.nombre}
          size="xlarge"
        >
          <div className="pdf-viewer">
            <iframe
              src={obtenerURLPDF(pdfViewer.data)}
              title={pdfViewer.nombre}
              width="100%"
              height="600px"
            />
          </div>
        </Modal>
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
