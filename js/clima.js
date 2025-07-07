// Variable global para controlar la síntesis de voz
let sintetizador = window.speechSynthesis;
let mensajeActual = null; // Para almacenar el mensaje en uso
let muteado = false; // Para controlar el estado de mute

// Función para hablar (texto a voz)
function hablar(texto) {
    if (muteado) return;

    if (mensajeActual) {
        sintetizador.cancel();
    }

    mensajeActual = new SpeechSynthesisUtterance(texto);
    mensajeActual.lang = "es-ES";

    mensajeActual.onend = function () {
        mensajeActual = null;
    };

    sintetizador.speak(mensajeActual);
}

// Función para buscar el clima
function buscarClima() {
    const ubicacion = document.getElementById('ubicacion').value.trim();
    const lat = document.getElementById('calle1').value.trim();
    const lon = document.getElementById('calle2').value.trim();

    let url = '';

    if (ubicacion) {
        url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(ubicacion)}&appid=9e122cd782b2d0333f5fe4e7fa192062&units=metric&lang=es`;
    } else if (lat && lon) {
        url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=9e122cd782b2d0333f5fe4e7fa192062&units=metric&lang=es`;
    } else {
        mostrarClima(false);
        alert("Por favor, ingresa una ubicación o las coordenadas (latitud y longitud).");
        return;
    }

    axios.get(url)
    .then(function(response) {
        mostrarClima(false);
        const data = response.data;

        const tempMax = data.main.temp_max;
        const tempMin = data.main.temp_min;
        const feelsLike = data.main.feels_like;

        document.getElementById('descripcion').textContent = data.weather[0].description;
        document.getElementById('temperatura').textContent = `${data.main.temp}°C`;
        document.getElementById('temp-max').textContent = tempMax !== undefined ? `${tempMax}°C` : 'No disponible';
        document.getElementById('temp-min').textContent = tempMin !== undefined ? `${tempMin}°C` : 'No disponible';
        document.getElementById('feels-like').textContent = feelsLike !== undefined ? `Sensación de: ${feelsLike}°C` : 'No disponible';
        document.getElementById('humedad').textContent = `${data.main.humidity}%`;
        document.getElementById('pais').textContent = `${data.name}, ${data.sys.country}`;
        document.getElementById('fecha').textContent = new Date().toLocaleDateString('es-ES');

        const icono = data.weather[0].icon;
        document.getElementById('icono-clima').innerHTML = `<img src="https://openweathermap.org/img/wn/${icono}@2x.png" alt="icono clima">`;

        const texto = `El clima en ${data.name}, ${data.sys.country} es de ${data.weather[0].description} con una temperatura actual de ${data.main.temp} grados Celsius. 
        La temperatura máxima será de ${tempMax} grados y la mínima de ${tempMin} grados. Sensación térmica: ${feelsLike} grados. Humedad: ${data.main.humidity}%.`;
        hablar(texto);
    })
    .catch(function(error) {
        mostrarClima(false);
        console.error("Error al realizar la solicitud:", error);
        alert("No se pudo obtener el clima. Intenta nuevamente más tarde.");
    });
}

