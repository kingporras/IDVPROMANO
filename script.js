/*
    Este código es para hacer funcionar el menú de navegación en móviles.
*/

// Espera a que todo el contenido del HTML esté cargado
document.addEventListener('DOMContentLoaded', function() {

    // Seleccionamos el botón de la hamburguesa y el menú de links
    const menuBtn = document.getElementById('menu-btn');
    const navLinks = document.getElementById('nav-links');

    // Comprobamos que ambos elementos existen antes de añadir el evento
    if (menuBtn && navLinks) {
        // Añadimos un "escuchador de eventos" que se activa al hacer clic en el botón
        menuBtn.addEventListener('click', function() {
            // Cada vez que se hace clic, se añade o se quita la clase "active" del menú
            // La clase "active" hace que el menú se muestre u oculte (controlado en el CSS)
            navLinks.classList.toggle('active');
        });
    }

});
