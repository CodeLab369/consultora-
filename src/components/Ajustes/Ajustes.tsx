// Componente de la sección Ajustes

import { useState, useEffect } from 'react';
import { Key, List, Database, Tag } from 'lucide-react';
import type { OpcionesListas, Etiqueta } from '../../types';
import { 
  obtenerCredenciales, 
  actualizarCredenciales, 
  obtenerOpciones, 
  actualizarOpciones,
  obtenerEtiquetas,
  guardarEtiqueta,
  eliminarEtiqueta,
  crearBackup,
  restaurarBackup
} from '../../services/database';
import { Notification } from '../common/Notification.tsx';
import type { NotificationType } from '../common/Notification.tsx';
import { ConfirmDialog } from '../common/ConfirmDialog.tsx';
import './Ajustes.css';

export const Ajustes = () => {
  const [nuevoUsuario, setNuevoUsuario] = useState('');
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [opciones, setOpciones] = useState<OpcionesListas | null>(null);
  const [etiquetas, setEtiquetas] = useState<Etiqueta[]>([]);
  const [opcionEditar, setOpcionEditar] = useState<{ campo: keyof OpcionesListas; indice: number } | null>(null);
  const [valorEditar, setValorEditar] = useState('');
  const [mostrarModalAgregar, setMostrarModalAgregar] = useState(false);
  const [campoAgregar, setCampoAgregar] = useState<keyof OpcionesListas | null>(null);
  const [nuevaOpcionValor, setNuevaOpcionValor] = useState('');
  const [mostrarModalEtiqueta, setMostrarModalEtiqueta] = useState(false);
  const [etiquetaEditar, setEtiquetaEditar] = useState<Etiqueta | null>(null);
  const [nombreEtiqueta, setNombreEtiqueta] = useState('');
  const [colorEtiqueta, setColorEtiqueta] = useState('#667eea');
  const [mostrarConfirmRestore, setMostrarConfirmRestore] = useState(false);
  const [archivoBackup, setArchivoBackup] = useState<File | null>(null);
  const [notificacion, setNotificacion] = useState<{ tipo: NotificationType; mensaje: string } | null>(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const cred = await obtenerCredenciales();
    const opts = await obtenerOpciones();
    const etqs = await obtenerEtiquetas();
    setNuevoUsuario(cred.usuario);
    setNuevaContrasena(cred.contrasena);
    setOpciones(opts);
    setEtiquetas(etqs);
  };

  const handleActualizarCredenciales = async () => {
    if (!nuevoUsuario.trim() || !nuevaContrasena.trim()) {
      setNotificacion({ tipo: 'error', mensaje: 'Complete todos los campos' });
      return;
    }

    await actualizarCredenciales({ usuario: nuevoUsuario.trim(), contrasena: nuevaContrasena.trim() });
    setNotificacion({ tipo: 'success', mensaje: 'Credenciales actualizadas correctamente' });
    cargarDatos();
  };

  const handleAgregarOpcion = async (campo: keyof OpcionesListas) => {
    setCampoAgregar(campo);
    setMostrarModalAgregar(true);
  };

  const handleConfirmarAgregar = async () => {
    if (!opciones || !campoAgregar || !nuevaOpcionValor.trim()) return;
    
    const nuevasOpciones = {
      ...opciones,
      [campoAgregar]: [...opciones[campoAgregar], nuevaOpcionValor.trim()]
    };
    await actualizarOpciones(nuevasOpciones);
    setNotificacion({ tipo: 'success', mensaje: 'Opción agregada correctamente' });
    setMostrarModalAgregar(false);
    setCampoAgregar(null);
    setNuevaOpcionValor('');
    cargarDatos();
  };

  const handleEditarOpcion = async () => {
    if (!opciones || !opcionEditar || !valorEditar.trim()) return;

    const nuevasOpciones = {
      ...opciones,
      [opcionEditar.campo]: opciones[opcionEditar.campo].map((v, i) =>
        i === opcionEditar.indice ? valorEditar.trim() : v
      )
    };
    await actualizarOpciones(nuevasOpciones);
    setNotificacion({ tipo: 'success', mensaje: 'Opción actualizada' });
    setOpcionEditar(null);
    setValorEditar('');
    cargarDatos();
  };

  const handleEliminarOpcion = async (campo: keyof OpcionesListas, indice: number) => {
    if (!opciones) return;

    const nuevasOpciones = {
      ...opciones,
      [campo]: opciones[campo].filter((_, i) => i !== indice)
    };
    await actualizarOpciones(nuevasOpciones);
    setNotificacion({ tipo: 'success', mensaje: 'Opción eliminada' });
    cargarDatos();
  };

  const handleAbrirModalEtiqueta = (etiqueta?: Etiqueta) => {
    if (etiqueta) {
      setEtiquetaEditar(etiqueta);
      setNombreEtiqueta(etiqueta.nombre);
      setColorEtiqueta(etiqueta.color);
    } else {
      setEtiquetaEditar(null);
      setNombreEtiqueta('');
      setColorEtiqueta('#667eea');
    }
    setMostrarModalEtiqueta(true);
  };

  const handleGuardarEtiqueta = async () => {
    if (!nombreEtiqueta.trim()) {
      setNotificacion({ tipo: 'error', mensaje: 'El nombre es obligatorio' });
      return;
    }

    const etiqueta: Etiqueta = {
      id: etiquetaEditar?.id || `etiqueta-${Date.now()}`,
      nombre: nombreEtiqueta.trim(),
      color: colorEtiqueta,
      fechaCreacion: etiquetaEditar?.fechaCreacion || new Date().toISOString()
    };

    await guardarEtiqueta(etiqueta);
    setNotificacion({ 
      tipo: 'success', 
      mensaje: etiquetaEditar ? 'Etiqueta actualizada' : 'Etiqueta creada' 
    });
    setMostrarModalEtiqueta(false);
    cargarDatos();
  };

  const handleEliminarEtiqueta = async (id: string) => {
    await eliminarEtiqueta(id);
    setNotificacion({ tipo: 'success', mensaje: 'Etiqueta eliminada' });
    cargarDatos();
  };

  const handleCrearBackup = async () => {
    const backupJson = await crearBackup();
    const blob = new Blob([backupJson], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_consultora_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    setNotificacion({ tipo: 'success', mensaje: 'Backup creado correctamente' });
  };

  const handleSeleccionarBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/json') {
      setArchivoBackup(file);
      setMostrarConfirmRestore(true);
    } else {
      setNotificacion({ tipo: 'error', mensaje: 'Seleccione un archivo JSON válido' });
    }
  };

  const handleRestaurarBackup = async () => {
    if (!archivoBackup) return;

    try {
      const texto = await archivoBackup.text();
      await restaurarBackup(texto);
      setNotificacion({ tipo: 'success', mensaje: 'Backup restaurado correctamente. Recargando...' });
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      setNotificacion({ tipo: 'error', mensaje: 'Error al restaurar el backup' });
    } finally {
      setMostrarConfirmRestore(false);
      setArchivoBackup(null);
    }
  };

  const campos: Array<{ label: string; key: keyof OpcionesListas }> = [
    { label: 'Tipo de Contribuyente', key: 'tipoContribuyente' },
    { label: 'Tipo de Entidad', key: 'tipoEntidad' },
    { label: 'Administración', key: 'administracion' },
    { label: 'Facturación', key: 'facturacion' },
    { label: 'Régimen', key: 'regimen' },
    { label: 'Consolidación', key: 'consolidacion' },
    { label: 'Encargado', key: 'encargado' }
  ];

  if (!opciones) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="ajustes-section">
      <div className="ajustes-panel">
        <div className="panel-header">
          <Key size={24} />
          <h2>Credenciales de Acceso</h2>
        </div>
        <div className="panel-content">
          <div className="form-field">
            <label>Usuario</label>
            <input
              type="text"
              value={nuevoUsuario}
              onChange={(e) => setNuevoUsuario(e.target.value)}
            />
          </div>
          <div className="form-field">
            <label>Contraseña</label>
            <input
              type="text"
              value={nuevaContrasena}
              onChange={(e) => setNuevaContrasena(e.target.value)}
            />
          </div>
          <button className="btn-actualizar" onClick={handleActualizarCredenciales}>
            Actualizar Credenciales
          </button>
        </div>
      </div>

      <div className="ajustes-panel">
        <div className="panel-header">
          <List size={24} />
          <h2>Opciones de Listas</h2>
        </div>
        <div className="panel-content">
          {campos.map(campo => (
            <div key={campo.key} className="opciones-grupo">
              <div className="opciones-header">
                <h3>{campo.label}</h3>
                <button 
                  className="btn-agregar"
                  onClick={() => handleAgregarOpcion(campo.key)}
                >
                  + Agregar
                </button>
              </div>
              <div className="opciones-lista">
                {opciones[campo.key].map((opcion, indice) => (
                  <div key={indice} className="opcion-item">
                    {opcionEditar?.campo === campo.key && opcionEditar.indice === indice ? (
                      <>
                        <input
                          type="text"
                          value={valorEditar}
                          onChange={(e) => setValorEditar(e.target.value)}
                          autoFocus
                        />
                        <button className="btn-guardar-sm" onClick={handleEditarOpcion}>
                          Guardar
                        </button>
                        <button className="btn-cancelar-sm" onClick={() => setOpcionEditar(null)}>
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <span>{opcion}</span>
                        <div className="opcion-acciones">
                          <button onClick={() => {
                            setOpcionEditar({ campo: campo.key, indice });
                            setValorEditar(opcion);
                          }}>
                            Editar
                          </button>
                          <button onClick={() => handleEliminarOpcion(campo.key, indice)}>
                            Eliminar
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="ajustes-panel">
        <div className="panel-header">
          <Tag size={24} />
          <h2>Gestión de Etiquetas</h2>
        </div>
        <div className="panel-content">
          <div className="opciones-header">
            <h3>Etiquetas Disponibles</h3>
            <button 
              className="btn-agregar"
              onClick={() => handleAbrirModalEtiqueta()}
            >
              + Agregar Etiqueta
            </button>
          </div>
          <div className="etiquetas-lista">
            {etiquetas.length === 0 ? (
              <p className="sin-datos">No hay etiquetas creadas</p>
            ) : (
              etiquetas.map((etiqueta) => (
                <div key={etiqueta.id} className="etiqueta-item">
                  <div className="etiqueta-info">
                    <div 
                      className="etiqueta-color" 
                      style={{ backgroundColor: etiqueta.color }}
                    />
                    <span>{etiqueta.nombre}</span>
                  </div>
                  <div className="opcion-acciones">
                    <button onClick={() => handleAbrirModalEtiqueta(etiqueta)}>
                      Editar
                    </button>
                    <button onClick={() => handleEliminarEtiqueta(etiqueta.id)}>
                      Eliminar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="ajustes-panel">
        <div className="panel-header">
          <Database size={24} />
          <h2>Backup y Restauración</h2>
        </div>
        <div className="panel-content">
          <div className="backup-actions">
            <button className="btn-backup" onClick={handleCrearBackup}>
              Crear Backup
            </button>
            <div className="restore-section">
              <label htmlFor="restore-file" className="btn-restore">
                Restaurar Backup
              </label>
              <input
                id="restore-file"
                type="file"
                accept="application/json"
                onChange={handleSeleccionarBackup}
                style={{ display: 'none' }}
              />
            </div>
          </div>
          <p className="backup-info">
            El backup incluye todos los clientes, archivos, notas, configuraciones y credenciales.
          </p>
        </div>
      </div>

      <ConfirmDialog
        isOpen={mostrarConfirmRestore}
        title="Restaurar Backup"
        message="¿Está seguro que desea restaurar el backup? Esto reemplazará todos los datos actuales."
        onConfirm={handleRestaurarBackup}
        onCancel={() => {
          setMostrarConfirmRestore(false);
          setArchivoBackup(null);
        }}
        confirmText="Restaurar"
        type="warning"
      />

      {mostrarModalAgregar && campoAgregar && (
        <div className="modal-overlay" onClick={() => setMostrarModalAgregar(false)}>
          <div className="modal-agregar" onClick={(e) => e.stopPropagation()}>
            <h3>Agregar Nueva Opción</h3>
            <p className="modal-campo">Campo: <strong>{campoAgregar}</strong></p>
            <input
              type="text"
              placeholder="Ingrese la nueva opción"
              value={nuevaOpcionValor}
              onChange={(e) => setNuevaOpcionValor(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleConfirmarAgregar()}
              autoFocus
            />
            <div className="modal-actions">
              <button 
                className="btn-cancelar" 
                onClick={() => {
                  setMostrarModalAgregar(false);
                  setCampoAgregar(null);
                  setNuevaOpcionValor('');
                }}
              >
                Cancelar
              </button>
              <button 
                className="btn-guardar" 
                onClick={handleConfirmarAgregar}
                disabled={!nuevaOpcionValor.trim()}
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}

      {mostrarModalEtiqueta && (
        <div className="modal-overlay" onClick={() => setMostrarModalEtiqueta(false)}>
          <div className="modal-agregar modal-etiqueta" onClick={(e) => e.stopPropagation()}>
            <h3>{etiquetaEditar ? 'Editar Etiqueta' : 'Nueva Etiqueta'}</h3>
            <div className="form-field">
              <label>Nombre</label>
              <input
                type="text"
                placeholder="Nombre de la etiqueta"
                value={nombreEtiqueta}
                onChange={(e) => setNombreEtiqueta(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleGuardarEtiqueta()}
                autoFocus
              />
            </div>
            <div className="form-field">
              <label>Color</label>
              <div className="color-picker">
                <input
                  type="color"
                  value={colorEtiqueta}
                  onChange={(e) => setColorEtiqueta(e.target.value)}
                />
                <span className="color-valor">{colorEtiqueta}</span>
              </div>
            </div>
            <div className="modal-actions">
              <button 
                className="btn-cancelar" 
                onClick={() => {
                  setMostrarModalEtiqueta(false);
                  setEtiquetaEditar(null);
                  setNombreEtiqueta('');
                  setColorEtiqueta('#667eea');
                }}
              >
                Cancelar
              </button>
              <button 
                className="btn-guardar" 
                onClick={handleGuardarEtiqueta}
                disabled={!nombreEtiqueta.trim()}
              >
                {etiquetaEditar ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
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
