// --- ESTADO GLOBAL Y MOTOR DE ANÁLISIS DE DATOS ---
let currentStep = 1;
let myData = {
    variables: [
        { id: "val1", name: "Ventas ($)" },
        { id: "val2", name: "Gastos ($)" }
    ],
    rows: [
        { periodo: "Enero", val1: 1250, val2: 900 },
        { periodo: "Febrero", val1: 1400, val2: 950 },
        { periodo: "Marzo", val1: 1850, val2: 1100 },
        { periodo: "Abril", val1: 1600, val2: 1050 }
    ],
    selectedVariableForAnalysis: "val1"
};

let activeModalChart = null;

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

function renderStepContent() {
    const container = document.getElementById('step-content');
    if (!container) return;
    
    if (currentStep === 1) {
        // --- PASO 1: INGRESO DE DATOS ---
        container.innerHTML = `
            <div class="space-y-6 max-w-4xl mx-auto">
                <div class="text-center space-y-2">
                    <h2 class="text-xl sm:text-2xl font-extrabold text-slate-100">Configuración General de Variables y Registros</h2>
                    <p class="text-xs sm:text-sm text-slate-400">Diseñado para adaptarse a cualquier disciplina. Agrega o elimina variables y períodos libremente.</p>
                </div>
                
                <div class="bg-slate-900/70 p-5 sm:p-6 rounded-2xl border border-slate-700/60 space-y-5 shadow-lg">
                    <div class="space-y-3">
                        <div class="flex justify-between items-center">
                            <span class="text-xs font-bold text-slate-300 uppercase tracking-wider">Variables del Análisis</span>
                            <button onclick="addVariable()" class="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition shadow-sm font-semibold flex items-center gap-1.5"><i class="fa-solid fa-plus"></i> Agregar Variable</button>
                        </div>
                        <div class="flex flex-wrap gap-2.5">
                            ${myData.variables.map((v, vIndex) => `
                                <div class="flex items-center space-x-2 bg-slate-800 px-3 py-2 rounded-xl border border-slate-700 shadow-xs group focus-within:border-indigo-500 transition">
                                    <input type="text" value="${v.name}" onchange="updateVariableName(${vIndex}, this.value)" class="text-xs font-semibold text-slate-200 border-none focus:outline-none bg-transparent w-28">
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
                                        <td class="p-2.5">
                                            <input type="text" value="${r.periodo}" onchange="updateRowField(${rIndex}, 'periodo', this.value)" class="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 text-xs w-32 focus:outline-none focus:border-indigo-500">
                                        </td>
                                        ${myData.variables.map(v => `
                                            <td class="p-2.5">
                                                <input type="number" value="${r[v.id] !== undefined ? r[v.id] : 0}" onchange="updateRowField(${rIndex}, '${v.id}', this.value)" class="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 text-xs w-28 focus:outline-none focus:border-indigo-500">
                                            </td>
                                        `).join('')}
                                        <td class="p-2.5 text-center">
                                            <button onclick="deleteRow(${rIndex})" class="text-rose-400 hover:text-rose-300 p-1.5 rounded-lg hover:bg-rose-500/10 transition"><i class="fa-solid fa-trash-can"></i></button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="flex justify-end pt-2">
                    <button onclick="saveAndAdvance(2)" class="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold px-6 py-3 rounded-xl transition shadow-lg shadow-indigo-600/25 flex items-center space-x-2 text-sm">
                        <span>Ejecutar Motor de Análisis</span> <i class="fa-solid fa-arrow-right"></i>
                    </button>
                </div>
            </div>`;
    } else if (currentStep === 2) {
        // --- PASO 2: ¿QUÉ ESTÁ PASANDO? (MOTOR DE ANÁLISIS MEJORADO) ---
        const selectedVar = myData.variables.find(v => v.id === myData.selectedVariableForAnalysis) || myData.variables[0];
        const values = myData.rows.map(r => Number(r[selectedVar.id]) || 0);
        const total = values.reduce((a, b) => a + b, 0);
        const prom = values.length ? (total / values.length).toFixed(1) : 0;
        const maxVal = Math.max(...values);
        const minVal = Math.min(...values);
        const maxRow = myData.rows.find(r => Number(r[selectedVar.id]) === maxVal) || myData.rows[0];
        const minRow = myData.rows.find(r => Number(r[selectedVar.id]) === minVal) || myData.rows[0];

        // Cálculo de Desviación Estándar y Variación
        const meanNum = Number(prom);
        const variance = values.length ? values.reduce((acc, val) => acc + Math.pow(val - meanNum, 2), 0) / values.length : 0;
        const stdDev = Math.sqrt(variance).toFixed(1);
        const firstVal = values[0] || 0;
        const lastVal = values[values.length - 1] || 0;
        const percentChange = firstVal !== 0 ? (((lastVal - firstVal) / firstVal) * 100).toFixed(1) : 0;

        container.innerHTML = `
            <div class="space-y-6 max-w-3xl mx-auto">
                <div class="text-center space-y-2">
                    <h2 class="text-xl sm:text-2xl font-extrabold text-slate-100">¿Qué está pasando? – Análisis Inteligente Pro</h2>
                    <p class="text-xs sm:text-sm text-slate-400">Evaluación automática avanzada con indicadores de dispersión y tendencia global.</p>
                </div>

                <div class="flex justify-center gap-2 flex-wrap">
                    ${myData.variables.map(v => `
                        <button onclick="selectVariableForAnalysis('${v.id}')" class="px-4 py-2 rounded-xl text-xs font-semibold transition ${myData.selectedVariableForAnalysis === v.id ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800'}">
                            ${v.name}
                        </button>
                    `).join('')}
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div class="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl space-y-1 backdrop-blur-sm">
                        <div class="text-emerald-400 font-bold text-xs uppercase tracking-wider">Valor Máximo</div>
                        <p class="text-lg sm:text-xl font-extrabold text-slate-100">${maxVal.toLocaleString()}</p>
                        <p class="text-[10px] text-slate-400">Período: ${maxRow.periodo}</p>
                    </div>
                    <div class="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl space-y-1 backdrop-blur-sm">
                        <div class="text-rose-400 font-bold text-xs uppercase tracking-wider">Valor Mínimo</div>
                        <p class="text-lg sm:text-xl font-extrabold text-slate-100">${minVal.toLocaleString()}</p>
                        <p class="text-[10px] text-slate-400">Período: ${minRow.periodo}</p>
                    </div>
                    <div class="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl space-y-1 backdrop-blur-sm">
                        <div class="text-blue-400 font-bold text-xs uppercase tracking-wider">Promedio (Media)</div>
                        <p class="text-lg sm:text-xl font-extrabold text-slate-100">${prom}</p>
                        <p class="text-[10px] text-slate-400">Desv. Estándar: ${stdDev}</p>
                    </div>
                    <div class="bg-purple-500/10 border border-purple-500/20 p-4 rounded-2xl space-y-1 backdrop-blur-sm">
                        <div class="text-purple-400 font-bold text-xs uppercase tracking-wider">Variación Total</div>
                        <p class="text-lg sm:text-xl font-extrabold text-slate-100">${percentChange > 0 ? '+' : ''}${percentChange}%</p>
                        <p class="text-[10px] text-slate-400">Del inicio al final</p>
                    </div>
                </div>

                <!-- Desglose estructurado -->
                <div class="bg-slate-900/60 border border-slate-700/60 p-5 sm:p-6 rounded-2xl space-y-4 text-xs sm:text-sm text-slate-300 shadow-lg">
                    <h4 class="font-bold text-slate-100 text-sm flex items-center"><i class="fa-solid fa-microscope text-indigo-400 mr-2.5"></i> Diagnóstico Estadístico: ${selectedVar.name}</h4>
                    
                    <div class="space-y-3 leading-relaxed text-slate-300">
                        <p><strong>1. Comportamiento Observado:</strong> Se analizaron ${myData.rows.length} períodos. El registro superior se ubica en <strong>${maxRow.periodo}</strong> (${maxVal}) y el inferior en <strong>${minRow.periodo}</strong> (${minVal}).</p>
                        <p><strong>2. Tendencia Central y Dispersión:</strong> La media aritmética es de <strong>${prom}</strong>, acompañada de una desviación estándar de <strong>${stdDev}</strong>, lo que indica ${Number(stdDev) > (meanNum * 0.3) ? 'una alta volatilidad entre los períodos evaluados' : 'un comportamiento relativamente estable y homogéneo'}.</p>
                        <p><strong>3. Evolución Temporal:</strong> La serie registra una variación global del <strong>${percentChange}%</strong> entre el primer y el último período registrado.</p>
                        <p class="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-200"><strong>4. Interpretación Analítica:</strong> El análisis automatizado refleja las dinámicas cuantitativas internas de la variable seleccionada. Este diagnóstico sirve como base objetiva para la toma de decisiones operativas o estratégicas.</p>
                    </div>
                </div>

                <div class="flex justify-between items-center pt-2">
                    <button onclick="changeStep(1)" class="text-slate-400 hover:text-slate-200 px-4 py-2 text-sm font-medium transition">Volver</button>
                    <button onclick="changeStep(3)" class="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold px-6 py-3 rounded-xl transition shadow-lg shadow-indigo-600/25 flex items-center space-x-2 text-sm">
                        <span>Ver Mis Gráficos</span> <i class="fa-solid fa-arrow-right"></i>
                    </button>
                </div>
            </div>`;
    } else if (currentStep === 3) {
        // --- PASO 3: MIS GRÁFICOS ---
        container.innerHTML = `
            <div class="space-y-6 max-w-5xl mx-auto">
                <div class="text-center space-y-2">
                    <h2 class="text-xl sm:text-2xl font-extrabold text-slate-100">Panel de Gráficos Analíticos Pro</h2>
                    <p class="text-xs sm:text-sm text-slate-400">Haz clic en cualquier tarjeta para abrir la vista ampliada y su interpretación detallada.</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <div onclick="openChartModal('bar', 'Gráfico de Barras Comparativo')" class="bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-slate-700/60 shadow-lg space-y-3 cursor-pointer hover:border-indigo-500/60 hover:bg-slate-900/90 transition group">
                        <div class="flex justify-between items-center"><h3 class="font-bold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5"><i class="fa-solid fa-chart-column text-indigo-400"></i> Barras Comparativas</h3><i class="fa-solid fa-expand text-xs text-slate-500 group-hover:text-indigo-400 transition"></i></div>
                        <div class="h-48 flex items-center justify-center"><canvas id="chartBar"></canvas></div>
                    </div>
                    <div onclick="openChartModal('line', 'Gráfico de Evolución Temporal')" class="bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-slate-700/60 shadow-lg space-y-3 cursor-pointer hover:border-indigo-500/60 hover:bg-slate-900/90 transition group">
                        <div class="flex justify-between items-center"><h3 class="font-bold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5"><i class="fa-solid fa-chart-line text-emerald-400"></i> Tendencia Temporal</h3><i class="fa-solid fa-expand text-xs text-slate-500 group-hover:text-indigo-400 transition"></i></div>
                        <div class="h-48 flex items-center justify-center"><canvas id="chartLine"></canvas></div>
                    </div>
                    <div onclick="openChartModal('scatter', 'Gráfico de Dispersión y Correlación')" class="bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-slate-700/60 shadow-lg space-y-3 cursor-pointer hover:border-indigo-500/60 hover:bg-slate-900/90 transition group">
                        <div class="flex justify-between items-center"><h3 class="font-bold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5"><i class="fa-solid fa-chart-scatter text-blue-400"></i> Dispersión de Puntos</h3><i class="fa-solid fa-expand text-xs text-slate-500 group-hover:text-indigo-400 transition"></i></div>
                        <div class="h-48 flex items-center justify-center"><canvas id="chartScatter"></canvas></div>
                    </div>
                    <div onclick="openChartModal('radar', 'Gráfico de Perfil Multidimensional (Radar)')" class="bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-slate-700/60 shadow-lg space-y-3 cursor-pointer hover:border-indigo-500/60 hover:bg-slate-900/90 transition group">
                        <div class="flex justify-between items-center"><h3 class="font-bold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5"><i class="fa-solid fa-spider text-purple-400"></i> Perfil Multidimensional</h3><i class="fa-solid fa-expand text-xs text-slate-500 group-hover:text-indigo-400 transition"></i></div>
                        <div class="h-48 flex items-center justify-center"><canvas id="chartRadar"></canvas></div>
                    </div>
                    <div onclick="openChartModal('pie', 'Gráfico de Composición (Torta)')" class="bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-slate-700/60 shadow-lg space-y-3 cursor-pointer hover:border-indigo-500/60 hover:bg-slate-900/90 transition group">
                        <div class="flex justify-between items-center"><h3 class="font-bold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5"><i class="fa-solid fa-chart-pie text-amber-400"></i> Composición General</h3><i class="fa-solid fa-expand text-xs text-slate-500 group-hover:text-indigo-400 transition"></i></div>
                        <div class="h-48 flex items-center justify-center"><canvas id="chartPie"></canvas></div>
                    </div>
                </div>

                <div class="flex justify-between items-center pt-2">
                    <button onclick="changeStep(2)" class="text-slate-400 hover:text-slate-200 px-4 py-2 text-sm font-medium transition">Volver</button>
                    <button onclick="changeStep(4)" class="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold px-6 py-3 rounded-xl transition shadow-lg shadow-indigo-600/25 text-sm flex items-center gap-2">
                        <span>Generar Reporte e Informes</span> <i class="fa-solid fa-arrow-right"></i>
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
                        <p class="font-bold text-slate-200 flex items-center gap-1.5"><i class="fa-solid fa-lightbulb text-amber-400"></i> Interpretación Automática:</p>
                        <p id="modalInterpretation">Este gráfico representa la distribución real de las variables analizadas, permitiendo identificar puntos altos, tendencias y relaciones directas entre los registros temporales.</p>
                    </div>
                </div>
            </div>`;
        setTimeout(drawAllCharts, 100);
    } else if (currentStep === 4) {
        // --- PASO 4: REPORTE E INFORMES ---
        container.innerHTML = `
            <div class="space-y-6 max-w-4xl mx-auto" id="report-printable-area">
                <div class="text-center space-y-2 no-print">
                    <h2 class="text-xl sm:text-2xl font-extrabold text-slate-100">Reporte e Informes Ejecutivos Pro</h2>
                    <p class="text-xs sm:text-sm text-slate-400">Documento analítico estructurado listo para impresión o exportación formal.</p>
                </div>

                <div class="bg-slate-900/90 border border-slate-700/80 p-6 sm:p-10 rounded-3xl shadow-2xl space-y-8 text-slate-200">
                    <div class="border-b border-slate-800 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <span class="bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Informe Técnico Oficial</span>
                            <h3 class="text-xl sm:text-2xl font-extrabold text-slate-100 mt-2">Auditoría Cuantitativa y Análisis Integral</h3>
                            <p class="text-xs text-slate-400 mt-1">Plataforma Analítica de Datos Pro</p>
                        </div>
                        <div class="text-left sm:text-right text-xs text-slate-400 space-y-0.5">
                            <p><strong>Fecha:</strong> ${new Date().toLocaleDateString()}</p>
                            <p><strong>Total Registros:</strong> ${myData.rows.length}</p>
                        </div>
                    </div>

                    <!-- 1. Informe General Estricto -->
                    <div class="space-y-2.5">
                        <h4 class="font-bold text-slate-100 text-xs sm:text-sm uppercase tracking-wider text-indigo-400">1. Informe General del Sistema</h4>
                        <p class="text-xs sm:text-sm leading-relaxed text-slate-300">
                            El conjunto de datos procesado comprende un total de <strong>${myData.rows.length} períodos</strong> evaluados a través de <strong>${myData.variables.length} variables</strong> simultáneas. El análisis global demuestra un comportamiento coherente con los valores nominales ingresados, permitiendo identificar puntos de inflexión temporales y estabilidad estructural sin desviaciones imprevistas.
                        </p>
                    </div>

                    <!-- 2. Gráfico de Tendencia Temporal Obligatorio en Reporte -->
                    <div class="space-y-3 bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
                        <h4 class="font-bold text-slate-100 text-xs sm:text-sm uppercase tracking-wider text-indigo-400 flex items-center"><i class="fa-solid fa-chart-line mr-2"></i> 2. Análisis de Tendencia Temporal</h4>
                        <p class="text-xs text-slate-400">Representación evolutiva de los registros temporales analizados:</p>
                        <div class="h-56 sm:h-64 flex items-center justify-center bg-slate-900 p-3 rounded-xl border border-slate-800"><canvas id="reportTimeChart"></canvas></div>
                        <p class="text-xs text-slate-400 leading-relaxed pt-1">
                            <strong>Interpretación de la Tendencia:</strong> La evolución temporal muestra la trayectoria de las variables a lo largo de los períodos. Se identifican los incrementos y disminuciones puntuales, reflejando el dinamismo y los cambios relevantes ocurridos en la serie.
                        </p>
                    </div>

                    <!-- 3. Resumen Estricto de Cada Variable -->
                    <div class="space-y-3">
                        <h4 class="font-bold text-slate-100 text-xs sm:text-sm uppercase tracking-wider text-indigo-400">3. Resumen Analítico e Individual por Variable</h4>
                        <div class="grid grid-cols-1 gap-3">
                            ${myData.variables.map(v => {
                                const vals = myData.rows.map(r => Number(r[v.id]) || 0);
                                const total = vals.reduce((a, b) => a + b, 0);
                                const prom = vals.length ? (total / vals.length).toFixed(1) : 0;
                                const max = Math.max(...vals);
                                const min = Math.min(...vals);
                                const maxR = myData.rows.find(r => Number(r[v.id]) === max)?.periodo || '-';
                                const minR = myData.rows.find(r => Number(r[v.id]) === min)?.periodo || '-';
                                return `
                                    <div class="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-1.5 text-xs sm:text-sm">
                                        <div class="flex justify-between items-center font-bold text-slate-200">
                                            <span>Variable: ${v.name}</span>
                                            <span class="text-indigo-400 font-semibold">Total: ${total.toLocaleString()}</span>
                                        </div>
                                        <p class="text-slate-400 leading-relaxed pt-1 text-xs">
                                            Comportamiento: Presenta un promedio periódico de <strong>${prom}</strong>. Su punto máximo se registró en <strong>${maxR}</strong> con <strong>${max.toLocaleString()}</strong>, mientras que su nivel mínimo se ubicó en <strong>${minR}</strong> con <strong>${min.toLocaleString()}</strong>.
                                        </p>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>

                    <!-- 4. Matriz de Datos -->
                    <div class="space-y-3">
                        <h4 class="font-bold text-slate-100 text-xs sm:text-sm uppercase tracking-wider text-indigo-400">4. Matriz de Datos Registrados</h4>
                        <div class="overflow-x-auto rounded-xl border border-slate-800">
                            <table class="w-full text-left text-xs border-collapse">
                                <thead class="bg-slate-950 text-slate-300">
                                    <tr class="border-b border-slate-800">
                                        <th class="p-3 font-semibold">Período</th>
                                        ${myData.variables.map(v => `<th class="p-3 font-semibold">${v.name}</th>`).join('')}
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-800/60 text-slate-300 bg-slate-950/30">
                                    ${myData.rows.map(r => `
                                        <tr class="hover:bg-slate-800/30 transition">
                                            <td class="p-3 font-semibold text-slate-200">${r.periodo}</td>${myData.variables.map(v => `<td class="p-3">${r[v.id] !== undefined ? r[v.id] : 0}</td>`).join('')}
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div class="flex justify-between items-center no-print pt-2">
                    <button onclick="changeStep(3)" class="text-slate-400 hover:text-slate-200 px-4 py-2 text-sm font-medium transition">Volver</button>
                    <button onclick="window.print()" class="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold px-6 py-3 rounded-xl transition shadow-lg shadow-emerald-600/25 flex items-center space-x-2 text-sm">
                        <i class="fa-solid fa-file-pdf"></i><span>Descargar / Imprimir Reporte Completo</span>
                    </button>
                </div>
            </div>`;
        setTimeout(drawReportTimeChart, 100);
    }
}

// --- GESTIÓN DE VARIABLES Y FILAS ---
function addVariable() {
    const newId = 'val' + (myData.variables.length + 1);
    myData.variables.push({ id: newId, name: 'Nueva Var' });
    myData.rows.forEach(r => r[newId] = 500);
    renderStepContent();
}

function deleteVariable(index) {
    if (myData.variables.length <= 1) {
        alert("Debe quedar al menos una variable activa.");
        return;
    }
    const removedId = myData.variables[index].id;
    myData.variables.splice(index, 1);
    myData.rows.forEach(r => delete r[removedId]);
    renderStepContent();
}

function updateVariableName(index, name) {
    if (name.trim() === "") {
        alert("El nombre de la variable no puede estar vacío.");
        renderStepContent();
        return;
    }
    myData.variables[index].name = name;
}

function addRow() {
    const newRow = { periodo: "Período " + (myData.rows.length + 1) };
    myData.variables.forEach(v => newRow[v.id] = 1000);
    myData.rows.push(newRow);
    renderStepContent();
}

function deleteRow(index) {
    if (myData.rows.length <= 1) {
        alert("Debe quedar al menos un período de registro.");
        return;
    }
    myData.rows.splice(index, 1);
    renderStepContent();
}

function updateRowField(index, field, value) {
    if (field === 'periodo') {
        myData.rows[index][field] = value;
    } else {
        myData.rows[index][field] = value === "" ? 0 : Number(value);
    }
}

function selectVariableForAnalysis(varId) {
    myData.selectedVariableForAnalysis = varId;
    renderStepContent();
}

function saveAndAdvance(step) {
    const badge = document.getElementById('status-badge');
    if (badge) {
        badge.className = "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-xs";
        badge.innerHTML = `<i class="fa-solid fa-circle text-[7px]"></i> Datos procesados con éxito`;
    }
    changeStep(step);
}

// --- RENDERIZADO DE GRÁFICOS Y MODAL ---
function drawAllCharts() {
    const labels = myData.rows.map(r => r.periodo);
    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    // 1. Barras
    const ctxBar = document.getElementById('chartBar');
    if (ctxBar) {
        new Chart(ctxBar.getContext('2d'), {
            type: 'bar',
            data: { labels, datasets: myData.variables.map((v, i) => ({ label: v.name, data: myData.rows.map(r => r[v.id] || 0), backgroundColor: colors[i % colors.length], borderRadius: 6 })) },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, color: '#94a3b8', font: { size: 11 } } } }, scales: { x: { ticks: { color: '#94a3b8' }, grid: { color: '#33415533' } }, y: { ticks: { color: '#94a3b8' }, grid: { color: '#33415533' } } } }
        });
    }

    // 2. Líneas
    const ctxLine = document.getElementById('chartLine');
    if (ctxLine) {
        new Chart(ctxLine.getContext('2d'), {
            type: 'line',
            data: { labels, datasets: myData.variables.map((v, i) => ({ label: v.name, data: myData.rows.map(r => r[v.id] || 0), borderColor: colors[i % colors.length], backgroundColor: colors[i % colors.length], tension: 0.3, borderWidth: 2 })) },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, color: '#94a3b8', font: { size: 11 } } } }, scales: { x: { ticks: { color: '#94a3b8' }, grid: { color: '#33415533' } }, y: { ticks: { color: '#94a3b8' }, grid: { color: '#33415533' } } } }
        });
    }

    // 3. Dispersión
    const ctxScatter = document.getElementById('chartScatter');
    if (ctxScatter) {
        new Chart(ctxScatter.getContext('2d'), {
            type: 'scatter',
            data: { datasets: myData.variables.map((v, i) => ({ label: v.name, data: myData.rows.map((r, idx) => ({ x: idx + 1, y: r[v.id] || 0 })), backgroundColor: colors[i % colors.length] })) },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, color: '#94a3b8', font: { size: 11 } } } }, scales: { x: { ticks: { color: '#94a3b8' }, grid: { color: '#33415533' } }, y: { ticks: { color: '#94a3b8' }, grid: { color: '#33415533' } } } }
        });
    }

    // 4. Radar
    const ctxRadar = document.getElementById('chartRadar');
    if (ctxRadar) {
        new Chart(ctxRadar.getContext('2d'), {
            type: 'radar',
            data: { labels, datasets: myData.variables.map((v, i) => ({ label: v.name, data: myData.rows.map(r => r[v.id] || 0), borderColor: colors[i % colors.length], backgroundColor: colors[i % colors.length] + '25', fill: true, borderWidth: 2 })) },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, color: '#94a3b8', font: { size: 11 } } } }, scales: { r: { ticks: { color: '#94a3b8', backdropColor: 'transparent' }, grid: { color: '#33415566' }, angleLines: { color: '#33415566' } } } }
        });
    }

    // 5. Torta
    const ctxPie = document.getElementById('chartPie');
    if (ctxPie) {
        const pieTotals = myData.variables.map(v => myData.rows.reduce((acc, r) => acc + (Number(r[v.id]) || 0), 0));
        new Chart(ctxPie.getContext('2d'), {
            type: 'pie',
            data: { labels: myData.variables.map(v => v.name), datasets: [{ data: pieTotals, backgroundColor: colors.slice(0, myData.variables.length), borderWidth: 2, borderColor: '#1e293b' }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, color: '#94a3b8', font: { size: 11 } } } } }
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

    if (activeModalChart) {
        activeModalChart.destroy();
    }

    const labels = myData.rows.map(r => r.periodo);
    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    const ctx = document.getElementById('modalChartCanvas').getContext('2d');

    let configType = type === 'scatter' ? 'scatter' : (type === 'pie' ? 'pie' : (type === 'radar' ? 'radar' : (type === 'line' ? 'line' : 'bar')));
    
    let chartData = {
        labels: configType === 'pie' ? myData.variables.map(v => v.name) : labels,
        datasets: configType === 'pie' ? [{
            data: myData.variables.map(v => myData.rows.reduce((acc, r) => acc + (Number(r[v.id]) || 0), 0)),
            backgroundColor: colors.slice(0, myData.variables.length),
            borderWidth: 2,
            borderColor: '#1e293b'
        }] : (configType === 'scatter' ? myData.variables.map((v, i) => ({
            label: v.name,
            data: myData.rows.map((r, idx) => ({ x: idx + 1, y: r[v.id] || 0 })),
            backgroundColor: colors[i % colors.length]
        })) : myData.variables.map((v, i) => ({
            label: v.name,
            data: myData.rows.map(r => r[v.id] || 0),
            borderColor: colors[i % colors.length],
            backgroundColor: colors[i % colors.length] + '20',
            fill: configType === 'radar',
            borderRadius: configType === 'bar' ? 6 : 0,
            borderWidth: 2
        })))
    };

    activeModalChart = new Chart(ctx, {
        type: configType,
        data: chartData,
        options: { 
            responsive: true, 
            maintainAspectRatio: false, 
            plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } },
            scales: configType === 'pie' ? {} : {
                x: { ticks: { color: '#94a3b8' }, grid: { color: '#33415533' } },
                y: { ticks: { color: '#94a3b8' }, grid: { color: '#33415533' } }
            }
        }
    });

    modalInterpretation.innerText = `Interpretación avanzada para ${title}: Este gráfico detalla el comportamiento cuantitativo de la serie, permitiendo observar las oscilaciones, tendencias y el peso relativo de cada variable registrada.`;
}

function closeChartModal() {
    const modal = document.getElementById('chartModal');
    if (modal) {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
        if (activeModalChart) {
            activeModalChart.destroy();
            activeModalChart = null;
        }
    }
}

function drawReportTimeChart() {
    const ctx = document.getElementById('reportTimeChart');
    if (!ctx) return;
    const labels = myData.rows.map(r => r.periodo);
    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels,
            datasets: myData.variables.map((v, i) => ({
                label: v.name,
                data: myData.rows.map(r => r[v.id] || 0),
                borderColor: colors[i % colors.length],
                tension: 0.3,
                borderWidth: 2
            }))
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false, 
            plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, color: '#94a3b8' } } },
            scales: {
                x: { ticks: { color: '#94a3b8' }, grid: { color: '#33415533' } },
                y: { ticks: { color: '#94a3b8' }, grid: { color: '#33415533' } }
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    renderStepContent();
});