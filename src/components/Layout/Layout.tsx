// Layout principal de la aplicación

import { Users, FileText, FolderArchive, Settings, LogOut, Home } from 'lucide-react';
import type { Seccion } from '../../types';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
  seccionActual: Seccion;
  onCambiarSeccion: (seccion: Seccion) => void;
  onCerrarSesion: () => void;
}

export const Layout = ({ children, seccionActual, onCambiarSeccion, onCerrarSesion }: LayoutProps) => {
  const secciones = [
    { 
      id: 'clientes' as Seccion, 
      nombre: 'Gestión de Clientes', 
      descripcion: 'Administra la información completa de tus clientes',
      icono: Users,
      color: '#667eea'
    },
    { 
      id: 'unir' as Seccion, 
      nombre: 'Unir Documentos PDF', 
      descripcion: 'Combina múltiples archivos PDF en un solo documento',
      icono: FileText,
      color: '#f59e0b'
    },
    { 
      id: 'comprimir' as Seccion, 
      nombre: 'Comprimir Archivos', 
      descripcion: 'Crea archivos ZIP con los documentos de tus clientes',
      icono: FolderArchive,
      color: '#10b981'
    },
    { 
      id: 'ajustes' as Seccion, 
      nombre: 'Configuración', 
      descripcion: 'Ajusta las opciones y preferencias del sistema',
      icono: Settings,
      color: '#6366f1'
    },
  ];

  // Determinar si estamos en el dashboard (inicio) o en una sección específica
  const enDashboard = seccionActual === 'clientes' && !children;

  return (
    <div className="layout">
      <header className="app-header">
        <div className="header-content">
          <div className="header-logo">
            <div className="logo-icon">
              <Users size={32} />
            </div>
            <div className="logo-text">
              <h1>Consultora</h1>
              <p>Sistema de Gestión</p>
            </div>
          </div>
          <button className="btn-logout" onClick={onCerrarSesion}>
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </header>

      <main className="app-main">
        {enDashboard ? (
          <div className="dashboard">
            <div className="dashboard-header">
              <h2>Bienvenido al Sistema de Gestión</h2>
              <p>Selecciona una opción para comenzar</p>
            </div>
            <div className="cards-grid">
              {secciones.map((seccion) => {
                const Icon = seccion.icono;
                return (
                  <button
                    key={seccion.id}
                    className="card"
                    onClick={() => onCambiarSeccion(seccion.id)}
                    style={{ '--card-color': seccion.color } as React.CSSProperties}
                  >
                    <div className="card-icon" style={{ backgroundColor: seccion.color }}>
                      <Icon size={40} />
                    </div>
                    <div className="card-content">
                      <h3>{seccion.nombre}</h3>
                      <p>{seccion.descripcion}</p>
                    </div>
                    <div className="card-arrow">→</div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="section-view">
            <button className="btn-back" onClick={() => onCambiarSeccion('clientes' as Seccion)}>
              <Home size={20} />
              <span>Volver al Inicio</span>
            </button>
            <div className="section-content">
              {children}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
