/**
 * SISTEMA CENTRALIZADO DE CONFIGURACIÓN DE HERRAMIENTAS
 * Para agregar una nueva herramienta o recurso, simplemente añada un nuevo objeto a este arreglo.
 */
const herramientas = [
    {
        id: "control-eventos",
        nombre: "Control de Eventos",
        descripcion: "Herramienta especializada para procesar, cruzar y analizar información delictiva. Verificar y análizar errores",
        icono: "🔎",
        url: "control-eventos/index.html",
        tipo: "interno",
        categoria: "analisis"
    },
    {
        id: "eliminacion_duplicado",
        nombre: "Eliminacion de Duplicados",
        descripcion: "Sistema centralizado de consultas rápidas y búsqueda en bases de datos.",
        icono: "📋",
        url: "eliminar-duplicados/index.html",
        tipo: "interno",
        categoria: "consultas"
    },
    {
        id: "utilidades",
        nombre: "Utilidades",
        descripcion: "Conjunto de utilidades de apoyo operativo, conversores y herramientas auxiliares.",
        icono: "🛠️",
        url: "paginas/utilidades/index.html",
        tipo: "interno",
        categoria: "utilidades"
    },
    {
        id: "recursos",
        nombre: "Recursos Web",
        descripcion: "Repositorio de enlaces externos, manuales normativos y portales de consulta.",
        icono: "🌐",
        url: "paginas/recursos/index.html",
        tipo: "interno",
        categoria: "recursos"
    },
    {
        id: "recurso-externo-ejemplo",
        nombre: "Buscar para verificar Identidad",
        descripcion: "Acceso directo a fuente web externa de consulta - Realiza la búsqueda por nombre, apellido, DNI o Cuil.",
        icono: "🔗",
        url: "https://datuar.com/index.php",
        tipo: "externo",
        categoria: "externo",
        nuevaPestana: true
    },
    {
        nombre: "Buscamos la Gemini",
        descripcion: "Esta es una nueva consulta al exterior.",
        icono: "🌐",
        url: "https://gemini.google.com/app",
        tipo: "externo",
        categoria: "externo", // o "recursos"
        nuevaPestana: true
    }
    
];

document.addEventListener("DOMContentLoaded", () => {
    const gridContainer = document.getElementById("toolsGrid");
    const searchInput = document.getElementById("searchInput");
    const filterButtons = document.querySelectorAll(".filter-btn");
    const noResultsEl = document.getElementById("noResults");

    let categoriaActual = "todas";
    let textoBusqueda = "";

    // Función para renderizar las tarjetas de herramientas
    function renderizarHerramientas(lista) {
        gridContainer.innerHTML = "";

        if (lista.length === 0) {
            noResultsEl.classList.remove("hidden");
            return;
        } else {
            noResultsEl.classList.add("hidden");
        }

        lista.forEach(herramienta => {
            const card = document.createElement("div");
            card.className = "tool-card";

            // Determinar atributos de enlace según el tipo
            let enlaceAttr = `href="${herramienta.url}"`;
            if (herramienta.tipo === "externo" && herramienta.nuevaPestana) {
                enlaceAttr += ` target="_blank" rel="noopener noreferrer"`;
            }

            card.innerHTML = `
                <div class="card-content">
                    <span class="card-icon">${herramienta.icono}</span>
                    <h3 class="card-title">${herramienta.nombre}</h3>
                    <p class="card-desc">${herramienta.descripcion}</p>
                </div>
                <a ${enlaceAttr} class="card-btn">INGRESAR</a>
            `;

            gridContainer.appendChild(card);
        });
    }

    // Función de filtrado y búsqueda combinada
    function filtrarYBuscar() {
        let resultado = herramientas;

        // Filtrar por categoría
        if (categoriaActual !== "todas") {
            resultado = resultado.filter(h => h.categoria === categoriaActual);
        }

        // Filtrar por texto de búsqueda
        if (textoBusqueda.trim() !== "") {
            const query = textoBusqueda.toLowerCase();
            resultado = resultado.filter(h => 
                h.nombre.toLowerCase().includes(query) || 
                h.descripcion.toLowerCase().includes(query)
            );
        }

        renderizarHerramientas(resultado);
    }

    // Evento de búsqueda en tiempo real
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            textoBusqueda = e.target.value;
            filtrarYBuscar();
        });
    }

    // Eventos de botones de categoría
    filterButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            filterButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            categoriaActual = btn.getAttribute("data-category");
            filtrarYBuscar();
        });
    });

    // Renderizado inicial al cargar la página principal
    if (gridContainer) {
        renderizarHerramientas(herramientas);
    }
});