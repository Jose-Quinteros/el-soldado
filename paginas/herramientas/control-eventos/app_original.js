/**
 * SISTEMA DE CONTROL DE CLASIFICACIÓN DE EVENTOS CON DASHBOARD ESTADÍSTICO
 * E INFORMES PDF MULTIPÁGINA
 */

// ==========================================================================
// 1. CONSTANTES, PARTIDOS OFICIALES Y CATÁLOGOS PREDETERMINADOS
// ==========================================================================
const CONFIG_VERSION = 3;
const STORAGE_CONFIG_VERSION = "control_eventos_version_db";
const STORAGE_HISTORIAL = "control_eventos_historial_db";
const STORAGE_CATALOGO = "control_eventos_errores_db";
const STORAGE_PARTIDOS = "control_eventos_partidos_db";
const STORAGE_SOLAPAS = "control_eventos_solapas_db";
const STORAGE_ELIMINADOS = "control_eventos_errores_eliminados_db";

const ERRORES_PREDETERMINADOS = [
    { uuid: "sys-lug-001", id: "LUG-001", solapa: "Lugar", nombre: "Geo del Lugar", indicador: "GEO DEL LUGAR DEL HECHO", mensaje: "Las coordenadas cargadas no corresponden a la dirección declarada o ubican el punto fuera del rango geográfico/jurisdiccional del hecho.", tipo: "SISTEMA" },
    { uuid: "sys-lug-002", id: "LUG-002", solapa: "Lugar", nombre: "Zona del Evento", indicador: "ZONA", mensaje: "No se está clasificando la zona del evento.", tipo: "SISTEMA" },
    { uuid: "sys-lug-003", id: "LUG-003", solapa: "Lugar", nombre: "Fechas Fuera de Rango — Esclarecidas", indicador: "FECHAS ESCLARECIDAS", mensaje: "Posee Fechas Esclarecidas con fecha menor a la Fecha del Evento o no posee fecha directamente.", tipo: "SISTEMA" },
    { uuid: "sys-lug-004", id: "LUG-004", solapa: "Lugar", nombre: "Fechas Fuera de Rango — Altas", indicador: "FECHAS DE ALTA", mensaje: "Posee Fechas del Evento con fecha mayor a las Fechas de Alta. Verificar y corregir lo que corresponda.", tipo: "SISTEMA" },
    { uuid: "sys-lug-005", id: "LUG-005", solapa: "Lugar", nombre: "Horas 00:00", indicador: "HORA DEL EVENTO", mensaje: "Denuncias donde indican hora del evento. Verificar eventos que indican una hora específica.", tipo: "SISTEMA" },
    { uuid: "sys-lug-006", id: "LUG-006", solapa: "Lugar", nombre: "Control Lugar", indicador: "DESCRIPCIÓN DE LUGAR", mensaje: "Verificar si el lugar corresponde a una de las descripciones solicitadas, por ejemplo urbana, intradomiciliaria, entre otras.", tipo: "SISTEMA" },
    { uuid: "sys-lug-007", id: "LUG-007", solapa: "Lugar", nombre: "Dependencia Actuante", indicador: "JURISDICCIÓN POLICIAL", mensaje: "Inconsistencia entre la localidad asignada y la comisaría seleccionada.", tipo: "SISTEMA" },
    { uuid: "sys-lug-008", id: "LUG-008", solapa: "Lugar", nombre: "Rango Horario del Evento", indicador: "RANGO TEMPORAL DEL EVENTO", mensaje: "El espacio temporal del Inicio y la Finalización del Evento registran exactamente el mismo valor, exclusivo para eventos especificos, generando una duración de cero minutos.",  tipo: "SISTEMA" },

    { uuid: "sys-car-001", id: "CAR-001", solapa: "Carátula", nombre: "Subtipificación o Degradación del Delito Principal", indicador: "TIPO DE DELITO / TIPICIDAD", mensaje: "Se clasificó un delito menor o no violento cuando en el relato constan elementos de violencia o coerción física", tipo: "SISTEMA" },
    { uuid: "sys-car-002", id: "CAR-002", solapa: "Carátula", nombre: "Omisión de Agravantes o Calificantes Requeridas", indicador: "AGRAVANTES / CALIFICANTES DEL HECHO", mensaje: "No se registró el agravante correspondiente a pesar de que el relato menciona (Ej. el uso de armas, la participación de menores, la nocturnidad o la comisión en banda.)", tipo: "SISTEMA" },
    { uuid: "sys-car-003", id: "CAR-003", solapa: "Carátula", nombre: "Inconsistencia en el Estado de Consumación", indicador: "GRADO DE TENTATIVA O CONSUMADO", mensaje: "El hecho se clasificó como 'Tentativa' pero se declararon bienes o elementos efectivamente apoderados/sustraídos (o viceversa).", tipo: "SISTEMA" },
    { uuid: "sys-car-004", id: "CAR-004", solapa: "Carátula", nombre: "Omisión de Caratula según se verifica en el Relato", indicador: "OMISIÓN DE CARATULA", mensaje: "El hecho no presenta caratula de correlación", tipo: "SISTEMA" },
 
    { uuid: "sys-mod-001", id: "MOD-001", solapa: "Modalidad", nombre: "Omisión o Descalificación del Medio o Táctica Utilizada", indicador: "MÉTODO / TÁCTICA DELICTIVA", mensaje: "No se registró la modalidad específica del hecho (ej. Arrebato, Rompepuertas, Piratería de asfalto, Ciberdelito) impidiendo la categorización del patrón criminal.", tipo: "SISTEMA" },
    { uuid: "sys-mod-002", id: "MOD-002", solapa: "Modalidad", nombre: "Modalidad Incorrecta", indicador: "MODALIDAD INCORRECTA", mensaje: "Se están verificando modalidades fuera del contexto del evento.", tipo: "SISTEMA" },
    { uuid: "sys-mod-003", id: "MOD-003", solapa: "Modalidad", nombre: "Control Modalidades", indicador: "CONTROL MODALIDADES", mensaje: "Se verifica que el evento no posee la modalidad que le corresponde.", tipo: "SISTEMA" },
    { uuid: "sys-mod-004", id: "MOD-004", solapa: "Modalidad", nombre: "Incompatibilidad entre Modus Operandi y Entorno del Lugar", indicador: "MODALIDAD VS LUGAR DE OCURRENCIA", mensaje: "Se registró una modalidad exclusiva de interiores/inmuebles (ej. Escruche o Entradera) en un evento geolocalizado y categorizado strictly en 'Vía pública'.", tipo: "SISTEMA" },
    { uuid: "sys-mod-005", id: "MOD-005", solapa: "Modalidad", nombre: "Incongruencia entre Modalidad Seleccionada y Relato", indicador: "MODALIDAD VS NARRATIVA", mensaje: "La modalidad registrada presenta inconsistencias o contradicciones evidentes con la mecánica del hecho descrita en la narrativa.", tipo: "SISTEMA" },
    { uuid: "sys-mod-006", id: "MOD-006", solapa: "Modalidad", nombre: "Omisión de Clasificación para Índice de Vulnerabilidad Barrial", indicador: "CLASIFICACIÓN DE VULNERABILIDAD BARRIAL", mensaje: "Se desconoce la tipificación requerida por el Índice de Vulnerabilidad Barrial, omitiendo la modalidad específica necesaria para dicho análisis.", tipo: "SISTEMA" },
    { uuid: "sys-mod-007", id: "MOD-007", solapa: "Modalidad", nombre: "Asignación Ilógica de Modalidad Oportunista", indicador: "MODALIDAD OPORTUNISTA / NATURALEZA DEL HECHO", mensaje: "Se registró una modalidad oportunista de forma arbitraria o sin sustento lógico, alterando la naturaleza real del evento y distorsionando el análisis delictivo.", tipo: "SISTEMA" },
    { uuid: "sys-mod-008", id: "MOD-008", solapa: "Modalidad", nombre: "Uso Abusivo e Injustificado de 'Sin Modalidad Específica'", indicador: "ABUSO DE CATEGORÍA GENÉRICA / INDETERMINADA", mensaje: "Se seleccionó 'Sin Modalidad Específica' habiendo datos concretos en el relato para clasificar la táctica delictiva, perdiendo información crítica para el análisis.", tipo: "SISTEMA" },

    { uuid: "sys-med-002", id: "MED-002", solapa: "Medio Empleado", nombre: "Control Medio Empleado / Delitocop", indicador: "DELITOCOP / MEDIO EMPLEADO", mensaje: "El medio empleado no corresponde al evento o el Delitocop no corresponde.", tipo: "SISTEMA" },

    { uuid: "sys-rod-001", id: "ROD-001", solapa: "Rodados", nombre: "Automotores Mal Clasificados", indicador: "AUTOMOTORES", mensaje: "Verificar automotores que no corresponden o a los que les faltan datos.", tipo: "SISTEMA" },
    { uuid: "sys-rod-002", id: "ROD-002", solapa: "Rodados", nombre: "Control Carga Motovehículos", indicador: "MOTOVEHÍCULOS", mensaje: "Se verifica en el relato datos de motovehículos sin clasificar conforme lo solicita el sistema.", tipo: "SISTEMA" },
    { uuid: "sys-rod-003", id: "ROD-003", solapa: "Rodados", nombre: "Control Carga Automóviles", indicador: "AUTOMÓVILES", mensaje: "Se verifica en el relato datos de automóviles sin clasificar conforme lo solicita el sistema.", tipo: "SISTEMA" },
    { uuid: "sys-rod-004", id: "ROD-004", solapa: "Rodados", nombre: "Inconsistencia entre Rol del Vehículo y Modalidad del Delito", indicador: "ROL DEL VEHÍCULO EN EL EVENTO", mensaje: "El vehículo figura como 'Sustraído' pero el hecho principal está clasificado como 'Accidente de Tránsito'.", tipo: "SISTEMA" },
    { uuid: "sys-rod-005", id: "ROD-005", solapa: "Rodados", nombre: "Omisión de Datos del Rodado Verificables en el Relato", indicador: "DATOS DEL RODADO (DOMINIO / MARCA / MODELO)", mensaje: "Se omitió el registro de la patente, marca, modelo o color del vehículo a pesar de estar claramente explicitados en el cuerpo del acta.", tipo: "SISTEMA" },
    { uuid: "sys-rod-006", id: "ROD-006", solapa: "Rodados", nombre: "Omisión de Registro de Fuga del Rodado", indicador: "FUGA / MEDIO DE ESCAPE DEL VEHÍCULO", mensaje: "No se marcó la condición o acción de fuga del vehículo en el evento habiéndose constatado su utilización para la huida de los autores.", tipo: "SISTEMA" },
    { uuid: "sys-rod-007", id: "ROD-007", solapa: "Rodados", nombre: "Omisión del Delito o Ilícito Asociado al Rodado", indicador: "DELITO ASOCIADO AL VEHÍCULO", mensaje: "Falta asociar la tipificación o conducta delictiva específica correspondiente al rodado en la solapa correspondiente.", tipo: "SISTEMA" },
    { uuid: "sys-rod-008", id: "ROD-008", solapa: "Rodados", nombre: "Error en clasificación del Delito asociado al Rodado", indicador: "ERROR DEL DELITO ASOCIADO AL RODADO", mensaje: "Se ha tipificado la conducta delictiva de manera erronea.", tipo: "SISTEMA" },
    
    { uuid: "sys-ele-001", id: "ELE-001", solapa: "Elementos", nombre: "Control Carga de Elementos", indicador: "ELEMENTOS SUSTRAÍDOS", mensaje: "No se registra ningún elemento sustraído. Clasificar la solapa correspondiente.", tipo: "SISTEMA" },
    { uuid: "sys-ele-002", id: "ELE-002", solapa: "Elementos", nombre: "Incongruencia entre Tipo y Subtipo de Elemento", indicador: "CATEGORIZACIÓN TIPO / SUBTIPO DE ELEMENTO", mensaje: "Existe una discrepancia o falta de relación lógica entre el Tipo y el Subtipo de elemento seleccionado, generando confusión en la clasificación del bien.", tipo: "SISTEMA" },
    { uuid: "sys-ele-003", id: "ELE-003", solapa: "Elementos", nombre: "Incompatibilidad o Ambigüedad en el Rol del Elemento", indicador: "ROL DEL ELEMENTO EN EL EVENTO", mensaje: "El rol asignado al elemento (ej. Utilizado/Sustraído/Secuestrado) genera confusión o resulta incompatible con la narrativa de los hechos descrita en el relato.", tipo: "SISTEMA" },
    { uuid: "sys-ele-004", id: "ELE-004", solapa: "Elementos", nombre: "Error en la Asignación del Delito Asociado al Elemento", indicador: "DELITO ASOCIADO AL ELEMENTO", mensaje: "Se seleccionó un delito incorrecto o incoherente con respecto a la naturaleza del objeto y la acción realizada sobre el mismo durante el evento.", tipo: "SISTEMA" },
    
    { uuid: "sys-per-001", id: "PER-001", solapa: "Personas", nombre: "Edad - Es Menor? — Sin Datos", indicador: "EDAD - ES MENOR?", mensaje: "Edad registra '-1' sin información en la descripción, marcando 'Sí' en 'Es Menor?' sin sustento.", tipo: "SISTEMA" },
    { uuid: "sys-per-002", id: "PER-002", solapa: "Personas", nombre: "Edad - Es Menor? — Con Datos", indicador: "EDAD - ES MENOR?", mensaje: "Edad en -1 siendo claramente verificable en el relato.", tipo: "SISTEMA" },
    { uuid: "sys-per-003", id: "PER-003", solapa: "Personas", nombre: "Control Roles Víctima — Robo/Hurto", indicador: "ROLES VÍCTIMA", mensaje: "Cargar el rol correspondiente al evento. Los eventos de Robo/Hurto poseen un rol específico.", tipo: "SISTEMA" },
    { uuid: "sys-per-004", id: "PER-004", solapa: "Personas", nombre: "Control Roles Lesiones", indicador: "ROLES LESIONES", mensaje: "Cargar el rol específico para Lesiones. Todas las lesiones deben tener un lesionado.", tipo: "SISTEMA" },
    { uuid: "sys-per-005", id: "PER-005", solapa: "Personas", nombre: "Control Roles Homicidio", indicador: "ROLES HOMICIDIO", mensaje: "Todos los eventos de homicidio deben incluir el rol especifico a una victima de homicidio, a su vez, debe estar fallecida.", tipo: "SISTEMA" },
    { uuid: "sys-per-006", id: "PER-006", solapa: "Personas", nombre: "Control Roles Suicidio", indicador: "ROLES SUICIDIO", mensaje: "Todos los eventos de suicidio deben incluir el rol especifico a una victima de suicidio.", tipo: "SISTEMA" },    
    { uuid: "sys-per-007", id: "PER-007", solapa: "Personas", nombre: "Control Roles Violación", indicador: "ROLES VIOLACION", mensaje: "Todos los eventos de violación deben incluir el rol especifico a una victima de violación.", tipo: "SISTEMA" },
    { uuid: "sys-per-008", id: "PER-008", solapa: "Personas", nombre: "Discrepancia entre Rol de Persona y Narrativa del Evento", indicador: "ROL DE LA PERSONA (VÍCTIMA/IMPUTADO/DENUNCIANTE)", mensaje: "El rol asignado a la persona inscrita no coincide con su actuación descrita en el hecho.", tipo: "SISTEMA" },
    { uuid: "sys-per-009", id: "PER-009", solapa: "Personas", nombre: "Inconsistencia en Vínculo/Relación entre Víctima e Imputado", indicador: "RELACIÓN ENTRE INVOLUCRADOS", mensaje: "Se omitió o clasificó incorrectamente el vínculo preexistente (ej. intrafamiliar, laboral, desconocido, etc) siendo este determinante para el encuadre del análisis.", tipo: "SISTEMA" },
    { uuid: "sys-per-010", id: "PER-010", solapa: "Personas", nombre: "Incompletitud en Asignación Directa del Delito por Involucrado", indicador: "VÍNCULO PERSONA - DELITO", mensaje: "No se desmarcaron o asociaron correctamente las conductas/delitos correspondientes a cada sujeto imputado en eventos con múltiples tipologías.", tipo: "SISTEMA" },
    { uuid: "sys-per-011", id: "PER-011", solapa: "Personas", nombre: "Fecha de Nacimiento por Defecto Inconsistente", indicador: "FECHA DE NACIMIENTO POR DEFECTO", mensaje: "Se guardó una fecha genérica o por defecto del sistema, generando confusión en el rango etario real de la persona.", tipo: "SISTEMA" },
    { uuid: "sys-per-012", id: "PER-012", solapa: "Personas", nombre: "Omisión del Tipo de Lesión Presente en el Relato", indicador: "TIPOLOGÍA DE LESIÓN", mensaje: "No se especificó la clase de lesión sufrida a pesar de estar detallada en el relato.", tipo: "SISTEMA" },
    { uuid: "sys-per-013", id: "PER-013", solapa: "Personas", nombre: "Omisión de Lesión Requiriéndolo el Rol de la Persona", indicador: "LESIÓN SEGÚN ROL (VÍCTIMA/IMPUTADO)", mensaje: "El rol asignado (ej. Víctima de Lesiones o Imputado herido) requiere tipificar la lesión y la solapa figura sin registros.", tipo: "SISTEMA" },
    { uuid: "sys-per-014", id: "PER-014", solapa: "Personas", nombre: "Omisión o Incongruencia en la Causa de la Lesión", indicador: "CAUSA Y MECANISMO DE LESIÓN", mensaje: "No se registró la causa del daño o existe contradicción entre el elemento utilizado y el tipo de lesión descripto.", tipo: "SISTEMA" },
    { uuid: "sys-per-015", id: "PER-015", solapa: "Personas", nombre: "Omisión de Georreferencia del Domicilio del Involucrado", indicador: "GEORREFERENCIA DE DOMICILIO FALTANTE", mensaje: "Se ingresó la dirección de la persona pero se omitió fijar su punto georreferenciado o coordenada correspondiente.", tipo: "SISTEMA" },
    { uuid: "sys-per-016", id: "PER-016", solapa: "Personas", nombre: "Georreferencia de Domicilio Incoherente o Mal Ubicada", indicador: "GEORREFERENCIA INCONGRUENTE DE DOMICILIO", mensaje: "El punto geográfico ubicado no guarda relación con la altura, calle o localidad declarada en la descripción textual del domicilio.", tipo: "SISTEMA" },
    { uuid: "sys-per-017", id: "PER-017", solapa: "Personas", nombre: "Marcación de 'Desconoce Domicilio' Habiendo Datos en el Relato", indicador: "DESCONOCE DOMICILIO INCORRECTO", mensaje: "Se seleccionó la opción 'Desconoce Domicilio' contándose con la dirección de la persona en la síntesis del hecho.", tipo: "SISTEMA" },
    { uuid: "sys-per-018", id: "PER-018", solapa: "Personas", nombre: "Omisión de Domicilio Presente en el Relato", indicador: "OMISIÓN DE DOMICILIO", mensaje: "Se omitió el domicilio del involucrado existiendo los datos filiatorios detallados en el cuerpo del acta.", tipo: "SISTEMA" },
    { uuid: "sys-per-019", id: "PER-019", solapa: "Personas", nombre: "Error en la Clasificación del Sexo del Involucrado", indicador: "SEXO DE LA PERSONA", mensaje: "El sexo registrado no coincide con lo volcado en el relato.", tipo: "SISTEMA" },
    { uuid: "sys-per-020", id: "PER-020", solapa: "Personas", nombre: "Error en la Registración del Género del Involucrado", indicador: "GÉNERO DE LA PERSONA", mensaje: "Falta especificar o se cargó de manera errónea la identidad de género de la persona involucrada.", tipo: "SISTEMA" },
    { uuid: "sys-per-021", id: "PER-021", solapa: "Personas", nombre: "Discrepancia entre Sexo Biológico e Identidad de Género", indicador: "DIVERGENCIA SEXO / GÉNERO", mensaje: "Existe inconsistencia entre los campos de sexo de nacimiento y género asignado sin la correspondiente aclaración que lo fundamente.", tipo: "SISTEMA" },
    { uuid: "sys-per-022", id: "PER-022", solapa: "Personas", nombre: "Error en el Cálculo o Registro de la Edad", indicador: "EDAD DEL INVOLUCRADO", mensaje: "La edad registrada no concuerda con la fecha de nacimiento ingresada o con el tramo etario mencionado en el hecho.", tipo: "SISTEMA" },
    { uuid: "sys-per-023", id: "PER-023", solapa: "Personas", nombre: "Omisión de Edad Presente en el Relato", indicador: "OMISIÓN DE EDAD", mensaje: "No se completó el campo edad a pesar de estar explícitamente mencionada en la narrativa del evento.", tipo: "SISTEMA" },
    
    { uuid: "sys-arm-001", id: "ARM-001", solapa: "Armas", nombre: "Omisión de Atributos Técnicos del Arma Secuestrada", indicador: "TIPO, CALIBRE Y ROL DEL ARMA", mensaje: "Se declaró el secuestro de un arma pero no se clasificaron sus datos básicos (tipo, calibre, aptitud para el disparo o rol en el hecho).", tipo: "SISTEMA" },
    { uuid: "sys-arm-002", id: "ARM-002", solapa: "Armas", nombre: "Incongruencia entre Tipo de Arma y Calibre según Relato", indicador: "TIPO Y CALIBRE DE ARMA", mensaje: "El calibre registrado no corresponde ni es compatible con el tipo de arma o la especificación técnica volcada en el relato.", tipo: "SISTEMA" },
    { uuid: "sys-arm-003", id: "ARM-003", solapa: "Armas", nombre: "Omisión del Rol del Arma en el Evento", indicador: "ROL DEL ARMA EN EL HECHO", mensaje: "Falta especificar la función del arma dentro del evento (empleada, secuestrada, hallada o sustraida) siendo verificable en la narrativa.", tipo: "SISTEMA" },
    { uuid: "sys-arm-004", id: "ARM-004", solapa: "Armas", nombre: "Discrepancia entre el Arma del Relato y el Catálogo de Clasificación", indicador: "TIPO DE ARMA NO CORRESPONDIENTE", mensaje: "El elemento o herramienta descrita en la síntesis no se encuadra correctamente dentro de la categoría o tipo de arma seleccionada.", tipo: "SISTEMA" },
    { uuid: "sys-arm-005", id: "ARM-005", solapa: "Armas", nombre: "Omisión de Datos sobre la Utilización del Arma", indicador: "USO / UTILIZACIÓN DEL ARMA", mensaje: "No se registra si se utilizó el arma durante el suceso o no.", tipo: "SISTEMA" },
    { uuid: "sys-arm-006", id: "ARM-006", solapa: "Armas", nombre: "Omisión de la Fuerza de Seguridad Pertinente", indicador: "TIPO DE FUERZA DE SEGURIDAD", mensaje: "Se omitió especificar la fuerza institucional a la que pertenece el arma oficial involucrada o secuestrada en el procedimiento.", tipo: "SISTEMA" },

    { uuid: "sys-tra-001", id: "TRA-001", solapa: "Accidente Tránsito", nombre: "Inconsistencia entre Mecánica Vial y Delito Culposo Registrado", indicador: "TIPO DE ACCIDENTE / MECÁNICA VIAL", mensaje: "El Tipo de Accidente contradice la cantidad de vehículos registrados (ej. Univehicular/Peatón) o el tipo de delito (Homicidio/Lesiones Culposas).", tipo: "SISTEMA" },
    { uuid: "sys-tra-002", id: "TRA-002", solapa: "Accidente Tránsito", nombre: "Omisión de Condiciones de Infraestructura y Vía Pública", indicador: "INFRAESTRUCTURA Y ESTADO DE LA VÍA", mensaje: "Falta clasificar la señalización, reductor de velocidad o estado de la calzada en siniestros viales con víctimas graves o fatales.", tipo: "SISTEMA" },
    { uuid: "sys-tra-003", id: "TRA-003", solapa: "Accidente Tránsito", nombre: "Discrepancia entre Clasificación del Delito y Narrativa del Siniestro", indicador: "CLASIFICACIÓN DEL DELITO EN SINIESTRO VIAL", mensaje: "La tipificación del delito asignada al hecho vial no se corresponde con la descripción de las lesiones, daños o conducta de los conductores expresada en la síntesis del relato.", tipo: "SISTEMA" },
    { uuid: "sys-tra-004", id: "TRA-004", solapa: "Accidente Tránsito", nombre: "Incongruencia en la Cantidad o Tipo de Vehículos Involucrados", indicador: "VEHÍCULOS INVOLUCRADOS VS RELATO", mensaje: "La cantidad, categoría o rol de los vehículos registrados en la solapa de tránsito contradice lo expuesto en la narrativa del evento.", tipo: "SISTEMA" },

    { uuid: "sys-dro-001", id: "DRO-001", solapa: "Drogas", nombre: "Falta de Clasificación de Sustancia y Unidad de Medición", indicador: "TIPO, CANTIDAD Y UNIDAD DE DROGA", mensaje: "Se declaró un procedimiento por estupefacientes pero no se determinó la sustancia hallada/secuestrada o su pesaje/unidad correspondiente.", tipo: "SISTEMA" },
    { uuid: "sys-dro-002", id: "DRO-002", solapa: "Drogas", nombre: "Incoherencia entre Procedimiento de Drogas y Carátula Principal", indicador: "TIPO DE PROCEDIMIENTO VS CARÁTULA", mensaje: "Se registró secuestro de sustancias bajo carátulas no vinculadas a infracción a la Ley de Drogas sin justificación ni acta complementaria.", tipo: "SISTEMA" },
    { uuid: "sys-dro-003", id: "DRO-003", solapa: "Drogas", nombre: "Incoherencia en el Tipo de Carátula del Procedimiento", indicador: "TIPO DE CARÁTULA EN DROGAS", mensaje: "Existe una contradicción entre el tipo de carátula seleccionada y la intervención de estupefacientes registrada en el procedimiento.", tipo: "SISTEMA" },
    { uuid: "sys-dro-004", id: "DRO-004", solapa: "Drogas", nombre: "Omisión de Coordenadas Geográficas Solicitadas", indicador: "COORDENADAS / GEOLOCALIZACIÓN DEL PROCEDIMIENTO", mensaje: "No se ingresaron las coordenadas geográficas requeridas para precisar el lugar exacto del hallazgo o procedimiento por drogas.", tipo: "SISTEMA" },
    { uuid: "sys-dro-005", id: "DRO-005", solapa: "Drogas", nombre: "Omisión de Registro de Drogas Específicas Involucradas", indicador: "SUSTANCIAS / DROGAS ESPECÍFICAS", mensaje: "Falta agregar o clasificar la sustancia específica involucrada en el hecho habiéndose constatado el secuestro o presencia de estupefacientes.", tipo: "SISTEMA" },
    
    { uuid: "sys-err-001", id: "ERR-001", solapa: "Errores Varios", nombre: "Cuadrante", indicador: "CUADRANTE INCORRECTO", mensaje: "Se devuelve para la corrección del Cuadrante.", tipo: "SISTEMA" },
    { uuid: "sys-err-002", id: "ERR-002", solapa: "Errores Varios", nombre: "Solapa incorrecta", indicador: "SOLAPA INCORRECTA / FALTANTE", mensaje: "La solapa correspondiente no se corresponde al evento.", tipo: "SISTEMA" }
];

