import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { useState } from 'react';
import Login from './components/Login';
import Empleados from './components/Empleados';
import Proyectos from './components/Proyectos';
import Salarios from './components/Salarios';
import Asignaciones from './components/Asignaciones';

const secciones = [
  { clave: 'empleados', titulo: 'Empleados', icono: '👥', encabezado: 'Gestión de empleados' },
  { clave: 'proyectos', titulo: 'Proyectos', icono: '📁', encabezado: 'Gestión de proyectos' },
  { clave: 'salarios', titulo: 'Salarios', icono: '💰', encabezado: 'Gestión de salarios' },
  { clave: 'asignaciones', titulo: 'Asignaciones', icono: '🔗', encabezado: 'Asignación de empleados a proyectos' },
];

function App() {
  const [usuario, setUsuario] = useState(
    localStorage.getItem('token') ? localStorage.getItem('usuario') : null
  );
  const [seccion, setSeccion] = useState('empleados');
  const [menuAbierto, setMenuAbierto] = useState(window.innerWidth > 768);

  const salir = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
  };

  if (!usuario) {
    return <Login onLogin={setUsuario} />;
  }

  const actual = secciones.find((s) => s.clave === seccion);

  return (
    <div>
      <header className="topbar">
        <button className="btn-menu" onClick={() => setMenuAbierto(!menuAbierto)} aria-label="Menú">
          <span></span><span></span><span></span>
        </button>
        <div className="topbar-usuario">
          <span>{usuario}</span>
          <div className="avatar">{usuario.charAt(0)}</div>
          <button className="btn-salir" onClick={salir}>Cerrar sesión</button>
        </div>
      </header>

      <div className="cuerpo">
        <aside className={`sidebar ${menuAbierto ? '' : 'cerrado'}`}>
          {secciones.map((s) => (
            <button
              key={s.clave}
              className={`sidebar-item ${seccion === s.clave ? 'activo' : ''}`}
              onClick={() => setSeccion(s.clave)}
            >
              <span className="icono">{s.icono}</span>
              {s.titulo}
            </button>
          ))}
        </aside>

        <main className="contenido">
          <div className="contenido-interno">
            <h2 className="titulo-seccion">{actual.encabezado}</h2>
            {seccion === 'empleados' && <Empleados />}
            {seccion === 'proyectos' && <Proyectos />}
            {seccion === 'salarios' && <Salarios />}
            {seccion === 'asignaciones' && <Asignaciones />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;