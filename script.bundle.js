"use strict";
(() => {
  // modulos/estados.js
  var estados = [
    // 1. ESTADO ROJO
    {
      color: "roja",
      titulo: "Luz roja",
      mensaje: "Alto. Debes esperar.",
      voz: "Luz roja. Debes detenerte.",
      // Duración: 3 segundos
      duracion: 3e3,
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
      duracion: 3e3,
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
      mensaje: "Precauci\xF3n. Prep\xE1rate para detenerte.",
      voz: "Amarillo.",
      // Duración: 1 segundo
      duracion: 1e3,
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

  // modulos/audio.js
  var contextoAudio = null;
  var gananciaPrincipal = null;
  var silenciado = false;
  function prepararAudio() {
    if (contextoAudio) {
      return contextoAudio;
    }
    const AudioAPI = window.AudioContext || window.webkitAudioContext;
    if (!AudioAPI) {
      return null;
    }
    try {
      contextoAudio = new AudioAPI();
      gananciaPrincipal = contextoAudio.createGain();
      gananciaPrincipal.gain.value = silenciado ? 0 : 0.12;
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
  function activarAudio() {
    const audio = prepararAudio();
    if (audio && audio.state === "suspended") {
      audio.resume().catch((error) => {
        console.warn(
          "No se pudo activar el audio:",
          error
        );
      });
    }
  }
  function reproducirSonido(estado) {
    if (silenciado) return;
    const audio = prepararAudio();
    if (!audio || !gananciaPrincipal) return;
    if (audio.state === "suspended") {
      activarAudio();
    }
    estado.pitidos.forEach((retraso) => {
      const oscilador = audio.createOscillator();
      const envolvente = audio.createGain();
      const inicio = audio.currentTime + retraso;
      const fin = inicio + estado.largo;
      oscilador.type = estado.onda;
      oscilador.frequency.setValueAtTime(
        estado.frecuencia,
        inicio
      );
      oscilador.frequency.linearRampToValueAtTime(
        estado.frecuenciaFinal,
        fin
      );
      envolvente.gain.setValueAtTime(
        1e-4,
        inicio
      );
      envolvente.gain.exponentialRampToValueAtTime(
        0.8,
        inicio + 0.018
      );
      envolvente.gain.exponentialRampToValueAtTime(
        1e-4,
        fin
      );
      oscilador.connect(envolvente);
      envolvente.connect(gananciaPrincipal);
      oscilador.start(inicio);
      oscilador.stop(fin + 0.01);
      oscilador.onended = () => {
        oscilador.disconnect();
        envolvente.disconnect();
      };
    });
  }
  function establecerSilencio(valor) {
    silenciado = Boolean(valor);
    if (!gananciaPrincipal || !contextoAudio) {
      return;
    }
    const tiempo = contextoAudio.currentTime;
    gananciaPrincipal.gain.cancelScheduledValues(
      tiempo
    );
    gananciaPrincipal.gain.setTargetAtTime(
      silenciado ? 0 : 0.12,
      tiempo,
      0.015
    );
  }

  // modulos/voz.js
  function vozDisponible() {
    return "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
  }
  function anunciarEstado(estado, silenciado3 = false) {
    if (silenciado3 || !vozDisponible()) {
      return;
    }
    const sintetizador = window.speechSynthesis;
    if (sintetizador.speaking || sintetizador.pending) {
      sintetizador.cancel();
    }
    const anuncio = new SpeechSynthesisUtterance(
      estado.voz
    );
    anuncio.lang = "es-PE";
    anuncio.rate = estado.color === "amarilla" ? 1.1 : 1;
    anuncio.pitch = 1;
    anuncio.volume = 0.9;
    const voces = sintetizador.getVoices();
    const vozEspanol = voces.find(
      (voz) => voz.lang.toLowerCase() === "es-pe"
    ) || voces.find(
      (voz) => voz.lang.toLowerCase().startsWith("es")
    );
    if (vozEspanol) {
      anuncio.voice = vozEspanol;
    }
    sintetizador.speak(anuncio);
  }
  function detenerVoz() {
    if (!vozDisponible()) {
      return;
    }
    window.speechSynthesis.cancel();
  }

  // modulos/animaciones.js
  var timelineActual = null;
  function detenerAnimacion() {
    if (timelineActual) {
      timelineActual.kill();
      timelineActual = null;
    }
    if (typeof window.gsap === "undefined") {
      return;
    }
    window.gsap.killTweensOf(".luz");
    window.gsap.set(".luz", {
      scale: 1
    });
  }
  function animarEstado(estado, activarFeedback, reducirMovimiento = false) {
    detenerAnimacion();
    const luz = document.getElementById(
      `luz-${estado.color}`
    );
    const feedback = typeof activarFeedback === "function" ? activarFeedback : () => {
    };
    if (typeof window.gsap === "undefined" || reducirMovimiento || !luz) {
      feedback();
      return;
    }
    const timeline = window.gsap.timeline({
      onComplete: () => {
        if (timelineActual === timeline) {
          timelineActual = null;
        }
      }
    });
    timelineActual = timeline;
    timeline.call(
      feedback,
      [],
      0
    );
    timeline.fromTo(
      luz,
      {
        scale: 0.88
      },
      {
        scale: 1.11,
        duration: 0.25,
        ease: "power2.out"
      },
      0
    );
    timeline.to(
      luz,
      {
        scale: 1,
        duration: 0.28,
        ease: "back.out(1.5)"
      }
    );
  }

  // script.js
  var luces = document.querySelectorAll(".luz");
  var semaforo = document.getElementById("semaforo");
  var textoEstado = document.getElementById("estado");
  var indicacion = document.getElementById("indicacion");
  var compatibilidad = document.getElementById("compatibilidad");
  var btnIniciar = document.getElementById("btn-iniciar");
  var btnDetener = document.getElementById("btn-detener");
  var btnCambiar = document.getElementById("btn-cambiar");
  var btnSilencio = document.getElementById("btn-silencio");
  var indice = 0;
  var automatico = false;
  var silenciado2 = false;
  var temporizador = null;
  var movimientoReducido = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );
  function verificarCompatibilidad() {
    const audioDisponible = !!(window.AudioContext || window.webkitAudioContext);
    const voz = vozDisponible();
    const animacion = typeof window.gsap !== "undefined";
    const vibracion = "vibrate" in navigator;
    compatibilidad.textContent = `Audio: ${audioDisponible ? "Disponible" : "No disponible"} | Voz: ${voz ? "Disponible" : "No disponible"} | GSAP: ${animacion ? "Disponible" : "No disponible"} | Vibraci\xF3n: ${vibracion ? "Compatible" : "No disponible"}`;
  }
  function emitirFeedback(estado) {
    reproducirSonido(estado);
    anunciarEstado(estado, silenciado2);
    if (!movimientoReducido.matches && "vibrate" in navigator) {
      navigator.vibrate(estado.vibracion);
    }
  }
  function mostrarEstado(conFeedback = true) {
    const estado = estados[indice];
    luces.forEach((luz) => {
      luz.classList.toggle(
        "activa",
        luz.id === `luz-${estado.color}`
      );
    });
    textoEstado.textContent = estado.titulo;
    indicacion.textContent = estado.mensaje;
    semaforo.setAttribute(
      "aria-label",
      `${estado.titulo}. ${estado.mensaje}`
    );
    if (conFeedback) {
      animarEstado(
        estado,
        () => emitirFeedback(estado),
        movimientoReducido.matches
      );
    } else {
      detenerAnimacion();
    }
  }
  function siguienteLuz() {
    indice = (indice + 1) % estados.length;
    mostrarEstado();
  }
  function programarCiclo() {
    clearTimeout(temporizador);
    temporizador = null;
    if (!automatico) return;
    const duracion = estados[indice].duracion;
    temporizador = setTimeout(() => {
      if (!automatico) return;
      siguienteLuz();
      programarCiclo();
    }, duracion);
  }
  btnIniciar.addEventListener("click", () => {
    if (automatico) return;
    if (!silenciado2) {
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
  btnDetener.addEventListener("click", () => {
    automatico = false;
    clearTimeout(temporizador);
    temporizador = null;
    btnIniciar.textContent = "Iniciar";
    btnIniciar.setAttribute(
      "aria-pressed",
      "false"
    );
    detenerAnimacion();
    detenerVoz();
    if ("vibrate" in navigator) {
      navigator.vibrate(0);
    }
  });
  btnCambiar.addEventListener("click", () => {
    if (!silenciado2) {
      activarAudio();
    }
    siguienteLuz();
    if (automatico) {
      programarCiclo();
    }
  });
  btnSilencio.addEventListener("click", () => {
    silenciado2 = !silenciado2;
    establecerSilencio(silenciado2);
    btnSilencio.setAttribute(
      "aria-pressed",
      String(silenciado2)
    );
    btnSilencio.textContent = silenciado2 ? "Activar sonido" : "Silenciar";
    if (silenciado2) {
      detenerVoz();
    } else {
      activarAudio();
    }
  });
  if (movimientoReducido.addEventListener) {
    movimientoReducido.addEventListener(
      "change",
      (evento) => {
        if (evento.matches) {
          detenerAnimacion();
        }
      }
    );
  }
  btnIniciar.setAttribute("aria-pressed", "false");
  verificarCompatibilidad();
  mostrarEstado(false);
})();
