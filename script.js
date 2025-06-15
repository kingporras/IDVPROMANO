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
// --- INICIALIZACIÓN DE FIREBASE ---
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const provider = new firebase.auth.GoogleAuthProvider();

// --- REFERENCIAS A ELEMENTOS DEL DOM ---
const loginContainer = document.getElementById('login-container');
const appContainer = document.getElementById('app-container');
const userInfo = document.getElementById('user-info');
const userName = document.getElementById('user-name');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');

const disponibleBtn = document.getElementById('disponible-btn');
const noDisponibleBtn = document.getElementById('no-disponible-btn');

const listaDisponibles = document.getElementById('lista-disponibles');
const disponiblesCount = document.getElementById('disponibles-count');
const listaNoDisponibles = document.getElementById('lista-no-disponibles');
const noDisponiblesCount = document.getElementById('no-disponibles-count');

// --- LÓGICA DE AUTENTICACIÓN ---
loginBtn.addEventListener('click', () => {
    auth.signInWithPopup(provider);
});

logoutBtn.addEventListener('click', () => {
    auth.signOut();
});

auth.onAuthStateChanged(user => {
    if (user) {
        // Usuario ha iniciado sesión
        loginContainer.style.display = 'none';
        appContainer.style.display = 'block';
        userInfo.style.display = 'flex';
        userName.textContent = user.displayName || user.email;

        // Empezamos a escuchar los cambios en la convocatoria
        escucharConvocatoria('partido-actual');

    } else {
        // Usuario ha cerrado sesión
        loginContainer.style.display = 'block';
        appContainer.style.display = 'none';
        userInfo.style.display = 'none';
    }
});


// --- LÓGICA DE LA CONVOCATORIA (FIRESTORE) ---
let unsub; // Variable para poder dejar de escuchar cambios si es necesario

function escucharConvocatoria(partidoId) {
    const partidoRef = db.collection('partidos').doc(partidoId);

    // .onSnapshot se ejecuta cada vez que hay un cambio en la base de datos
    unsub = partidoRef.onSnapshot(doc => {
        if (doc.exists) {
            const data = doc.data();
            actualizarListas(data.disponibles || {}, data.no_disponibles || {});
        } else {
            console.log("El documento del partido no existe. El míster debe crearlo.");
            // Podríamos crear el documento aquí si quisiéramos
            db.collection('partidos').doc('partido-actual').set({ disponibles: {}, no_disponibles: {} });
        }
    });
}

function actualizarListas(disponibles, noDisponibles) {
    // Limpiamos las listas antes de volver a pintarlas
    listaDisponibles.innerHTML = '';
    listaNoDisponibles.innerHTML = '';
    
    // Convertimos objetos a arrays y los pintamos
    Object.values(disponibles).forEach(nombre => {
        const li = document.createElement('li');
        li.textContent = nombre;
        listaDisponibles.appendChild(li);
    });

    Object.values(noDisponibles).forEach(nombre => {
        const li = document.createElement('li');
        li.textContent = nombre;
        listaNoDisponibles.appendChild(li);
    });
    
    // Actualizamos los contadores
    disponiblesCount.textContent = Object.keys(disponibles).length;
    noDisponiblesCount.textContent = Object.keys(noDisponibles).length;
}

disponibleBtn.addEventListener('click', () => {
    const user = auth.currentUser;
    if (user) {
        const partidoRef = db.collection('partidos').doc('partido-actual');
        
        // Usamos notación de punto para poder usar variables en el path
        // Se añade al usuario a la lista de disponibles y se elimina de la de no disponibles
        const updates = {};
        updates[`disponibles.${user.uid}`] = user.displayName;
        updates[`no_disponibles.${user.uid}`] = firebase.firestore.FieldValue.delete();

        partidoRef.update(updates);
    }
});

noDisponibleBtn.addEventListener('click', () => {
    const user = auth.currentUser;
    if (user) {
        const partidoRef = db.collection('partidos').doc('partido-actual');
        
        const updates = {};
        updates[`no_disponibles.${user.uid}`] = user.displayName;
        updates[`disponibles.${user.uid}`] = firebase.firestore.FieldValue.delete();

        partidoRef.update(updates);
    }
});

// --- REGISTRO DEL SERVICE WORKER ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then(registration => {
      console.log('SW registrado: ', registration);
    }).catch(registrationError => {
      console.log('SW registro fallido: ', registrationError);
    });
  });
}
