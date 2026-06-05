// app.js

// Configuración de las credenciales de tu proyecto en Supabase
const SUPABASE_URL = "https://rrynyzvkwdmgdfpkakde.supabase.co/rest/v1/productos";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyeW55enZrd2RtZ2RmcGtha2RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2NzY2NDQsImV4cCI6MjA5NjI1MjY0NH0.K9hcjEweIendolA2H_cQOXbDETdpyBMf-WkZIbWgNrI";

document.addEventListener('DOMContentLoaded', () => {
    const grilla = document.getElementById('grilla-productos');
    const contador = document.getElementById('contador-productos');
    const tituloSeccion = document.getElementById('titulo-seccion');
    const botonesFiltro = document.querySelectorAll('.btn-filtro');
    
    // Elementos del menú desplegable móvil
    const sidebarMenu = document.getElementById('sidebar-menu');
    const menuOverlay = document.getElementById('menu-overlay');
    const btnAbrirMenu = document.getElementById('btn-abrir-menu');
    const btnCerrarMenu = document.getElementById('btn-cerrar-menu');

    // Variable global temporal para guardar los productos que vienen de la nube
    let listaProductosDB = [];

    // --- LÓGICA DEL MENÚ DESPLEGABLE MÓVIL ---
    function abrirMenu() {
        sidebarMenu.classList.remove('-translate-x-full');
        menuOverlay.classList.remove('hidden');
        setTimeout(() => menuOverlay.classList.add('opacity-100'), 10);
    }

    function cerrarMenu() {
        sidebarMenu.classList.add('-translate-x-full');
        menuOverlay.classList.remove('opacity-100');
        setTimeout(() => menuOverlay.classList.add('hidden'), 300);
    }

    btnAbrirMenu.addEventListener('click', abrirMenu);
    btnCerrarMenu.addEventListener('click', cerrarMenu);
    menuOverlay.addEventListener('click', cerrarMenu);

    // --- CONSULTA A LA BASE DE DATOS (SUPABASE) ---
    async function obtenerProductosDesdeSupabase() {
        try {
            grilla.innerHTML = `<p class="col-span-full text-center text-gray-500 py-10">Cargando aromas...</p>`;
            
            // Consultamos la tabla por HTTP usando tu clave anon pública
            const respuesta = await fetch(`${SUPABASE_URL}?select=*`, {
                method: 'GET',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`
                }
            });

            if (!respuesta.ok) throw new Error('Error al conectar con Supabase');

            // Guardamos el array de productos que nos devuelve la base de datos
            listaProductosDB = await respuesta.json();
            
            // Renderizamos la pantalla inicial con todos los productos
            filtrarYMostrarProductos('todos');

        } catch (error) {
            console.error(error);
            grilla.innerHTML = `<p class="col-span-full text-center text-red-500 py-10">Hubo un problema al cargar el catálogo. Por favor reintentá en unos momentos.</p>`;
        }
    }

    // --- LÓGICA DE FILTRADO Y RENDER ---
    function filtrarYMostrarProductos(categoriaFiltrada) {
        grilla.innerHTML = '';
        
        // 1. Filtrar por la categoría seleccionada
        let filtrados = categoriaFiltrada === 'todos' 
            ? listaProductosDB 
            : listaProductosDB.filter(p => p.categoria === categoriaFiltrada);

        // 2. Filtro extra de seguridad: Ocultar los que estén pausados en el catálogo público
        filtrados = filtrados.filter(p => p.activo !== false);

        // 3. Actualizar el contador visual
        contador.textContent = `${filtrados.length} ${filtrados.length === 1 ? 'ítem' : 'ítems'}`;

        if (filtrados.length === 0) {
            grilla.innerHTML = `<p class="col-span-full text-center text-gray-500 py-10">No hay productos disponibles en esta sección por el momento.</p>`;
            return;
        }

        // 4. Inyectar las tarjetas en el HTML
        filtrados.forEach(prod => {
            const card = document.createElement('div');
            card.className = "card-producto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition duration-300 flex flex-col relative";
            
            // Evaluamos si corresponde renderizar el precio (Supabase devuelve nombres con guion bajo: mostrar_precio)
            const etiquetaPrecio = (prod.mostrar_precio && prod.precio) 
                ? `<div class="text-lg font-black text-gray-900 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">$${prod.precio}</div>` 
                : '';

            // Badge para la sección exclusiva de Ofertas
            const badgeOferta = prod.categoria === 'ofertas' ? `<span class="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">🔥 OFERTA</span>` : '';
            
            card.innerHTML = `
                <div class="relative bg-gray-100 h-64 w-full">
                    <img src="${prod.imagen}" alt="${prod.nombre}" class="object-cover w-full h-full transition-transform duration-500 hover:scale-105" onerror="this.src='https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&q=80'">
                    <span class="absolute top-3 left-3 bg-black text-white text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded">
                        ${prod.subcategoria}
                    </span>
                    ${badgeOferta}
                </div>
                <div class="p-5 flex-1 flex flex-col justify-between">
                    <div>
                        <h3 class="text-lg font-bold text-gray-900 mb-1">${prod.nombre}</h3>
                        <p class="text-sm text-gray-600 mb-4 line-clamp-3">${prod.descripcion}</p>
                    </div>
                    <div class="border-t border-gray-100 pt-3 flex justify-between items-center text-xs">
                        <div class="flex flex-col">
                            <span class="text-gray-400 font-medium">Contenido</span>
                            <span class="font-bold text-gray-900 mt-0.5">${prod.tamano}</span>
                        </div>
                        ${etiquetaPrecio}
                    </div>
                </div>
            `;
            grilla.appendChild(card);
        });
    }

    // Manejador de acciones en los botones de categoría
    botonesFiltro.forEach(boton => {
        boton.addEventListener('click', (e) => {
            botonesFiltro.forEach(b => b.classList.remove('active'));
            
            const botonCorrecto = e.target.closest('.btn-filtro');
            botonCorrecto.classList.add('active');

            const categoria = botonCorrecto.getAttribute('data-cat');
            
            // Reemplazar emojis del encabezado de la sección
            tituloSeccion.textContent = botonCorrecto.textContent.replace(/[🔥✨🧥🌿🧴🚗]\s/g, '');
            
            filtrarYMostrarProductos(categoria);

            if (window.innerWidth < 768) {
                cerrarMenu();
            }
        });
    });

    // Arrancamos la aplicación trayendo los datos vivos de Supabase
    obtenerProductosDesdeSupabase();
});