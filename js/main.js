let header = document.getElementById("header");
let main = document.getElementById("main");
let aside = document.getElementById("aside");
let formularioDos = document.getElementById("formularioDos");
let headerDivUno = document.getElementById("headerDivUno");
let headerDivTres = document.getElementById("headerDivTres");

const infoFetch = [];

// FETCH DE LA API CON PRODUCTOS Y SE GUARDA EN EL ARRAY INFOFETCH PARA UTILIZAR MAS ADELANTE.

fetch('https://dummyjson.com/products')
    .then(response => response.json())
    .then(data => {
        infoFetch.push(...data.products);
        
        renderizarFetch(infoFetch);
    })
    .catch(error => {
        main.innerHTML = `<h1>Error de conexion, intenta nuevamente</h1>`
        console.error('Error en la solicitud fetch:', error);
    });

// DESPLIEGA LOS PRODUCTOS EN LA PAGINA.

const renderizarFetch =  (info) => {
    info.forEach((item) => { 
        let div = document.createElement("div");   
        div.className = "productos";
        div.innerHTML = `
                <h2>${item.title}</h2>
                <img src="${item.thumbnail}" alt="${item.description}" class="imagenes">
                <b>$${item.price}</b>
                <div>
                    <input type="number" name="" id="cantidad${item.id}">
                    <button id="${item.id}">+</button>
                </div>
                `
        main.append(div);
    })
}

const inciarPagina = () => {
    (sessionStorage.usuario) ? userExist() : userNoExist();
}

window.addEventListener('DOMContentLoaded', inciarPagina);


// SI EN EL SESSIONSTORAGE EXISTE EL USUARIO, LO SALUDA, DE LO CONTRARIO MUESTRA EL FORMULARIO PARRA INICIAR SESION

const userExist = () => {
    headerDivUno.innerHTML = `<h2>Bienvenido ${sessionStorage.usuario}</h2>`;
    headerDivTres.innerHTML = `
                                <img src="carrito.png" alt="Icono del carrito" class="imagenCarrito">
                                <p class="precioCarrito" id="carrito">0</p>
                                <button class="vaciarCarrito" id="vaciarCarrito">Vaciar Carrito</button>
                                <button class="comprarCarrito" id="comprarCarrito">Comprar</button>
                            `
    mostrarCarrito();
}

const userNoExist = () => {
    headerDivUno.innerHTML = `
                                <form class="formularioUno" id="formularioUno">
                                    <input type="text" placeholder="Usuario">
                                    <input type="password" placeholder="Contraseña">
                                    <input type="submit" value="Iniciar sesion">    
                                </form>
                            `
}

// FORMULARIO NUMERO 1, PARA CREAR UN USUARIO.

headerDivUno.addEventListener('submit', (e) => iniciarSesion(e))

const iniciarSesion = (e) => {
    e.preventDefault();
    let input = e.target.children;

    if((!input[0].value || !input[1].value) || (input[0].value.length < 5 || input[1].value.length < 5)){
            Swal.fire({
                icon: "error",
                title: "Completa todos los campos.",
                text: "La cantidad de caracteres no puede ser menor a 5."
            });
    }
    else{
        sessionStorage.setItem("usuario", input[0].value)
        sessionStorage.setItem("contraseña", input[1].value)
        location.reload();
    }
}

// ORDENAR PRODUCTOS POR PRECIO > O < / ALFABETICAMENTE O POR NUMERO DE ID (Nuevos productos)

formularioDos.addEventListener('change', () => ordenarProductos());

const ordenarProductos = () => {
        main.innerHTML = "";
        let criterio = document.getElementById("selectOrdenar").value;

        switch (criterio) {
            case "alfa":
                infoFetch.sort((a, b) => a.title.localeCompare(b.title))
                break;
            case "barato":
                infoFetch.sort((a, b) => a.price - b.price)            
                break;
            case "caro":
                infoFetch.sort((a, b) => b.price - a.price)
                break;
            case "nuevo":
                infoFetch.sort((a, b) => b.id - a.id)
                break;            
            }
            renderizarFetch(infoFetch);
}

// BUSQUEDA PARCIAL CON INPUT SEARCH

formularioDos.addEventListener('input', (e) => buscarProductos(e));

const buscarProductos = (e) => {
    ordenarProductos()
    let busqueda = e.target.value;
    main.innerHTML = "";
    let infoBuscada = infoFetch.filter(item => item.title.toLocaleLowerCase().includes(busqueda.toLocaleLowerCase()));
    
    renderizarFetch(infoBuscada)
}

// VACIAR CARRITO

headerDivTres.addEventListener('click', (e) => vaciarCarrito(e))

const vaciarCarrito = (e) => {
    if(e.target.id === "vaciarCarrito"){
        const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
            confirmButton: "btn btn-success",
            cancelButton: "btn btn-danger"
        },
        buttonsStyling: false
        });
        swalWithBootstrapButtons.fire({
            title: "¿Estas seguro de vaciar el carrito?",
            text: "No hay vuelta atras!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Si, borrar",
            cancelButtonText: "No, cancelar",
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.clear();
                location.reload();     
            } else if (
                    result.dismiss === Swal.DismissReason.cancel
            ) {
                swalWithBootstrapButtons.fire({
                    title: "Cancelado",
                    text: "Tu carrito sigue con tus cosas",
                    icon: "error"
                });
            }
        });
    }
    else{
        Swal.fire({
            position: "top-end",
            icon: "success",
            title: "Tu compra se realizo con exito!!",
            showConfirmButton: false,
            timer: 1500
        });
    } 
}

// AGREGAR PRODUCTOS AL CARRITO

const productosElegidos = JSON.parse(localStorage.getItem("Productos")) || [];

main.addEventListener('click', (e) => agregarAlCarrito(e))

const agregarAlCarrito = (e) => {
    if(e.target.tagName === 'BUTTON'){
        let cantidad = document.getElementById(`cantidad${e.target.id}`).value;
            if(cantidad > 0){
                const index = productosElegidos.findIndex(producto => producto.titulo === infoFetch[e.target.id - 1].title);

                if (index !== -1) {
                    productosElegidos.splice(index, 1);
                }
    
                productosElegidos.push({
                    "titulo": infoFetch[e.target.id-1].title,
                    "precio": cantidad * infoFetch[e.target.id-1].price,
                    "imagen": infoFetch[e.target.id-1].thumbnail
                })
                localStorage.setItem("Productos", JSON.stringify(productosElegidos))
            }
            mostrarCarrito();
    }
    else{
        
    }
}

// MOSTRAR CARRITO

const mostrarCarrito = () =>{
    const carritoTerminado = JSON.parse(localStorage.getItem("Productos"));

    aside.innerHTML = ""
    let total = 0;
    if(carritoTerminado){
    carritoTerminado.forEach(products => {
        let div = document.createElement("div");   
        div.className = "productosElegidos";
        div.innerHTML = `
                <h3>${products.titulo}</h3>
                <img src="${products.imagen}" alt="${products.titulo}" class="imagenesElegidas">
                <b>$${products.precio}</b>
                `
        aside.append(div);
        total += products.precio;           
    });
    }
    document.getElementById("carrito").innerHTML = `$ ${total}`;
}

