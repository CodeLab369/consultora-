// Componente de la sección Ajustes

import { useState, useEffect } from 'react';
import { Key, List, Database } from 'lucide-react';
import type { OpcionesListas } from '../../types';
import { 
  obtenerCredenciales, 
  actualizarCredenciales, 
  obtenerOpciones, 
  actualizarOpciones,
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
  const [opcionEditar, setOpcionEditar] = useState<{ campo: keyof OpcionesListas; indice: number } | null>(null);
  const [valorEditar, setValorEditar] = useState('');
  const [mostrarConfirmRestore, setMostrarConfirmRestore] = useState(false);
  const [archivoBackup, setArchivoBackup] = useState<File | null>(null);
  const [notificacion, setNotificacion] = useState<{ tipo: NotificationType; mensaje: string } | null>(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const cred = await obtenerCredenciales();
    const opts = await obtenerOpciones();
    setNuevoUsuario(cred.usuario);
    setNuevaContrasena(cred.contrasena);
    setOpciones(opts);
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
    if (!opciones) return;
    
    const nuevaOpcion = prompt(`Ingrese nueva opción para ${campo}:`);
    if (nuevaOpcion && nuevaOpcion.trim()) {
      const nuevasOpciones = {
        ...opciones,
        [campo]: [...opciones[campo], nuevaOpcion.trim()]
      };
      await actualizarOpciones(nuevasOpciones);
      setNotificacion({ tipo: 'success', mensaje: 'Opción agregada' });
      cargarDatos();
    }
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
