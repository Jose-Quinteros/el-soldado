// --- ESTADO GLOBAL Y MOTOR DE ANÁLISIS ESTADÍSTICO ---
let currentStep = 1;

let myData = JSON.parse(localStorage.getItem('myDataEnterpriseAdvanced')) || {
    reportTitle: "El Soldado Controla",
    periodAnalyzed: "Enero - Abril 2026",
    variables: [
        { id: "val1", name: "Eventos Registrados" },
        { id: "val2", name: "Inspecciones" }
    ],
    rows: [
        { periodo: "Enero", val1: 1250, val2: 900 },
        { periodo: "Febrero", val1: 1400, val2: 950 },
        { periodo: "Marzo", val1: 1850, val2: 1100 },
        { periodo: "Abril", val1: 1600, val2: 1050 }
    ],
    selectedVariableForAnalysis: "val1"
};

let historyReports = JSON.parse(localStorage.getItem('myHistoryReportsEnterpriseAdvanced')) || [];
let activeModalChart = null;

function saveState() {
    localStorage.setItem('myDataEnterpriseAdvanced', JSON.stringify(myData));
    localStorage.setItem('myHistoryReportsEnterpriseAdvanced', JSON.stringify(historyReports));
}

function changeStep(step) {
    currentStep = step;
    for (let i = 1; i <= 4; i++) {
        const tab = document.getElementById(`tab-${i}`);
        if (tab) {
            if (i === step) {
                tab.className = "step-tab flex items-center justify-center space-x-2.5 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold transition bg-indigo-600 text-white shadow-md shadow-indigo-600/25";
            } else {
                tab.className = "step-tab flex items-center justify-center space-x-2.5 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold transition text-slate-400 hover:text-slate-200 hover:bg-slate-700/50";
            }
        }
    }
    renderStepContent();
}

// --- FUNCIONES DE CÁLCULO ESTADÍSTICO Y DETECCIÓN AUTOMÁTICA ---
function calculateAdvancedMetrics(varId) {
    const values = myData.rows.map(r => Number(r[varId]) || 0);
    const total = values.reduce((a, b) => a + b, 0);
    const count = values.length;
    const mean = count ? total / count : 0;
    const max = count ? Math.max(...values) : 0;
    const min = count ? Math.min(...values) : 0;
    
    const sorted = [...values].sort((a, b) => a - b);
    const median = count === 0 ? 0 : (count % 2 === 0 ? (sorted[count/2 - 1] + sorted[count/2]) / 2 : sorted[Math.floor(count/2)]);
    
    const variance = count ? values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / count : 0;
    const stdDev = Math.sqrt(variance);

    const firstVal = values[0] || 0;
    const lastVal = values[count - 1] || 0;
    const absDiff = lastVal - firstVal;
    const percentChange = firstVal !== 0 ? ((absDiff / firstVal) * 100) : 0;

    const maxRow = myData.rows.find(r => (Number(r[varId]) || 0) === max) || myData.rows[0];
    const minRow = myData.rows.find(r => (Number(r[varId]) || 0) === min) || myData.rows[0];

    return { total, mean, median, max, min, stdDev, absDiff, percentChange, maxRow, minRow, values };
}

// --- GENERADOR DE ANÁLISIS INTERNO ESPECÍFICO POR GRÁFICO ---
function getChartInternalAnalysis(chartType) {
    let mainVar = myData.variables[0];
    let m = calculateAdvancedMetrics(mainVar.id);
    
    switch(chartType) {
        case 'bar':
            return `Análisis de Barras Comparativas: Permite contraponer las variables observadas en cada período. Se evidencia que el período con mayor volumen absoluto es ${m.maxRow?.periodo || '-'} (${m.max.toLocaleString()} en ${mainVar.name}), facilitando la lectura de asimetrías operativas entre ciclos.`;
        case 'line':
            return `Análisis de Tendencia Temporal: Muestra la trayectoria cronológica de las variables. La serie exhibe una variación total del ${m.percentChange > 0 ? '+' : ''}${m.percentChange.toFixed(1)}%, marcando una transición desde un registro inicial de ${m.values[0] || 0} hasta ${m.values[m.values.length - 1] || 0}.`;
        case 'totals':
            return `Análisis de Acumulados por Variable: Sintetiza el volumen total de cada métrica a lo largo de todo el horizonte temporal. Esto permite identificar rápidamente cuál variable concentra la mayor proporción de registros globales.`;
        case 'scatter':
            return `Análisis de Dispersión y Comportamiento: Distribuye los puntos en función del índice temporal. Permite identificar visualmente desvíos puntuales o valores atípicos que se apartan del promedio general (${m.mean.toFixed(1)}).`;
        case 'radar':
            return `Análisis de Perfil Multidimensional: Evalúa de forma simétrica el comportamiento global de las variables simultáneamente, contrastando los techos y pisos de cada categoría analizada.`;
        case 'pie':
            return `Análisis de Composición Porcentual: Muestra la participación relativa de cada variable sobre el total general acumulado, dimensionando el peso específico de cada categoría en el período ${myData.periodAnalyzed}.`;
        default:
            return `Análisis técnico basado en la distribución cuantitativa de los registros ingresados al sistema.`;
    }
}