const SOLAPAS_PREDETERMINADAS = [
    { id: "sol-1", nombre: "Lugar", tipo: "SISTEMA" },
    { id: "sol-2", nombre: "Modalidad", tipo: "SISTEMA" },
    { id: "sol-3", nombre: "Medio Empleado", tipo: "SISTEMA" },
    { id: "sol-4", nombre: "Rodados", tipo: "SISTEMA" },
    { id: "sol-5", nombre: "Elementos", tipo: "SISTEMA" },
    { id: "sol-6", nombre: "Personas", tipo: "SISTEMA" },
    { id: "sol-7", nombre: "Caratulas", tipo: "SISTEMA" },
    { id: "sol-8", nombre: "Armas", tipo: "SISTEMA" },
    { id: "sol-9", nombre: "Accidente Tránsito", tipo: "SISTEMA" },
    { id: "sol-10", nombre: "Drogas", tipo: "SISTEMA" },
    { id: "sol-11", nombre: "Errores Varios", tipo: "SISTEMA" }
];

const PARTIDOS_PREDETERMINADOS = [
    "Almirante Brown", "Avellaneda", "Berazategui", "Berisso", "Ensenada",
    "Escobar", "Esteban Echeverría", "Ezeiza", "Florencio Varela", "San Martín",
    "Hurlingham", "Ituzaingó", "José C. Paz", "La Matanza", "La Plata", 
    "Lanús", "Lomas de Zamora", "Malvinas Argentinas", "Merlo", "Moreno", 
    "Morón", "Pilar", "Quilmes", "San Fernando", "San Isidro", 
    "San Miguel", "Tigre", "Tres de Febrero", "Vicente López"
].map((nombre, i) => ({ id: `par-${i + 1}`, nombre, tipo: "SISTEMA" }));