// Lista de ciudades
const ciudadesDisponibles = [
    'Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza', 'La Plata', 'Mar del Plata',
    'San Miguel de Tucumán', 'Salta', 'Santa Fe', 'Posadas', 'Neuquén', 'Resistencia',
    'Washington, D.C.', 'Beijing', 'Nueva Delhi', 'Moscú', 'Berlín', 'Londres', 
    'París', 'Brasilia', 'Tokio', 'Ottawa', 'Sídney', 'Ciudad de México', 
    'Roma', 'Madrid', 'Pretoria', 'Seúl', 'Riad', 
    'Yakarta', 'Ankara', 'El Cairo', 'Islamabad', 'Daca', 
    'Abuja', 'Hanói', 'Manila', 'Varsovia', 'Kiev', 'Bogotá', 
    'Santiago', 'Lima', 'Teherán', 'Bangkok', 'Jartum', 'Jerusalén', 'Kuala Lumpur', 
    'Bagdad', 'Kabul', 'Nairobi', 'Katmandú', 'Astaná', 'Tashkent', 
    'Chisináu', 'Bucarest', 'Budapest', 'Minsk', 'Berna', 'Estocolmo', 
    'Oslo', 'Copenhague', 'Helsinki', 'Accra', 'Amán', 
    'Harare', 'Banjul', 'Juba', 'Yuba', 'Ginebra', 
    'Lagos', 'Tegucigalpa', 'Addis Abeba', 'Quito', 'Caracas', 'Marrakech', 'Bratislava', 'Damasco', 
    'Beirut', 'Kinshasa', 'Rabat', 'Mogadiscio', 'Luanda', 'Maputo', 'Ulaanbaatar', 
    'Antananarivo', 'Yamoussoukro', 'Ouagadougou', 'Lomé', 'Malabo', 'Mombasa', 'Belgrado', 'Viena', 
    'Dublín', 'Asunción', 'Guatemala', 'Algiers', 'Amman', 'Addis Ababa', 'Almaty', 'Andorra la Vella', 
    'Apia', 'Athens', 'Baku', 'Bangui', 'Basseterre', 'Bissau', 'Bucharest', 
    'Cairo', 'Canberra', 'Castries', 'Colombo', 'Conakry', 'Copenhagen', 'Dhaka', 'Dili', 'Djibouti', 
    'Dodoma', 'Durban', 'Hong Kong'
];

// Función para mostrar las ciudades en el dropdown
function mostrarCiudades() {
    let input = document.getElementById('ubicacion').value.trim();
    let dropdown = document.getElementById('myDropdown');
    
    // Limpiar el contenido previo
    dropdown.innerHTML = '';
    
    // Mostrar el dropdown solo si el campo tiene texto
    if (input !== '') {
        let opciones = ciudadesDisponibles.filter(ciudad => ciudad.toLowerCase().includes(input.toLowerCase()));
        
        // Si hay opciones, mostrar el dropdown
        if (opciones.length > 0) {
            dropdown.style.display = 'block';
            
            // Crear las opciones del dropdown
            opciones.forEach(function(ciudad) {
                let option = document.createElement('a');
                option.textContent = ciudad;
                option.href = '#'; // No tiene que llevar a ningún lado
                option.onclick = function() {
                    document.getElementById('ubicacion').value = ciudad; // Rellenar el campo con la ciudad seleccionada
                    dropdown.style.display = 'none'; // Ocultar el dropdown
                    buscarClima(); // Llamar a la función de búsqueda del clima
                };
                dropdown.appendChild(option);
            });
        } else {
            dropdown.style.display = 'none'; // Si no hay resultados, ocultar el dropdown
        }
    } else {
        dropdown.style.display = 'none'; // Si no hay texto, ocultar el dropdown
    }
}

// Mostrar u ocultar el loader del clima
function mostrarClima(visible) {
    const climaLoader = document.getElementById('clima-loader');
    climaLoader.style.display = visible ? 'block' : 'none';
}

// Función para hablar (Play)
function hablar(texto) {
    if (muteado) return;

    if (mensajeActual) {
        sintetizador.cancel(); // Detener el mensaje actual
    }

    mensajeActual = new SpeechSynthesisUtterance(texto);
    mensajeActual.lang = "es-ES";

    mensajeActual.onend = function () {
        mensajeActual = null;
    };

    sintetizador.speak(mensajeActual);
}

// Manejador del checkbox de mute
document.getElementById("checkboxInput").addEventListener("change", function() {
    muteado = this.checked;

    if (muteado && sintetizador.speaking) {
        sintetizador.cancel(); // Detener cualquier síntesis
    }
});

// Funciones de control
function pausar() {
    if (sintetizador.speaking && !sintetizador.paused) {
        sintetizador.pause();
    }
}

function reanudar() {
    if (sintetizador.paused) {
        sintetizador.resume();
    }
}

function detener() {
    sintetizador.cancel();
    mensajeActual = null;
}

// Asignar eventos
document.getElementById("pauseButton").addEventListener("click", pausar);
document.getElementById("playButton").addEventListener("click", reanudar);

// Cancelar cualquier síntesis al cargar
window.onload = function() {
    if (sintetizador.speaking) {
        sintetizador.cancel();
    }
};

