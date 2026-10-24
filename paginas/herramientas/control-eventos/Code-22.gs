/**
 * SERVICIO DE RESPALDO Y EXPORTACIÓN — Control de Clasificación de Eventos
 * Google Apps Script (aplicación web). Se ejecuta con los permisos de quien lo
 * implementa; la app web del navegador NUNCA recibe credenciales de Google.
 *
 * PROPIEDADES DEL SCRIPT (Configuración del proyecto > Propiedades del script):
 *   TOKEN      -> clave compartida larga y aleatoria (la misma que se carga en la app)
 *   FOLDER_ID  -> ID de la carpeta de Google Drive de destino
 *   BACKUP_SHEET_ID -> lo crea y completa el propio script (no cargar a mano)
 *
 * ACCIONES:
 *   ping              -> valida clave y carpeta
 *   upsertControles   -> alta o actualización (por ID de evento) en la hoja de respaldo
 *   exportarHistorial -> crea una NUEVA hoja de cálculo con todo el historial en la carpeta
 *   listarControles   -> devuelve todos los controles de la hoja de respaldo (para importarlos en la app y
 *                        combinarlos con el historial local). Solo lectura: no modifica ninguna hoja.
 */

var NOMBRE_RESPALDO = 'Respaldo_Controles_Clasificacion';
var HOJA_CONTROLES = 'Controles';
var HOJA_ERRORES = 'Errores_Control';

var ENC_CONTROLES = ['ID Evento', 'Partido', 'Fecha del Evento', 'DELITOCOP', 'Clave de control', 'Estado', 'Evento exitoso',
  'Cantidad de errores', 'Fecha de creación', 'Fecha de actualización', 'Mensaje de notificación', 'Último respaldo'];
var ENC_ERRORES = ['ID Evento', 'Partido', 'Fecha del Evento', 'Orden', 'Código', 'Solapa (categoría)', 'Indicador', 'Nombre del error',
  'Mensaje técnico', 'Fecha de actualización del control'];

/** Ejecutar UNA vez manualmente desde el editor para conceder los permisos. */
function autorizar() {
  var props = PropertiesService.getScriptProperties();
  var carpeta = DriveApp.getFolderById(props.getProperty('FOLDER_ID'));
  var hoja = obtenerHojaRespaldo_(carpeta, props);
  Logger.log('Carpeta: ' + carpeta.getName() + ' | Hoja de respaldo: ' + hoja.getName());
}

function doGet() {
  return json_({ ok: false, error: 'Este servicio solo acepta solicitudes POST desde la aplicación.' });
}

function doPost(e) {
  var lock = null;
  try {
    var req = JSON.parse(e.postData.contents);
    var props = PropertiesService.getScriptProperties();

    var token = props.getProperty('TOKEN');
    if (!token) throw new Error('El script no tiene definida la propiedad TOKEN.');
    if (!req.token || !iguales_(String(req.token), token)) throw new Error('Clave de acceso inválida.');

    var folderId = props.getProperty('FOLDER_ID');
    if (!folderId) throw new Error('El script no tiene definida la propiedad FOLDER_ID.');
    var carpeta;
    try {
      carpeta = DriveApp.getFolderById(folderId);
    } catch (err) {
      throw new Error('No se puede acceder a la carpeta de Drive configurada (ID inexistente o permisos insuficientes).');
    }

    lock = LockService.getScriptLock();
    lock.waitLock(30000);

    var datos = req.datos || {};
    switch (req.accion) {
      case 'ping':
        var h = obtenerHojaRespaldo_(carpeta, props);
        return json_({ ok: true, carpeta: carpeta.getName(), hojaRespaldo: h.getName() });
      case 'upsertControles':
        return json_(upsertControles_(carpeta, props, datos.registros));
      case 'exportarHistorial':
        return json_(exportarHistorial_(carpeta, datos));
      case 'listarControles':
        return json_(listarControles_(carpeta, props));
      default:
        throw new Error('Acción desconocida: ' + req.accion);
    }
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message ? err.message : err) });
  } finally {
    if (lock) { try { lock.releaseLock(); } catch (x) {} }
  }
}

