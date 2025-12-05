// Componente principal de la aplicación

import { useState, useEffect } from 'react';
import { Login } from './components/Login/Login.tsx';
import { Layout } from './components/Layout/Layout.tsx';
import { Clientes } from './components/Clientes/Clientes.tsx';
import { Unir } from './components/Unir/Unir.tsx';
import { Comprimir } from './components/Comprimir/Comprimir.tsx';
import { Ajustes } from './components/Ajustes/Ajustes.tsx';
import { Notification } from './components/common/Notification.tsx';
import type { NotificationType } from './components/common/Notification';
import type { Seccion } from './types';
import { 
  inicializarCredenciales, 
  inicializarOpciones, 
  obtenerCredenciales 
} from './services/database';
import './App.css';

function App() {
  const [autenticado, setAutenticado] = useState(false);
  const [seccionActual, setSeccionActual] = useState<Seccion>('clientes');
  const [inicializado, setInicializado] = useState(false);
  const [notificacion, setNotificacion] = useState<{ tipo: NotificationType; mensaje: string } | null>(null);

  useEffect(() => {
    inicializar();
  }, []);

  const inicializar = async () => {
    await inicializarCredenciales();
    await inicializarOpciones();
    setInicializado(true);
  };

  const handleLogin = async (usuario: string, contrasena: string) => {
    const credenciales = await obtenerCredenciales();
    
    if (usuario === credenciales.usuario && contrasena === credenciales.contrasena) {
      setAutenticado(true);
      setNotificacion({ tipo: 'success', mensaje: 'Bienvenido al sistema' });
    } else {
      setNotificacion({ tipo: 'error', mensaje: 'Credenciales incorrectas' });
    }
  };

  const handleCerrarSesion = () => {
    setAutenticado(false);
    setSeccionActual('clientes');
    setNotificacion({ tipo: 'info', mensaje: 'Sesión cerrada' });
  };

  if (!inicializado) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Cargando aplicación...</p>
      </div>
    );
  }

  if (!autenticado) {
    return (
      <>
        <Login onLogin={handleLogin} />
        {notificacion && (
          <Notification
            type={notificacion.tipo}
            message={notificacion.mensaje}
            onClose={() => setNotificacion(null)}
          />
        )}
      </>
    );
  }

  const renderSeccion = () => {
    switch (seccionActual) {
      case 'clientes':
        return <Clientes />;
      case 'unir':
        return <Unir />;
      case 'comprimir':
        return <Comprimir />;
      case 'ajustes':
        return <Ajustes />;
      default:
        return <Clientes />;
    }
  };

  return (
    <>
      <Layout
        seccionActual={seccionActual}
        onCambiarSeccion={setSeccionActual}
        onCerrarSesion={handleCerrarSesion}
      >
        {renderSeccion()}
      </Layout>

      {notificacion && (
        <Notification
          type={notificacion.tipo}
          message={notificacion.mensaje}
          onClose={() => setNotificacion(null)}
        />
      )}
    </>
  );
}

export default App;
