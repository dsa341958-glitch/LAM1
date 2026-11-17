const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const SECRET = process.env.JWT_SECRET || 'clave_secreta_empleados';

app.use(cors());
app.use(express.json());

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'empleados'
});

// Helper: responde con error 500 si falla la consulta
const responder = (res, mensaje) => (err, result) => {
  if (err) {
    console.log(err);
    return res.status(500).send(err.sqlMessage || 'Error en el servidor');
  }
  res.send(mensaje !== undefined ? mensaje : result);
};

/*LOGIN Y REGISTRO*/

app.post('/login', (req, res) => {
  const { usuario, password } = req.body;
  if (!usuario || !password) {
    return res.status(400).send('Ingrese usuario y contraseña');
  }
  db.query('SELECT * FROM usuarios WHERE usuario = ?', [usuario], (err, rows) => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error en el servidor');
    }
    if (rows.length === 0 || !bcrypt.compareSync(password, rows[0].password)) {
      return res.status(401).send('Usuario o contraseña incorrectos');
    }
    const token = jwt.sign({ id: rows[0].id, usuario: rows[0].usuario }, SECRET, { expiresIn: '8h' });
    res.send({ token, usuario: rows[0].usuario });
  });
});

app.post('/registro', (req, res) => {
  const usuario = (req.body.usuario || '').trim();
  const password = req.body.password || '';

  if (!usuario || !password) {
    return res.status(400).send('Ingrese usuario y contraseña');
  }
  if (usuario.length < 3) {
    return res.status(400).send('El usuario debe tener al menos 3 caracteres');
  }
  if (password.length < 6) {
    return res.status(400).send('La contraseña debe tener al menos 6 caracteres');
  }

  const hash = bcrypt.hashSync(password, 10);
  db.query('INSERT INTO usuarios (usuario, password) VALUES (?, ?)', [usuario, hash], (err) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).send('Ese usuario ya existe');
      }
      console.log(err);
      return res.status(500).send('Error en el servidor');
    }
    res.send('Usuario creado correctamente');
  });
});

// Todo lo que está debajo de este middleware requiere token
app.use((req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).send('No autorizado');
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch (e) {
    res.status(401).send('Sesión inválida o expirada');
  }
});

/*EMPLEADOS*/

app.get('/empleados', (req, res) => {
  db.query('SELECT * FROM empleado', responder(res));
});

app.post('/create', (req, res) => {
  const { nombre, edad, pais, cargo, correo } = req.body;
  db.query(
    'INSERT INTO empleado (nombre, edad, pais, cargo, correo) VALUES (?,?,?,?,?)',
    [nombre, edad, pais, cargo, correo],
    responder(res, 'Values Inserted')
  );
});

app.put('/update', (req, res) => {
  const { id, nombre, edad, pais, cargo, correo } = req.body;
  db.query(
    'UPDATE empleado SET nombre=?, edad=?, pais=?, cargo=?, correo=? WHERE id=?',
    [nombre, edad, pais, cargo, correo, id],
    responder(res, 'Empleado actualizado exitosamente')
  );
});

app.delete('/delete/:id', (req, res) => {
  db.query('DELETE FROM empleado WHERE id = ?', [req.params.id], responder(res, 'Empleado eliminado'));
});

/*PROYECTOS*/

app.get('/proyectos', (req, res) => {
  db.query('SELECT * FROM proyectos', responder(res));
});

app.post('/proyectos', (req, res) => {
  const { nombre_proyecto, descripcion } = req.body;
  db.query(
    'INSERT INTO proyectos (nombre_proyecto, descripcion) VALUES (?,?)',
    [nombre_proyecto, descripcion],
    responder(res, 'Proyecto registrado')
  );
});

app.put('/proyectos', (req, res) => {
  const { id, nombre_proyecto, descripcion } = req.body;
  db.query(
    'UPDATE proyectos SET nombre_proyecto=?, descripcion=? WHERE id=?',
    [nombre_proyecto, descripcion, id],
    responder(res, 'Proyecto actualizado')
  );
});

app.delete('/proyectos/:id', (req, res) => {
  db.query('DELETE FROM proyectos WHERE id = ?', [req.params.id], responder(res, 'Proyecto eliminado'));
});

/*SALARIOS*/

app.get('/salarios', (req, res) => {
  db.query(
    `SELECT s.id, s.empleado_id, e.nombre AS empleado, s.monto,
            DATE_FORMAT(s.fecha_actualizacion, '%Y-%m-%d') AS fecha_actualizacion
     FROM salario s
     INNER JOIN empleado e ON e.id = s.empleado_id
     ORDER BY s.id`,
    responder(res)
  );
});

app.post('/salarios', (req, res) => {
  const { empleado_id, monto, fecha_actualizacion } = req.body;
  db.query(
    'INSERT INTO salario (empleado_id, monto, fecha_actualizacion) VALUES (?,?,?)',
    [empleado_id, monto, fecha_actualizacion],
    responder(res, 'Salario registrado')
  );
});

app.put('/salarios', (req, res) => {
  const { id, empleado_id, monto, fecha_actualizacion } = req.body;
  db.query(
    'UPDATE salario SET empleado_id=?, monto=?, fecha_actualizacion=? WHERE id=?',
    [empleado_id, monto, fecha_actualizacion, id],
    responder(res, 'Salario actualizado')
  );
});

app.delete('/salarios/:id', (req, res) => {
  db.query('DELETE FROM salario WHERE id = ?', [req.params.id], responder(res, 'Salario eliminado'));
});

/*ASIGNACIONES*/

app.get('/asignaciones', (req, res) => {
  db.query(
    `SELECT ep.empleado_id, ep.proyecto_id,
            e.nombre AS empleado, p.nombre_proyecto AS proyecto,
            (SELECT s.monto
               FROM salario s
              WHERE s.empleado_id = ep.empleado_id
              ORDER BY s.fecha_actualizacion DESC, s.id DESC
              LIMIT 1) AS salario_actual
     FROM empleado_proyecto ep
     INNER JOIN empleado e ON e.id = ep.empleado_id
     INNER JOIN proyectos p ON p.id = ep.proyecto_id
     ORDER BY e.nombre, p.nombre_proyecto`,
    responder(res)
  );
});
app.post('/asignaciones', (req, res) => {
  const { empleado_id, proyecto_id } = req.body;
  db.query(
    'INSERT INTO empleado_proyecto (empleado_id, proyecto_id) VALUES (?,?)',
    [empleado_id, proyecto_id],
    (err) => {
      if (err) {
        console.log(err);
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).send('El empleado ya está asignado a ese proyecto');
        }
        return res.status(500).send('Error en el servidor');
      }
      res.send('Asignación registrada');
    }
  );
});

app.delete('/asignaciones/:empleado_id/:proyecto_id', (req, res) => {
  db.query(
    'DELETE FROM empleado_proyecto WHERE empleado_id = ? AND proyecto_id = ?',
    [req.params.empleado_id, req.params.proyecto_id],
    responder(res, 'Asignación eliminada')
  );
});

app.listen(3001, () => {
  console.log('Servidor corriendo en el puerto 3001');
});