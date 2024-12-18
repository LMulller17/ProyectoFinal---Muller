// Cargar productos desde un JSON local
async function cargarProductos() {
    try {
        const respuesta = await fetch('productos.json')
        if (!respuesta.ok) throw new Error('Error al cargar los productos.')
        const data = await respuesta.json()
        return data
    } catch (error) {
        console.error(error.message)
        return []
    }
}

let productos = []
let carrito = JSON.parse(localStorage.getItem('carrito')) || []

// Guardar carrito en localStorage
function guardarCarrito() {
    localStorage.setItem('carrito', JSON.stringify(carrito))
}

// Función para mostrar la alerta de mayor de edad
function mostrarAlertaMayorDeEdad() {
    Swal.fire({
        title: '¿Eres mayor de edad?',
        text: 'Debes ser mayor de edad para realizar compras en este sitio.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, soy mayor de edad',
        cancelButtonText: 'No, soy menor de edad',
    }).then((result) => {
        if (!result.isConfirmed) {
            
            window.location.href = 'https://www.google.com' 
        } else {
            
            cargarProductos().then(data => {
                productos = data
                renderizarProductos()
            })
        }
    })
}

// Renderizar productos
function renderizarProductos(filtro = "") {
    const contenedor = document.getElementById('productos-container')
    const carritoVista = document.getElementById('carrito')
    contenedor.style.display = 'flex'
    carritoVista.style.display = 'none'
    contenedor.innerHTML = ""

    const productosFiltrados = productos.filter(producto =>
        producto.nombre.toLowerCase().includes(filtro.toLowerCase())
    )

    productosFiltrados.forEach(producto => {
        const div = document.createElement('div')
        div.className = 'producto-card'
        div.innerHTML = `
            <img src="${producto.img}" alt="${producto.nombre}">
            <h3>${producto.nombre}</h3>
            <p>Precio: $${producto.precio}</p>
            <button class="boton-agregar" data-id="${producto.id}">Agregar al Carrito</button>
        `
        contenedor.appendChild(div)
    })

    // Eventos de los botones
    document.querySelectorAll('.boton-agregar').forEach(boton => {
        boton.addEventListener('click', agregarAlCarrito)
    })
}

// Agregar producto al carrito
function agregarAlCarrito(e) {
    const id = e.target.getAttribute('data-id');
    const producto = productos.find(p => p.id == id)

    const existente = carrito.find(p => p.id == id)
    if (existente) {
        existente.cantidad++
    } else {
        carrito.push({ ...producto, cantidad: 1 })
    }

    guardarCarrito()
    Swal.fire({
        icon: 'success',
        title: `${producto.nombre} añadido al carrito`,
        showConfirmButton: false,
        timer: 1500
    })

    renderizarCarrito() 
}

