import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from '../api';
import Tabla from './Tabla';
import { IconoEditar, IconoBorrar } from './Iconos';

function Salarios() {
  const [empleadoId, setEmpleadoId] = useState('');
  const [monto, setMonto] = useState('');
  const [fecha, setFecha] = useState('');
  const [id, setId] = useState('');
  const [editar, setEditar] = useState(false);
  const [lista, setLista] = useState([]);
  const [empleados, setEmpleados] = useState([]);

  const getSalarios = () => api.get('/salarios').then((r) => setLista(r.data));

  useEffect(() => {
    getSalarios();
    api.get('/empleados').then((r) => setEmpleados(r.data));
  }, []);

  const cancelar = () => { setEditar(false); setEmpleadoId(''); setMonto(''); setFecha(''); setId(''); };

  const mostrarError = (err) =>
    Swal.fire({ title: 'Error', text: (err.response && err.response.data) || 'Error', icon: 'error' });

  const datos = () => ({ empleado_id: empleadoId, monto, fecha_actualizacion: fecha });

  const add = () => {
    api.post('/salarios', datos())
      .then(() => {
        getSalarios(); cancelar();
        Swal.fire({ title: 'Registro Exitoso', text: 'Salario registrado correctamente.', icon: 'success' });
      }).catch(mostrarError);
  };

  const update = () => {
    api.put('/salarios', { id, ...datos() })
      .then(() => {
        getSalarios(); cancelar();
        Swal.fire({ title: 'Actualización Exitosa', text: 'Salario actualizado correctamente.', icon: 'success' });
      }).catch(mostrarError);
  };

  const eliminar = (s) => {
    Swal.fire({
      title: '¿Eliminar?',
      text: `¿Desea eliminar este salario de ${s.empleado}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((r) => {
      if (r.isConfirmed) {
        api.delete(`/salarios/${s.id}`).then(() => {
          getSalarios(); cancelar();
          Swal.fire({ title: 'Eliminado', icon: 'success' });
        }).catch(mostrarError);
      }
    });
  };

  const editarSalario = (s) => {
    setEditar(true); setId(s.id); setEmpleadoId(s.empleado_id);
    setMonto(s.monto); setFecha(s.fecha_actualizacion);
  };

  return (
    <div className="crud-layout">
      <div className="crud-form">
        <h3 className="crud-form-titulo">{editar ? 'Editar salario' : 'Nuevo salario'}</h3>

        <label className="form-label">Empleado</label>
        <select className="form-select" value={empleadoId} onChange={(e) => setEmpleadoId(e.target.value)}>
          <option value="">Seleccione empleado</option>
          {empleados.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
        </select>

        <label className="form-label">Monto</label>
        <input type="number" step="0.01" className="form-control" value={monto}
          onChange={(e) => setMonto(e.target.value)} />

        <label className="form-label">Fecha de actualización</label>
        <input type="date" className="form-control" value={fecha}
          onChange={(e) => setFecha(e.target.value)} />

        {editar ? (
          <>
            <button className="btn-oscuro" onClick={update}>Actualizar salario</button>
            <button className="btn-claro" onClick={cancelar}>Cancelar</button>
          </>
        ) : (
          <button className="btn-oscuro" onClick={add}>Agregar salario</button>
        )}
      </div>

      <div className="crud-lista">
        <Tabla
          titulo="Lista de salarios"
          etiquetaTotal="Total de salarios"
          datos={lista}
          claveFila={(f) => f.id}
          columnas={[
            { titulo: '#', campo: 'id' },
            { titulo: 'Empleado', campo: 'empleado' },
            { titulo: 'Monto', campo: 'monto', render: (s) => Number(s.monto).toFixed(2) },
            { titulo: 'Fecha actualización', campo: 'fecha_actualizacion' },
          ]}
          acciones={(s) => (
            <>
              <button className="btn-icono btn-icono-editar" title="Editar" onClick={() => editarSalario(s)}><IconoEditar /></button>
              <button className="btn-icono btn-icono-borrar" title="Eliminar" onClick={() => eliminar(s)}><IconoBorrar /></button>
            </>
          )}
        />
      </div>
    </div>
  );
}

export default Salarios;