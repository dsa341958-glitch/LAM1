import { useState, useMemo } from 'react';

function Tabla({ titulo, etiquetaTotal, columnas, datos, acciones, claveFila }) {
  const [buscar, setBuscar] = useState('');
  const [porPagina, setPorPagina] = useState(10);
  const [pagina, setPagina] = useState(1);
  const [orden, setOrden] = useState({ campo: null, asc: true });

  const filtrados = useMemo(() => {
    const texto = buscar.trim().toLowerCase();
    let resultado = datos;

    if (texto) {
      resultado = datos.filter((fila) =>
        columnas.some((c) => String(fila[c.campo] ?? '').toLowerCase().includes(texto))
      );
    }

    if (orden.campo) {
      resultado = [...resultado].sort((a, b) => {
        const x = a[orden.campo];
        const y = b[orden.campo];
        const sonNumeros =
          x !== null && y !== null && x !== '' && y !== '' && !isNaN(Number(x)) && !isNaN(Number(y));
        const cmp = sonNumeros
          ? Number(x) - Number(y)
          : String(x ?? '').localeCompare(String(y ?? ''), 'es');
        return orden.asc ? cmp : -cmp;
      });
    }
    return resultado;
  }, [datos, columnas, buscar, orden]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / porPagina));
  const paginaActual = Math.min(pagina, totalPaginas);
  const inicio = (paginaActual - 1) * porPagina;
  const visibles = filtrados.slice(inicio, inicio + porPagina);

  const ordenarPor = (campo) => {
    setOrden((o) => (o.campo === campo ? { campo, asc: !o.asc } : { campo, asc: true }));
  };

  const flecha = (campo) => {
    if (orden.campo !== campo) return '↕';
    return orden.asc ? '↑' : '↓';
  };

  const numeros = [];
  for (let i = 1; i <= totalPaginas; i++) {
    if (i === 1 || i === totalPaginas || Math.abs(i - paginaActual) <= 2) numeros.push(i);
  }

  return (
    <div>
      {titulo && <h2 className="lista-titulo">{titulo}</h2>}
      {etiquetaTotal && (
        <div className="lista-total">
          {etiquetaTotal}: <strong>{datos.length}</strong>
        </div>
      )}

      <div className="tabla-controles">
        <label>
          Mostrar{' '}
          <select
            value={porPagina}
            onChange={(e) => { setPorPagina(Number(e.target.value)); setPagina(1); }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>{' '}
          registros
        </label>
        <label>
          Buscar:{' '}
          <input
            type="text"
            value={buscar}
            onChange={(e) => { setBuscar(e.target.value); setPagina(1); }}
          />
        </label>
      </div>

      <div className="tabla-scroll">
        <table className="tabla-datos">
          <thead>
            <tr>
              {columnas.map((c) => (
                <th key={c.campo} onClick={() => ordenarPor(c.campo)}>
                  {c.titulo}
                  <span className="flecha">{flecha(c.campo)}</span>
                </th>
              ))}
              {acciones && <th style={{ cursor: 'default' }}>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {visibles.length === 0 ? (
              <tr>
                <td className="tabla-vacia" colSpan={columnas.length + (acciones ? 1 : 0)}>
                  No hay registros para mostrar
                </td>
              </tr>
            ) : (
              visibles.map((fila) => (
                <tr key={claveFila(fila)}>
                  {columnas.map((c) => (
                    <td key={c.campo}>{c.render ? c.render(fila) : fila[c.campo]}</td>
                  ))}
                  {acciones && <td className="celda-acciones">{acciones(fila)}</td>}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="tabla-pie">
        <span>
          {filtrados.length === 0
            ? 'Mostrando registros del 0 al 0 de un total de 0 registros'
            : `Mostrando registros del ${inicio + 1} al ${inicio + visibles.length} de un total de ${filtrados.length} registros`}
        </span>
        <div className="paginacion">
          <button disabled={paginaActual === 1} onClick={() => setPagina(1)}>Primero</button>
          <button disabled={paginaActual === 1} onClick={() => setPagina(paginaActual - 1)}>Anterior</button>
          {numeros.map((n) => (
            <button key={n} className={n === paginaActual ? 'activa' : ''} onClick={() => setPagina(n)}>
              {n}
            </button>
          ))}
          <button disabled={paginaActual === totalPaginas} onClick={() => setPagina(paginaActual + 1)}>Siguiente</button>
          <button disabled={paginaActual === totalPaginas} onClick={() => setPagina(totalPaginas)}>Último</button>
        </div>
      </div>
    </div>
  );
}

export default Tabla;