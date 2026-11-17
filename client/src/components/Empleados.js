import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from '../api';
import Tabla from './Tabla';
import { IconoVer, IconoEditar, IconoBorrar } from './Iconos';

const esc = (t) =>
  String(t ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function Empleados() {
  const [nombre, setNombre] = useState('');
  const [edad, setEdad] = useState('');
  const [pais, setPais] = useState('');
  const [cargo, setCargo] = useState('');
  const [correo, setCorreo] = useState('');
  const [id, setId] = useState('');
  const [editar, setEditar] = useState(false);
  const [lista, setLista] = useState([]);

  const getEmpleados = () => api.get('/empleados').then((r) => setLista(r.data));

  useEffect(() => { getEmpleados(); }, []);

  const cancelar = () => {
    setEditar(false);
    setNombre(''); setEdad(''); setPais(''); setCargo(''); setCorreo(''); setId('');
  };

  const mostrarError = (err) =>
    Swal.fire({ title: 'Error', text: (err.response && err.response.data) || 'Error', icon: 'error' });

  const add = () => {
    api.post('/create', { nombre, edad, pais, cargo, correo })
      .then(() => {
        getEmpleados(); cancelar();
        Swal.fire({ title: 'Registro Exitoso', text: 'El empleado ha sido registrado correctamente.', icon: 'success' });
      }).catch(mostrarError);
  };

  const update = () => {
    api.put('/update', { id, nombre, edad, pais, cargo, correo })
      .then(() => {
        getEmpleados(); cancelar();
        Swal.fire({ title: 'Actualización Exitosa', text: 'El empleado ha sido actualizado correctamente.', icon: 'success' });
      }).catch(mostrarError);
  };

  const deleteEmple = (id, nombre) => {
    Swal.fire({
      title: '¿Eliminar?',
      text: `¿Desea eliminar a ${nombre}? También se borrarán sus salarios y asignaciones.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        api.delete(`/delete/${id}`).then(() => {
          getEmpleados(); cancelar();
          Swal.fire({ title: 'Eliminado', text: `${nombre} ha sido eliminado.`, icon: 'success' });
        }).catch(mostrarError);
      }
    });
  };

  const verEmpleado = (val) => {
    Swal.fire({
      title: 'Datos del empleado',
      html:
        `<div style="text-align:left;line-height:1.9">` +
        `<b>Nombre:</b> ${esc(val.nombre)}<br>` +
        `<b>Edad:</b> ${esc(val.edad)}<br>` +
        `<b>País:</b> ${esc(val.pais)}<br>` +
        `<b>Cargo:</b> ${esc(val.cargo)}<br>` +
        `<b>Correo:</b> ${esc(val.correo)}</div>`,
      confirmButtonText: 'Cerrar',
    });
  };

  const editarEmpleado = (val) => {
    setEditar(true);
    setNombre(val.nombre); setEdad(val.edad); setPais(val.pais);
    setCargo(val.cargo); setCorreo(val.correo); setId(val.id);
  };

  const renderCampo = (etiqueta, tipo, valor, setter) => (
    <div>
      <label className="form-label">{etiqueta}</label>
      <input type={tipo} value={valor} onChange={(e) => setter(e.target.value)} className="form-control" />
    </div>
  );

  return (
    <div className="crud-layout">
      <div className="crud-form">
        <h3 className="crud-form-titulo">{editar ? 'Editar empleado' : 'Nuevo empleado'}</h3>
        {renderCampo('Nombre', 'text', nombre, setNombre)}
        {renderCampo('Edad', 'number', edad, setEdad)}
        {renderCampo('País', 'text', pais, setPais)}
        {renderCampo('Cargo', 'text', cargo, setCargo)}
        {renderCampo('Correo', 'text', correo, setCorreo)}

        {editar ? (
          <>
            <button className="btn-oscuro" onClick={update}>Actualizar empleado</button>
            <button className="btn-claro" onClick={cancelar}>Cancelar</button>
          </>
        ) : (
          <button className="btn-oscuro" onClick={add}>Agregar empleado</button>
        )}
      </div>

      <div className="crud-lista">
        <Tabla
          titulo="Lista de empleados"
          etiquetaTotal="Total de empleados"
          datos={lista}
          claveFila={(f) => f.id}
          columnas={[
            { titulo: '#', campo: 'id' },
            { titulo: 'Nombre', campo: 'nombre' },
            { titulo: 'Edad', campo: 'edad' },
            { titulo: 'País', campo: 'pais' },
            { titulo: 'Cargo', campo: 'cargo' },
            { titulo: 'Correo', campo: 'correo' },
          ]}
          acciones={(val) => (
            <>
              <button className="btn-icono btn-icono-ver" title="Ver" onClick={() => verEmpleado(val)}><IconoVer /></button>
              <button className="btn-icono btn-icono-editar" title="Editar" onClick={() => editarEmpleado(val)}><IconoEditar /></button>
              <button className="btn-icono btn-icono-borrar" title="Eliminar" onClick={() => deleteEmple(val.id, val.nombre)}><IconoBorrar /></button>
            </>
          )}
        />
      </div>
    </div>
  );
}

export default Empleados;