import { useState } from 'react';
import Swal from 'sweetalert2';
import api from '../api';

function Login({ onLogin }) {
  const [modoRegistro, setModoRegistro] = useState(false);
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');

  const mostrarError = (err) =>
    Swal.fire({
      title: 'Error',
      text: (err.response && err.response.data) || 'No se pudo conectar con el servidor',
      icon: 'error',
    });

  const cambiarModo = () => {
    setModoRegistro(!modoRegistro);
    setUsuario(''); setPassword(''); setConfirmar('');
  };

  const entrar = () => {
    api.post('/login', { usuario, password })
      .then((res) => {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('usuario', res.data.usuario);
        onLogin(res.data.usuario);
      })
      .catch(mostrarError);
  };

  const registrar = () => {
    if (password !== confirmar) {
      return Swal.fire({ title: 'Error', text: 'Las contraseñas no coinciden', icon: 'error' });
    }
    api.post('/registro', { usuario, password })
      .then(() => {
        Swal.fire({
          title: 'Cuenta creada',
          text: 'Ya puedes iniciar sesión con tu nuevo usuario.',
          icon: 'success',
        });
        cambiarModo();
      })
      .catch(mostrarError);
  };

  const enviar = (e) => {
    e.preventDefault();
    if (modoRegistro) registrar();
    else entrar();
  };

  return (
    <div className="login-pantalla">
      {/* Panel izquierdo */}
      <div className="login-izq">
        <svg className="login-asterisco" viewBox="0 0 100 100" aria-hidden="true">
          <g stroke="#fff" strokeWidth="9" strokeLinecap="round">
            <line x1="50" y1="8" x2="50" y2="92" />
            <line x1="8" y1="50" x2="92" y2="50" />
            <line x1="20" y1="20" x2="80" y2="80" />
            <line x1="80" y1="20" x2="20" y2="80" />
          </g>
        </svg>
        <h1>Hola,<br />Sistema de Empleados</h1>
        <p>
          Gestiona empleados, proyectos y salarios en un solo lugar.
          Organiza a tu equipo de forma rápida, ordenada y sencilla.
        </p>
      </div>

      {/* Panel derecho */}
      <div className="login-der">
        <div className="login-caja">
          <div className="login-brand">Sistema de Empleados</div>

          <h2>{modoRegistro ? 'Crea tu cuenta' : '¡Bienvenido de nuevo!'}</h2>
          <p className="login-sub">
            {modoRegistro ? '¿Ya tienes una cuenta? ' : '¿No tienes una cuenta? '}
            <button type="button" className="link-negro" onClick={cambiarModo}>
              {modoRegistro ? 'Inicia sesión' : 'Crea una cuenta nueva'}
            </button>
            {modoRegistro ? '' : '. ¡Es gratis y toma menos de un minuto!'}
          </p>

          <form onSubmit={enviar}>
            <input
              type="text"
              className="campo-linea"
              placeholder="Usuario"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              autoFocus
            />
            <input
              type="password"
              className="campo-linea"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {modoRegistro && (
              <input
                type="password"
                className="campo-linea"
                placeholder="Repetir contraseña"
                value={confirmar}
                onChange={(e) => setConfirmar(e.target.value)}
              />
            )}
            <button type="submit" className="btn-login">
              {modoRegistro ? 'Registrarme' : 'Iniciar sesión'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;