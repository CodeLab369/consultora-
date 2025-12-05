// Modal para asignar etiquetas a un cliente

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Cliente, Etiqueta } from '../../types';
import { obtenerEtiquetas } from '../../services/database';
import './ClienteEtiquetas.css';

interface ClienteEtiquetasProps {
  cliente: Cliente;
  onClose: () => void;
  onSave: (etiquetas: string[]) => void;
}

export const ClienteEtiquetas = ({ cliente, onClose, onSave }: ClienteEtiquetasProps) => {
  const [etiquetas, setEtiquetas] = useState<Etiqueta[]>([]);
  const [seleccionadas, setSeleccionadas] = useState<string[]>(cliente.etiquetas || []);

  useEffect(() => {
    cargarEtiquetas();
  }, []);

  const cargarEtiquetas = async () => {
    const etqs = await obtenerEtiquetas();
    setEtiquetas(etqs);
  };

  const toggleEtiqueta = (id: string) => {
    setSeleccionadas(prev => 
      prev.includes(id) 
        ? prev.filter(e => e !== id)
        : [...prev, id]
    );
  };

  const handleGuardar = () => {
    onSave(seleccionadas);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-etiquetas" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Asignar Etiquetas</h2>
          <button className="btn-cerrar" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p className="cliente-nombre">
            Cliente: <strong>{cliente.razonSocial}</strong>
          </p>

          {etiquetas.length === 0 ? (
            <div className="sin-etiquetas-disponibles">
              <p>No hay etiquetas disponibles.</p>
              <p>Crea etiquetas desde la sección de Ajustes.</p>
            </div>
          ) : (
            <div className="etiquetas-grid">
              {etiquetas.map(etiqueta => (
                <button
                  key={etiqueta.id}
                  className={`etiqueta-opcion ${seleccionadas.includes(etiqueta.id) ? 'selected' : ''}`}
                  onClick={() => toggleEtiqueta(etiqueta.id)}
                  style={{
                    '--etiqueta-color': etiqueta.color,
                  } as React.CSSProperties}
                >
                  <div 
                    className="etiqueta-color-badge" 
                    style={{ backgroundColor: etiqueta.color }}
                  />
                  <span>{etiqueta.nombre}</span>
                  {seleccionadas.includes(etiqueta.id) && (
                    <div className="check-mark">✓</div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-cancelar" onClick={onClose}>
            Cancelar
          </button>
          <button 
            className="btn-guardar" 
            onClick={handleGuardar}
            disabled={etiquetas.length === 0}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};
