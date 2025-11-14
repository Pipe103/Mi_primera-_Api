// ==============================================
// VARIABLES GLOBALES
// ==============================================
let productos = [];
let carrito = [];
const API_URL = 'https://fakestoreapi.com/products';

// ==============================================
// ELEMENTOS DEL DOM
// ==============================================
const catalogo = document.getElementById('catalogo');
const loader = document.getElementById('loader');
const btnCarrito = document.getElementById('btn-carrito');
const modalCarrito = document.getElementById('modal-carrito');
const cerrarModal = document.querySelector('.cerrar');
const itemsCarrito = document.getElementById('items-carrito');
const totalCarrito = document.getElementById('total-carrito');
const contadorCarrito = document.getElementById('contador-carrito');
const btnVaciar = document.querySelector('.btn-vaciar');
const btnFinalizar = document.querySelector('.btn-finalizar');
const filtrosBtns = document.querySelectorAll('.filtro-btn');

// ==============================================
// FUNCIÓN PARA OBTENER PRODUCTOS DE LA API
// ==============================================
async function obtenerProductos() {
    try {
        mostrarLoader();
        
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error('Error al obtener los productos');
        }
        
        productos = await response.json();
        mostrarProductos(productos);
        ocultarLoader();
        
    } catch (error) {
        console.error('Error:', error);
        catalogo.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 50px;">
                <h2 style="color: #ff4757;">❌ Error al cargar los productos</h2>
                <p style="color: white; margin-top: 10px;">Por favor, intenta nuevamente más tarde</p>
            </div>
        `;
        ocultarLoader();
    }
}

// ==============================================
// FUNCIÓN PARA MOSTRAR PRODUCTOS EN EL CATÁLOGO
// ==============================================
function mostrarProductos(productosArray) {
    catalogo.innerHTML = '';
    
    if (productosArray.length === 0) {
        catalogo.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 50px;">
                <h2 style="color: white;">No se encontraron productos</h2>
            </div>
        `;
        return;
    }
    
    productosArray.forEach(producto => {
        const productoDiv = document.createElement('div');
        productoDiv.className = 'producto';
        
        productoDiv.innerHTML = `
            <img src="${producto.image}" alt="${producto.title}" class="producto-imagen">
            <span class="producto-categoria">${producto.category}</span>
            <h3 class="producto-titulo">${producto.title}</h3>
            <p class="producto-descripcion">${producto.description}</p>
            <div class="producto-info">
                <span class="producto-precio">$${producto.price.toFixed(2)}</span>
                <span class="producto-rating">⭐ ${producto.rating.rate} (${producto.rating.count})</span>
            </div>
            <button class="btn-agregar" onclick="agregarAlCarrito(${producto.id})">
                🛒 Agregar al Carrito
            </button>
        `;
        
        catalogo.appendChild(productoDiv);
    });
}

// ==============================================
// FUNCIÓN PARA AGREGAR PRODUCTO AL CARRITO
// ==============================================
function agregarAlCarrito(id) {
    const producto = productos.find(p => p.id === id);
    
    if (!producto) return;
    
    // Verificar si el producto ya está en el carrito
    const productoEnCarrito = carrito.find(item => item.id === id);
    
    if (productoEnCarrito) {
        productoEnCarrito.cantidad++;
    } else {
        carrito.push({
            ...producto,
            cantidad: 1
        });
    }
    
    actualizarCarrito();
    mostrarNotificacion('Producto agregado al carrito');
}

// ==============================================
// FUNCIÓN PARA ACTUALIZAR EL CARRITO
// ==============================================
function actualizarCarrito() {
    // Actualizar contador
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    contadorCarrito.textContent = totalItems;
    
    // Actualizar vista del carrito
    if (carrito.length === 0) {
        itemsCarrito.innerHTML = `
            <div class="carrito-vacio">
                <h3>🛒</h3>
                <p>Tu carrito está vacío</p>
            </div>
        `;
        totalCarrito.textContent = '0.00';
        return;
    }
    
    itemsCarrito.innerHTML = '';
    
    carrito.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item-carrito';
        
        itemDiv.innerHTML = `
            <img src="${item.image}" alt="${item.title}">
            <div class="item-carrito-info">
                <h4>${item.title}</h4>
                <p class="item-carrito-precio">$${item.price.toFixed(2)}</p>
                <div class="item-carrito-cantidad">
                    <button class="btn-cantidad" onclick="cambiarCantidad(${item.id}, -1)">-</button>
                    <span>Cantidad: ${item.cantidad}</span>
                    <button class="btn-cantidad" onclick="cambiarCantidad(${item.id}, 1)">+</button>
                </div>
            </div>
            <button class="btn-eliminar" onclick="eliminarDelCarrito(${item.id})">🗑️</button>
        `;
        
        itemsCarrito.appendChild(itemDiv);
    });
    
    // Calcular total
    const total = carrito.reduce((sum, item) => sum + (item.price * item.cantidad), 0);
    totalCarrito.textContent = total.toFixed(2);
    
    // Guardar en localStorage
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

