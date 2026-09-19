/**
 * DE SOLDADO A GENERAL - Motor de Lluvia Digital y Control de Experiencia
 * Autor: Front-End Senior Specialist
 */

document.addEventListener('DOMContentLoaded', () => {
  // Setup de Canvas y Contexto
  const canvas = document.getElementById('matrixCanvas');
  const ctx = canvas.getContext('2d');

  // Ajuste de tamaño inicial
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  // Conjunto de caracteres (Latinos, Números, Símbolos y Katakana)
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*+-=/<>[]{}()アイウエオカキクケコサシスセソタチツテトナニヌネノ';
  const charArray = characters.split('');

  // Configuración de columnas de la lluvia
  const fontSize = 16;
  let columns = Math.floor(width / fontSize);

  // Array que mantiene la posición 'Y' de cada columna
  let drops = [];
  // Array de velocidades individuales para un movimiento orgánico
  let speeds = [];

  function initDrops() {
    columns = Math.floor(width / fontSize);
    drops = [];
    speeds = [];
    for (let i = 0; i < columns; i++) {
      // Posición vertical inicial aleatoria para dinamismo inmediato
      drops[i] = Math.random() * -100;
      // Velocidad variable entre 0.8 y 2.2
      speeds[i] = Math.random() * 1.4 + 0.8;
    }
  }

  initDrops();

  // Gestión de Interacción del Mouse (Perturbación)
  const mouse = {
    x: null,
    y: null,
    radius: 120
  };

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  // Arreglo de impulsos/ondas por clic
  const ripples = [];

  window.addEventListener('click', (e) => {
    ripples.push({
      x: e.clientX,
      y: e.clientY,
      radius: 1,
      maxRadius: 200,
      alpha: 1
    });
  });

  // LOOP PRINCIPAL DE ANIMACIÓN
  function drawMatrix() {
    // Fondo semitransparente para generar la estela (trail) suave
    ctx.fillStyle = 'rgba(3, 5, 4, 0.08)';
    ctx.fillRect(0, 0, width, height);

    ctx.font = `${fontSize}px 'Share Tech Mono', monospace`;

    for (let i = 0; i < drops.length; i++) {
      // Caracter aleatorio
      const text = charArray[Math.floor(Math.random() * charArray.length)];
      const x = i * fontSize;
      const y = drops[i] * fontSize;

      // Calcular distancia con el mouse para el efecto de repulsión/reacción
      let isNearMouse = false;
      if (mouse.x !== null && mouse.y !== null) {
        const dx = x - mouse.x;
        const dy = y - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < mouse.radius) {
          isNearMouse = true;
        }
      }

      // Renderizado con variaciones de brillo y color
      if (isNearMouse) {
        // Resplandor cian/blanco cerca del cursor
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#00ffff';
      } else if (Math.random() > 0.96) {
        // Cabezal de la gota (letra guía super brillante)
        ctx.fillStyle = '#e6f5ec';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#00ff66';
      } else {
        // Cuerpo de la lluvia (Verde matriz estandar)
        ctx.fillStyle = 'rgba(0, 255, 102, 0.75)';
        ctx.shadowBlur = 0;
      }

      ctx.fillText(text, x, y);

      // Reinicio de columna cuando llega al final de la pantalla
      if (y > height && Math.random() > 0.975) {
        drops[i] = 0;
      }

      // Avanzar gota según su velocidad asignada
      drops[i] += speeds[i];
    }

    // Dibujar y actualizar efectos de perturbación por clic
    drawRipples();

    requestAnimationFrame(drawMatrix);
  }

  function drawRipples() {
    for (let i = 0; i < ripples.length; i++) {
      const r = ripples[i];
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0, 255, 102, ${r.alpha})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      r.radius += 5;
      r.alpha -= 0.025;

      if (r.alpha <= 0 || r.radius >= r.maxRadius) {
        ripples.splice(i, 1);
        i--;
      }
    }
  }

  // Iniciar animación
  requestAnimationFrame(drawMatrix);

  // REDIMENSIONAMIENTO ADAPTATIVO
  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initDrops();
  });

  // NAVEGACIÓN Y TRANSICIÓN ENTRE PANTALLAS
  const heroSection = document.getElementById('heroSection');
  const platformSection = document.getElementById('platformSection');
  const enterBtn = document.getElementById('enterBtn');
  const backBtn = document.getElementById('backBtn');

  enterBtn.addEventListener('click', () => {
    heroSection.classList.remove('active');
    heroSection.classList.add('hidden');

    setTimeout(() => {
      platformSection.classList.remove('hidden');
      platformSection.classList.add('active');
    }, 300);
  });

  backBtn.addEventListener('click', () => {
    platformSection.classList.remove('active');
    platformSection.classList.add('hidden');

    setTimeout(() => {
      heroSection.classList.remove('hidden');
      heroSection.classList.add('active');
    }, 300);
  });
});