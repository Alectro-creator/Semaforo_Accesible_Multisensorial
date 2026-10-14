
"use strict";

/* ==========================================
   PROYECTO: SEMÁFORO ACCESIBLE MULTISENSORIAL
   MÓDULO: audio.js

   Responsabilidades:
   - Inicializar Web Audio API
   - Generar sonidos con osciladores
   - Controlar frecuencias y volumen
   - Aplicar envolventes de sonido
   - Activar y silenciar los sonidos
========================================== */

// 1. VARIABLES DEL SISTEMA DE AUDIO

let contextoAudio = null;
let gananciaPrincipal = null;
let silenciado = false;

// 2. PREPARAR WEB AUDIO API

function prepararAudio() {

  if (contextoAudio) {
    return contextoAudio;
  }

  const AudioAPI =
    window.AudioContext || window.webkitAudioContext;

  // Comprobar compatibilidad
  if (!AudioAPI) {
    return null;
  }

  try {
    contextoAudio = new AudioAPI();

    // Crear el control general de volumen
    gananciaPrincipal = contextoAudio.createGain();

    gananciaPrincipal.gain.value =
      silenciado ? 0 : 0.12;

    gananciaPrincipal.connect(
      contextoAudio.destination
    );

    return contextoAudio;

  } catch (error) {
    console.warn("Error al iniciar audio:", error);
    contextoAudio = null;
    gananciaPrincipal = null;
    return null;
  }
}

// 3. ACTIVAR EL AUDIO

export function activarAudio() {

  const audio = prepararAudio();

  if (audio && audio.state === "suspended") {

    audio.resume().catch(error => {
      console.warn(
        "No se pudo activar el audio:", error
      );
    });

  }
}

// 4. GENERAR SONIDOS DEL SEMÁFORO

export function reproducirSonido(estado) {

  if (silenciado) return;

  const audio = prepararAudio();

  if (!audio || !gananciaPrincipal) return;

  if (audio.state === "suspended") {
    activarAudio();
  }

  // Crear los pitidos configurados para cada luz
  estado.pitidos.forEach(retraso => {

    const oscilador = audio.createOscillator();
    const envolvente = audio.createGain();

    const inicio = audio.currentTime + retraso;
    const fin = inicio + estado.largo;

    // Configurar el tipo de onda
    oscilador.type = estado.onda;

    // Frecuencia inicial
    oscilador.frequency.setValueAtTime(
      estado.frecuencia,
      inicio
    );

    // Variación de frecuencia
    oscilador.frequency.linearRampToValueAtTime(
      estado.frecuenciaFinal,
      fin
    );

    // Envolvente de volumen
    envolvente.gain.setValueAtTime(
      0.0001, inicio
    );

    // Entrada gradual del sonido
    envolvente.gain.exponentialRampToValueAtTime(
      0.8, inicio + 0.018
    );

    // Salida gradual del sonido
    envolvente.gain.exponentialRampToValueAtTime(
      0.0001, fin
    );

    // Conectar los nodos de audio
    oscilador.connect(envolvente);
    envolvente.connect(gananciaPrincipal);

    // Reproducir el sonido
    oscilador.start(inicio);
    oscilador.stop(fin + 0.01);

    // Liberar las conexiones al finalizar
    oscilador.onended = () => {
      oscilador.disconnect();
      envolvente.disconnect();
    };

  });
}

// 5. ACTIVAR O DESACTIVAR SONIDOS

export function establecerSilencio(valor) {

  silenciado = Boolean(valor);

  if (!gananciaPrincipal || !contextoAudio) {
    return;
  }

  const tiempo = contextoAudio.currentTime;

  // Cancelar automatizaciones anteriores
  gananciaPrincipal.gain.cancelScheduledValues(
    tiempo
  );

  // Cambiar el volumen suavemente
  gananciaPrincipal.gain.setTargetAtTime(
    silenciado ? 0 : 0.12,
    tiempo,
    0.015
  );
}
