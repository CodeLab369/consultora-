// Componente principal de la sección Clientes

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import type { Cliente, OpcionesListas } from '../../types';
import { obtenerClientes, obtenerOpciones } from '../../services/database';
import { ClientesTable } from './ClientesTable.tsx';
import { ClienteForm } from './ClienteForm.tsx';
import { ClientesFilters } from './ClientesFilters.tsx';
import './Clientes.css';

export const Clientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clientesFiltrados, setClientesFiltrados] = useState<Cliente[]>([]);
  const [opciones, setOpciones] = useState<OpcionesListas | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [clienteEditar, setClienteEditar] = useState<Cliente | undefined>(undefined);
  const [busqueda, setBusqueda] = useState('');
  const [filtros, setFiltros] = useState({
    digitoNIT: '',
    tipoEntidad: '',
    administracion: '',
    facturacion: '',
    consolidacion: ''
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [clientes, busqueda, filtros]);

  const cargarDatos = async () => {
    const clientesData = await obtenerClientes();
    const opcionesData = await obtenerOpciones();
    setClientes(clientesData);
    setOpciones(opcionesData);
  };

  const aplicarFiltros = () => {
    let resultado = [...clientes];

    // Búsqueda general
    if (busqueda) {
      const busquedaLower = busqueda.toLowerCase();
      resultado = resultado.filter(c =>
        c.nitCurCi.toLowerCase().includes(busquedaLower) ||
        c.razonSocial.toLowerCase().includes(busquedaLower) ||
        c.correo.toLowerCase().includes(busquedaLower)
      );
    }

    // Filtro por dígito NIT
    if (filtros.digitoNIT) {
      resultado = resultado.filter(c =>
        c.nitCurCi.slice(-1) === filtros.digitoNIT
      );
    }

    // Filtros de opciones
    if (filtros.tipoEntidad) {
      resultado = resultado.filter(c => c.tipoEntidad === filtros.tipoEntidad);
    }
    if (filtros.administracion) {
      resultado = resultado.filter(c => c.administracion === filtros.administracion);
    }
    if (filtros.facturacion) {
      resultado = resultado.filter(c => c.facturacion === filtros.facturacion);
    }
    if (filtros.consolidacion) {
      resultado = resultado.filter(c => c.consolidacion === filtros.consolidacion);
    }

    setClientesFiltrados(resultado);
  };

  const handleNuevoCliente = () => {
    setClienteEditar(undefined);
    setMostrarFormulario(true);
  };

  const handleEditarCliente = (cliente: Cliente) => {
    setClienteEditar(cliente);
    setMostrarFormulario(true);
  };

  const handleCerrarFormulario = () => {
    setMostrarFormulario(false);
    setClienteEditar(undefined);
  };

  const handleGuardarCliente = async () => {
    await cargarDatos();
    handleCerrarFormulario();
  };

  if (!opciones) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="clientes-section">
      <div className="section-header">
        <button className="btn-primary" onClick={handleNuevoCliente}>
          <Plus size={20} />
          Nuevo Cliente
        </button>
      </div>

      <ClientesFilters
        busqueda={busqueda}
        onBusquedaChange={setBusqueda}
        filtros={filtros}
        onFiltrosChange={setFiltros}
        opciones={opciones}
      />

      <ClientesTable
        clientes={clientesFiltrados}
        onEditar={handleEditarCliente}
        onActualizar={cargarDatos}
      />

      {mostrarFormulario && (
        <ClienteForm
          cliente={clienteEditar}
          opciones={opciones}
          onGuardar={handleGuardarCliente}
          onCancelar={handleCerrarFormulario}
        />
      )}
    </div>
  );
};
