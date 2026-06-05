// app.js
import catalogoProductos from './productos.js';

document.addEventListener('DOMContentLoaded', () => {
    const grilla = document.getElementById('grilla-productos');
    const contador = document.getElementById('contador-productos');
    const tituloSeccion = document.getElementById('titulo-seccion');
    const botonesFiltro = document.querySelectorAll('.btn-filtro');

    // Función constructora de las tarjetas de productos
    function renderizarProductos(categoriaFiltrada) {
        grilla.innerHTML = '';
        
        const productosFiltrados = categoriaFiltrada === 'todos' 
            ? catalogoProductos 
            : catalogoProductos.filter(p => p.categoria === categoriaFiltrada);

        contador.textContent = `${productosFiltrados.length} ${productosFiltrados.length === 1 ? 'ítem' : 'ítems'}`;

        if (productosFiltrados.length === 0) {
            grilla.innerHTML = `<p class="col-span-full text-center text-gray-500 py-10">Próximamente más productos en esta sección.</p>`;
            return;
        }

        productosFiltrados.forEach(prod => {
            const card = document.createElement('div');
            card.className = "card-producto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition duration-300 flex flex-col";
            
            card.innerHTML = `
                <div class="relative bg-gray-100 h-64 w-full">
                    <img src="${prod.imagen}" alt="${prod.nombre}" class="object-cover w-full h-full transition-transform duration-500 hover:scale-105">
                    <span class="absolute top-3 left-3 bg-black text-white text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded">
                        ${prod.subcategoria}
                    </span>
                </div>
                <div class="p-5 flex-1 flex flex-col justify-between">
                    <div>
                        <h3 class="text-lg font-bold text-gray-900 mb-1">${prod.nombre}</h3>
                        <p class="text-sm text-gray-600 mb-4 line-clamp-3">${prod.descripcion}</p>
                    </div>
                    <div class="border-t border-gray-100 pt-3 flex justify-between items-center text-xs">
                        <span class="text-gray-400 font-medium">Contenido</span>
                        <span class="font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded">${prod.tamano}</span>
                    </div>
                </div>
            `;
            grilla.appendChild(card);
        });
    }

    // Manejador de clics en la barra lateral de categorías
    botonesFiltro.forEach(boton => {
        boton.addEventListener('click', (e) => {
            botonesFiltro.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            const categoria = e.target.getAttribute('data-cat');
            
            // Actualizar el título de la sección de forma elegante
            tituloSeccion.textContent = e.target.textContent.replace('✨ ', '').replace('🧥 ', '').replace('🌿 ', '').replace('🧴 ', '').replace('🚗 ', '');
            
            renderizarProductos(categoria);
        });
    });

    // Carga inicial de todos los aromas disponibles
    renderizarProductos('todos');
});