const PARTIDOS_OFICIALES_PBA = [
    "Adolfo Alsina", "Adolfo Gonzáles Chaves", "Alberti", "Almirante Brown", "Arrecifes", "Avellaneda", "Ayacucho",
    "Azul", "Bahía Blanca", "Balcarce", "Baradero", "Benito Juárez", "Berazategui", "Berisso",
    "Bolívar", "Bragado", "Brandsen", "Campana", "Cañuelas", "Capitán Sarmiento", "Carlos Casares", "Carlos Tejedor",
    "Carmen de Areco", "Castelli", "Chacabuco", "Chascomús", "Chivilcoy", "Colón", "Coronel de Marina Leonardo Rosales",
    "Coronel Dorrego", "Coronel Pringles", "Coronel Suárez", "Daireaux", "Dolores", "Ensenada", "Escobar", "Esteban Echeverría",
    "Exaltación de la Cruz", "Ezeiza", "Florencio Varela", "Florentino Ameghino", "General Alvarado", "General Alvear",
    "General Arenales", "General Belgrano", "General Guido", "General Juan Madariaga", "General La Madrid", "General Las Heras",
    "General Lavalle", "General San Martín", "San Martín", "General Viamonte", "General Villegas", "Guaminí", "Hipólito Yrigoyen",
    "Hurlingham", "Ituzaingó", "José C. Paz", "Junín", "La Costa", "La Matanza", "La Plata", "Lanús", "Lapprida", "Las Flores",
    "Leandro N. Alem", "Lezama", "Lincoln", "Lobería", "Lobos", "Lomas de Zamora", "Luján", "Magdalena", "Maipú",
    "Malvinas Argentinas", "Mar Chiquita", "Marcos Paz", "Mercedes", "Merlo", "San Miguel", "Monte", "Monte Hermoso",
    "Moreno", "Morón", "Navarro", "Necochea", "Nueve de Julio", "Olavarría", "Patagones", "Pehuajó", "Pellegrini",
    "Pergamino", "Pila", "Pilar", "Pinamar", "Presidente Perón", "Puan", "Punta Indio", "Quilmes", "Ramallo", "Rauch",
    "Rivadavia", "Rojas", "Roque Pérez", "Saavedra", "Saladillo", "Salliqueló", "Salto", "San Andrés de Giles",
    "San Antonio de Areco", "San Cayetano", "San Fernando", "San Isidro", "San Nicolás", "San Pedro", "San Vicente",
    "Suipacha", "Tandil", "Tapalqué", "Tigre", "Tordillo", "Tornquist", "Trenque Lauquen", "Tres Lomas", "Tres de Febrero",
    "Tres Arroyos", "Vicente López", "Villa Gesell", "Villarino", "Zárate"
];

// ==========================================================================
// 2. ESTADO GLOBAL EN MEMORIA & REPOSITORIO DE GRÁFICOS
// ==========================================================================
let errores = [];
let erroresEliminadosSystema = [];
let partidos = [];
let listaSolapas = [];
let controlActivo = null;
let esModificado = false;
let solapaActiva = "Lugar";
let pendingImportData = null;
let importTargetMode = "CONFIG";

// Instancias de Chart.js
let chartIndSolapasInstance = null;
let chartIndCodigosInstance = null;
let chartIndEvolucionInstance = null;
let chartCompBarrasInstance = null;

// Criterio de Ordenamiento
let ordenTablaInd = { columna: "cantidad", ascendente: false };

// ==========================================================================
// 3. INICIALIZACIÓN Y PERSISTENCIA (LOCALSTORAGE)
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
    cargarYMigrarDatosStorage();
    inicializarUI();
    vincularEventos();
});

function generarUUID() {
    return 'id-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
}

function normalizarTexto(txt) {
    return txt ? txt.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase() : "";
}

function cargarYMigrarDatosStorage() {
    const v = parseInt(localStorage.getItem(STORAGE_CONFIG_VERSION) || "1");

    // 1. SOLAPAS
    const storageSolapas = localStorage.getItem(STORAGE_SOLAPAS);
    if (!storageSolapas) {
        listaSolapas = JSON.parse(JSON.stringify(SOLAPAS_PREDETERMINADAS));
        guardarSolapasStorage();
    } else {
        const rawSolapas = JSON.parse(storageSolapas);
        listaSolapas = rawSolapas.map(s => {
            if (typeof s === "string") {
                const pre = SOLAPAS_PREDETERMINADAS.find(p => p.nombre.toLowerCase() === s.toLowerCase());
                return { id: pre ? pre.id : generarUUID(), nombre: s, tipo: pre ? "SISTEMA" : "PERSONALIZADO" };
            }
            return s;
        });
        if (v < CONFIG_VERSION) guardarSolapasStorage();
    }

    // 2. PARTIDOS
    const storagePartidos = localStorage.getItem(STORAGE_PARTIDOS);
    if (!storagePartidos) {
        partidos = JSON.parse(JSON.stringify(PARTIDOS_PREDETERMINADOS));
        guardarPartidosStorage();
    } else {
        const rawPartidos = JSON.parse(storagePartidos);
        partidos = rawPartidos.map(p => {
            if (typeof p === "string") {
                const pre = PARTIDOS_PREDETERMINADOS.find(pt => pt.nombre.toLowerCase() === p.toLowerCase());
                return { id: pre ? pre.id : generarUUID(), nombre: p, tipo: pre ? "SISTEMA" : "PERSONALIZADO" };
            }
            return p;
        });
        if (v < CONFIG_VERSION) guardarPartidosStorage();
    }

    // 3. ELIMINADOS DE SISTEMA
    const storageEliminados = localStorage.getItem(STORAGE_ELIMINADOS);
    erroresEliminadosSystema = storageEliminados ? JSON.parse(storageEliminados) : [];

    // 4. ERRORES
    const storageErrores = localStorage.getItem(STORAGE_CATALOGO);
    if (!storageErrores) {
        errores = JSON.parse(JSON.stringify(ERRORES_PREDETERMINADOS));
        guardarErroresStorage();
    } else {
        const rawErrores = JSON.parse(storageErrores);
        errores = rawErrores.map(e => {
            if (!e.uuid) e.uuid = generarUUID();
            if (!e.tipo) {
                const pre = ERRORES_PREDETERMINADOS.find(p => p.id === e.id);
                e.tipo = pre ? "SISTEMA" : "PERSONALIZADO";
            }
            return e;
        });
        if (v < CONFIG_VERSION) guardarErroresStorage();
    }

    localStorage.setItem(STORAGE_CONFIG_VERSION, CONFIG_VERSION.toString());
}

function obtenerHistorialStorage() {
    const storage = localStorage.getItem(STORAGE_HISTORIAL);
    return storage ? JSON.parse(storage) : {};
}

function guardarHistorialStorage(historial) {
    localStorage.setItem(STORAGE_HISTORIAL, JSON.stringify(historial));
}

function guardarErroresStorage() {
    localStorage.setItem(STORAGE_CATALOGO, JSON.stringify(errores));
}

function guardarSolapasStorage() {
    localStorage.setItem(STORAGE_SOLAPAS, JSON.stringify(listaSolapas));
}

function guardarPartidosStorage() {
    localStorage.setItem(STORAGE_PARTIDOS, JSON.stringify(partidos));
}

function guardarEliminadosStorage() {
    localStorage.setItem(STORAGE_ELIMINADOS, JSON.stringify(erroresEliminadosSystema));
}

function buscarControlPorId(id) {
    const historial = obtenerHistorialStorage();
    return historial[id] || null;
}

// ==========================================================================
// 4. INTERFAZ Y NAVEGACIÓN
// ==========================================================================
function inicializarUI() {
    poblarSelectoresPartidos();
    poblarSelectoresSolapasAdmin();
    renderizarSolapas();
    renderizarCatErroresAdmin();
    renderizarSolapasAdmin();
    renderizarPartidosAdmin();

    if (listaSolapas.length > 0) {
        solapaActiva = listaSolapas[0].nombre;
    }
}

function vincularEventos() {
    // --- NAVEGACIÓN LATERAL (SIDEBAR COLAPSABLE & HAMBURGUESA) ---
    const sidebar = document.getElementById("sidebar");
    const btnToggle = document.getElementById("btn-toggle-sidebar");
    const btnClose = document.getElementById("btn-close-sidebar");

    btnToggle.addEventListener("click", () => {
        sidebar.classList.toggle("collapsed");
    });

    if (btnClose) {
        btnClose.addEventListener("click", () => {
            sidebar.classList.add("collapsed");
        });
    }

    // Ocultar el menú lateral al hacer clic fuera de él
    document.addEventListener("click", (e) => {
        if (!sidebar.contains(e.target) && !btnToggle.contains(e.target) && !sidebar.classList.contains("collapsed")) {
            sidebar.classList.add("collapsed");
        }
    });

    document.querySelectorAll(".nav-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const secId = e.currentTarget.getAttribute("data-sec");
            const targetBtn = e.currentTarget;

            if (esModificado) {
                if (confirm("Hay cambios no guardados en el control actual. ¿Desea continuar sin guardar?")) {
                    esModificado = false;
                    cambiarSeccion(secId, targetBtn);
                }
            } else {
                cambiarSeccion(secId, targetBtn);
            }

            // Ocultar sidebar al seleccionar una sección
            sidebar.classList.add("collapsed");
        });
    });

    document.querySelectorAll(".sub-nav-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const subId = e.currentTarget.getAttribute("data-sub");
            document.querySelectorAll(".sub-nav-btn").forEach(b => b.classList.remove("active"));
            document.querySelectorAll(".sub-section-content").forEach(s => s.classList.add("hidden"));

            e.currentTarget.classList.add("active");
            document.getElementById(subId).classList.remove("hidden");
        });
    });

    const inputInicio = document.getElementById("input-id-inicio");
    inputInicio.addEventListener("input", (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, "").slice(0, 7);
        validarIDInicio();
    });

    document.getElementById("btn-iniciar-control").addEventListener("click", iniciarControlFlow);

    document.getElementById("select-partido").addEventListener("change", (e) => {
        if (controlActivo) {
            controlActivo.partido = e.target.value;
            esModificado = true;
            actualizarMensajeYResumen();
        }
    });

    // Panel Control
    document.getElementById("btn-nuevo-control").addEventListener("click", solicitarNuevoControl);
    document.getElementById("btn-limpiar-errores").addEventListener("click", limpiarErroresSeleccionados);
    document.getElementById("btn-copiar-mensaje").addEventListener("click", copiarMensaje);
    document.getElementById("btn-guardar-control").addEventListener("click", guardarControl);
    document.getElementById("btn-imprimir-control").addEventListener("click", () => window.print());

    // Solapas Modal
    document.getElementById("btn-abrir-modal-solapa").addEventListener("click", abrirModalSolapa);
    document.getElementById("btn-cerrar-modal-solapa").addEventListener("click", cerrarModalSolapa);
    document.getElementById("btn-guardar-solapa").addEventListener("click", guardarNuevaSolapaModal);

    // Filtros Dashboard Individual
    document.getElementById("filtro-partido").addEventListener("change", actualizarDashboardIndividual);
    document.getElementById("filtro-preset").addEventListener("change", (e) => {
        const customGrp = document.getElementById("grp-fechas-individual");
        if (e.target.value === "CUSTOM") customGrp.classList.remove("hidden");
        else customGrp.classList.add("hidden");
        actualizarDashboardIndividual();
    });
    document.getElementById("f-fecha-desde").addEventListener("change", actualizarDashboardIndividual);
    document.getElementById("f-fecha-hasta").addEventListener("change", actualizarDashboardIndividual);
    document.getElementById("btn-copiar-ids").addEventListener("click", copiarIDsAgrupados);

    // PDF Individual
    document.getElementById("btn-generar-pdf-individual").addEventListener("click", generarInformePDFIndividual);

    // Módulo Comparativo
    document.getElementById("btn-ejecutar-comparativa").addEventListener("click", analizarComparativa);
    document.getElementById("btn-generar-pdf-comparativo").addEventListener("click", generarComparativaPDF);

    // Administración - Errores
    document.getElementById("form-error").addEventListener("submit", guardarAdminError);
    document.getElementById("btn-cancelar-admin-error").addEventListener("click", resetearFormAdminError);
    document.getElementById("btn-restaurar-errores").addEventListener("click", restaurarErroresPredeterminados);
    document.getElementById("btn-restaurar-eliminados").addEventListener("click", restaurarErroresEliminados);
    document.getElementById("btn-exportar-errores").addEventListener("click", exportarConfiguracionJSON);
    document.getElementById("input-importar-errores").addEventListener("change", (e) => { importTargetMode = "CONFIG"; cargarImportacionJSON(e); });
    document.getElementById("buscar-error").addEventListener("input", renderizarCatErroresAdmin);
    document.getElementById("admin-solapa").addEventListener("change", sugerirCodigoError);

    // Administración - Solapas
    document.getElementById("form-solapa").addEventListener("submit", guardarAdminSolapa);
    document.getElementById("btn-cancelar-admin-solapa").addEventListener("click", resetearFormAdminSolapa);

    // Administración - Partidos
    document.getElementById("form-partido").addEventListener("submit", guardarAdminPartido);
    document.getElementById("btn-cancelar-admin-partido").addEventListener("click", resetearFormAdminPartido);
    document.getElementById("buscar-partido").addEventListener("input", renderizarPartidosAdmin);

    // Respaldo Sistema
    document.getElementById("btn-exportar-todo").addEventListener("click", exportarSistemaCompletoJSON);
    document.getElementById("input-importar-todo").addEventListener("change", (e) => { importTargetMode = "TODO"; cargarImportacionJSON(e); });

    // Modal Importación
    document.getElementById("btn-import-combinar").addEventListener("click", () => procesarImportacion("COMBINAR"));
    document.getElementById("btn-import-reemplazar").addEventListener("click", () => procesarImportacion("REEMPLAZAR"));
    document.getElementById("btn-import-cancelar").addEventListener("click", () => {
        pendingImportData = null;
        document.getElementById("modal-importar").classList.add("hidden");
    });

    document.getElementById("btn-eliminar-historial").addEventListener("click", eliminarHistorial);

    window.addEventListener("beforeunload", (e) => {
        if (esModificado) {
            e.preventDefault();
            e.returnValue = "";
        }
    });
}

function cambiarSeccion(secId, btnElement) {
    document.querySelectorAll(".section-content").forEach(s => s.classList.add("hidden"));
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));

    document.getElementById(secId).classList.remove("hidden");
    if (btnElement) btnElement.classList.add("active");

    if (secId === "sec-historial") renderizarHistorial();
    if (secId === "sec-estadisticas") actualizarDashboardIndividual();
    if (secId === "sec-admin") {
        renderizarCatErroresAdmin();
        renderizarSolapasAdmin();
        renderizarPartidosAdmin();
    }
}

function poblarSelectoresPartidos() {
    const selControl = document.getElementById("select-partido");
    const selFiltro = document.getElementById("filtro-partido");
    const selComp = document.getElementById("comp-partido");

    selControl.innerHTML = `<option value="">-- Seleccionar Partido --</option>`;
    selFiltro.innerHTML = `<option value="">-- Seleccionar Partido --</option>`;
    if (selComp) selComp.innerHTML = `<option value="">-- Seleccionar Partido --</option>`;

    partidos.slice().sort((a,b) => a.nombre.localeCompare(b.nombre)).forEach(p => {
        const opt1 = document.createElement("option");
        opt1.value = p.nombre;
        opt1.textContent = p.nombre + (p.tipo === "PERSONALIZADO" ? " (Pers.)" : "");
        selControl.appendChild(opt1);

        const opt2 = document.createElement("option");
        opt2.value = p.nombre;
        opt2.textContent = p.nombre;
        selFiltro.appendChild(opt2);

        if (selComp) {
            const opt3 = document.createElement("option");
            opt3.value = p.nombre;
            opt3.textContent = p.nombre;
            selComp.appendChild(opt3);
        }
    });
}

