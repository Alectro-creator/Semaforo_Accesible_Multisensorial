
"use strict";

/* ==========================================
   PROYECTO: SEMÁFORO ACCESIBLE MULTISENSORIAL
   MÓDULO: estados.js

   Este módulo almacena la configuración
   de cada estado del semáforo.

   Define:
   - Colores y mensajes
   - Duración de cada luz
   - Frecuencias y patrones de sonido
   - Anuncios de voz
   - Patrones de vibración
========================================== */

export const estados = [

  // 1. ESTADO ROJO
  {
    color: "roja",
    titulo: "Luz roja",
    mensaje: "Alto. Debes esperar.",
    voz: "Luz roja. Debes detenerte.",

    // Duración: 3 segundos
    duracion: 3000,

    // Configuración del sonido
    frecuencia: 280,
    frecuenciaFinal: 240,
    onda: "sine",
    pitidos: [0],
    largo: 0.28,

    // Patrón de vibración
    vibracion: [90, 60, 90]
  },

  // 2. ESTADO VERDE
  {
    color: "verde",
    titulo: "Luz verde",
    mensaje: "Puedes avanzar si es seguro.",
    voz: "Luz verde. Puedes avanzar.",

    // Duración: 3 segundos
    duracion: 3000,

    // Configuración del sonido
    frecuencia: 650,
    frecuenciaFinal: 780,
    onda: "sine",
    pitidos: [0, 0.17],
    largo: 0.12,

    // Patrón de vibración
    vibracion: [60]
  },

  // 3. ESTADO AMARILLO
  {
    color: "amarilla",
    titulo: "Luz amarilla",
    mensaje: "Precaución. Prepárate para detenerte.",
    voz: "Amarillo.",

    // Duración: 1 segundo
    duracion: 1000,

    // Configuración del sonido
    frecuencia: 440,
    frecuenciaFinal: 350,
    onda: "triangle",
    pitidos: [0, 0.16],
    largo: 0.11,

    // Patrón de vibración
    vibracion: [45, 45, 45]
  }

];