// ---------------------------------------------------------------- utilidades
function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function iguales_(a, b) {
  if (a.length !== b.length) return false;
  var r = 0;
  for (var i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

function filaControl_(c, ahora) {
  return [String(c.idEvento), String(c.partido || ''), String(c.fechaEvento || ''), String(c.delitocop || ''), String(c.claveControl || ''),
    String(c.estado || ''), c.exitoso ? 'SÍ' : 'NO', String(c.cantidadErrores || 0),
    String(c.fechaCreacion || ''), String(c.fechaActualizacion || ''), String(c.mensaje || ''), ahora];
}

function filasErrores_(c) {
  return (c.errores || []).map(function (er) {
    return [String(c.idEvento), String(c.partido || ''), String(c.fechaEvento || ''), String(er.orden), String(er.codigo || ''), String(er.solapa || ''),
      String(er.indicador || ''), String(er.nombre || ''), String(er.mensajeTecnico || ''),
      String(c.fechaActualizacion || '')];
  });
}

/** Escribe encabezado + filas como TEXTO (evita que "=..." se interprete como fórmula y conserva ceros/dígitos). */
function escribirHoja_(hoja, encabezado, filas) {
  hoja.clearContents();
  var total = [encabezado].concat(filas);
  var rango = hoja.getRange(1, 1, total.length, encabezado.length);
  rango.setNumberFormat('@');
  rango.setValues(total);
  hoja.setFrozenRows(1);
  hoja.getRange(1, 1, 1, encabezado.length).setFontWeight('bold');
}

function leerFilas_(hoja, columnas) {
  var ultima = hoja.getLastRow();
  if (ultima < 2) return [];
  return hoja.getRange(2, 1, ultima - 1, columnas).getValues();
}

function obtenerHojaRespaldo_(carpeta, props) {
  var id = props.getProperty('BACKUP_SHEET_ID');
  var ss = null;
  if (id) {
    try { ss = SpreadsheetApp.openById(id); } catch (e) { ss = null; }
  }
  if (!ss) {
    ss = SpreadsheetApp.create(NOMBRE_RESPALDO);
    DriveApp.getFileById(ss.getId()).moveTo(carpeta);
    props.setProperty('BACKUP_SHEET_ID', ss.getId());
  }
  var sc = ss.getSheetByName(HOJA_CONTROLES);
  if (!sc) {
    var primera = ss.getSheets()[0];
    if (primera && primera.getLastRow() === 0 && !ss.getSheetByName(HOJA_ERRORES)) {
      primera.setName(HOJA_CONTROLES);
      sc = primera;
    } else {
      sc = ss.insertSheet(HOJA_CONTROLES);
    }
    escribirHoja_(sc, ENC_CONTROLES, []);
  }
  if (!ss.getSheetByName(HOJA_ERRORES)) {
    escribirHoja_(ss.insertSheet(HOJA_ERRORES), ENC_ERRORES, []);
  }
  return ss;
}

// ------------------------------------------------------- respaldo (upsert)
function upsertControles_(carpeta, props, registros) {
  if (!registros || !registros.length) throw new Error('No se recibieron registros para respaldar.');
  var ss = obtenerHojaRespaldo_(carpeta, props);
  var sc = ss.getSheetByName(HOJA_CONTROLES);
  var se = ss.getSheetByName(HOJA_ERRORES);
  var ahora = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');

  var resultados = [];
  var validos = {};
  registros.forEach(function (c) {
    if (!c || !/^\d{7}$/.test(String(c.idEvento))) {
      resultados.push({ idEvento: c ? String(c.idEvento) : '', ok: false, error: 'ID de evento inválido (deben ser 7 dígitos).' });
    } else {
      validos[String(c.idEvento)] = c;
    }
  });
  var ids = Object.keys(validos);

  var filasC = leerFilas_(sc, ENC_CONTROLES.length);
  var posicion = {};
  filasC.forEach(function (f, i) { posicion[String(f[0])] = i; });
  ids.forEach(function (id) {
    var fila = filaControl_(validos[id], ahora);
    if (posicion.hasOwnProperty(id)) filasC[posicion[id]] = fila;
    else { posicion[id] = filasC.length; filasC.push(fila); }
  });
  escribirHoja_(sc, ENC_CONTROLES, filasC);

  var filasE = leerFilas_(se, ENC_ERRORES.length).filter(function (f) { return !validos.hasOwnProperty(String(f[0])); });
  ids.forEach(function (id) { filasE = filasE.concat(filasErrores_(validos[id])); });
  escribirHoja_(se, ENC_ERRORES, filasE);
  SpreadsheetApp.flush();

  var conteo = {};
  leerFilas_(se, ENC_ERRORES.length).forEach(function (f) {
    var k = String(f[0]); conteo[k] = (conteo[k] || 0) + 1;
  });
  ids.forEach(function (id) {
    resultados.push({ idEvento: id, ok: true, erroresRegistrados: conteo[id] || 0 });
  });
  return { ok: true, resultados: resultados };
}

// ------------------------------------------- lectura del respaldo (importar en la app)
/**
 * Devuelve los controles respaldados con el MISMO formato que la app envía en upsertControles
 * (cada registro lleva su arreglo "errores"), para que la app pueda importarlos y combinarlos.
 * Es solo lectura: no crea ni modifica hojas (si el respaldo aún no existe, devuelve una lista vacía).
 */
function listarControles_(carpeta, props) {
  var id = props.getProperty('BACKUP_SHEET_ID');
  if (!id) return { ok: true, registros: [] };

  var ss;
  try { ss = SpreadsheetApp.openById(id); } catch (e) {
    throw new Error('No se pudo abrir la hoja de respaldo (ID inexistente o permisos insuficientes).');
  }
  var sc = ss.getSheetByName(HOJA_CONTROLES);
  var se = ss.getSheetByName(HOJA_ERRORES);
  if (!sc) return { ok: true, registros: [] };

  // Errores agrupados por ID de evento
  var erroresPorId = {};
  if (se) {
    leerFilas_(se, ENC_ERRORES.length).forEach(function (f) {
      var k = String(f[0]).trim();
      if (!k) return;
      if (!erroresPorId[k]) erroresPorId[k] = [];
      erroresPorId[k].push({
        orden: Number(f[3]) || 0,
        codigo: String(f[4]),
        solapa: String(f[5]),
        indicador: String(f[6]),
        nombre: String(f[7]),
        mensajeTecnico: String(f[8])
      });
    });
  }

  var registros = [];
  leerFilas_(sc, ENC_CONTROLES.length).forEach(function (f) {
    var idEvento = String(f[0]).trim();
    if (!/^\d{7}$/.test(idEvento)) return;
    var errs = (erroresPorId[idEvento] || []).sort(function (a, b) { return a.orden - b.orden; });
    registros.push({
      idEvento: idEvento,
      partido: String(f[1]),
      fechaEvento: String(f[2]),
      delitocop: String(f[3]),
      claveControl: String(f[4]),
      estado: String(f[5]),
      exitoso: String(f[6]).toUpperCase().replace('Í', 'I') === 'SI',
      cantidadErrores: errs.length,
      fechaCreacion: String(f[8]),
      fechaActualizacion: String(f[9]),
      mensaje: String(f[10]),
      errores: errs
    });
  });
  return { ok: true, registros: registros };
}

// ---------------------------------------------- exportación integral (nuevo archivo)
function nombreLibre_(carpeta, base, hora) {
  var nombre = base;
  if (carpeta.getFilesByName(nombre).hasNext()) nombre = base + '_' + hora;
  var n = 2;
  while (carpeta.getFilesByName(nombre).hasNext()) { nombre = base + '_' + hora + '_' + n; n++; }
  return nombre;
}

function exportarHistorial_(carpeta, datos) {
  var registros = datos.registros;
  if (!registros || !registros.length) throw new Error('No se recibieron registros del historial.'); 

  var zona = Session.getScriptTimeZone();
  var fecha = /^\d{4}-\d{2}-\d{2}$/.test(String(datos.fecha)) ? datos.fecha : Utilities.formatDate(new Date(), zona, 'yyyy-MM-dd');
  var hora = /^\d{2}-\d{2}$/.test(String(datos.hora)) ? datos.hora : Utilities.formatDate(new Date(), zona, 'HH-mm');

  var unicos = {};
  registros.forEach(function (c) { if (c && c.idEvento) unicos[String(c.idEvento)] = c; });
  var ids = Object.keys(unicos).sort();

  var ahora = Utilities.formatDate(new Date(), zona, 'yyyy-MM-dd HH:mm:ss');
  var filasC = [], filasE = [];
  ids.forEach(function (id) {
    filasC.push(filaControl_(unicos[id], ahora));
    filasE = filasE.concat(filasErrores_(unicos[id]));
  });

  var nombre = nombreLibre_(carpeta, 'Historial_Completo_Clasificacion_' + fecha, hora);
  var ss = SpreadsheetApp.create(nombre);
  DriveApp.getFileById(ss.getId()).moveTo(carpeta);

  var hc = ss.getSheets()[0];
  hc.setName('Historial_Controles');
  var encC = ENC_CONTROLES.slice(0, ENC_CONTROLES.length - 1).concat(['Fecha de exportación']);
  escribirHoja_(hc, encC, filasC);
  var he = ss.insertSheet('Historial_Errores');
  escribirHoja_(he, ENC_ERRORES, filasE);
  SpreadsheetApp.flush();

  return {
    ok: true,
    nombre: nombre,
    url: ss.getUrl(),
    id: ss.getId(),
    carpeta: carpeta.getName(),
    registrosExportados: Math.max(hc.getLastRow() - 1, 0),
    filasErrores: Math.max(he.getLastRow() - 1, 0)
  };
}