function poblarSelectoresSolapasAdmin() {
    const selSolapa = document.getElementById("admin-solapa");
    selSolapa.innerHTML = "";
    listaSolapas.forEach(s => {
        const opt = document.createElement("option");
        opt.value = s.nombre;
        opt.textContent = s.nombre + (s.tipo === "PERSONALIZADO" ? " (Pers.)" : "");
        selSolapa.appendChild(opt);
    });
}

// ==========================================================================
// 5. GESTIÓN DINÁMICA DE SOLAPAS Y FORMULARIOS
// ==========================================================================
function abrirModalSolapa() {
    document.getElementById("input-nueva-solapa").value = "";
    document.getElementById("modal-solapa").classList.remove("hidden");
}

function cerrarModalSolapa() {
    document.getElementById("modal-solapa").classList.add("hidden");
}

function guardarNuevaSolapaModal() {
    const nombre = document.getElementById("input-nueva-solapa").value.trim();
    if (crearSolapaLogica(nombre)) {
        solapaActiva = nombre;
        renderizarSolapas();
        renderizarTablaErrores();
        cerrarModalSolapa();
    }
}

function crearSolapaLogica(nombre) {
    if (!nombre) {
        mostrarToast("Ingrese un nombre válido para la solapa.");
        return false;
    }

    const existe = listaSolapas.some(s => s.nombre.toLowerCase() === nombre.toLowerCase());
    if (existe) {
        mostrarToast("Esa solapa ya existe.");
        return false;
    }

    const nuevaSolapa = { id: generarUUID(), nombre: nombre, tipo: "PERSONALIZADO" };

    listaSolapas.push(nuevaSolapa);
    guardarSolapasStorage();
    poblarSelectoresSolapasAdmin();
    renderizarSolapasAdmin();
    renderizarSolapas();
    mostrarToast(`Solapa "${nombre}" agregada correctamente.`);
    return true;
}