// Renderizar carrito
function renderizarCarrito() {
    const contenedor = document.getElementById('productos-container')
    const carritoVista = document.getElementById('carrito')
    const carritoLista = document.getElementById('carrito-lista')
    const totalCarrito = document.getElementById('total-carrito')
    const botonFinalizar = document.getElementById('finalizar-compra')
    const botonVolverCarrito = document.getElementById('volver-carrito')

    contenedor.style.display = 'none'
    carritoVista.style.display = 'block'
    carritoLista.innerHTML = ""

    let total = 0

    carrito.forEach(producto => {
        total += producto.precio * producto.cantidad

        const li = document.createElement('li')
        li.className = 'carrito-item'
        li.innerHTML = `
            <span>${producto.nombre}</span>
            <span>Cantidad: ${producto.cantidad}</span>
            <span>Total: $${producto.precio * producto.cantidad}</span>
            <button class="btn-disminuir" data-id="${producto.id}">-</button>
            <button class="btn-aumentar" data-id="${producto.id}">+</button>
            <button class="btn-eliminar" data-id="${producto.id}">Eliminar</button>
        `
        carritoLista.appendChild(li)
    })

    totalCarrito.textContent = `Total: $${total}`

    // Mostrar el botón de finalizar compra solo si hay productos en el carrito y no existe el botón ya
    if (carrito.length > 0 && !botonFinalizar) {
        const boton = document.createElement('button')
        boton.textContent = 'Finalizar Compra'
        boton.id = 'finalizar-compra'
        carritoVista.appendChild(boton)
        boton.addEventListener('click', mostrarFormularioCompra)
    }

    // Mostrar el botón de volver a productos solo si no existe el botón ya
    if (!botonVolverCarrito) {
        const botonVolver = document.createElement('button')
        botonVolver.textContent = 'Volver a Productos'
        botonVolver.id = 'volver-carrito'
        carritoVista.appendChild(botonVolver)
        botonVolver.addEventListener('click', () => renderizarProductos())
    }

    // Eventos de botones
    document.querySelectorAll('.btn-aumentar').forEach(boton => {
        boton.addEventListener('click', aumentarCantidad)
    })

    document.querySelectorAll('.btn-disminuir').forEach(boton => {
        boton.addEventListener('click', disminuirCantidad)
    })

    document.querySelectorAll('.btn-eliminar').forEach(boton => {
        boton.addEventListener('click', eliminarProducto)
    })
}

// Función para aumentar cantidad
function aumentarCantidad(e) {
    const id = e.target.getAttribute('data-id')
    const producto = carrito.find(p => p.id == id)
    if (producto) {
        producto.cantidad++
        guardarCarrito()
        renderizarCarrito()
    }
}

// Función para disminuir cantidad
function disminuirCantidad(e) {
    const id = e.target.getAttribute('data-id')
    const producto = carrito.find(p => p.id == id)
    if (producto && producto.cantidad > 1) {
        producto.cantidad--
    } else if (producto) {
        carrito = carrito.filter(p => p.id != id)
    }
    guardarCarrito()
    renderizarCarrito()
}

// Función para eliminar producto
function eliminarProducto(e) {
    const id = e.target.getAttribute('data-id')
    carrito = carrito.filter(p => p.id != id)
    guardarCarrito()
    renderizarCarrito()
}

// Mostrar el formulario de compra
function mostrarFormularioCompra() {
    Swal.fire({
        title: 'Ingresa tus datos',
        html: `
            <input type="text" id="nombre" class="swal2-input" placeholder="Nombre completo">
            <input type="email" id="correo" class="swal2-input" placeholder="Correo electrónico">
            <input type="text" id="direccion" class="swal2-input" placeholder="Dirección de envío">
        `,
        showCancelButton: true,
        confirmButtonText: 'Finalizar Compra',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
            const nombre = document.getElementById('nombre').value
            const correo = document.getElementById('correo').value
            const direccion = document.getElementById('direccion').value

            if (!nombre || !correo || !direccion) {
                Swal.showValidationMessage('Por favor, completa todos los campos')
                return false
            }

            return { nombre, correo, direccion }
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const { nombre, correo, direccion } = result.value
            // Aquí puedes realizar acciones adicionales como enviar los datos al servidor

            // Mostrar confirmación de compra exitosa
            Swal.fire({
                icon: 'success',
                title: 'Compra exitosa',
                text: `Gracias, ${nombre}! Tu compra ha sido completada y será enviada a: ${direccion}`,
                confirmButtonText: 'Aceptar'
            })

            // Limpiar el carrito
            carrito = []
            guardarCarrito()
            renderizarCarrito()
        }
    })
}

// Eventos iniciales
document.getElementById('buscador').addEventListener('input', (e) => {
    renderizarProductos(e.target.value)
})

document.getElementById('ver-carrito').addEventListener('click', renderizarCarrito)
document.getElementById('volver-productos').addEventListener('click', () => renderizarProductos())

// Inicializar la alerta de mayor de edad
mostrarAlertaMayorDeEdad()