// ==============================================
// FUNCIÓN PARA CAMBIAR CANTIDAD DE UN PRODUCTO
// ==============================================
function cambiarCantidad(id, cambio) {
    const producto = carrito.find(item => item.id === id);
    
    if (!producto) return;
    
    producto.cantidad += cambio;
    
    if (producto.cantidad <= 0) {
        eliminarDelCarrito(id);
        return;
    }
    
    actualizarCarrito();
}

// ==============================================
// FUNCIÓN PARA ELIMINAR PRODUCTO DEL CARRITO
// ==============================================
function eliminarDelCarrito(id) {
    carrito = carrito.filter(item => item.id !== id);
    actualizarCarrito();
    mostrarNotificacion('Producto eliminado del carrito');
}

// ==============================================
// FUNCIÓN PARA VACIAR EL CARRITO
// ==============================================
function vaciarCarrito() {
    if (carrito.length === 0) return;
    
    if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
        carrito = [];
        actualizarCarrito();
        mostrarNotificacion('Carrito vaciado');
    }
}

// ==============================================
// FUNCIÓN PARA FINALIZAR COMPRA
// ==============================================
function finalizarCompra() {
    if (carrito.length === 0) {
        alert('Tu carrito está vacío');
        return;
    }
    
    const total = carrito.reduce((sum, item) => sum + (item.price * item.cantidad), 0);
    
    alert(`
        ¡Compra finalizada! 🎉
        
        Total de productos: ${carrito.reduce((sum, item) => sum + item.cantidad, 0)}
        Total a pagar: $${total.toFixed(2)}
        
        ¡Gracias por tu compra!
    `);
    
    carrito = [];
    actualizarCarrito();
    modalCarrito.style.display = 'none';
}

// ==============================================
// FUNCIÓN PARA FILTRAR PRODUCTOS
// ==============================================
function filtrarProductos(categoria) {
    if (categoria === 'all') {
        mostrarProductos(productos);
    } else {
        const productosFiltrados = productos.filter(p => p.category === categoria);
        mostrarProductos(productosFiltrados);
    }
}

// ==============================================
// FUNCIÓN PARA MOSTRAR/OCULTAR LOADER
// ==============================================
function mostrarLoader() {
    loader.style.display = 'flex';
    catalogo.innerHTML = '';
}

function ocultarLoader() {
    loader.style.display = 'none';
}

// ==============================================
// FUNCIÓN PARA MOSTRAR NOTIFICACIONES
// ==============================================
function mostrarNotificacion(mensaje) {
    // Crear elemento de notificación
    const notificacion = document.createElement('div');
    notificacion.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        z-index: 2000;
        animation: slideInRight 0.3s ease;
    `;
    notificacion.textContent = mensaje;
    
    document.body.appendChild(notificacion);
    
    // Eliminar después de 3 segundos
    setTimeout(() => {
        notificacion.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notificacion);
        }, 300);
    }, 3000);
}

// ==============================================
// EVENT LISTENERS
// ==============================================

// Abrir modal del carrito
btnCarrito.addEventListener('click', () => {
    modalCarrito.style.display = 'block';
});

// Cerrar modal
cerrarModal.addEventListener('click', () => {
    modalCarrito.style.display = 'none';
});

// Cerrar modal al hacer clic fuera
window.addEventListener('click', (e) => {
    if (e.target === modalCarrito) {
        modalCarrito.style.display = 'none';
    }
});

// Vaciar carrito
btnVaciar.addEventListener('click', vaciarCarrito);

// Finalizar compra
btnFinalizar.addEventListener('click', finalizarCompra);

// Filtros de categoría
filtrosBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remover clase active de todos los botones
        filtrosBtns.forEach(b => b.classList.remove('active'));
        
        // Agregar clase active al botón clickeado
        btn.classList.add('active');
        
        // Filtrar productos
        const categoria = btn.dataset.categoria;
        filtrarProductos(categoria);
    });
});

// ==============================================
// CARGAR CARRITO DEL LOCALSTORAGE AL INICIAR
// ==============================================
function cargarCarrito() {
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
        carrito = JSON.parse(carritoGuardado);
        actualizarCarrito();
    }
}

// ==============================================
// INICIALIZAR LA APLICACIÓN
// ==============================================
document.addEventListener('DOMContentLoaded', () => {
    obtenerProductos();
    cargarCarrito();
});