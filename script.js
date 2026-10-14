
"use strict";

/* ==========================================
   PROYECTO: SEMÁFORO ACCESIBLE MULTISENSORIAL
   ARCHIVO PRINCIPAL: script.js

   Responsabilidades:
   - Importar los módulos del proyecto
   - Controlar el ciclo del semáforo
   - Actualizar la información visual
   - Coordinar sonidos, voz y animaciones
   - Gestionar los botones interactivos
   - Implementar opciones de accesibilidad
========================================== */

// 1. IMPORTAR LOS MÓDULOS

import { estados } from "./modulos/estados.js";

import {
  activarAudio,
  reproducirSonido,
  establecerSilencio
} from "./modulos/audio.js";

import {
  vozDisponible,
  anunciarEstado,
  detenerVoz
} from "./modulos/voz.js";

import {
  animarEstado,
  detenerAnimacion
} from "./modulos/animaciones.js";

// 2. OBTENER LOS ELEMENTOS DEL HTML

const luces = document.querySelectorAll(".luz");

const semaforo = document.getElementById("semaforo");
const textoEstado = document.getElementById("estado");
const indicacion = document.getElementById("indicacion");

const compatibilidad =
  document.getElementById("compatibilidad");

const btnIniciar =
  document.getElementById("btn-iniciar");

const btnDetener =
  document.getElementById("btn-detener");

const btnCambiar =
  document.getElementById("btn-cambiar");

const btnSilencio =
  document.getElementById("btn-silencio");

// 3. VARIABLES DE CONTROL

let indice = 0;
let automatico = false;
let silenciado = false;
let temporizador = null;

// Preferencia de accesibilidad del usuario
const movimientoReducido = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
);

// 4. VERIFICAR COMPATIBILIDAD

function verificarCompatibilidad() {

  const audioDisponible = !!(
    window.AudioContext ||
    window.webkitAudioContext
  );

  const voz = vozDisponible();

  const animacion =
    typeof window.gsap !== "undefined";

  const vibracion = "vibrate" in navigator;

  compatibilidad.textContent =
    `Audio: ${audioDisponible ? "Disponible" : "No disponible"} | ` +
    `Voz: ${voz ? "Disponible" : "No disponible"} | ` +
    `GSAP: ${animacion ? "Disponible" : "No disponible"} | ` +
    `Vibración: ${vibracion ? "Compatible" : "No disponible"}`;
}

// 5. COORDINAR EL FEEDBACK MULTISENSORIAL

function emitirFeedback(estado) {

  // Sonido: módulo audio.js
  reproducirSonido(estado);

  // Voz: módulo voz.js
  anunciarEstado(estado, silenciado);

  // Vibración en dispositivos compatibles
  if (
    !movimientoReducido.matches &&
    "vibrate" in navigator
  ) {
    navigator.vibrate(estado.vibracion);
  }
}

// 6. ACTUALIZAR EL ESTADO DEL SEMÁFORO

function mostrarEstado(conFeedback = true) {

  const estado = estados[indice];

  // Encender únicamente la luz actual
  luces.forEach(luz => {

    luz.classList.toggle(
      "activa",
      luz.id === `luz-${estado.color}`
    );

  });

  // Actualizar la información visual
  textoEstado.textContent = estado.titulo;
  indicacion.textContent = estado.mensaje;

  // Información para lectores de pantalla
  semaforo.setAttribute(
    "aria-label",
    `${estado.titulo}. ${estado.mensaje}`
  );

  // Animar y sincronizar el feedback
  if (conFeedback) {

    animarEstado(
      estado,
      () => emitirFeedback(estado),
      movimientoReducido.matches
    );

  } else {

    // Estado inicial sin sonido ni animación
    detenerAnimacion();

  }
}

// 7. CAMBIAR A LA SIGUIENTE LUZ

function siguienteLuz() {

  indice = (indice + 1) % estados.length;

  mostrarEstado();
}

// 8. CONTROLAR EL CICLO AUTOMÁTICO

function programarCiclo() {

  clearTimeout(temporizador);
  temporizador = null;

  if (!automatico) return;

  // Duración definida en estados.js
  const duracion = estados[indice].duracion;

  temporizador = setTimeout(() => {

    if (!automatico) return;

    siguienteLuz();

    // Programar el siguiente cambio
    programarCiclo();

  }, duracion);
}

// 9. BOTÓN INICIAR

btnIniciar.addEventListener("click", () => {

  if (automatico) return;

  // Activar audio mediante interacción
  if (!silenciado) {
    activarAudio();
  }

  automatico = true;

  btnIniciar.textContent = "En marcha";

  btnIniciar.setAttribute(
    "aria-pressed",
    "true"
  );

  mostrarEstado();

  programarCiclo();
});

// 10. BOTÓN DETENER

btnDetener.addEventListener("click", () => {

  automatico = false;

  clearTimeout(temporizador);
  temporizador = null;

  btnIniciar.textContent = "Iniciar";

  btnIniciar.setAttribute(
    "aria-pressed",
    "false"
  );

  // Detener animaciones y anuncios
  detenerAnimacion();
  detenerVoz();

  // Detener vibración si está disponible
  if ("vibrate" in navigator) {
    navigator.vibrate(0);
  }
});

// 11. BOTÓN CAMBIAR LUZ

btnCambiar.addEventListener("click", () => {

  if (!silenciado) {
    activarAudio();
  }

  // Cambiar el estado manualmente
  siguienteLuz();

  // Reiniciar el tiempo del ciclo automático
  if (automatico) {
    programarCiclo();
  }
});

// 12. BOTÓN SILENCIAR

btnSilencio.addEventListener("click", () => {

  silenciado = !silenciado;

  // Controlar volumen desde audio.js
  establecerSilencio(silenciado);

  btnSilencio.setAttribute(
    "aria-pressed",
    String(silenciado)
  );

  btnSilencio.textContent = silenciado
    ? "Activar sonido"
    : "Silenciar";

  if (silenciado) {

    // Cancelar anuncios de voz
    detenerVoz();

  } else {

    // Restaurar el sistema de audio
    activarAudio();

  }
});

// 13. RESPETAR EL MOVIMIENTO REDUCIDO

if (movimientoReducido.addEventListener) {

  movimientoReducido.addEventListener(
    "change",
    evento => {

      if (evento.matches) {

        // Cancelar movimientos en curso
        detenerAnimacion();

      }

    }
  );

}

// 14. INICIALIZAR EL PROYECTO

btnIniciar.setAttribute("aria-pressed", "false");

verificarCompatibilidad();

// Mostrar rojo inicialmente sin sonido
mostrarEstado(false);
