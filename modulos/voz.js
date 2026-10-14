
"use strict";

/* ==========================================
   PROYECTO: SEMÁFORO ACCESIBLE MULTISENSORIAL
   MÓDULO: voz.js

   Responsabilidades:
   - Comprobar compatibilidad con Web Speech API
   - Anunciar los estados del semáforo
   - Seleccionar una voz en español
   - Evitar acumulación de anuncios
   - Detener la voz cuando sea necesario
========================================== */

// 1. VERIFICAR COMPATIBILIDAD DE VOZ

export function vozDisponible() {

  return "speechSynthesis" in window &&
         "SpeechSynthesisUtterance" in window;

}

// 2. ANUNCIAR EL ESTADO DEL SEMÁFORO

export function anunciarEstado(estado, silenciado = false) {

  // No anunciar si está silenciado
  // o el navegador no admite voz
  if (silenciado || !vozDisponible()) {
    return;
  }

  const sintetizador = window.speechSynthesis;

  // Evitar acumulación de anuncios anteriores
  if (sintetizador.speaking || sintetizador.pending) {
    sintetizador.cancel();
  }

  // Crear el mensaje de voz
  const anuncio = new SpeechSynthesisUtterance(
    estado.voz
  );

  // Configurar idioma
  anuncio.lang = "es-PE";

  // Ajustar velocidad de pronunciación
  anuncio.rate = estado.color === "amarilla"
    ? 1.10
    : 1;

  // Configurar tono y volumen
  anuncio.pitch = 1;
  anuncio.volume = 0.9;

  // 3. BUSCAR UNA VOZ EN ESPAÑOL

  const voces = sintetizador.getVoices();

  // Priorizar español de Perú
  const vozEspanol = voces.find(
    voz => voz.lang.toLowerCase() === "es-pe"
  ) || voces.find(
    voz => voz.lang.toLowerCase().startsWith("es")
  );

  // Utilizar la voz encontrada
  if (vozEspanol) {
    anuncio.voice = vozEspanol;
  }

  // 4. REPRODUCIR EL ANUNCIO

  sintetizador.speak(anuncio);

}

// 5. DETENER LOS ANUNCIOS DE VOZ

export function detenerVoz() {

  if (!vozDisponible()) {
    return;
  }

  window.speechSynthesis.cancel();

}
