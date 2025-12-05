// Componente de filtros para la sección de Clientes

import { Search } from 'lucide-react';
import type { OpcionesListas } from '../../types';
import './ClientesFilters.css';

interface Filtros {
  digitoNIT: string;
  tipoEntidad: string;
  administracion: string;
  facturacion: string;
  consolidacion: string;
  encargado: string;
}

interface ClientesFiltersProps {
  busqueda: string;
  onBusquedaChange: (valor: string) => void;
  filtros: Filtros;
  onFiltrosChange: (filtros: Filtros) => void;
  opciones: OpcionesListas;
}

export const ClientesFilters = ({
  busqueda,
  onBusquedaChange,
  filtros,
  onFiltrosChange,
  opciones
}: ClientesFiltersProps) => {
  const handleFiltroChange = (key: keyof Filtros, value: string) => {
    onFiltrosChange({ ...filtros, [key]: value });
  };

  const limpiarFiltros = () => {
    onBusquedaChange('');
    onFiltrosChange({
      digitoNIT: '',
      tipoEntidad: '',
      administracion: '',
      facturacion: '',
      consolidacion: '',
      encargado: ''
    });
  };

  const hayFiltrosActivos = busqueda || Object.values(filtros).some(f => f);

  return (
    <div className="filters-container">
      <div className="search-box">
        <Search size={20} />
        <input
          type="text"
          placeholder="Buscar por NIT, Razón Social o Correo..."
          value={busqueda}
          onChange={(e) => onBusquedaChange(e.target.value)}
        />
      </div>

      <div className="filters-grid">
        <div className="filter-group">
          <label>Dígito NIT</label>
          <select
            value={filtros.digitoNIT}
            onChange={(e) => handleFiltroChange('digitoNIT', e.target.value)}
          >
            <option value="">Todos</option>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => (
              <option key={d} value={d.toString()}>{d}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Tipo de Entidad</label>
          <select
            value={filtros.tipoEntidad}
            onChange={(e) => handleFiltroChange('tipoEntidad', e.target.value)}
          >
            <option value="">Todos</option>
            {opciones.tipoEntidad.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Administración</label>
          <select
            value={filtros.administracion}
            onChange={(e) => handleFiltroChange('administracion', e.target.value)}
          >
            <option value="">Todos</option>
            {opciones.administracion.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Facturación</label>
          <select
            value={filtros.facturacion}
            onChange={(e) => handleFiltroChange('facturacion', e.target.value)}
          >
            <option value="">Todos</option>
            {opciones.facturacion.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Consolidación</label>
          <select
            value={filtros.consolidacion}
            onChange={(e) => handleFiltroChange('consolidacion', e.target.value)}
          >
            <option value="">Todos</option>
            {opciones.consolidacion.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Encargado</label>
          <select
            value={filtros.encargado}
            onChange={(e) => handleFiltroChange('encargado', e.target.value)}
          >
            <option value="">Todos</option>
            {opciones.encargado.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      </div>

      {hayFiltrosActivos && (
        <div className="filter-actions">
          <button className="btn-clear-filters" onClick={limpiarFiltros}>
            Limpiar Filtros
          </button>
        </div>
      )}
    </div>
  );
};
