// Layout principal de la aplicación

import { useState } from 'react';
import { Users, FileText, FolderArchive, Settings, LogOut } from 'lucide-react';
import type { Seccion } from '../../types';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
  seccionActual: Seccion;
  onCambiarSeccion: (seccion: Seccion) => void;
  onCerrarSesion: () => void;
}

export const Layout = ({ children, seccionActual, onCambiarSeccion, onCerrarSesion }: LayoutProps) => {
  const [menuAbierto, setMenuAbierto] = useState(window.innerWidth > 768);

  const secciones = [
    { id: 'clientes' as Seccion, nombre: 'Clientes', icono: Users },
    { id: 'unir' as Seccion, nombre: 'Unir', icono: FileText },
    { id: 'comprimir' as Seccion, nombre: 'Comprimir', icono: FolderArchive },
    { id: 'ajustes' as Seccion, nombre: 'Ajustes', icono: Settings },
  ];

  const handleCambiarSeccion = (seccion: Seccion) => {
    onCambiarSeccion(seccion);
    if (window.innerWidth <= 768) {
      setMenuAbierto(false);
    }
  };

  return (
    <div className="layout">
      <aside className={`sidebar ${menuAbierto ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <h2>Consultora</h2>
        </div>

        <nav className="sidebar-nav">
          {secciones.map((seccion) => {
            const Icon = seccion.icono;
            return (
              <button
                key={seccion.id}
                className={`nav-item ${seccionActual === seccion.id ? 'nav-item-active' : ''}`}
                onClick={() => handleCambiarSeccion(seccion.id)}
              >
                <Icon size={20} />
                <span>{seccion.nombre}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item" onClick={onCerrarSesion}>
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      <div className="main-content">
        <header className="header">
          <button 
            className="menu-toggle"
            onClick={() => setMenuAbierto(!menuAbierto)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          <h1>
            {secciones.find(s => s.id === seccionActual)?.nombre}
          </h1>
        </header>

        <main className="content">
          {children}
        </main>
      </div>

      {menuAbierto && (
        <div 
          className="sidebar-overlay"
          onClick={() => setMenuAbierto(false)}
        />
      )}
    </div>
  );
};