function renderizarSolapasAdmin() {
    const tbody = document.getElementById("tbody-admin-solapas");
    if (!tbody) return;
    tbody.innerHTML = "";

    listaSolapas.forEach((item, index) => {
        const cantErrores = errores.filter(e => e.solapa.toLowerCase() === item.nombre.toLowerCase()).length;
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td><strong>${item.nombre}</strong></td>
            <td><span class="badge-estado ${item.tipo === 'SISTEMA' ? 'badge-en-control' : 'badge-corregido'}">${item.tipo}</span></td>
            <td>${cantErrores} errores</td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="cargarEdicionSolapa(${index})">✏️</button>
                <button class="btn btn-danger btn-sm" onclick="eliminarSolapa(${index})">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function guardarAdminSolapa(e) {
    e.preventDefault();
    const idx = parseInt(document.getElementById("admin-solapa-index").value);
    const nuevoNombre = document.getElementById("admin-solapa-nombre").value.trim();

    if (!nuevoNombre) {
        mostrarToast("Nombre de solapa no válido.");
        return;
    }

    if (idx === -1) {
        crearSolapaLogica(nuevoNombre);
    } else {
        const solapaObj = listaSolapas[idx];
        const nombreAnterior = solapaObj.nombre;

        if (nombreAnterior.toLowerCase() !== nuevoNombre.toLowerCase()) {
            const existe = listaSolapas.some((s, i) => i !== idx && s.nombre.toLowerCase() === nuevoNombre.toLowerCase());
            if (existe) {
                mostrarToast("Ya existe otra solapa con este nombre.");
                return;
            }

            solapaObj.nombre = nuevoNombre;
            errores.forEach(err => {
                if (err.solapa.toLowerCase() === nombreAnterior.toLowerCase()) {
                    err.solapa = nuevoNombre;
                }
            });

            if (solapaActiva.toLowerCase() === nombreAnterior.toLowerCase()) {
                solapaActiva = nuevoNombre;
            }

            guardarErroresStorage();
            guardarSolapasStorage();
            poblarSelectoresSolapasAdmin();
            renderizarSolapas();
            renderizarCatErroresAdmin();
            renderizarSolapasAdmin();
            mostrarToast("Solapa y errores asociados actualizados correctamente.");
        }
    }

    resetearFormAdminSolapa();
}

function cargarEdicionSolapa(index) {
    const item = listaSolapas[index];
    document.getElementById("admin-solapa-index").value = index;
    document.getElementById("admin-solapa-nombre").value = item.nombre;
    document.getElementById("titulo-form-solapa").textContent = "EDITAR SOLAPA";
    document.getElementById("btn-cancelar-admin-solapa").classList.remove("hidden");
}

function resetearFormAdminSolapa() {
    document.getElementById("admin-solapa-index").value = "-1";
    document.getElementById("form-solapa").reset();
    document.getElementById("titulo-form-solapa").textContent = "ADMINISTRAR SOLAPAS";
    document.getElementById("btn-cancelar-admin-solapa").classList.add("hidden");
}

function eliminarSolapa(index) {
    const solapaObj = listaSolapas[index];

    if (solapaObj.tipo === "SISTEMA") {
        alert("Las solapas por defecto del SISTEMA no pueden ser eliminadas directamente.");
        return;
    }

    const erroresAsociados = errores.filter(e => e.solapa.toLowerCase() === solapaObj.nombre.toLowerCase());

    if (erroresAsociados.length > 0) {
        const msg = `Esta solapa contiene ${erroresAsociados.length} errores. Si continúa, los errores asociados serán eliminados del catálogo actual (sin afectar los controles históricos). ¿Desea continuar?`;
        if (!confirm(msg)) return;
    } else {
        if (!confirm(`¿Está seguro de eliminar la solapa "${solapaObj.nombre}"?`)) return;
    }

    errores = errores.filter(e => e.solapa.toLowerCase() !== solapaObj.nombre.toLowerCase());
    listaSolapas.splice(index, 1);

    if (solapaActiva.toLowerCase() === solapaObj.nombre.toLowerCase()) {
        solapaActiva = listaSolapas.length > 0 ? listaSolapas[0].nombre : "";
    }

    guardarErroresStorage();
    guardarSolapasStorage();
    poblarSelectoresSolapasAdmin();
    renderizarSolapas();
    renderizarCatErroresAdmin();
    renderizarSolapasAdmin();
    mostrarToast("Solapa eliminada correctamente.");
}

// ==========================================================================
// 6. REGISTRO Y CONTROL DE EVENTOS
// ==========================================================================
function validarIDInicio() {
    const val = document.getElementById("input-id-inicio").value;
    const errSpan = document.getElementById("error-id-inicio");
    if (val.length > 0 && val.length !== 7) {
        errSpan.classList.remove("hidden");
        return false;
    } else {
        errSpan.classList.add("hidden");
        return val.length === 7;
    }
}

function iniciarControlFlow() {
    const inputVal = document.getElementById("input-id-inicio").value.trim();
    if (inputVal.length !== 7) {
        mostrarToast("El ID debe contener exactamente 7 números.");
        return;
    }

    const controlExistente = buscarControlPorId(inputVal);

    if (controlExistente) {
        const abrir = confirm(`EL ID ${inputVal} YA POSEE UN CONTROL REGISTRADO.\n\n¿Desea Cargar el Control Existente?`);
        if (abrir) abrirControlExistente(controlExistente);
        else document.getElementById("input-id-inicio").value = "";
    } else {
        crearNuevoControlFormulario(inputVal);
    }
}

function crearNuevoControlFormulario(id) {
    const ahoraISO = new Date().toISOString();
    controlActivo = {
        idEvento: id,
        partido: "",
        fechaCreacion: ahoraISO,
        fechaActualizacion: ahoraISO,
        estado: "EN CONTROL",
        erroresSeleccionados: [],
        snapshotErrores: {},
        cantidadErrores: 0,
        mensaje: ""
    };

    desplegarPanelTrabajo(controlActivo, formatearFechaMostrar(ahoraISO));
    esModificado = false;
}

function abrirControlExistente(control) {
    controlActivo = JSON.parse(JSON.stringify(control));
    desplegarPanelTrabajo(controlActivo, formatearFechaMostrar(controlActivo.fechaCreacion));
    document.getElementById("select-partido").value = controlActivo.partido || "";
    esModificado = false;
    actualizarMensajeYResumen();
}

function desplegarPanelTrabajo(control, fechaMostrar) {
    document.getElementById("lbl-id-evento").textContent = control.idEvento;
    document.getElementById("lbl-fecha-control").textContent = fechaMostrar;

    actualizarBadgeEstado(control.estado);

    document.getElementById("pantalla-inicio").classList.add("hidden");
    document.getElementById("panel-trabajo").classList.remove("hidden");

    renderizarSolapas();
    renderizarTablaErrores();
    actualizarMensajeYResumen();
}

function actualizarBadgeEstado(estado) {
    const badge = document.getElementById("badge-estado-control");
    badge.textContent = estado;
    badge.className = "badge-estado";
    if (estado === "EN CONTROL") badge.classList.add("badge-en-control");
    else if (estado === "PENDIENTE DE CORRECCIÓN") badge.classList.add("badge-pendiente");
    else if (estado === "CORREGIDO") badge.classList.add("badge-corregido");
}

function renderizarSolapas() {
    const container = document.getElementById("tabs-header");
    container.innerHTML = "";
    listaSolapas.forEach(solapa => {
        const btn = document.createElement("button");
        btn.className = `tab-btn ${solapa.nombre === solapaActiva ? "active" : ""}`;
        btn.textContent = solapa.nombre.toUpperCase();
        btn.onclick = () => {
            solapaActiva = solapa.nombre;
            renderizarSolapas();
            renderizarTablaErrores();
        };
        container.appendChild(btn);
    });
}

function renderizarTablaErrores() {
    const tbody = document.getElementById("tbody-errores");
    tbody.innerHTML = "";
    if (!controlActivo) return;

    const erroresSolapa = errores.filter(e => e.solapa.toLowerCase() === solapaActiva.toLowerCase());

    if (erroresSolapa.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color: var(--text-muted);">No hay errores definidos para la solapa "${solapaActiva}". Agregue nuevos errores en la sección Administración.</td></tr>`;
        return;
    }

    erroresSolapa.forEach(item => {
        const indexOrden = controlActivo.erroresSeleccionados.indexOf(item.id);
        const isSelected = indexOrden !== -1;

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td style="text-align: center;">
                <input type="checkbox" ${isSelected ? "checked" : ""} data-id="${item.id}">
            </td>
            <td><strong>${item.id}</strong></td>
            <td>${item.nombre} ${isSelected ? `<span class="badge-estado badge-en-control">#${indexOrden + 1}</span>` : ""}</td>
            <td>${item.indicador || "—"}</td>
        `;

        tr.querySelector("input").addEventListener("change", (e) => {
            esModificado = true;
            seleccionarError(item, e.target.checked);
        });

        tbody.appendChild(tr);
    });
}

function seleccionarError(itemErr, checked) {
    if (!controlActivo.snapshotErrores) controlActivo.snapshotErrores = {};

    if (checked) {
        if (!controlActivo.erroresSeleccionados.includes(itemErr.id)) {
            controlActivo.erroresSeleccionados.push(itemErr.id);
        }
        controlActivo.snapshotErrores[itemErr.id] = {
            id: itemErr.id,
            solapa: itemErr.solapa,
            nombre: itemErr.nombre,
            indicador: itemErr.indicador,
            mensaje: itemErr.mensaje
        };
    } else {
        controlActivo.erroresSeleccionados = controlActivo.erroresSeleccionados.filter(i => i !== itemErr.id);
    }
    renderizarTablaErrores();
    actualizarMensajeYResumen();
}

function actualizarMensajeYResumen() {
    if (!controlActivo) return;

    const listaResumen = document.getElementById("lista-resumen-solapas");
    const lblTotal = document.getElementById("lbl-total-errores");
    listaResumen.innerHTML = "";

    const totalGlobal = controlActivo.erroresSeleccionados.length;
    controlActivo.cantidadErrores = totalGlobal;
    lblTotal.textContent = totalGlobal;

    const conteoSolapas = {};
    controlActivo.erroresSeleccionados.forEach(idCode => {
        let errObj = errores.find(e => e.id === idCode) || (controlActivo.snapshotErrores && controlActivo.snapshotErrores[idCode]);
        if (errObj) {
            conteoSolapas[errObj.solapa] = (conteoSolapas[errObj.solapa] || 0) + 1;
        }
    });

    Object.entries(conteoSolapas).forEach(([solapa, count]) => {
        const li = document.createElement("li");
        li.innerHTML = `<span>${solapa.toUpperCase()}</span> <strong>${count}</strong>`;
        listaResumen.appendChild(li);
    });

    const box = document.getElementById("contenedor-mensaje");
    if (totalGlobal === 0) {
        const msgVacio = `CONTROL DE CLASIFICACIÓN DE EVENTO ID: ${controlActivo.idEvento} - PARTIDO: ${controlActivo.partido ? controlActivo.partido.toUpperCase() : "SIN SELECCIONAR"}\nSIN ERRORES DETECTADOS.`;
        box.textContent = msgVacio;
        controlActivo.mensaje = msgVacio;
        return;
    }

    let msg = `CONTROL DE CLASIFICACIÓN DE EVENTO\n\n`;
    msg += `ID: ${controlActivo.idEvento}\n`;
    msg += `PARTIDO: ${controlActivo.partido ? controlActivo.partido.toUpperCase() : "SIN SELECCIONAR"}\n\n`;
    msg += `ERRORES DETECTADOS (${totalGlobal})\n\n`;

    controlActivo.erroresSeleccionados.forEach((idErr, idx) => {
        let errObj = errores.find(e => e.id === idErr) || (controlActivo.snapshotErrores && controlActivo.snapshotErrores[idErr]);
        if (errObj) {
            const numOrden = idx + 1;
            const titulo = errObj.indicador ? errObj.indicador.toUpperCase() : errObj.nombre.toUpperCase();
            msg += `${numOrden}. [${errObj.solapa.toUpperCase()}] ${titulo}:\n${errObj.mensaje}\n\n`;
        }
    });

    msg += `Se solicita verificar y corregir los aspectos señalados.`;
    box.textContent = msg;
    controlActivo.mensaje = msg;
}

function guardarControl() {
    if (!controlActivo || controlActivo.idEvento.length !== 7) return;
    if (!controlActivo.partido) {
        mostrarToast("Debe seleccionar un Partido antes de guardar.");
        return;
    }

    const historial = obtenerHistorialStorage();
    const id = controlActivo.idEvento;
    const ahoraISO = new Date().toISOString();
    const cantidadErrores = controlActivo.erroresSeleccionados.length;

    let estadoFinal = cantidadErrores > 0 ? "PENDIENTE DE CORRECCIÓN" : "CORREGIDO";

    if (historial[id]) {
        controlActivo.fechaCreacion = historial[id].fechaCreacion;
    } else {
        controlActivo.fechaCreacion = ahoraISO;
    }

    controlActivo.fechaActualizacion = ahoraISO;
    controlActivo.estado = estadoFinal;
    controlActivo.cantidadErrores = cantidadErrores;

    historial[id] = controlActivo;
    guardarHistorialStorage(historial);

    actualizarBadgeEstado(estadoFinal);
    esModificado = false;
    mostrarToast("✅ Control guardado exitosamente.");
}

function solicitarNuevoControl() {
    if (esModificado && confirm("Hay cambios sin guardar. ¿Desea descartarlos?")) {
        resetearFormularioControl();
    } else if (!esModificado) {
        resetearFormularioControl();
    }
}

function resetearFormularioControl() {
    controlActivo = null;
    esModificado = false;
    document.getElementById("input-id-inicio").value = "";
    document.getElementById("panel-trabajo").classList.add("hidden");
    document.getElementById("pantalla-inicio").classList.remove("hidden");
}

function limpiarErroresSeleccionados() {
    if (!controlActivo) return;
    controlActivo.erroresSeleccionados = [];
    esModificado = true;
    renderizarTablaErrores();
    actualizarMensajeYResumen();
}

function copiarMensaje() {
    const text = document.getElementById("contenedor-mensaje").textContent;
    navigator.clipboard.writeText(text).then(() => mostrarToast("¡Mensaje copiado al portapapeles!"));
}

// ==========================================================================
// 7. HISTORIAL DE CONTROLES
// ==========================================================================
function renderizarHistorial() {
    const tbody = document.getElementById("tbody-historial");
    tbody.innerHTML = "";
    const historial = obtenerHistorialStorage();
    const lista = Object.values(historial);

    if (lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No hay controles guardados.</td></tr>`;
        return;
    }

    lista.sort((a, b) => new Date(b.fechaActualizacion) - new Date(a.fechaActualizacion));

    lista.forEach(item => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${item.idEvento}</strong></td>
            <td>${item.partido || "-"}</td>
            <td>${formatearFechaMostrar(item.fechaActualizacion)}</td>
            <td><span class="badge-estado">${item.cantidadErrores} Errores</span></td>
            <td>
                <button class="btn btn-info btn-sm btn-abrir">👁️ Ver</button>
                <button class="btn btn-danger btn-sm btn-eliminar">🗑️</button>
            </td>
        `;

        tr.querySelector(".btn-abrir").onclick = () => {
            cambiarSeccion("sec-control", document.querySelector('[data-sec="sec-control"]'));
            abrirControlExistente(item);
        };

        tr.querySelector(".btn-eliminar").onclick = () => {
            if (confirm(`¿Eliminar control ID ${item.idEvento}?`)) {
                const h = obtenerHistorialStorage();
                delete h[item.idEvento];
                guardarHistorialStorage(h);
                renderizarHistorial();
            }
        };

        tbody.appendChild(tr);
    });
}

function eliminarHistorial() {
    if (confirm("¿Vaciar todo el historial de controles?")) {
        localStorage.removeItem(STORAGE_HISTORIAL);
        renderizarHistorial();
        mostrarToast("Historial eliminado.");
    }
}

// ==========================================================================
// 8. CÁLCULO Y FILTRADO POR PARTIDO + PERÍODO
// ==========================================================================
function resolverRangoFechas(preset, fDesdeRaw, fHastaRaw) {
    const ahora = new Date();
    let dStart = null;
    let dEnd = null;

    if (preset === "ESTE_MES") {
        dStart = new Date(ahora.getFullYear(), ahora.getMonth(), 1, 0, 0, 0);
        dEnd = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0, 23, 59, 59);
    } else if (preset === "MES_ANTERIOR") {
        dStart = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1, 0, 0, 0);
        dEnd = new Date(ahora.getFullYear(), ahora.getMonth(), 0, 23, 59, 59);
    } else if (preset === "ULTIMOS_3_MESES") {
        dStart = new Date(ahora.getFullYear(), ahora.getMonth() - 2, 1, 0, 0, 0);
        dEnd = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0, 23, 59, 59);
    } else if (preset === "ULTIMOS_6_MESES") {
        dStart = new Date(ahora.getFullYear(), ahora.getMonth() - 5, 1, 0, 0, 0);
        dEnd = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0, 23, 59, 59);
    } else if (preset === "ESTE_ANO") {
        dStart = new Date(ahora.getFullYear(), 0, 1, 0, 0, 0);
        dEnd = new Date(ahora.getFullYear(), 11, 31, 23, 59, 59);
    } else if (preset === "ANO_ANTERIOR") {
        dStart = new Date(ahora.getFullYear() - 1, 0, 1, 0, 0, 0);
        dEnd = new Date(ahora.getFullYear() - 1, 11, 31, 23, 59, 59);
    } else if (preset === "CUSTOM" || (fDesdeRaw && fHastaRaw)) {
        if (fDesdeRaw) dStart = new Date(fDesdeRaw + "T00:00:00");
        if (fHastaRaw) dEnd = new Date(fHastaRaw + "T23:59:59");
    }

    return { dStart, dEnd };
}

function obtenerEventosFiltrados(partido, preset, fDesdeRaw, fHastaRaw) {
    const historial = obtenerHistorialStorage();
    let controles = Object.values(historial);

    if (partido) {
        controles = controles.filter(c => c.partido === partido);
    }

    const { dStart, dEnd } = resolverRangoFechas(preset, fDesdeRaw, fHastaRaw);

    if (dStart) {
        controles = controles.filter(c => new Date(c.fechaActualizacion) >= dStart);
    }
    if (dEnd) {
        controles = controles.filter(c => new Date(c.fechaActualizacion) <= dEnd);
    }

    return controles.sort((a, b) => new Date(a.fechaActualizacion) - new Date(b.fechaActualizacion));
}

function calcularEstadisticasPartido(controles) {
    const totalEventos = controles.length;
    let totalErrores = 0;
    let eventosSinError = 0;
    let eventosConError = 0;

    const conteoSolapas = {};
    const conteoErrores = {};

    listaSolapas.forEach(s => conteoSolapas[s.nombre] = 0);

    let primerRegistro = null;
    let ultimoRegistro = null;

    controles.forEach((c, idx) => {
        const fechaObj = new Date(c.fechaActualizacion);
        if (idx === 0 || fechaObj < primerRegistro) primerRegistro = fechaObj;
        if (idx === 0 || fechaObj > ultimoRegistro) ultimoRegistro = fechaObj;

        const numErr = c.erroresSeleccionados ? c.erroresSeleccionados.length : 0;
        if (numErr === 0) {
            eventosSinError++;
        } else {
            eventosConError++;
            c.erroresSeleccionados.forEach(errId => {
                totalErrores++;
                conteoErrores[errId] = (conteoErrores[errId] || 0) + 1;

                let errObj = errores.find(e => e.id === errId) || (c.snapshotErrores && c.snapshotErrores[errId]);
                if (errObj) {
                    conteoSolapas[errObj.solapa] = (conteoSolapas[errObj.solapa] || 0) + 1;
                }
            });
        }
    });

    const promedioErrores = totalEventos > 0 ? (totalErrores / totalEventos).toFixed(2) : "0.00";
    const pctConError = totalEventos > 0 ? ((eventosConError / totalEventos) * 100).toFixed(1) : "0.0";

    return {
        totalEventos,
        totalErrores,
        eventosSinError,
        eventosConError,
        promedioErrores,
        pctConError,
        conteoSolapas,
        conteoErrores,
        primerRegistro: primerRegistro ? formatearFechaCorta(primerRegistro) : "Sin datos",
        ultimoRegistro: ultimoRegistro ? formatearFechaCorta(ultimoRegistro) : "Sin datos"
    };
}

function calcularEvolucionTemporal(controles) {
    if (controles.length === 0) return { labels: [], data: [] };

    const minDate = new Date(controles[0].fechaActualizacion);
    const maxDate = new Date(controles[controles.length - 1].fechaActualizacion);
    const diffDias = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24));

    const agrupado = {};

    controles.forEach(c => {
        const d = new Date(c.fechaActualizacion);
        let key = "";
        if (diffDias <= 31) {
            key = `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`;
        } else if (diffDias <= 180) {
            const sem = Math.ceil(d.getDate() / 7);
            key = `S${sem} ${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
        } else {
            key = `${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
        }

        const numErr = c.erroresSeleccionados ? c.erroresSeleccionados.length : 0;
        agrupado[key] = (agrupado[key] || 0) + numErr;
    });

    return {
        labels: Object.keys(agrupado),
        data: Object.values(agrupado)
    };
}

// ==========================================================================
// 9. DASHBOARD INDIVIDUAL & EVALUACIÓN DE GRAVEDAD E IMPACTO
// ==========================================================================
function actualizarDashboardIndividual() {
    const partido = document.getElementById("filtro-partido").value;
    const preset = document.getElementById("filtro-preset").value;
    const fDesdeRaw = document.getElementById("f-fecha-desde").value;
    const fHastaRaw = document.getElementById("f-fecha-hasta").value;

    const containerCards = document.getElementById("cards-estadisticas-ind");
    const containerInfo = document.getElementById("lista-info-analisis");
    const containerText = document.getElementById("contenedor-resumen-descriptivo-ind");

    if (!partido) {
        containerCards.innerHTML = `<div class="stat-card" style="grid-column: 1/-1;"><p style="font-size:0.9rem; color:var(--text-muted);">Seleccione un partido para activar el dashboard estadístico.</p></div>`;
        containerInfo.innerHTML = `<li><span>Estado:</span> <strong>Sin partido seleccionado</strong></li>`;
        containerText.textContent = "Seleccione un partido y período para calcular las estadísticas correspondientes.";
        document.getElementById("kpi-count-alto").textContent = "0";
        document.getElementById("kpi-count-medio").textContent = "0";
        document.getElementById("kpi-count-bajo").textContent = "0";
        limpiarGraficosIndividuales();
        renderizarTablaIndividualErrores([], 0, []);
        renderizarTablaIndividualSolapas({}, 0);
        renderizarTablaIndividualEventos([]);
        return;
    }

    const controles = obtenerEventosFiltrados(partido, preset, fDesdeRaw, fHastaRaw);
    const stats = calcularEstadisticasPartido(controles);

    if (stats.totalEventos === 0) {
        containerCards.innerHTML = `
            <div class="stat-card"><h4>EVENTOS ANALIZADOS</h4><p>0</p></div>
            <div class="stat-card"><h4>ERRORES DETECTADOS</h4><p>0</p></div>
            <div class="stat-card"><h4>EVENTOS CON ERRORES</h4><p>0</p></div>
            <div class="stat-card"><h4>EVENTOS SIN ERRORES</h4><p>0</p></div>
            <div class="stat-card"><h4>PROMEDIO / EVENTO</h4><p>0.00</p></div>
            <div class="stat-card"><h4>% EVENTOS CON ERROR</h4><p>0%</p></div>
        `;

        containerInfo.innerHTML = `
            <li><span>Partido Seleccionado:</span> <strong>${partido}</strong></li>
            <li><span>Período Analizado:</span> <strong>${preset}</strong></li>
            <li><span>Cantidad de Eventos:</span> <strong>0</strong></li>
            <li><span>Resultado:</span> <strong>SIN DATOS (No existen registros)</strong></li>
        `;

        containerText.textContent = `SIN DATOS: No existen registros para el partido ${partido} en el período seleccionado.`;
        document.getElementById("kpi-count-alto").textContent = "0";
        document.getElementById("kpi-count-medio").textContent = "0";
        document.getElementById("kpi-count-bajo").textContent = "0";
        limpiarGraficosIndividuales();
        renderizarTablaIndividualErrores([], 0, []);
        renderizarTablaIndividualSolapas({}, 0);
        renderizarTablaIndividualEventos([]);
        return;
    }

    // TARJETAS
    containerCards.innerHTML = `
        <div class="stat-card"><h4>EVENTOS ANALIZADOS</h4><p>${stats.totalEventos}</p></div>
        <div class="stat-card"><h4>ERRORES DETECTADOS</h4><p style="color:var(--danger);">${stats.totalErrores}</p></div>
        <div class="stat-card"><h4>EVENTOS CON ERRORES</h4><p style="color:var(--warning);">${stats.eventosConError}</p></div>
        <div class="stat-card"><h4>EVENTOS SIN ERRORES</h4><p style="color:var(--success);">${stats.eventosSinError}</p></div>
        <div class="stat-card"><h4>PROMEDIO / EVENTO</h4><p>${stats.promedioErrores}</p></div>
        <div class="stat-card"><h4>% EVENTOS CON ERROR</h4><p>${stats.pctConError}%</p></div>
    `;

    // INFO
    const { dStart, dEnd } = resolverRangoFechas(preset, fDesdeRaw, fHastaRaw);
    containerInfo.innerHTML = `
        <li><span>Partido Seleccionado:</span> <strong>${partido}</strong></li>
        <li><span>Período Analizado:</span> <strong>${preset}</strong></li>
        <li><span>Fecha Inicial:</span> <strong>${dStart ? formatearFechaCorta(dStart) : stats.primerRegistro}</strong></li>
        <li><span>Fecha Final:</span> <strong>${dEnd ? formatearFechaCorta(dEnd) : stats.ultimoRegistro}</strong></li>
        <li><span>Cantidad de Eventos:</span> <strong>${stats.totalEventos}</strong></li>
        <li><span>Controles Realizados:</span> <strong>${stats.totalEventos}</strong></li>
        <li><span>Cantidad de Errores:</span> <strong>${stats.totalErrores}</strong></li>
        <li><span>Primer Registro Real:</span> <strong>${stats.primerRegistro}</strong></li>
        <li><span>Último Registro Real:</span> <strong>${stats.ultimoRegistro}</strong></li>
    `;

    // CÁLCULO DE NIVELES DE GRAVEDAD / IMPACTO KPI
    let cantAlto = 0, cantMedio = 0, cantBajo = 0;
    Object.values(stats.conteoErrores).forEach(cant => {
        const pct = stats.totalErrores > 0 ? (cant / stats.totalErrores) * 100 : 0;
        if (pct > 20) cantAlto++;
        else if (pct >= 10) cantMedio++;
        else cantBajo++;
    });

    document.getElementById("kpi-count-alto").textContent = cantAlto;
    document.getElementById("kpi-count-medio").textContent = cantMedio;
    document.getElementById("kpi-count-bajo").textContent = cantBajo;

    // DESCRIPCIÓN CON INFORME Y CONCLUSIÓN FORMAL
    const textoDescriptivo = generarTextoDescriptivoFormal(partido, preset, dStart, dEnd, stats);
    containerText.textContent = textoDescriptivo;

    // GRÁFICOS
    actualizarGraficosIndividuales(stats, controles);

    // TABLAS
    renderizarTablaIndividualErrores(Object.entries(stats.conteoErrores), stats.totalErrores, controles);
    renderizarTablaIndividualSolapas(stats.conteoSolapas, stats.totalErrores);
    renderizarTablaIndividualEventos(controles);

    // IDs
    const arrayIDs = controles.map(c => `'${c.idEvento}'`);
    document.getElementById("contenedor-ids-agrupados").textContent = arrayIDs.length > 0 ? arrayIDs.join('. ') + '.' : "Sin datos";
}

function generarTextoDescriptivoFormal(partido, preset, dStart, dEnd, stats) {
    const fInicioStr = dStart ? formatearFechaCorta(dStart) : stats.primerRegistro;
    const fFinStr = dEnd ? formatearFechaCorta(dEnd) : stats.ultimoRegistro;

    if (stats.totalErrores === 0) {
        return `INFORME FORMAL DE CLASIFICACIÓN\n\nDurante el período evaluado (${fInicioStr} a ${fFinStr}) para la jurisdicción de ${partido}, no se han detectado inconsistencias en la muestra analizada (${stats.totalEventos} eventos).\n\nCONCLUSIÓN: Los procesos de carga cumplen con los estándares de calidad vigentes. Se recomienda mantener los controles de rutina habituales.`;
    }

    let solapaTop = "-";
    let maxS = -1;
    Object.entries(stats.conteoSolapas).forEach(([s, c]) => { if (c > maxS) { maxS = c; solapaTop = s; } });

    let errTopCod = "-";
    let maxE = -1;
    Object.entries(stats.conteoErrores).forEach(([cod, cant]) => { if (cant > maxE) { maxE = cant; errTopCod = cod; } });

    let errObj = errores.find(e => e.id === errTopCod);

    let doc = `INFORME ESTADÍSTICO DE CONTROL DE CALIDAD Y CLASIFICACIÓN\n\n`;
    doc += `Durante el período comprendido entre el ${fInicioStr} y el ${fFinStr}, se auditaron ${stats.totalEventos} eventos en la jurisdicción de ${partido}, registrándose un total de ${stats.totalErrores} inconsistencias técnicas de carga.\n\n`;
    doc += `DETERMINACIÓN DE PUNTOS CRÍTICOS:\n`;
    doc += `• La categoría con mayor concentración de fallas corresponde a "${solapaTop.toUpperCase()}", representando el ${Math.round((maxS / stats.totalErrores) * 100)}% del total de las observaciones de la muestra.\n`;
    if (errObj) {
        doc += `• La falla específica de mayor gravedad relativa por frecuencia es "${errObj.nombre}" (${errTopCod}) acumulando ${maxE} registros desestimados.\n\n`;
    }
    doc += `CONCLUSIÓN FORMAL Y DIRECCIONAMIENTO DE ESFUERZOS:\n`;
    doc += `Los esfuerzos operativos institucionales deben enfocar prioritariamente los recursos de capacitación, supervisión y auditoría de campo sobre los procesos de carga de la categoría "${solapaTop.toUpperCase()}". Específicamente, se requiere instrumentar un control rígido al momento del volcado de datos primarios para erradicar las inconsistencias asociadas a "${errObj ? errObj.nombre : 'las fallas principales'}", optimizando de forma inmediata la precisión global de las clasificaciones.`;

    return doc;
}

// ==========================================================================
// 10. GENERACIÓN Y MANEJO DE GRÁFICOS (CHART.JS)
// ==========================================================================
function limpiarGraficosIndividuales() {
    if (chartIndSolapasInstance) { chartIndSolapasInstance.destroy(); chartIndSolapasInstance = null; }
    if (chartIndCodigosInstance) { chartIndCodigosInstance.destroy(); chartIndCodigosInstance = null; }
    if (chartIndEvolucionInstance) { chartIndEvolucionInstance.destroy(); chartIndEvolucionInstance = null; }
}

function actualizarGraficosIndividuales(stats, controles) {
    limpiarGraficosIndividuales();

    // 1. CHART SOLAPAS
    const ctxSol = document.getElementById("chart-ind-solapas").getContext("2d");
    chartIndSolapasInstance = new Chart(ctxSol, {
        type: "bar",
        data: {
            labels: Object.keys(stats.conteoSolapas),
            datasets: [{
                label: "Errores por Solapa",
                data: Object.values(stats.conteoSolapas),
                backgroundColor: "#2563eb"
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, animation: false }
    });

    // 2. CHART CÓDIGOS (TOP 5)
    const top5Errores = Object.entries(stats.conteoErrores).sort((a,b) => b[1] - a[1]).slice(0, 5);
    const ctxCod = document.getElementById("chart-ind-codigos").getContext("2d");
    chartIndCodigosInstance = new Chart(ctxCod, {
        type: "bar",
        data: {
            labels: top5Errores.map(e => e[0]),
            datasets: [{
                label: "Cantidad de Errores",
                data: top5Errores.map(e => e[1]),
                backgroundColor: "#dc2626"
            }]
        },
        options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, animation: false }
    });

    // 3. CHART EVOLUCIÓN TEMPORAL
    const evol = calcularEvolucionTemporal(controles);
    const ctxEvol = document.getElementById("chart-ind-evolucion").getContext("2d");
    chartIndEvolucionInstance = new Chart(ctxEvol, {
        type: "line",
        data: {
            labels: evol.labels,
            datasets: [{
                label: "Evolución de Errores",
                data: evol.data,
                borderColor: "#16a34a",
                backgroundColor: "rgba(22, 163, 74, 0.1)",
                fill: true,
                tension: 0.2
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, animation: false }
    });
}

// ==========================================================================
// 11. TABLAS Y ORDENAMIENTO DE DATOS
// ==========================================================================
function ordenarTablaIndividual(columna) {
    if (ordenTablaInd.columna === columna) {
        ordenTablaInd.ascendente = !ordenTablaInd.ascendente;
    } else {
        ordenTablaInd.columna = columna;
        ordenTablaInd.ascendente = true;
    }
    actualizarDashboardIndividual();
}

function renderizarTablaIndividualErrores(entriesErrores, totalErrores, controles) {
    const tbody = document.getElementById("tbody-ind-errores");
    tbody.innerHTML = "";

    if (entriesErrores.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Sin errores registrados para la selección.</td></tr>`;
        return;
    }

    let listaMapeada = entriesErrores.map(([cod, cant]) => {
        let errObj = errores.find(e => e.id === cod);
        if (!errObj) {
            for (let c of controles) {
                if (c.snapshotErrores && c.snapshotErrores[cod]) { errObj = c.snapshotErrores[cod]; break; }
            }
        }
        const pct = totalErrores > 0 ? ((cant / totalErrores) * 100) : 0;
        let nivelImpacto = "Bajo Impacto";
        let badgeCls = "badge-bajo-impacto";

        if (pct > 20) {
            nivelImpacto = "Alto Impacto";
            badgeCls = "badge-alto-impacto";
        } else if (pct >= 10) {
            nivelImpacto = "Medio Impacto";
            badgeCls = "badge-medio-impacto";
        }

        return {
            codigo: cod,
            error: errObj ? errObj.nombre : "Error Histórico",
            solapa: errObj ? errObj.solapa : "-",
            cantidad: cant,
            porcentaje: pct,
            nivelImpacto: nivelImpacto,
            badgeCls: badgeCls
        };
    });

    listaMapeada.sort((a, b) => {
        let valA = a[ordenTablaInd.columna];
        let valB = b[ordenTablaInd.columna];
        if (typeof valA === "string") valA = valA.toLowerCase();
        if (typeof valB === "string") valB = valB.toLowerCase();

        if (valA < valB) return ordenTablaInd.ascendente ? -1 : 1;
        if (valA > valB) return ordenTablaInd.ascendente ? 1 : -1;
        return 0;
    });

    listaMapeada.forEach(item => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${item.codigo}</strong></td>
            <td>${item.error}</td>
            <td>${item.solapa}</td>
            <td><strong>${item.cantidad}</strong></td>
            <td>${item.porcentaje.toFixed(1)}%</td>
            <td><span class="badge-estado ${item.badgeCls}">${item.nivelImpacto}</span></td>
        `;
        tbody.appendChild(tr);
    });
}

function renderizarTablaIndividualSolapas(conteoSolapas, totalErrores) {
    const tbody = document.getElementById("tbody-ind-solapas");
    tbody.innerHTML = "";

    listaSolapas.forEach(s => {
        const cant = conteoSolapas[s.nombre] || 0;
        const pct = totalErrores > 0 ? ((cant / totalErrores) * 100).toFixed(1) : "0.0";
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${s.nombre}</strong></td>
            <td>${cant}</td>
            <td>${pct}%</td>
        `;
        tbody.appendChild(tr);
    });
}

function renderizarTablaIndividualEventos(controles) {
    const tbody = document.getElementById("tbody-ind-eventos");
    tbody.innerHTML = "";

    if (controles.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Sin datos de eventos.</td></tr>`;
        return;
    }

    controles.forEach(c => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${c.idEvento}</strong></td>
            <td>${formatearFechaCorta(new Date(c.fechaActualizacion))}</td>
            <td>${c.partido}</td>
            <td>${c.cantidadErrores}</td>
        `;
        tbody.appendChild(tr);
    });
}

// ==========================================================================
// 12. GENERACIÓN DEL INFORME INDIVIDUAL PDF
// ==========================================================================
function generarInformePDFIndividual() {
    const partido = document.getElementById("filtro-partido").value;
    const preset = document.getElementById("filtro-preset").value;
    const fDesdeRaw = document.getElementById("f-fecha-desde").value;
    const fHastaRaw = document.getElementById("f-fecha-hasta").value;

    if (!partido) {
        alert("Seleccione un partido para generar el informe.");
        return;
    }

    const { dStart, dEnd } = resolverRangoFechas(preset, fDesdeRaw, fHastaRaw);
    if (preset === "CUSTOM" && (!fDesdeRaw || !fHastaRaw)) {
        alert("Seleccione un período válido (Fecha Desde y Fecha Hasta).");
        return;
    }

    const controles = obtenerEventosFiltrados(partido, preset, fDesdeRaw, fHastaRaw);
    if (controles.length === 0) {
        alert("No existen datos para el partido y período seleccionado.");
        return;
    }

    const stats = calcularEstadisticasPartido(controles);
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    let y = 15;

    // ENCABEZADO
    doc.setFontSize(15);
    doc.setFont("helvetica", "bold");
    doc.text("SISTEMA DE CONTROL DE CLASIFICACIÓN DE EVENTOS", 14, y);
    y += 7;

    doc.setFontSize(13);
    doc.text("INFORME ESTADÍSTICO INDIVIDUAL", 14, y);
    y += 7;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`PARTIDO: ${partido.toUpperCase()}`, 14, y);
    doc.text(`FECHA DE GENERACIÓN: ${formatearFechaMostrar(new Date().toISOString())}`, 120, y);
    y += 5;

    const fInicioStr = dStart ? formatearFechaCorta(dStart) : stats.primerRegistro;
    const fFinStr = dEnd ? formatearFechaCorta(dEnd) : stats.ultimoRegistro;
    doc.text(`PERÍODO ANALIZADO: ${fInicioStr} — ${fFinStr}`, 14, y);
    y += 6;

    doc.setDrawColor(200, 200, 200);
    doc.line(14, y, 196, y);
    y += 6;

    // RESUMEN EJECUTIVO
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("RESUMEN EJECUTIVO DEL PERÍODO", 14, y);
    y += 4;

    const cantSolapasInvolucradas = Object.values(stats.conteoSolapas).filter(c => c > 0).length;

    const resumenData = [
        ["Total de Eventos Analizados", stats.totalEventos.toString()],
        ["Total de Errores Detectados", stats.totalErrores.toString()],
        ["Eventos Con Errores", `${stats.eventosConError} (${stats.pctConError}%)`],
        ["Eventos Sin Errores", `${stats.eventosSinError} (${(100 - parseFloat(stats.pctConError)).toFixed(1)}%)`],
        ["Promedio de Errores por Evento", stats.promedioErrores.toString()],
        ["Cantidad de Solapas Involucradas", cantSolapasInvolucradas.toString()],
        ["Cantidad de Controles Realizados", stats.totalEventos.toString()]
    ];

    doc.autoTable({
        startY: y,
        head: [["Indicador Metodológico", "Valor Auditado"]],
        body: resumenData,
        theme: "striped",
        headStyles: { fillColor: [37, 99, 235] },
        styles: { fontSize: 8 }
    });

    y = doc.lastAutoTable.finalY + 8;

    // INFORME DESCRIPTIVO Y FORMAL
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("INFORME FORMAL DE EVALUACIÓN Y ESFUERZOS", 14, y);
    y += 4;

    const textoDescriptivo = generarTextoDescriptivoFormal(partido, preset, dStart, dEnd, stats);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const splitText = doc.splitTextToSize(textoDescriptivo, 180);
    doc.text(splitText, 14, y);

    y += splitText.length * 4.5 + 6;

    if (y > 220) { doc.addPage(); y = 15; }

    // DETALLE DE ERRORES CON NIVEL DE IMPACTO
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("DETALLE DE ERRORES DETECTADOS Y GRAVEDAD", 14, y);
    y += 4;

    const filasErroresPDF = Object.entries(stats.conteoErrores)
        .sort((a,b) => b[1] - a[1])
        .map(([cod, cant]) => {
            let errObj = errores.find(e => e.id === cod);
            const pct = stats.totalErrores > 0 ? (cant / stats.totalErrores) * 100 : 0;
            let nivelImp = "Bajo Impacto";
            if (pct > 20) nivelImp = "Alto Impacto";
            else if (pct >= 10) nivelImp = "Medio Impacto";

            return [cod, errObj ? errObj.nombre : "Error Histórico", errObj ? errObj.solapa : "-", cant.toString(), pct.toFixed(1) + "%", nivelImp];
        });

    doc.autoTable({
        startY: y,
        head: [["Código", "Error", "Solapa", "Cantidad", "%", "Gravedad"]],
        body: filasErroresPDF.length > 0 ? filasErroresPDF : [["-", "Sin errores registrados", "-", "0", "0%", "Bajo Impacto"]],
        theme: "grid",
        headStyles: { fillColor: [100, 116, 139] },
        styles: { fontSize: 8 }
    });

    y = doc.lastAutoTable.finalY + 8;

    if (y > 220) { doc.addPage(); y = 15; }

    // DISTRIBUCIÓN POR SOLAPA
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("DISTRIBUCIÓN DE ERRORES POR SOLAPA", 14, y);
    y += 4;

    const filasSolapasPDF = Object.entries(stats.conteoSolapas).map(([sol, cant]) => {
        const pct = stats.totalErrores > 0 ? ((cant / stats.totalErrores) * 100).toFixed(1) + "%" : "0%";
        return [sol, cant.toString(), pct];
    });

    doc.autoTable({
        startY: y,
        head: [["Solapa", "Cantidad de Errores", "% del Total"]],
        body: filasSolapasPDF,
        theme: "plain",
        headStyles: { fillColor: [219, 234, 254], textColor: [30, 64, 175] },
        styles: { fontSize: 8 }
    });

    y = doc.lastAutoTable.finalY + 8;

    // INCORPORACIÓN DE GRÁFICOS AL PDF
    if (chartIndSolapasInstance) {
        if (y > 180) { doc.addPage(); y = 15; }
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("GRÁFICO — ERRORES POR SOLAPA", 14, y);
        y += 4;

        const imgSolapas = chartIndSolapasInstance.toBase64Image();
        doc.addImage(imgSolapas, 'PNG', 14, y, 180, 65);
        y += 70;
    }

    if (chartIndEvolucionInstance) {
        if (y > 180) { doc.addPage(); y = 15; }
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("GRÁFICO — EVOLUCIÓN TEMPORAL DE ERRORES", 14, y);
        y += 4;

        const imgEvol = chartIndEvolucionInstance.toBase64Image();
        doc.addImage(imgEvol, 'PNG', 14, y, 180, 65);
        y += 70;
    }

    if (y > 220) { doc.addPage(); y = 15; }

    // EVENTOS ANALIZADOS
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("EVENTOS ANALIZADOS EN EL PERÍODO", 14, y);
    y += 4;

    const filasEventosPDF = controles.map(c => [
        c.idEvento,
        formatearFechaCorta(new Date(c.fechaActualizacion)),
        c.partido,
        c.cantidadErrores.toString()
    ]);

    doc.autoTable({
        startY: y,
        head: [["ID Evento", "Fecha", "Partido", "Cant. Errores"]],
        body: filasEventosPDF,
        theme: "striped",
        styles: { fontSize: 8 }
    });

    doc.save(`informe_individual_${partido}_${new Date().toISOString().slice(0, 10)}.pdf`);
    mostrarToast("¡Informe Individual PDF generado correctamente!");
}

// ==========================================================================
// 13. MÓDULO COMPARATIVO
// ==========================================================================
function analizarComparativa() {
    const partido = document.getElementById("comp-partido").value;
    const p1Desde = document.getElementById("comp-p1-desde").value;
    const p1Hasta = document.getElementById("comp-p1-hasta").value;
    const p2Desde = document.getElementById("comp-p2-desde").value;
    const p2Hasta = document.getElementById("comp-p2-hasta").value;

    if (!partido) {
        alert("Seleccione un partido para la comparativa.");
        return;
    }
    if (!p1Desde || !p1Hasta || !p2Desde || !p2Hasta) {
        alert("Seleccione las fechas Desde y Hasta completas para ambos períodos.");
        return;
    }

    const controlesP1 = obtenerEventosFiltrados(partido, "CUSTOM", p1Desde, p1Hasta);
    const controlesP2 = obtenerEventosFiltrados(partido, "CUSTOM", p2Desde, p2Hasta);

    if (controlesP1.length === 0 && controlesP2.length === 0) {
        alert("No existen datos suficientes para realizar la comparación.");
        return;
    }

    const statsP1 = calcularEstadisticasPartido(controlesP1);
    const statsP2 = calcularEstadisticasPartido(controlesP2);

    document.getElementById("contenedor-resultados-comparativa").classList.remove("hidden");

    // KPI COMPARATIVAS
    const cardKpi = document.getElementById("cards-comparativa-kpi");
    const diffEv = statsP2.totalEventos - statsP1.totalEventos;
    const diffErr = statsP2.totalErrores - statsP1.totalErrores;
    const diffProm = (parseFloat(statsP2.promedioErrores) - parseFloat(statsP1.promedioErrores)).toFixed(2);

    cardKpi.innerHTML = `
        <div class="stat-card"><h4>EVENTOS P1 / P2</h4><p>${statsP1.totalEventos} / ${statsP2.totalEventos}</p><span>Dif: ${diffEv >= 0 ? '+' : ''}${diffEv}</span></div>
        <div class="stat-card"><h4>ERRORES P1 / P2</h4><p>${statsP1.totalErrores} / ${statsP2.totalErrores}</p><span style="color:${diffErr <= 0 ? 'var(--success)' : 'var(--danger)'};">Dif: ${diffErr >= 0 ? '+' : ''}${diffErr}</span></div>
        <div class="stat-card"><h4>PROMEDIO P1 / P2</h4><p>${statsP1.promedioErrores} / ${statsP2.promedioErrores}</p><span>Dif: ${diffProm}</span></div>
    `;

    // TABLA GENERAL
    const tbodyGen = document.getElementById("tbody-comp-generales");
    tbodyGen.innerHTML = "";

    const filasGen = [
        ["Total Eventos", statsP1.totalEventos, statsP2.totalEventos],
        ["Total Errores", statsP1.totalErrores, statsP2.totalErrores],
        ["Eventos Con Errores", statsP1.eventosConError, statsP2.eventosConError],
        ["Eventos Sin Errores", statsP1.eventosSinError, statsP2.eventosSinError],
        ["Promedio Errores/Evento", statsP1.promedioErrores, statsP2.promedioErrores],
        ["% Eventos con Error", statsP1.pctConError + "%", statsP2.pctConError + "%"]
    ];

    filasGen.forEach(([ind, v1, v2]) => {
        const num1 = parseFloat(v1) || 0;
        const num2 = parseFloat(v2) || 0;
        const diff = (num2 - num1).toFixed(2);
        const varPct = num1 === 0 ? "N/A" : (((num2 - num1) / num1) * 100).toFixed(1) + "%";

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${ind}</strong></td>
            <td>${v1}</td>
            <td>${v2}</td>
            <td><strong>${diff > 0 ? '+' + diff : diff}</strong></td>
            <td>${varPct}</td>
        `;
        tbodyGen.appendChild(tr);
    });

    // TABLA SOLAPAS
    const tbodySol = document.getElementById("tbody-comp-solapas");
    tbodySol.innerHTML = "";

    listaSolapas.forEach(s => {
        const c1 = statsP1.conteoSolapas[s.nombre] || 0;
        const c2 = statsP2.conteoSolapas[s.nombre] || 0;
        const diffS = c2 - c1;
        const varS = c1 === 0 ? (c2 > 0 ? "+100%" : "N/A") : (((c2 - c1) / c1) * 100).toFixed(1) + "%";

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${s.nombre}</strong></td>
            <td>${c1}</td>
            <td>${c2}</td>
            <td><strong style="color:${diffS <= 0 ? 'var(--success)' : 'var(--danger)'};">${diffS > 0 ? '+' + diffS : diffS}</strong></td>
            <td>${varS}</td>
        `;
        tbodySol.appendChild(tr);
    });

    // TABLA ERRORES
    const tbodyErr = document.getElementById("tbody-comp-errores");
    tbodyErr.innerHTML = "";

    const todosCodigos = Array.from(new Set([...Object.keys(statsP1.conteoErrores), ...Object.keys(statsP2.conteoErrores)]));

    if (todosCodigos.length === 0) {
        tbodyErr.innerHTML = `<tr><td colspan="7" style="text-align:center;">Sin errores registrados en ambos períodos.</td></tr>`;
    } else {
        todosCodigos.forEach(cod => {
            const e1 = statsP1.conteoErrores[cod] || 0;
            const e2 = statsP2.conteoErrores[cod] || 0;
            const dE = e2 - e1;
            const vE = e1 === 0 ? "N/A (Aparición en P2)" : (((e2 - e1) / e1) * 100).toFixed(1) + "%";

            let estadoComp = "Sin variación";
            if (e1 === 0 && e2 > 0) estadoComp = "Aparición de error en P2";
            else if (e1 > 0 && e2 === 0) estadoComp = "Desaparición de error en P2";
            else if (dE > 0) estadoComp = "Aumento";
            else if (dE < 0) estadoComp = "Disminución";

            let errObj = errores.find(e => e.id === cod);

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>${cod}</strong></td>
                <td>${errObj ? errObj.nombre : "Error Histórico"}</td>
                <td>${e1}</td>
                <td>${e2}</td>
                <td><strong>${dE > 0 ? '+' + dE : dE}</strong></td>
                <td>${vE}</td>
                <td><span class="badge-estado">${estadoComp}</span></td>
            `;
            tbodyErr.appendChild(tr);
        });
    }

    // GRÁFICO BARRAS AGRUPADAS P1 VS P2
    renderizarGraficoComparativo(statsP1, statsP2);

    // TEXTO COMPARATIVO
    const boxTextComp = document.getElementById("comp-lectura-automatica");
    boxTextComp.textContent = generarTextoDescriptivoComparativo(partido, p1Desde, p1Hasta, p2Desde, p2Hasta, statsP1, statsP2);
}

function renderizarGraficoComparativo(statsP1, statsP2) {
    if (chartCompBarrasInstance) { chartCompBarrasInstance.destroy(); chartCompBarrasInstance = null; }

    const labelsSol = listaSolapas.map(s => s.nombre);
    const dataP1 = labelsSol.map(s => statsP1.conteoSolapas[s] || 0);
    const dataP2 = labelsSol.map(s => statsP2.conteoSolapas[s] || 0);

    const ctxComp = document.getElementById("chart-comp-barras").getContext("2d");
    chartCompBarrasInstance = new Chart(ctxComp, {
        type: "bar",
        data: {
            labels: labelsSol,
            datasets: [
                { label: "Período 1 (P1)", data: dataP1, backgroundColor: "#64748b" },
                { label: "Período 2 (P2)", data: dataP2, backgroundColor: "#2563eb" }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false, animation: false }
    });
}

function generarTextoDescriptivoComparativo(partido, p1Desde, p1Hasta, p2Desde, p2Hasta, statsP1, statsP2) {
    const diffEv = statsP2.totalEventos - statsP1.totalEventos;
    const diffErr = statsP2.totalErrores - statsP1.totalErrores;

    let txt = `ANÁLISIS ESTADÍSTICO COMPARATIVO — PARTIDO DE ${partido.toUpperCase()}\n\n`;
    txt += `La comparación entre el Período 1 (${formatearFechaCorta(new Date(p1Desde))} al ${formatearFechaCorta(new Date(p1Hasta))}) y el Período 2 (${formatearFechaCorta(new Date(p2Desde))} al ${formatearFechaCorta(new Date(p2Hasta))}) registra una diferencia absoluta de ${diffEv > 0 ? '+' + diffEv : diffEv} eventos evaluados y ${diffErr > 0 ? '+' + diffErr : diffErr} errores de clasificación.\n`;
    txt += `El promedio de inconsistencias por evento pasó de ${statsP1.promedioErrores} en P1 a ${statsP2.promedioErrores} en P2.\n`;
    txt += `La distribución de errores por solapas refleja la evolución cualitativa de las clasificaciones durante los períodos auditados.`;

    return txt;
}

function generarComparativaPDF() {
    const partido = document.getElementById("comp-partido").value;
    const p1Desde = document.getElementById("comp-p1-desde").value;
    const p1Hasta = document.getElementById("comp-p1-hasta").value;
    const p2Desde = document.getElementById("comp-p2-desde").value;
    const p2Hasta = document.getElementById("comp-p2-hasta").value;

    if (!partido || !p1Desde || !p1Hasta || !p2Desde || !p2Hasta) {
        alert("Complete los filtros y analice la comparativa antes de exportar en PDF.");
        return;
    }

    const controlesP1 = obtenerEventosFiltrados(partido, "CUSTOM", p1Desde, p1Hasta);
    const controlesP2 = obtenerEventosFiltrados(partido, "CUSTOM", p2Desde, p2Hasta);

    const statsP1 = calcularEstadisticasPartido(controlesP1);
    const statsP2 = calcularEstadisticasPartido(controlesP2);

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    let y = 15;

    // ENCABEZADO
    doc.setFontSize(15);
    doc.setFont("helvetica", "bold");
    doc.text("SISTEMA DE CONTROL DE CLASIFICACIÓN DE EVENTOS", 14, y);
    y += 7;

    doc.setFontSize(13);
    doc.text("INFORME ESTADÍSTICO COMPARATIVO DE PERÍODOS", 14, y);
    y += 7;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`PARTIDO: ${partido.toUpperCase()}`, 14, y);
    doc.text(`FECHA DE GENERACIÓN: ${formatearFechaMostrar(new Date().toISOString())}`, 120, y);
    y += 5;

    doc.text(`PERÍODO 1: ${formatearFechaCorta(new Date(p1Desde))} — ${formatearFechaCorta(new Date(p1Hasta))}`, 14, y);
    y += 4.5;
    doc.text(`PERÍODO 2: ${formatearFechaCorta(new Date(p2Desde))} — ${formatearFechaCorta(new Date(p2Hasta))}`, 14, y);
    y += 6;

    doc.line(14, y, 196, y);
    y += 6;

    // RESUMEN GENERAL COMPARATIVO
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("RESUMEN COMPARATIVO DE INDICADORES GENERALES", 14, y);
    y += 4;

    const filasGenPDF = [
        ["Total Eventos Analizados", statsP1.totalEventos.toString(), statsP2.totalEventos.toString(), (statsP2.totalEventos - statsP1.totalEventos).toString()],
        ["Total Errores Detectados", statsP1.totalErrores.toString(), statsP2.totalErrores.toString(), (statsP2.totalErrores - statsP1.totalErrores).toString()],
        ["Eventos Con Errores", statsP1.eventosConError.toString(), statsP2.eventosConError.toString(), (statsP2.eventosConError - statsP1.eventosConError).toString()],
        ["Eventos Sin Errores", statsP1.eventosSinError.toString(), statsP2.eventosSinError.toString(), (statsP2.eventosSinError - statsP1.eventosSinError).toString()],
        ["Promedio Errores / Evento", statsP1.promedioErrores, statsP2.promedioErrores, (parseFloat(statsP2.promedioErrores) - parseFloat(statsP1.promedioErrores)).toFixed(2)],
        ["% Eventos con Error", statsP1.pctConError + "%", statsP2.pctConError + "%", (parseFloat(statsP2.pctConError) - parseFloat(statsP1.pctConError)).toFixed(1) + " pp"]
    ];

    doc.autoTable({
        startY: y,
        head: [["Indicador", "Período 1", "Período 2", "Diferencia (P2 - P1)"]],
        body: filasGenPDF,
        theme: "striped",
        headStyles: { fillColor: [37, 99, 235] },
        styles: { fontSize: 8 }
    });

    y = doc.lastAutoTable.finalY + 8;

    // COMPARACIÓN POR SOLAPA
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("COMPARACIÓN POR SOLAPA", 14, y);
    y += 4;

    const filasSolPDF = listaSolapas.map(s => {
        const c1 = statsP1.conteoSolapas[s.nombre] || 0;
        const c2 = statsP2.conteoSolapas[s.nombre] || 0;
        const varS = c1 === 0 ? "N/A" : (((c2 - c1) / c1) * 100).toFixed(1) + "%";
        return [s.nombre, c1.toString(), c2.toString(), (c2 - c1).toString(), varS];
    });

    doc.autoTable({
        startY: y,
        head: [["Solapa", "P1", "P2", "Diferencia", "Variación %"]],
        body: filasSolPDF,
        theme: "grid",
        headStyles: { fillColor: [100, 116, 139] },
        styles: { fontSize: 8 }
    });

    y = doc.lastAutoTable.finalY + 8;

    // INCORPORACIÓN DEL GRÁFICO COMPARATIVO EN PDF
    if (chartCompBarrasInstance) {
        if (y > 180) { doc.addPage(); y = 15; }
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("GRÁFICO COMPARATIVO DE ERRORES POR SOLAPA (P1 vs P2)", 14, y);
        y += 4;

        const imgComp = chartCompBarrasInstance.toBase64Image();
        doc.addImage(imgComp, 'PNG', 14, y, 180, 65);
        y += 70;
    }

    if (y > 220) { doc.addPage(); y = 15; }

    // ANÁLISIS DESCRIPTIVO COMPARATIVO
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("ANÁLISIS ESTADÍSTICO COMPARATIVO DESCRIPTIVO", 14, y);
    y += 4;

    const textoComp = generarTextoDescriptivoComparativo(partido, p1Desde, p1Hasta, p2Desde, p2Hasta, statsP1, statsP2);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const splitComp = doc.splitTextToSize(textoComp, 180);
    doc.text(splitComp, 14, y);

    doc.save(`informe_comparativo_${partido}_${new Date().toISOString().slice(0, 10)}.pdf`);
    mostrarToast("¡Informe Comparativo PDF generado correctamente!");
}

// ==========================================================================
// 14. ADMINISTRADOR DE ERRORES (CRUD) Y SUGERENCIA DE CÓDIGO
// ==========================================================================
function sugerirCodigoError() {
    const solapa = document.getElementById("admin-solapa").value;
    const inputCodigo = document.getElementById("admin-codigo");
    const idx = parseInt(document.getElementById("admin-error-index").value);

    if (idx !== -1 || !solapa) return;

    const prefijo = solapa.substring(0, 3).toUpperCase();
    const codigosExistentes = errores
        .filter(e => e.id.startsWith(prefijo + "-"))
        .map(e => parseInt(e.id.split("-")[1]) || 0);

    const maxNum = codigosExistentes.length > 0 ? Math.max(...codigosExistentes) : 0;
    const siguiente = String(maxNum + 1).padStart(3, "0");
    inputCodigo.value = `${prefijo}-${siguiente}`;
}

function renderizarCatErroresAdmin() {
    const tbody = document.getElementById("tbody-cat-errores");
    if (!tbody) return;
    tbody.innerHTML = "";

    const busqueda = (document.getElementById("buscar-error").value || "").toLowerCase().trim();

    const filtrados = errores.filter(item => {
        return item.id.toLowerCase().includes(busqueda) ||
               item.nombre.toLowerCase().includes(busqueda) ||
               (item.indicador && item.indicador.toLowerCase().includes(busqueda)) ||
               item.solapa.toLowerCase().includes(busqueda);
    });

    filtrados.forEach((item) => {
        const indexReal = errores.findIndex(e => e.uuid === item.uuid);
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${item.id}</strong></td>
            <td>${item.solapa}</td>
            <td>${item.nombre}</td>
            <td><span class="badge-estado ${item.tipo === 'SISTEMA' ? 'badge-en-control' : 'badge-corregido'}">${item.tipo}</span></td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="cargarEdicionAdminError(${indexReal})">✏️</button>
                <button class="btn btn-danger btn-sm" onclick="eliminarAdminError(${indexReal})">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function guardarAdminError(e) {
    e.preventDefault();
    const idx = parseInt(document.getElementById("admin-error-index").value);
    const idCodigo = document.getElementById("admin-codigo").value.trim().toUpperCase();
    const solapaVal = document.getElementById("admin-solapa").value;
    const nombreVal = document.getElementById("admin-nombre").value.trim();
    const indicadorVal = document.getElementById("admin-indicador").value.trim();
    const mensajeVal = document.getElementById("admin-mensaje").value.trim();

    const duplicadoCod = errores.some((item, i) => i !== idx && item.id.toUpperCase() === idCodigo);
    if (duplicadoCod) {
        alert(`El código de error "${idCodigo}" ya existe en el catálogo.`);
        return;
    }

    let uuidFinal = generarUUID();
    let tipoFinal = "PERSONALIZADO";

    if (idx !== -1) {
        const original = errores[idx];
        uuidFinal = original.uuid;
        tipoFinal = original.tipo;
    }

    const objetoError = {
        uuid: uuidFinal,
        id: idCodigo,
        solapa: solapaVal,
        nombre: nombreVal,
        indicador: indicadorVal,
        mensaje: mensajeVal,
        tipo: tipoFinal
    };

    if (idx === -1) errores.push(objetoError);
    else errores[idx] = objetoError;

    guardarErroresStorage();
    resetearFormAdminError();
    renderizarCatErroresAdmin();
    renderizarTablaErrores();
    mostrarToast("Error guardado en el catálogo.");
}

function cargarEdicionAdminError(index) {
    const item = errores[index];
    document.getElementById("admin-error-index").value = index;
    document.getElementById("admin-solapa").value = item.solapa;
    document.getElementById("admin-codigo").value = item.id;
    document.getElementById("admin-nombre").value = item.nombre;
    document.getElementById("admin-indicador").value = item.indicador || "";
    document.getElementById("admin-mensaje").value = item.mensaje;

    document.getElementById("titulo-form-admin").textContent = "EDITAR ERROR";
    document.getElementById("btn-cancelar-admin-error").classList.remove("hidden");
}

function resetearFormAdminError() {
    document.getElementById("admin-error-index").value = "-1";
    document.getElementById("form-error").reset();
    document.getElementById("titulo-form-admin").textContent = "ADMINISTRAR ERRORES";
    document.getElementById("btn-cancelar-admin-error").classList.add("hidden");
}

function eliminarAdminError(index) {
    const item = errores[index];
    const confirmacion = confirm(`⚠️ CONFIRMACIÓN DE ELIMINACIÓN:\nEstá a punto de eliminar el error ${item.id} (${item.nombre}).\nEsta acción quitará el error del catálogo actual, pero no eliminará registros históricos.\n\n¿Desea continuar?`);

    if (confirmacion) {
        if (item.tipo === "SISTEMA") {
            if (!erroresEliminadosSystema.includes(item.id)) {
                erroresEliminadosSystema.push(item.id);
                guardarEliminadosStorage();
            }
        }

        errores.splice(index, 1);
        guardarErroresStorage();
        renderizarCatErroresAdmin();
        renderizarTablaErrores();
        mostrarToast("Error eliminado del catálogo.");
    }
}

function restaurarErroresPredeterminados() {
    if (confirm("🔄 RESTAURAR ELEMENTOS PREDETERMINADOS DE SISTEMA:\n\nEsta acción recuperará los errores predeterminados de fábrica.\n\n¿Desea continuar?")) {
        ERRORES_PREDETERMINADOS.forEach(pred => {
            const indexEx = errores.findIndex(e => e.id === pred.id);
            if (indexEx !== -1) {
                if (errores[indexEx].tipo === "SISTEMA") {
                    errores[indexEx] = JSON.parse(JSON.stringify(pred));
                }
            } else {
                errores.push(JSON.parse(JSON.stringify(pred)));
            }
        });

        erroresEliminadosSystema = [];
        guardarEliminadosStorage();
        guardarErroresStorage();
        renderizarCatErroresAdmin();
        renderizarTablaErrores();
        mostrarToast("Elementos predeterminados restaurados.");
    }
}

function restaurarErroresEliminados() {
    if (erroresEliminadosSystema.length === 0) {
        mostrarToast("No hay errores predeterminados de sistema eliminados.");
        return;
    }

    if (confirm(`Existen ${erroresEliminadosSystema.length} errores eliminados. ¿Desea restaurarlos?`)) {
        erroresEliminadosSystema.forEach(idPred => {
            const predObj = ERRORES_PREDETERMINADOS.find(p => p.id === idPred);
            if (predObj && !errores.some(e => e.id === predObj.id)) {
                errores.push(JSON.parse(JSON.stringify(predObj)));
            }
        });

        erroresEliminadosSystema = [];
        guardarEliminadosStorage();
        guardarErroresStorage();
        renderizarCatErroresAdmin();
        renderizarTablaErrores();
        mostrarToast("Errores eliminados recuperados correctamente.");
    }
}

// ==========================================================================
// 15. ADMINISTRACIÓN DE PARTIDOS (PBA)
// ==========================================================================
function renderizarPartidosAdmin() {
    const tbody = document.getElementById("tbody-admin-partidos");
    if (!tbody) return;
    tbody.innerHTML = "";

    const busqueda = (document.getElementById("buscar-partido").value || "").toLowerCase().trim();

    const filtrados = partidos.filter(p => p.nombre.toLowerCase().includes(busqueda));
    filtrados.sort((a,b) => a.nombre.localeCompare(b.nombre));

    filtrados.forEach(item => {
        const indexReal = partidos.findIndex(p => p.id === item.id);
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td><strong>${item.nombre}</strong></td>
            <td><span class="badge-estado ${item.tipo === 'SISTEMA' ? 'badge-en-control' : 'badge-corregido'}">${item.tipo}</span></td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="cargarEdicionPartido(${indexReal})">✏️</button>
                <button class="btn btn-danger btn-sm" onclick="eliminarPartido(${indexReal})">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function guardarAdminPartido(e) {
    e.preventDefault();
    const idx = parseInt(document.getElementById("admin-partido-index").value);
    let nombreVal = document.getElementById("admin-partido-nombre").value;

    if (!nombreVal || !nombreVal.trim()) {
        mostrarToast("El nombre del partido no puede estar vacío.");
        return;
    }

    nombreVal = nombreVal.trim().replace(/\s+/g, " ");

    const esPBA = PARTIDOS_OFICIALES_PBA.some(p => normalizarTexto(p) === normalizarTexto(nombreVal));
    if (!esPBA) {
        alert(`El municipio/partido "${nombreVal}" NO corresponde a un Partido oficial de la Provincia de Buenos Aires.`);
        return;
    }

    const duplicado = partidos.some((p, i) => i !== idx && normalizarTexto(p.nombre) === normalizarTexto(nombreVal));
    if (duplicado) {
        mostrarToast("Ese Partido ya se encuentra registrado en el sistema.");
        return;
    }

    if (idx === -1) {
        partidos.push({ id: generarUUID(), nombre: nombreVal, tipo: "PERSONALIZADO" });
        mostrarToast(`Partido "${nombreVal}" agregado exitosamente.`);
    } else {
        partidos[idx].nombre = nombreVal;
        mostrarToast(`Partido modificado a "${nombreVal}".`);
    }

    guardarPartidosStorage();
    poblarSelectoresPartidos();
    renderizarPartidosAdmin();
    resetearFormAdminPartido();
}

function cargarEdicionPartido(index) {
    const item = partidos[index];
    document.getElementById("admin-partido-index").value = index;
    document.getElementById("admin-partido-nombre").value = item.nombre;
    document.getElementById("titulo-form-partido").textContent = "EDITAR PARTIDO — PBA";
    document.getElementById("btn-cancelar-admin-partido").classList.remove("hidden");
}

function resetearFormAdminPartido() {
    document.getElementById("admin-partido-index").value = "-1";
    document.getElementById("form-partido").reset();
    document.getElementById("titulo-form-partido").textContent = "ADMINISTRAR PARTIDOS — PROVINCIA DE BUENOS AIRES";
    document.getElementById("btn-cancelar-admin-partido").classList.add("hidden");
}

function eliminarPartido(index) {
    partidos.splice(index, 1);
    guardarPartidosStorage();
    poblarSelectoresPartidos();
    renderizarPartidosAdmin();
    mostrarToast("Partido eliminado del catálogo.");
}

// ==========================================================================
// 16. EXPORTACIÓN E IMPORTACIÓN DE DATOS (JSON)
// ==========================================================================
function exportarConfiguracionJSON() {
    const exportData = {
        version: CONFIG_VERSION,
        fechaExportacion: new Date().toISOString(),
        solapas: listaSolapas,
        partidos: partidos,
        errores: errores,
        erroresEliminadosSystema: erroresEliminadosSystema
    };
    descargarJSONFile(exportData, `backup_config_${new Date().toISOString().slice(0, 10)}.json`);
}

function exportarSistemaCompletoJSON() {
    const exportData = {
        version: CONFIG_VERSION,
        fechaExportacion: new Date().toISOString(),
        solapas: listaSolapas,
        partidos: partidos,
        errores: errores,
        erroresEliminadosSystema: erroresEliminadosSystema,
        historial: obtenerHistorialStorage()
    };
    descargarJSONFile(exportData, `backup_SISTEMA_COMPLETO_${new Date().toISOString().slice(0, 10)}.json`);
}

function descargarJSONFile(obj, filename) {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(obj, null, 2));
    const a = document.createElement("a");
    a.href = dataStr;
    a.download = filename;
    a.click();
}

function cargarImportacionJSON(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target.result);
            pendingImportData = data;
            document.getElementById("modal-importar").classList.remove("hidden");
        } catch (err) {
            mostrarToast("Error al procesar el archivo JSON.");
        }
    };
    reader.readAsText(file);
    e.target.value = "";
}

function procesarImportacion(modo) {
    if (!pendingImportData) return;

    if (modo === "REEMPLAZAR") {
        if (pendingImportData.solapas) listaSolapas = pendingImportData.solapas;
        if (pendingImportData.partidos) partidos = pendingImportData.partidos;
        if (pendingImportData.errores) errores = pendingImportData.errores;
        if (pendingImportData.erroresEliminadosSystema) erroresEliminadosSystema = pendingImportData.erroresEliminadosSystema;
        if (importTargetMode === "TODO" && pendingImportData.historial) {
            guardarHistorialStorage(pendingImportData.historial);
        }
    } else if (modo === "COMBINAR") {
        if (pendingImportData.solapas) {
            pendingImportData.solapas.forEach(sImp => {
                if (!listaSolapas.some(s => s.nombre.toLowerCase() === sImp.nombre.toLowerCase())) {
                    listaSolapas.push(sImp);
                }
            });
        }
        if (pendingImportData.partidos) {
            pendingImportData.partidos.forEach(pImp => {
                if (!partidos.some(p => normalizarTexto(p.nombre) === normalizarTexto(pImp.nombre))) {
                    partidos.push(pImp);
                }
            });
        }
        if (pendingImportData.errores) {
            pendingImportData.errores.forEach(eImp => {
                const idxEx = errores.findIndex(e => e.id === eImp.id);
                if (idxEx !== -1) errores[idxEx] = eImp;
                else errores.push(eImp);
            });
        }
        if (importTargetMode === "TODO" && pendingImportData.historial) {
            const hActual = obtenerHistorialStorage();
            Object.assign(hActual, pendingImportData.historial);
            guardarHistorialStorage(hActual);
        }
    }

    guardarSolapasStorage();
    guardarPartidosStorage();
    guardarErroresStorage();
    guardarEliminadosStorage();

    poblarSelectoresPartidos();
    poblarSelectoresSolapasAdmin();
    renderizarSolapas();
    renderizarCatErroresAdmin();
    renderizarSolapasAdmin();
    renderizarPartidosAdmin();

    pendingImportData = null;
    document.getElementById("modal-importar").classList.add("hidden");
    mostrarToast("¡Importación completada exitosamente!");
}

// ==========================================================================
// 17. FUNCIONES AUXILIARES
// ==========================================================================
function formatearFechaMostrar(isoString) {
    if (!isoString) return "-";
    const d = new Date(isoString);
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

function formatearFechaCorta(d) {
    if (!d || isNaN(d.getTime())) return "Sin datos";
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
}

function copiarIDsAgrupados() {
    const text = document.getElementById("contenedor-ids-agrupados").textContent;
    if (text.includes("Sin") || text.includes("Seleccione")) {
        mostrarToast("No hay IDs para copiar.");
        return;
    }
    navigator.clipboard.writeText(text).then(() => mostrarToast("¡IDs agrupados copiados al portapapeles!"));
}

function mostrarToast(mensaje) {
    const toast = document.getElementById("toast");
    toast.textContent = mensaje;
    toast.classList.remove("hidden");
    setTimeout(() => toast.classList.add("hidden"), 3500);
}
