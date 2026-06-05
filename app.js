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
    
    // 1. Evaluamos si corresponde renderizar el precio
    const etiquetaPrecio = (prod.mostrar_precio && prod.precio) 
        ? `<div class="text-base font-black text-gray-900 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">$${prod.precio}</div>` 
        : '';

    // 2. Badge para la sección exclusiva de Ofertas
    const badgeOferta = prod.categoria === 'ofertas' ? `<span class="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">🔥 OFERTA</span>` : '';
    
    // 3. CONFIGURACIÓN DEL MENSAJE AUTOMÁTICO DE WHATSAPP
    const numeroTelefono = "542915263070"; // Número de Tienda de Aromas extraído de tu catálogo
    const mensajeTexto = `Hola! Me gustaría solicitar más información o encargar este producto:\n\n*Producto:* ${prod.nombre}\n*Línea:* ${prod.subcategoria}\n*Tamaño:* ${prod.tamano}`;
    
    // Codificamos el texto para que los espacios y emojis viajen seguros en la URL
    const urlWhatsApp = `https://wa.me/${5491130243955}?text=${encodeURIComponent(mensajeTexto)}`;

    card.innerHTML = `
        <div class="relative bg-gray-100 h-64 w-full">
            <img src="${prod.imagen}" alt="${prod.nombre}" class="object-cover w-full h-full transition-transform duration-500 hover:scale-105" onerror="this.src='https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&q=80'">
            <span class="absolute top-3 left-3 bg-black text-white text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded">
                ${prod.subcategoria}
            </span>
            ${badgeOferta}
        </div>
        <div class="p-5 flex-1 flex flex-col justify-between">
            <div class="mb-4">
                <h3 class="text-lg font-bold text-gray-900 mb-1">${prod.nombre}</h3>
                <p class="text-sm text-gray-600 line-clamp-3">${prod.descripcion}</p>
            </div>
            
            <div class="space-y-3">
                <div class="border-t border-gray-100 pt-3 flex justify-between items-center text-xs">
                    <div class="flex flex-col">
                        <span class="text-gray-400 font-medium">Contenido</span>
                        <span class="font-bold text-gray-900 mt-0.5">${prod.tamano}</span>
                    </div>
                    ${etiquetaPrecio}
                </div>
                
                <a href="${urlWhatsApp}" target="_blank" rel="noopener noreferrer" 
                   class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg text-xs transition duration-200 flex items-center justify-center gap-2 shadow-sm">
                   <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                       <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 11.95.01c3.177.001 6.165 1.24 8.413 3.491 2.247 2.253 3.484 5.244 3.485 8.421-.003 6.554-5.339 11.892-11.893 11.892-1.997-.001-3.958-.501-5.712-1.452L0 24zm6.59-4.846c1.66.986 3.288 1.487 4.71 1.488 5.25 0 9.517-4.261 9.52-9.51.002-2.543-.988-4.934-2.79-6.735-1.803-1.801-4.194-2.791-6.735-2.792-5.252 0-9.52 4.263-9.522 9.516-.001 1.57.444 3.102 1.285 4.467l-.995 3.634 3.731-.978zm11.416-5.127c-.305-.153-1.805-.891-2.079-.991-.274-.101-.474-.153-.674.153-.2.305-.774.991-.949 1.193-.175.202-.35.228-.655.076-.305-.153-1.288-.475-2.454-1.516-.908-.81-1.52-1.812-1.698-2.118-.178-.306-.019-.471.133-.622.137-.136.305-.355.457-.533.153-.178.204-.305.305-.509.101-.204.051-.382-.026-.534-.076-.153-.674-1.626-.924-2.227-.243-.585-.49-.506-.674-.515-.174-.009-.374-.01-.574-.01s-.525.076-.799.382c-.274.305-1.049 1.029-1.049 2.507 0 1.479 1.074 2.903 1.224 3.107.15.204 2.114 3.227 5.122 4.531.715.31 1.273.496 1.708.635.719.228 1.374.196 1.892.119.577-.087 1.805-.738 2.059-1.452.254-.715.254-1.326.178-1.452-.076-.127-.274-.203-.579-.355z"/>
                   </svg>
                   Solicitar por WhatsApp
                </a>
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