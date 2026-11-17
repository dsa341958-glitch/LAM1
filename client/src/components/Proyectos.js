import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from '../api';
import Tabla from './Tabla';
import { IconoVer, IconoEditar, IconoBorrar } from './Iconos';

const esc = (t) =>
  String(t ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function Proyectos() {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [id, setId] = useState('');
  const [editar, setEditar] = useState(false);
  const [lista, setLista] = useState([]);

  const getProyectos = () => api.get('/proyectos').then((r) => setLista(r.data));

  useEffect(() => { getProyectos(); }, []);

  const cancelar = () => { setEditar(false); setNombre(''); setDescripcion(''); setId(''); };

  const mostrarError = (err) =>
    Swal.fire({ title: 'Error', text: (err.response && err.response.data) || 'Error', icon: 'error' });

  const add = () => {
    api.post('/proyectos', { nombre_proyecto: nombre, descripcion })
      .then(() => {
        getProyectos(); cancelar();
        Swal.fire({ title: 'Registro Exitoso', text: 'Proyecto registrado correctamente.', icon: 'success' });
      }).catch(mostrarError);
  };

  const update = () => {
    api.put('/proyectos', { id, nombre_proyecto: nombre, descripcion })
      .then(() => {
        getProyectos(); cancelar();
        Swal.fire({ title: 'Actualización Exitosa', text: 'Proyecto actualizado correctamente.', icon: 'success' });
      }).catch(mostrarError);
  };

  const eliminar = (p) => {
    Swal.fire({
      title: '¿Eliminar?',
      text: `¿Desea eliminar el proyecto ${p.nombre_proyecto}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((r) => {
      if (r.isConfirmed) {
        api.delete(`/proyectos/${p.id}`).then(() => {
          getProyectos(); cancelar();
          Swal.fire({ title: 'Eliminado', icon: 'success' });
        }).catch(mostrarError);
      }
    });
  };

  const ver = (p) => {
    Swal.fire({
      title: 'Datos del proyecto',
      html:
        `<div style="text-align:left;line-height:1.7">` +
        `<b>Proyecto:</b> ${esc(p.nombre_proyecto)}<br>` +
        `<b>Descripción:</b> ${esc(p.descripcion) || '—'}</div>`,
      confirmButtonText: 'Cerrar',
    });
  };

  const editarProyecto = (p) => {
    setEditar(true); setId(p.id); setNombre(p.nombre_proyecto); setDescripcion(p.descripcion || '');
  };

  return (
    <div className="crud-layout">
      <div className="crud-form">
        <h3 className="crud-form-titulo">{editar ? 'Editar proyecto' : 'Nuevo proyecto'}</h3>

        <label className="form-label">Nombre del proyecto</label>
        <input type="text" className="form-control" value={nombre}
          onChange={(e) => setNombre(e.target.value)} />

        <label className="form-label">Descripción</label>
        <textarea className="form-control" rows="4" value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)} />

        {editar ? (
          <>
            <button className="btn-oscuro" onClick={update}>Actualizar proyecto</button>
            <button className="btn-claro" onClick={cancelar}>Cancelar</button>
          </>
        ) : (
          <button className="btn-oscuro" onClick={add}>Agregar proyecto</button>
        )}
      </div>

      <div className="crud-lista">
        <Tabla
          titulo="Lista de proyectos"
          etiquetaTotal="Total de proyectos"
          datos={lista}
          claveFila={(f) => f.id}
          columnas={[
            { titulo: '#', campo: 'id' },
            { titulo: 'Proyecto', campo: 'nombre_proyecto' },
            { titulo: 'Descripción', campo: 'descripcion' },
          ]}
          acciones={(p) => (
            <>
              <button className="btn-icono btn-icono-ver" title="Ver" onClick={() => ver(p)}><IconoVer /></button>
              <button className="btn-icono btn-icono-editar" title="Editar" onClick={() => editarProyecto(p)}><IconoEditar /></button>
              <button className="btn-icono btn-icono-borrar" title="Eliminar" onClick={() => eliminar(p)}><IconoBorrar /></button>
            </>
          )}
        />
      </div>
    </div>
  );
}

export default Proyectos;