import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from '../api';
import Tabla from './Tabla';
import { IconoBorrar } from './Iconos';

function Asignaciones() {
  const [empleadoId, setEmpleadoId] = useState('');
  const [proyectoId, setProyectoId] = useState('');
  const [lista, setLista] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [proyectos, setProyectos] = useState([]);

  const getAsignaciones = () => api.get('/asignaciones').then((r) => setLista(r.data));

  useEffect(() => {
    getAsignaciones();
    api.get('/empleados').then((r) => setEmpleados(r.data));
    api.get('/proyectos').then((r) => setProyectos(r.data));
  }, []);

  const mostrarError = (err) =>
    Swal.fire({ title: 'Error', text: (err.response && err.response.data) || 'Error', icon: 'error' });

  const asignar = () => {
    if (!empleadoId || !proyectoId) {
      return Swal.fire({ title: 'Faltan datos', text: 'Seleccione un empleado y un proyecto.', icon: 'warning' });
    }
    api.post('/asignaciones', { empleado_id: empleadoId, proyecto_id: proyectoId })
      .then(() => {
        getAsignaciones(); setEmpleadoId(''); setProyectoId('');
        Swal.fire({ title: 'Asignado', text: 'El empleado fue asignado al proyecto.', icon: 'success' });
      }).catch(mostrarError);
  };

  const quitar = (a) => {
    Swal.fire({
      title: '¿Quitar asignación?',
      text: `${a.empleado} dejará de estar en ${a.proyecto}.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, quitar',
      cancelButtonText: 'Cancelar',
    }).then((r) => {
      if (r.isConfirmed) {
        api.delete(`/asignaciones/${a.empleado_id}/${a.proyecto_id}`).then(() => {
          getAsignaciones();
          Swal.fire({ title: 'Eliminado', icon: 'success' });
        }).catch(mostrarError);
      }
    });
  };

  return (
    <div className="crud-layout">
      <div className="crud-form">
        <h3 className="crud-form-titulo">Nueva asignación</h3>

        <label className="form-label">Empleado</label>
        <select className="form-select" value={empleadoId} onChange={(e) => setEmpleadoId(e.target.value)}>
          <option value="">Seleccione empleado</option>
          {empleados.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
        </select>

        <label className="form-label">Proyecto</label>
        <select className="form-select" value={proyectoId} onChange={(e) => setProyectoId(e.target.value)}>
          <option value="">Seleccione proyecto</option>
          {proyectos.map((p) => <option key={p.id} value={p.id}>{p.nombre_proyecto}</option>)}
        </select>

        <button className="btn-oscuro" onClick={asignar}>Asignar empleado</button>
      </div>

      <div className="crud-lista">
        <Tabla
          titulo="Lista de asignaciones"
          etiquetaTotal="Total de asignaciones"
          datos={lista}
          claveFila={(f) => `${f.empleado_id}-${f.proyecto_id}`}
          columnas={[
            { titulo: 'Empleado', campo: 'empleado' },
            { titulo: 'Proyecto', campo: 'proyecto' },
            {
              titulo: 'Salario actual',
              campo: 'salario_actual',
              render: (a) => (a.salario_actual !== null ? Number(a.salario_actual).toFixed(2) : 'Sin salario'),
            },
          ]}
          acciones={(a) => (
            <button className="btn-icono btn-icono-borrar" title="Quitar" onClick={() => quitar(a)}><IconoBorrar /></button>
          )}
        />
      </div>
    </div>
  );
}

export default Asignaciones;