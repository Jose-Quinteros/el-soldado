/**
 * ASISTENTE DE ANÁLISIS CRIMINAL - MÓDULO DE LÓGICA FRONTEND
 */

document.addEventListener('DOMContentLoaded', () => {

  const form = document.getElementById('analysis-form');
  
  // Evento 1
  const inputId1 = document.getElementById('id-evento-1');
  const inputIpp1 = document.getElementById('ipp-evento-1');
  const inputLugar1 = document.getElementById('lugar-evento-1');
  const inputPartido1 = document.getElementById('partido-evento-1');
  const inputDelito1 = document.getElementById('delito-evento-1');
  const inputFecha1 = document.getElementById('fecha-evento-1');

  // Evento 2
  const inputId2 = document.getElementById('id-evento-2');
  const inputIpp2 = document.getElementById('ipp-evento-2');
  const inputLugar2 = document.getElementById('lugar-evento-2');
  const inputPartido2 = document.getElementById('partido-evento-2');
  const inputDelito2 = document.getElementById('delito-evento-2');
  const inputFecha2 = document.getElementById('fecha-evento-2');

  // Errores Evento 1
  const errorId1 = document.getElementById('error-id-evento-1');
  const errorIpp1 = document.getElementById('error-ipp-evento-1');
  const errorLugar1 = document.getElementById('error-lugar-evento-1');
  const errorPartido1 = document.getElementById('error-partido-evento-1');
  const errorDelito1 = document.getElementById('error-delito-evento-1');
  const errorFecha1 = document.getElementById('error-fecha-evento-1');

  // Errores Evento 2
  const errorId2 = document.getElementById('error-id-evento-2');
  const errorIpp2 = document.getElementById('error-ipp-evento-2');
  const errorLugar2 = document.getElementById('error-lugar-evento-2');
  const errorPartido2 = document.getElementById('error-partido-evento-2');
  const errorDelito2 = document.getElementById('error-delito-evento-2');
  const errorFecha2 = document.getElementById('error-fecha-evento-2');

  // Resultado y Botones
  const outputMessage = document.getElementById('output-message');
  const btnCopy = document.getElementById('btn-copy');
  const btnReset = document.getElementById('btn-reset');
  const toast = document.getElementById('toast');

  // Restricción solo números para ID
  const restrictToNumeric = (e) => {
    e.target.value = e.target.value.replace(/\D/g, '');
  };

  inputId1.addEventListener('input', restrictToNumeric);
  inputId2.addEventListener('input', restrictToNumeric);

  // Formateador de IPP (Auto-formato mientras se escribe: PP-XX-XX-XXXXXX-XX/XX)
  const formatIppInput = (e) => {
    let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (value.startsWith('PP')) {
      value = value.substring(2);
    }
    let numbers = value.replace(/\D/g, '').substring(0, 14);
    
    let formatted = 'PP-';
    if (numbers.length > 0) formatted += numbers.substring(0, 2);
    if (numbers.length >= 2) formatted += '-' + numbers.substring(2, 4);
    if (numbers.length >= 4) formatted += '-' + numbers.substring(4, 10);
    if (numbers.length >= 10) formatted += '-' + numbers.substring(10, 12);
    if (numbers.length >= 12) formatted += '/' + numbers.substring(12, 14);

    e.target.value = formatted === 'PP-' ? '' : formatted;
  };

  inputIpp1.addEventListener('input', formatIppInput);
  inputIpp2.addEventListener('input', formatIppInput);

  // Formateador de Fecha DD/MM/AAAA
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  // Construir Plantilla en Tiempo Real
  const renderLivePreview = () => {
    const id1 = inputId1.value.trim() || '[ID 1]';
    const ipp1 = inputIpp1.value.trim() || '[IPP 1]';
    const delito1 = inputDelito1.value.trim() || '[DELITO 1]';
    const partido1 = inputPartido1.value.trim() || '[PARTIDO 1]';
    const fecha1 = formatDate(inputFecha1.value) || '[FECHA 1]';
    const lugar1 = inputLugar1.value.trim() || '[DEPENDENCIA 1]';

    const id2 = inputId2.value.trim() || '[ID 2]';
    const ipp2 = inputIpp2.value.trim() || '[IPP 2]';
    const delito2 = inputDelito2.value.trim() || '[DELITO 2]';
    const partido2 = inputPartido2.value.trim() || '[PARTIDO 2]';
    const fecha2 = formatDate(inputFecha2.value) || '[FECHA 2]';
    const lugar2 = inputLugar2.value.trim() || '[DEPENDENCIA 2]';

    const message = `SE INFORMA: El evento id “${id1}” IPP Nº ${ipp1} (${delito1} - Partido de ${partido1} - Fecha ${fecha1}) de la “${lugar1}”, posee una correlación con el evento id “${id2}” IPP Nº ${ipp2} (${delito2} - Partido de ${partido2} - Fecha ${fecha2}) de la “${lugar2}”; Mismos eventos generan duplicidad de personas, carátulas, entre otros ítems. Por lo cual, se procede a sacar de línea al evento id “${id2}” de la “${lugar2}”, para no generar estos inconvenientes, impulsando completar con los datos correspondientes al relato manteniendo la integridad de la información.-`;

    outputMessage.textContent = message;
  };

  // Escuchar cambios en todos los campos para actualización en tiempo real
  const allInputs = form.querySelectorAll('input');
  allInputs.forEach(input => {
    input.addEventListener('input', renderLivePreview);
    input.addEventListener('change', renderLivePreview);
  });

  // Validaciones
  const validateId = (value) => {
    const regex = /^[0-9]{7}$/;
    if (!value || value.trim() === '') {
      return { valid: false, message: 'El ID es obligatorio.' };
    }
    if (!regex.test(value)) {
      return { valid: false, message: 'Debe contener exactamente 7 dígitos.' };
    }
    return { valid: true, message: '' };
  };

  const validateIpp = (value) => {
    const regex = /^PP-\d{2}-\d{2}-\d{6}-\d{2}\/\d{2}$/;
    if (!value || value.trim() === '') {
      return { valid: false, message: 'La IPP es obligatoria.' };
    }
    if (!regex.test(value)) {
      return { valid: false, message: 'Formato inválido (Ej: PP-13-00-028489-26/00).' };
    }
    return { valid: true, message: '' };
  };

  const validateRequired = (value, name) => {
    if (!value || value.trim() === '') {
      return { valid: false, message: `El campo ${name} es obligatorio.` };
    }
    return { valid: true, message: '' };
  };

  const updateFieldUI = (inputElement, errorElement, validationResult) => {
    const parentGroup = inputElement.closest('.form-group');
    if (validationResult.valid) {
      parentGroup.classList.remove('error');
      parentGroup.classList.add('success');
      errorElement.textContent = '';
    } else {
      parentGroup.classList.remove('success');
      parentGroup.classList.add('error');
      errorElement.textContent = validationResult.message;
    }
  };

  const clearValidationUI = (inputElement, errorElement) => {
    const parentGroup = inputElement.closest('.form-group');
    parentGroup.classList.remove('error', 'success');
    errorElement.textContent = '';
  };

  // Manejo de Generación y Validación Completa
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const valId1 = inputId1.value.trim();
    const valIpp1 = inputIpp1.value.trim();
    const valLugar1 = inputLugar1.value.trim();
    const valPartido1 = inputPartido1.value.trim();
    const valDelito1 = inputDelito1.value.trim();
    const valFecha1 = inputFecha1.value;

    const valId2 = inputId2.value.trim();
    const valIpp2 = inputIpp2.value.trim();
    const valLugar2 = inputLugar2.value.trim();
    const valPartido2 = inputPartido2.value.trim();
    const valDelito2 = inputDelito2.value.trim();
    const valFecha2 = inputFecha2.value;

    // Validaciones
    const resId1 = validateId(valId1);
    const resIpp1 = validateIpp(valIpp1);
    const resLugar1 = validateRequired(valLugar1, 'Fiscalía / UFI');
    const resPartido1 = validateRequired(valPartido1, 'Partido');
    const resDelito1 = validateRequired(valDelito1, 'Delito');
    const resFecha1 = validateRequired(valFecha1, 'Fecha');

    const resId2 = validateId(valId2);
    const resIpp2 = validateIpp(valIpp2);
    const resLugar2 = validateRequired(valLugar2, 'Fiscalía / UFI');
    const resPartido2 = validateRequired(valPartido2, 'Partido');
    const resDelito2 = validateRequired(valDelito2, 'Delito');
    const resFecha2 = validateRequired(valFecha2, 'Fecha');

    // Actualizar estados visuales de los inputs
    updateFieldUI(inputId1, errorId1, resId1);
    updateFieldUI(inputIpp1, errorIpp1, resIpp1);
    updateFieldUI(inputLugar1, errorLugar1, resLugar1);
    updateFieldUI(inputPartido1, errorPartido1, resPartido1);
    updateFieldUI(inputDelito1, errorDelito1, resDelito1);
    updateFieldUI(inputFecha1, errorFecha1, resFecha1);

    updateFieldUI(inputId2, errorId2, resId2);
    updateFieldUI(inputIpp2, errorIpp2, resIpp2);
    updateFieldUI(inputLugar2, errorLugar2, resLugar2);
    updateFieldUI(inputPartido2, errorPartido2, resPartido2);
    updateFieldUI(inputDelito2, errorDelito2, resDelito2);
    updateFieldUI(inputFecha2, errorFecha2, resFecha2);

    const isValid = resId1.valid && resIpp1.valid && resLugar1.valid && resPartido1.valid && resDelito1.valid && resFecha1.valid &&
                    resId2.valid && resIpp2.valid && resLugar2.valid && resPartido2.valid && resDelito2.valid && resFecha2.valid;

    renderLivePreview();

    if (isValid) {
      document.getElementById('result-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  // Copiar al Portapapeles
  btnCopy.addEventListener('click', async () => {
    const textToCopy = outputMessage.textContent;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      toast.classList.remove('hidden');
      setTimeout(() => {
        toast.classList.add('hidden');
      }, 3000);

    } catch (err) {
      alert('Error al intentar copiar el mensaje al portapapeles.');
    }
  });

  // Nuevo Análisis / Limpiar
  btnReset.addEventListener('click', () => {
    const hasData = inputId1.value || inputId2.value || inputIpp1.value || inputIpp2.value ||
                    inputLugar1.value || inputLugar2.value || inputDelito1.value || inputDelito2.value ||
                    inputPartido1.value || inputPartido2.value;

    if (hasData) {
      const confirmReset = confirm('¿Desea limpiar todos los campos y comenzar un nuevo análisis?');
      if (!confirmReset) return;
    }

    form.reset();

    clearValidationUI(inputId1, errorId1);
    clearValidationUI(inputIpp1, errorIpp1);
    clearValidationUI(inputLugar1, errorLugar1);
    clearValidationUI(inputPartido1, errorPartido1);
    clearValidationUI(inputDelito1, errorDelito1);
    clearValidationUI(inputFecha1, errorFecha1);

    clearValidationUI(inputId2, errorId2);
    clearValidationUI(inputIpp2, errorIpp2);
    clearValidationUI(inputLugar2, errorLugar2);
    clearValidationUI(inputPartido2, errorPartido2);
    clearValidationUI(inputDelito2, errorDelito2);
    clearValidationUI(inputFecha2, errorFecha2);

    toast.classList.add('hidden');
    renderLivePreview();
    inputId1.focus();
  });

  // Render inicial al cargar la página
  renderLivePreview();

});