function renderStepContent() {
    const container = document.getElementById('step-content');
    if (!container) return;
    
    if (currentStep === 1) {
        container.innerHTML = `
            <div class="space-y-6 max-w-4xl mx-auto">
                <div class="text-center space-y-2">
                    <h2 class="text-xl sm:text-2xl font-extrabold text-slate-100">Configuración de Datos y Parámetros del Informe</h2>
                    <p class="text-xs sm:text-sm text-slate-400">Establezca los metadatos temporales, variables de análisis y registros observados.</p>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-900/70 p-5 rounded-2xl border border-slate-700/60 shadow-lg">
                    <div class="space-y-1.5">
                        <label class="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Título del Informe</label>
                        <input type="text" id="inputReportTitle" value="${myData.reportTitle}" onchange="updateMetaField('reportTitle', this.value)" class="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 font-semibold">
                    </div>
                    <div class="space-y-1.5">
                        <label class="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Período Analizado</label>
                        <input type="text" id="inputPeriodAnalyzed" value="${myData.periodAnalyzed}" onchange="updateMetaField('periodAnalyzed', this.value)" class="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 font-semibold">
                    </div>
                </div>

                <div class="bg-slate-900/70 p-5 sm:p-6 rounded-2xl border border-slate-700/60 space-y-5 shadow-lg">
                    <div class="space-y-3">
                        <div class="flex justify-between items-center">
                            <span class="text-xs font-bold text-slate-300 uppercase tracking-wider">Variables del Análisis</span>
                            <button onclick="addVariable()" class="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition shadow-sm font-semibold flex items-center gap-1.5"><i class="fa-solid fa-plus"></i> Agregar Variable</button>
                        </div>
                        <div class="flex flex-wrap gap-2.5">
                            ${myData.variables.map((v, vIndex) => `
                                <div class="flex items-center space-x-2 bg-slate-800 px-3 py-2 rounded-xl border border-slate-700 shadow-xs">
                                    <input type="text" value="${v.name}" onchange="updateVariableName(${vIndex}, this.value)" class="text-xs font-semibold text-slate-200 border-none focus:outline-none bg-transparent w-32">
                                    ${myData.variables.length > 1 ? `<button onclick="deleteVariable(${vIndex})" class="text-rose-400 hover:text-rose-300 text-xs transition"><i class="fa-solid fa-xmark"></i></button>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="flex justify-between items-center pt-3 border-t border-slate-800">
                        <span class="text-xs font-bold text-slate-300 uppercase tracking-wider">Períodos / Registros Temporales</span>
                        <button onclick="addRow()" class="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition shadow-sm font-semibold flex items-center gap-1.5"><i class="fa-solid fa-plus"></i> Agregar Período</button>
                    </div>

                    <div class="overflow-x-auto max-h-60 rounded-xl border border-slate-800">
                        <table class="w-full text-left text-xs">
                            <thead class="bg-slate-800/80 sticky top-0">
                                <tr class="text-slate-300 font-semibold border-b border-slate-700">
                                    <th class="p-3">Período / Etiqueta</th>
                                    ${myData.variables.map(v => `<th class="p-3">${v.name}</th>`).join('')}
                                    <th class="p-3 w-10 text-center">Acción</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-800/60 bg-slate-900/30">
                                ${myData.rows.map((r, rIndex) => `
                                    <tr class="hover:bg-slate-800/40 transition">
                                        <td class="p-2.5"><input type="text" value="${r.periodo}" onchange="updateRowField(${rIndex}, 'periodo', this.value)" class="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 text-xs w-32 focus:outline-none focus:border-indigo-500"></td>
                                        ${myData.variables.map(v => `<td class="p-2.5"><input type="number" value="${r[v.id] !== undefined ? r[v.id] : 0}" onchange="updateRowField(${rIndex}, '${v.id}', this.value)" class="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 text-xs w-28 focus:outline-none focus:border-indigo-500"></td>`).join('')}
                                        <td class="p-2.5 text-center"><button onclick="deleteRow(${rIndex})" class="text-rose-400 hover:text-rose-300 p-1.5 rounded-lg hover:bg-rose-500/10 transition"><i class="fa-solid fa-trash-can"></i></button></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="flex justify-end pt-2">
                    <button onclick="saveAndAdvance(2)" class="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold px-6 py-3 rounded-xl transition shadow-lg shadow-indigo-600/25 flex items-center space-x-2 text-sm">
                        <span>Ejecutar Diagnóstico Estadístico</span> <i class="fa-solid fa-arrow-right"></i>
                    </button>
                </div>
            </div>`;
    } else if (currentStep === 2) {
        if (!myData.variables.some(v => v.id === myData.selectedVariableForAnalysis)) {
            myData.selectedVariableForAnalysis = myData.variables[0].id;
        }
        const selectedVar = myData.variables.find(v => v.id === myData.selectedVariableForAnalysis) || myData.variables[0];
        const m = calculateAdvancedMetrics(selectedVar.id);

        container.innerHTML = `
            <div class="space-y-6 max-w-4xl mx-auto">
                <div class="text-center space-y-2">
                    <h2 class="text-xl sm:text-2xl font-extrabold text-slate-100">Diagnóstico Técnico: ${myData.reportTitle}</h2>
                    <p class="text-xs sm:text-sm text-slate-400">Análisis multinivel, tendencias y comportamiento de la variable seleccionada (${myData.periodAnalyzed}).</p>
                </div>

                <div class="flex justify-center gap-2 flex-wrap">
                    ${myData.variables.map(v => `
                        <button onclick="selectVariableForAnalysis('${v.id}')" class="px-4 py-2 rounded-xl text-xs font-semibold transition ${myData.selectedVariableForAnalysis === v.id ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800'}">
                            ${v.name}
                        </button>
                    `).join('')}
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div class="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl space-y-1">
                        <div class="text-emerald-400 font-bold text-xs uppercase tracking-wider">Máximo Registro</div>
                        <p class="text-lg sm:text-xl font-extrabold text-slate-100">${m.max.toLocaleString()}</p>
                        <p class="text-[10px] text-slate-400">Período: ${m.maxRow ? m.maxRow.periodo : '-'}</p>
                    </div>
                    <div class="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl space-y-1">
                        <div class="text-rose-400 font-bold text-xs uppercase tracking-wider">Mínimo Registro</div>
                        <p class="text-lg sm:text-xl font-extrabold text-slate-100">${m.min.toLocaleString()}</p>
                        <p class="text-[10px] text-slate-400">Período: ${m.minRow ? m.minRow.periodo : '-'}</p>
                    </div>
                    <div class="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl space-y-1">
                        <div class="text-blue-400 font-bold text-xs uppercase tracking-wider">Media Aritmética</div>
                        <p class="text-lg sm:text-xl font-extrabold text-slate-100">${m.mean.toFixed(1)}</p>
                        <p class="text-[10px] text-slate-400">Mediana: ${m.median.toFixed(1)} | Desv: ${m.stdDev.toFixed(1)}</p>
                    </div>
                    <div class="bg-purple-500/10 border border-purple-500/20 p-4 rounded-2xl space-y-1">
                        <div class="text-purple-400 font-bold text-xs uppercase tracking-wider">Variación Total</div>
                        <p class="text-lg sm:text-xl font-extrabold text-slate-100">${m.percentChange > 0 ? '+' : ''}${m.percentChange.toFixed(1)}%</p>
                        <p class="text-[10px] text-slate-400">Dif. Absoluta: ${m.absDiff > 0 ? '+' : ''}${m.absDiff.toLocaleString()}</p>
                    </div>
                </div>

                <div class="bg-slate-900/60 border border-slate-700/60 p-5 sm:p-6 rounded-2xl space-y-4 text-xs sm:text-sm text-slate-300 shadow-lg">
                    <h4 class="font-bold text-slate-100 text-sm flex items-center text-indigo-400"><i class="fa-solid fa-chart-pie mr-2.5"></i> 1. Análisis General del Comportamiento Global</h4>
                    <p class="leading-relaxed">El conjunto de datos analizado abarca un total de <strong>${myData.rows.length} períodos temporales</strong> bajo la variable <strong>${selectedVar.name}</strong>, registrando un volumen global acumulado de <strong>${m.total.toLocaleString()}</strong> y una media estadística de <strong>${m.mean.toFixed(1)}</strong>.</p>
                </div>

                <div class="bg-slate-900/60 border border-slate-700/60 p-5 sm:p-6 rounded-2xl space-y-4 text-xs sm:text-sm text-slate-300 shadow-lg">
                    <h4 class="font-bold text-slate-100 text-sm flex items-center text-indigo-400"><i class="fa-solid fa-magnifying-glass mr-2.5"></i> 2. Análisis Particular y Hallazgos Segmentados</h4>
                    <div class="space-y-2.5 leading-relaxed">
                        <p>• <strong>Punto de Máxima Concentración:</strong> Ubicado en el período <strong>${m.maxRow ? m.maxRow.periodo : '-'}</strong> (${m.max.toLocaleString()}).</p>
                        <p>• <strong>Punto de Mínima Actividad:</strong> Ubicado en <strong>${m.minRow ? m.minRow.periodo : '-'}</strong> (${m.min.toLocaleString()}).</p>
                    </div>
                </div>

                <div class="flex justify-between items-center pt-2">
                    <button onclick="changeStep(1)" class="text-slate-400 hover:text-slate-200 px-4 py-2 text-sm font-medium transition">Volver</button>
                    <button onclick="changeStep(3)" class="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold px-6 py-3 rounded-xl transition shadow-lg shadow-indigo-600/25 flex items-center space-x-2 text-sm">
                        <span>Ver Mis Gráficos Analíticos</span> <i class="fa-solid fa-arrow-right"></i>
                    </button>
                </div>
            </div>`;
    } else if (currentStep === 3) {
        container.innerHTML = `
            <div class="space-y-6 max-w-5xl mx-auto">
                <div class="text-center space-y-2">
                    <h2 class="text-xl sm:text-2xl font-extrabold text-slate-100">Panel de Gráficos Analíticos Pro</h2>
                    <p class="text-xs sm:text-sm text-slate-400">Cada gráfico cuenta con su función y análisis interno específico para interpretar el fenómeno.</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <!-- Tarjeta 1: Barras -->
                    <div onclick="openChartModal('bar', 'Gráfico de Barras Comparativo')" class="bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-slate-700/60 shadow-lg space-y-3 cursor-pointer hover:border-indigo-500/60 hover:bg-slate-900/90 transition group">
                        <div class="flex justify-between items-center"><h3 class="font-bold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5"><i class="fa-solid fa-chart-column text-indigo-400"></i> Barras Comparativas</h3><i class="fa-solid fa-expand text-xs text-slate-500 group-hover:text-indigo-400 transition"></i></div>
                        <div class="h-40 flex items-center justify-center"><canvas id="chartBar"></canvas></div>
                        <p class="text-[11px] text-slate-400 italic bg-slate-950/40 p-2.5 rounded-xl border border-slate-800">${getChartInternalAnalysis('bar')}</p>
                    </div>
                    <!-- Tarjeta 2: Línea -->
                    <div onclick="openChartModal('line', 'Gráfico de Evolución Temporal')" class="bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-slate-700/60 shadow-lg space-y-3 cursor-pointer hover:border-indigo-500/60 hover:bg-slate-900/90 transition group">
                        <div class="flex justify-between items-center"><h3 class="font-bold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5"><i class="fa-solid fa-chart-line text-emerald-400"></i> Tendencia Temporal</h3><i class="fa-solid fa-expand text-xs text-slate-500 group-hover:text-indigo-400 transition"></i></div>
                        <div class="h-40 flex items-center justify-center"><canvas id="chartLine"></canvas></div>
                        <p class="text-[11px] text-slate-400 italic bg-slate-950/40 p-2.5 rounded-xl border border-slate-800">${getChartInternalAnalysis('line')}</p>
                    </div>
                    <!-- Tarjeta 3: Totales -->
                    <div onclick="openChartModal('totals', 'Cantidad Total por Variable')" class="bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-slate-700/60 shadow-lg space-y-3 cursor-pointer hover:border-indigo-500/60 hover:bg-slate-900/90 transition group">
                        <div class="flex justify-between items-center"><h3 class="font-bold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5"><i class="fa-solid fa-chart-simple text-amber-400"></i> Cantidad Total por Variable</h3><i class="fa-solid fa-expand text-xs text-slate-500 group-hover:text-indigo-400 transition"></i></div>
                        <div class="h-40 flex items-center justify-center"><canvas id="chartTotals"></canvas></div>
                        <p class="text-[11px] text-slate-400 italic bg-slate-950/40 p-2.5 rounded-xl border border-slate-800">${getChartInternalAnalysis('totals')}</p>
                    </div>
                    <!-- Tarjeta 4: Dispersión -->
                    <div onclick="openChartModal('scatter', 'Gráfico de Dispersión y Correlación')" class="bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-slate-700/60 shadow-lg space-y-3 cursor-pointer hover:border-indigo-500/60 hover:bg-slate-900/90 transition group">
                        <div class="flex justify-between items-center"><h3 class="font-bold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5"><i class="fa-solid fa-chart-scatter text-blue-400"></i> Dispersión de Puntos</h3><i class="fa-solid fa-expand text-xs text-slate-500 group-hover:text-indigo-400 transition"></i></div>
                        <div class="h-40 flex items-center justify-center"><canvas id="chartScatter"></canvas></div>
                        <p class="text-[11px] text-slate-400 italic bg-slate-950/40 p-2.5 rounded-xl border border-slate-800">${getChartInternalAnalysis('scatter')}</p>
                    </div>
                    <!-- Tarjeta 5: Radar -->
                    <div onclick="openChartModal('radar', 'Perfil Multidimensional (Radar)')" class="bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-slate-700/60 shadow-lg space-y-3 cursor-pointer hover:border-indigo-500/60 hover:bg-slate-900/90 transition group">
                        <div class="flex justify-between items-center"><h3 class="font-bold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5"><i class="fa-solid fa-spider text-purple-400"></i> Perfil Multidimensional</h3><i class="fa-solid fa-expand text-xs text-slate-500 group-hover:text-indigo-400 transition"></i></div>
                        <div class="h-40 flex items-center justify-center"><canvas id="chartRadar"></canvas></div>
                        <p class="text-[11px] text-slate-400 italic bg-slate-950/40 p-2.5 rounded-xl border border-slate-800">${getChartInternalAnalysis('radar')}</p>
                    </div>
                    <!-- Tarjeta 6: Torta -->
                    <div onclick="openChartModal('pie', 'Composición General (Torta)')" class="bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-slate-700/60 shadow-lg space-y-3 cursor-pointer hover:border-indigo-500/60 hover:bg-slate-900/90 transition group">
                        <div class="flex justify-between items-center"><h3 class="font-bold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5"><i class="fa-solid fa-chart-pie text-cyan-400"></i> Composición General</h3><i class="fa-solid fa-expand text-xs text-slate-500 group-hover:text-indigo-400 transition"></i></div>
                        <div class="h-40 flex items-center justify-center"><canvas id="chartPie"></canvas></div>
                        <p class="text-[11px] text-slate-400 italic bg-slate-950/40 p-2.5 rounded-xl border border-slate-800">${getChartInternalAnalysis('pie')}</p>
                    </div>
                </div>

                <div class="flex justify-between items-center pt-2">
                    <button onclick="changeStep(2)" class="text-slate-400 hover:text-slate-200 px-4 py-2 text-sm font-medium transition">Volver</button>
                    <button onclick="changeStep(4)" class="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold px-6 py-3 rounded-xl transition shadow-lg shadow-indigo-600/25 text-sm flex items-center gap-2">
                        <span>Generar Reporte Técnico e Historial</span> <i class="fa-solid fa-arrow-right"></i>
                    </button>
                </div>
            </div>

            <!-- MODAL DE AMPLIACIÓN DE GRÁFICO -->
            <div id="chartModal" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm hidden items-center justify-center z-50 p-4">
                <div class="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
                    <div class="flex justify-between items-center border-b border-slate-800 pb-4">
                        <h3 id="modalTitle" class="font-bold text-slate-100 text-lg">Detalle del Gráfico</h3>
                        <button onclick="closeChartModal()" class="text-slate-400 hover:text-slate-200 text-lg p-2 rounded-xl hover:bg-slate-800 transition"><i class="fa-solid fa-xmark"></i></button>
                    </div>
                    <div class="h-72 sm:h-80 flex items-center justify-center relative">
                        <canvas id="modalChartCanvas"></canvas>
                    </div>
                    <div class="bg-slate-800/80 border border-slate-700 p-4 rounded-xl text-xs sm:text-sm text-slate-300 space-y-1.5 shadow-inner">
                        <p class="font-bold text-slate-200 flex items-center gap-1.5"><i class="fa-solid fa-lightbulb text-amber-400"></i> Análisis Interno Específico:</p>
                        <p id="modalInterpretation">Análisis cuantitativo de la representación gráfica seleccionada.</p>
                    </div>
                </div>
            </div>`;
        setTimeout(drawAllCharts, 100);
    } else if (currentStep === 4) {
        let mainVar = myData.variables[0];
        let m = calculateAdvancedMetrics(mainVar.id);
        const totalGlobal = myData.variables.reduce((acc, v) => acc + calculateAdvancedMetrics(v.id).total, 0);

        container.innerHTML = `
            <div class="space-y-6 max-w-4xl mx-auto" id="report-printable-area">
                <div class="text-center space-y-2 no-print">
                    <h2 class="text-xl sm:text-2xl font-extrabold text-slate-100">Informe Técnico de Análisis Profesional</h2>
                    <p class="text-xs sm:text-sm text-slate-400">Documento estructurado con rigor analítico, indicadores, patrones y conclusiones objetivas.</p>
                </div>

                <div class="bg-slate-900/90 border border-slate-700/80 p-6 sm:p-10 rounded-3xl shadow-2xl space-y-8 text-slate-200 font-sans">
                    
                    <div class="border-b border-slate-800 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <span class="bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Informe Técnico Oficial</span>
                            <h3 class="text-xl sm:text-2xl font-extrabold text-slate-100 mt-2">${myData.reportTitle}</h3>
                            <p class="text-xs text-slate-400 mt-1">Período analizado: ${myData.periodAnalyzed}</p>
                        </div>
                        <div class="text-left sm:text-right text-xs text-slate-400 space-y-0.5">
                            <p><strong>Fecha de Emisión:</strong> ${new Date().toLocaleDateString()}</p>
                            <p><strong>Registros Analizados:</strong> ${myData.rows.length} períodos</p>
                        </div>
                    </div>

                    <div class="space-y-2.5">
                        <h4 class="font-bold text-slate-100 text-xs sm:text-sm uppercase tracking-wider text-indigo-400 flex items-center"><i class="fa-solid fa-file-lines mr-2"></i> 1. Resumen Ejecutivo</h4>
                        <p class="text-xs sm:text-sm leading-relaxed text-slate-300">El presente documento instrumental sintetiza el comportamiento estadístico del informe <strong>"${myData.reportTitle}"</strong> correspondiente al ciclo <strong>${myData.periodAnalyzed}</strong>.</p>
                    </div>

                    <div class="space-y-3">
                        <h4 class="font-bold text-slate-100 text-xs sm:text-sm uppercase tracking-wider text-indigo-400 flex items-center"><i class="fa-solid fa-chart-pie mr-2"></i> 2. Análisis General</h4>
                        <p class="text-xs sm:text-sm leading-relaxed text-slate-300">El volumen acumulado total asciende a <strong>${totalGlobal.toLocaleString()} unidades</strong>. La distribución general muestra una media de <strong>${m.mean.toFixed(1)}</strong> con una desviación estándar de <strong>${m.stdDev.toFixed(1)}</strong>.</p>
                        <div class="h-52 sm:h-60 flex items-center justify-center bg-slate-950/60 p-3 rounded-2xl border border-slate-800"><canvas id="reportTimeChart"></canvas></div>
                    </div>

                    <div class="space-y-3">
                        <h4 class="font-bold text-slate-100 text-xs sm:text-sm uppercase tracking-wider text-indigo-400 flex items-center"><i class="fa-solid fa-chart-line mr-2"></i> 3. Análisis Temporal y Tendencias</h4>
                        <p class="text-xs sm:text-sm leading-relaxed text-slate-300">La evolución temporal evidencia una variación global del <strong>${m.percentChange > 0 ? '+' : ''}${m.percentChange.toFixed(1)}%</strong>. Máximo registro: <strong>${m.max.toLocaleString()}</strong> (${m.maxRow?.periodo || '-'}).</p>
                    </div>

                    <div class="space-y-3">
                        <h4 class="font-bold text-slate-100 text-xs sm:text-sm uppercase tracking-wider text-indigo-400 flex items-center"><i class="fa-solid fa-magnifying-glass mr-2"></i> 4. Análisis Particular y Concentración</h4>
                        <div class="grid grid-cols-1 gap-3">
                            ${myData.variables.map(v => {
                                const vm = calculateAdvancedMetrics(v.id);
                                const participation = totalGlobal > 0 ? ((vm.total / totalGlobal) * 100).toFixed(1) : 0;
                                return `
                                    <div class="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-1.5 text-xs sm:text-sm">
                                        <div class="flex justify-between items-center font-bold text-slate-200">
                                            <span>Variable: ${v.name}</span>
                                            <span class="text-indigo-400 font-semibold">Total: ${vm.total.toLocaleString()} (${participation}% del total)</span>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>

                    <div class="space-y-3">
                        <h4 class="font-bold text-slate-100 text-xs sm:text-sm uppercase tracking-wider text-indigo-400 flex items-center"><i class="fa-solid fa-table mr-2"></i> 5. Matriz de Datos Registrados</h4>
                        <div class="overflow-x-auto rounded-xl border border-slate-800">
                            <table class="w-full text-left text-xs border-collapse">
                                <thead class="bg-slate-950 text-slate-300">
                                    <tr class="border-b border-slate-800"><th class="p-3 font-semibold">Período</th>${myData.variables.map(v => `<th class="p-3 font-semibold">${v.name}</th>`).join('')}</tr>
                                </thead>
                                <tbody class="divide-y divide-slate-800/60 text-slate-300 bg-slate-950/30">
                                    ${myData.rows.map(r => `
                                        <tr class="hover:bg-slate-800/30 transition"><td class="p-3 font-semibold text-slate-200">${r.periodo}</td>${myData.variables.map(v => `<td class="p-3">${r[v.id] !== undefined ? r[v.id] : 0}</td>`).join('')}</tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div class="space-y-2 pt-2 border-t border-slate-800">
                        <h4 class="font-bold text-slate-100 text-xs sm:text-sm uppercase tracking-wider text-indigo-400 flex items-center"><i class="fa-solid fa-check-circle mr-2"></i> 6. Conclusión Técnica Objetiva</h4>
                        <p class="text-xs sm:text-sm leading-relaxed text-slate-300">El análisis objetivo demuestra que el fenómeno evaluado mantiene un nivel de actividad acorde a las proyecciones esperadas para el período <strong>${myData.periodAnalyzed}</strong>.</p>
                    </div>

                </div>

                <div class="bg-slate-900/90 border border-slate-700/80 p-6 sm:p-8 rounded-3xl shadow-xl space-y-4 no-print">
                    <div class="flex justify-between items-center">
                        <h4 class="font-bold text-slate-100 text-sm uppercase tracking-wider flex items-center gap-2"><i class="fa-solid fa-clock-rotate-left text-indigo-400"></i> Historial de Informes Guardados</h4>
                        <button onclick="saveCurrentReportToHistory()" class="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition shadow-sm flex items-center gap-1.5"><i class="fa-solid fa-bookmark"></i> Guardar en Historial</button>
                    </div>
                    <div class="space-y-2 max-h-48 overflow-y-auto">
                        ${historyReports.length === 0 ? '<p class="text-xs text-slate-500 italic">No hay informes guardados en el historial aún.</p>' : 
                            historyReports.map((h, hIndex) => `
                                <div class="flex justify-between items-center bg-slate-950/60 border border-slate-800 p-3 rounded-xl text-xs">
                                    <div><span class="font-bold text-slate-200">${h.title}</span> <span class="text-slate-400 ml-2">(${h.period})</span></div>
                                    <div class="flex items-center gap-2">
                                        <button onclick="loadHistoryReport(${hIndex})" class="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg transition font-semibold">Cargar</button>
                                        <button onclick="deleteHistoryReport(${hIndex})" class="text-rose-400 hover:text-rose-300 p-1 rounded-lg"><i class="fa-solid fa-trash"></i></button>
                                    </div>
                                </div>
                            `).join('')}
                    </div>
                </div>

                <div class="flex justify-between items-center no-print pt-2">
                    <button onclick="changeStep(3)" class="text-slate-400 hover:text-slate-200 px-4 py-2 text-sm font-medium transition">Volver</button>
                    <button onclick="window.print()" class="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold px-6 py-3 rounded-xl transition shadow-lg shadow-emerald-600/25 flex items-center space-x-2 text-sm">
                        <i class="fa-solid fa-file-pdf"></i><span>Imprimir / Exportar Reporte Técnico</span>
                    </button>
                </div>
            </div>`;
        setTimeout(drawReportTimeChart, 100);
    }
}

// --- GESTIÓN DE DATOS Y METADATOS ---
function updateMetaField(field, value) { myData[field] = value; saveState(); }
function addVariable() {
    const newId = 'val' + (myData.variables.length + 1);
    myData.variables.push({ id: newId, name: 'Nueva Var' });
    myData.rows.forEach(r => r[newId] = 500);
    saveState(); renderStepContent();
}
function deleteVariable(index) {
    if (myData.variables.length <= 1) { alert("Debe quedar al menos una variable activa."); return; }
    const removedId = myData.variables[index].id;
    myData.variables.splice(index, 1);
    myData.rows.forEach(r => delete r[removedId]);
    saveState(); renderStepContent();
}
function updateVariableName(index, name) { myData.variables[index].name = name; saveState(); }
function addRow() {
    const newRow = { periodo: "Período " + (myData.rows.length + 1) };
    myData.variables.forEach(v => newRow[v.id] = 1000);
    myData.rows.push(newRow);
    saveState(); renderStepContent();
}
function deleteRow(index) {
    if (myData.rows.length <= 1) { alert("Debe quedar al menos un período."); return; }
    myData.rows.splice(index, 1); saveState(); renderStepContent();
}
function updateRowField(index, field, value) {
    myData.rows[index][field] = (field === 'periodo') ? value : (value === "" ? 0 : Number(value));
    saveState();
}
function selectVariableForAnalysis(varId) { myData.selectedVariableForAnalysis = varId; saveState(); renderStepContent(); }
function saveAndAdvance(step) { saveState(); changeStep(step); }
function saveCurrentReportToHistory() {
    historyReports.unshift({ title: myData.reportTitle, period: myData.periodAnalyzed, date: new Date().toLocaleDateString(), data: JSON.parse(JSON.stringify(myData)) });
    saveState(); renderStepContent(); alert("Informe técnico guardado en el historial.");
}
function loadHistoryReport(index) {
    if (historyReports[index]) { myData = JSON.parse(JSON.stringify(historyReports[index].data)); saveState(); renderStepContent(); }
}
function deleteHistoryReport(index) { historyReports.splice(index, 1); saveState(); renderStepContent(); }

// --- RENDERIZADO DE GRÁFICOS ---
function drawAllCharts() {
    const labels = myData.rows.map(r => r.periodo);
    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

    ['chartBar', 'chartLine', 'chartTotals', 'chartScatter', 'chartRadar', 'chartPie'].forEach(id => {
        let existing = Chart.getChart(id);
        if (existing) existing.destroy();
    });

    const ctxBar = document.getElementById('chartBar');
    if (ctxBar) {
        new Chart(ctxBar.getContext('2d'), {
            type: 'bar',
            data: { labels, datasets: myData.variables.map((v, i) => ({ label: v.name, data: myData.rows.map(r => r[v.id] || 0), backgroundColor: colors[i % colors.length], borderRadius: 4 })) },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { color: '#33415522' } }, y: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { color: '#33415522' } } } }
        });
    }

    const ctxLine = document.getElementById('chartLine');
    if (ctxLine) {
        new Chart(ctxLine.getContext('2d'), {
            type: 'line',
            data: { labels, datasets: myData.variables.map((v, i) => ({ label: v.name, data: myData.rows.map(r => r[v.id] || 0), borderColor: colors[i % colors.length], tension: 0.3, borderWidth: 2 })) },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { color: '#33415522' } }, y: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { color: '#33415522' } } } }
        });
    }

    const ctxTotals = document.getElementById('chartTotals');
    if (ctxTotals) {
        const totalsData = myData.variables.map(v => myData.rows.reduce((acc, r) => acc + (Number(r[v.id]) || 0), 0));
        new Chart(ctxTotals.getContext('2d'), {
            type: 'bar',
            data: { labels: myData.variables.map(v => v.name), datasets: [{ data: totalsData, backgroundColor: colors.slice(0, myData.variables.length), borderRadius: 4 }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { color: '#33415522' } }, y: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { color: '#33415522' } } } }
        });
    }

    const ctxScatter = document.getElementById('chartScatter');
    if (ctxScatter) {
        new Chart(ctxScatter.getContext('2d'), {
            type: 'scatter',
            data: { datasets: myData.variables.map((v, i) => ({ label: v.name, data: myData.rows.map((r, idx) => ({ x: idx + 1, y: r[v.id] || 0 })), backgroundColor: colors[i % colors.length], pointRadius: 4 })) },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#94a3b8', font: { size: 10 }, callback: val => myData.rows[val - 1]?.periodo || val }, grid: { color: '#33415522' } }, y: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { color: '#33415522' } } } }
        });
    }

    const ctxRadar = document.getElementById('chartRadar');
    if (ctxRadar) {
        new Chart(ctxRadar.getContext('2d'), {
            type: 'radar',
            data: { labels, datasets: myData.variables.map((v, i) => ({ label: v.name, data: myData.rows.map(r => r[v.id] || 0), borderColor: colors[i % colors.length], backgroundColor: colors[i % colors.length] + '20', borderWidth: 2 })) },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { r: { ticks: { display: false }, grid: { color: '#33415544' } } } }
        });
    }

    const ctxPie = document.getElementById('chartPie');
    if (ctxPie) {
        const pieTotals = myData.variables.map(v => myData.rows.reduce((acc, r) => acc + (Number(r[v.id]) || 0), 0));
        new Chart(ctxPie.getContext('2d'), {
            type: 'pie',
            data: { labels: myData.variables.map(v => v.name), datasets: [{ data: pieTotals, backgroundColor: colors.slice(0, myData.variables.length), borderWidth: 1, borderColor: '#1e293b' }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
        });
    }
}

function openChartModal(type, title) {
    const modal = document.getElementById('chartModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalInterpretation = document.getElementById('modalInterpretation');
    if (!modal) return;

    modalTitle.innerText = title;
    modal.classList.remove('hidden');
    modal.classList.add('flex');

    if (activeModalChart) activeModalChart.destroy();

    const labels = myData.rows.map(r => r.periodo);
    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
    const ctx = document.getElementById('modalChartCanvas').getContext('2d');

    let configType = type === 'scatter' ? 'scatter' : (type === 'pie' ? 'pie' : (type === 'radar' ? 'radar' : (type === 'line' ? 'line' : 'bar')));
    
    let chartData = {
        labels: (type === 'pie' || type === 'totals') ? myData.variables.map(v => v.name) : labels,
        datasets: type === 'pie' ? [{
            data: myData.variables.map(v => myData.rows.reduce((acc, r) => acc + (Number(r[v.id]) || 0), 0)),
            backgroundColor: colors.slice(0, myData.variables.length),
            borderWidth: 2, borderColor: '#1e293b'
        }] : (type === 'totals' ? [{
            data: myData.variables.map(v => myData.rows.reduce((acc, r) => acc + (Number(r[v.id]) || 0), 0)),
            backgroundColor: colors.slice(0, myData.variables.length),
            borderRadius: 6
        }] : (configType === 'scatter' ? myData.variables.map((v, i) => ({
            label: v.name, data: myData.rows.map((r, idx) => ({ x: idx + 1, y: r[v.id] || 0 })),
            backgroundColor: colors[i % colors.length], pointRadius: 6
        })) : myData.variables.map((v, i) => ({
            label: v.name, data: myData.rows.map(r => r[v.id] || 0),
            borderColor: colors[i % colors.length], backgroundColor: colors[i % colors.length] + '20',
            fill: configType === 'radar', borderWidth: 2
        }))))
    };

    activeModalChart = new Chart(ctx, {
        type: configType,
        data: chartData,
        options: { 
            responsive: true, maintainAspectRatio: false, 
            plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } },
            scales: (type === 'pie' ? {} : {
                x: { ticks: { color: '#94a3b8' }, grid: { color: '#33415533' } },
                y: { ticks: { color: '#94a3b8' }, grid: { color: '#33415533' } },
                ...(configType === 'radar' ? { r: { ticks: { color: '#94a3b8', backdropColor: 'transparent' }, grid: { color: '#33415566' } } } : {})
            })
        }
    });

    modalInterpretation.innerText = getChartInternalAnalysis(type);
}

function closeChartModal() {
    const modal = document.getElementById('chartModal');
    if (modal) {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
        if (activeModalChart) { activeModalChart.destroy(); activeModalChart = null; }
    }
}

function drawReportTimeChart() {
    const ctx = document.getElementById('reportTimeChart');
    if (!ctx) return;
    let existing = Chart.getChart('reportTimeChart');
    if (existing) existing.destroy();

    const labels = myData.rows.map(r => r.periodo);
    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

    new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: { labels, datasets: myData.variables.map((v, i) => ({ label: v.name, data: myData.rows.map(r => r[v.id] || 0), borderColor: colors[i % colors.length], tension: 0.3, borderWidth: 2 })) },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, color: '#94a3b8' } } }, scales: { x: { ticks: { color: '#94a3b8' }, grid: { color: '#33415533' } }, y: { ticks: { color: '#94a3b8' }, grid: { color: '#33415533' } } } }
    });
}

document.addEventListener('DOMContentLoaded', () => { renderStepContent(); });