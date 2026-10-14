
"use strict";

/* ==========================================
   PROYECTO: SEMÁFORO ACCESIBLE MULTISENSORIAL
   MÓDULO: animaciones.js

   Responsabilidades:
   - Controlar las animaciones con GSAP
   - Sincronizar animaciones y sonidos
   - Aplicar movimientos fluidos
   - Respetar el movimiento reducido
   - Detener animaciones anteriores
========================================== */

// 1. VARIABLE DE CONTROL

let timelineActual = null;

// 2. DETENER ANIMACIONES ANTERIORES

export function detenerAnimacion() {

  // Cancelar la línea de tiempo activa
  if (timelineActual) {
    timelineActual.kill();
    timelineActual = null;
  }

  // Comprobar disponibilidad de GSAP
  if (typeof window.gsap === "undefined") {
    return;
  }

  // Cancelar animaciones pendientes
  window.gsap.killTweensOf(".luz");

  // Restablecer el tamaño de las luces
  window.gsap.set(".luz", {
    scale: 1
  });
}

// 3. ANIMAR EL ESTADO DEL SEMÁFORO

export function animarEstado(
  estado,
  activarFeedback,
  reducirMovimiento = false
) {

  // Eliminar animaciones anteriores
  detenerAnimacion();

  // Buscar la luz correspondiente
  const luz = document.getElementById(
    `luz-${estado.color}`
  );

  // Función de sonido, voz y vibración
  const feedback = typeof activarFeedback === "function"
    ? activarFeedback
    : () => {};

  // 4. RESPETAR LA ACCESIBILIDAD

  // Sin GSAP o con movimiento reducido,
  // mantener el feedback sin animaciones.
  if (
    typeof window.gsap === "undefined" ||
    reducirMovimiento ||
    !luz
  ) {
    feedback();
    return;
  }

  // 5. CREAR LA LÍNEA DE TIEMPO GSAP

  const timeline = window.gsap.timeline({
    onComplete: () => {
      if (timelineActual === timeline) {
        timelineActual = null;
      }
    }
  });

  timelineActual = timeline;

  // 6. SINCRONIZAR EL FEEDBACK

  // Ejecutar sonido, voz y vibración
  // al inicio de la animación.
  timeline.call(
    feedback,
    [],
    0
  );

  // 7. ANIMACIÓN DE ENCENDIDO

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

  // 8. ANIMACIÓN DE ESTABILIZACIÓN

  timeline.to(
    luz,
    {
      scale: 1,
      duration: 0.28,
      ease: "back.out(1.5)"
    }
  );

}
