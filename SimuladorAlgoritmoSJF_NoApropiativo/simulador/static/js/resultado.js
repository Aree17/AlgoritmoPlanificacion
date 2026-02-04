let paso = 0;
let timer = null;
let cesIndex = 0;
let cesActivos = [];
let bloqueado = false;
let ultimoFinCPU = 0;

const DURACION_ANIM = 1200;
const ESPERA_AUTO = 1600;

function renderCola(id, lista, bloqueados = []) {
  let box = document.getElementById(id);
  box.innerHTML = "";

  lista.forEach(p => {
    let d = document.createElement("div");
    let html = `<strong>${p.nombre}</strong>`;

    if (id === "cplBox" && p.restante !== undefined) {
      html += `<div class="tiempo">${p.restante}</div>`;
    }

    if (id === "cesBox" && p.retorno !== undefined) {
      html += `
        <div class="tiempo">
          R: ${p.restante}<br>
          Retorno: ${p.retorno}
        </div>
      `;
    }

    d.innerHTML = html;

    if (id === "cesBox") {
      d.className = "proc proc-es";
    } else {
      d.className = "proc";
    }

    box.appendChild(d);
  });
}

function agregarCPU(nombre, ini, fin) {
  let cpuBox = document.getElementById("cpuBox");
  let d = document.createElement("div");
  d.className = "proc";
  d.innerHTML = `<strong>${nombre}</strong><div class="tiempo">${ini} → ${fin}</div>`;
  cpuBox.appendChild(d);
}

function agregarCPUIdle(ini, fin) {
  let cpuBox = document.getElementById("cpuBox");
  let d = document.createElement("div");

  d.className = "proc proc-idle";
  d.innerHTML = `
    <div class="proc-title">&nbsp;</div>
    <div class="tiempo">${ini} → ${fin}</div>
  `;

  cpuBox.appendChild(d);
}


function animarMovimiento(nombre, fromId, toId, callback) {
  const fromBox = document.getElementById(fromId);
  const toBox = document.getElementById(toId);

  if (!fromBox || !toBox) { callback(); return; }

  const items = fromBox.querySelectorAll(".proc, .proc-es");
  if (!items.length) { callback(); return; }

  const elem = items[items.length - 1];
  const start = elem.getBoundingClientRect();

  const ph = document.createElement("div");
  ph.className = elem.className;
  ph.style.visibility = "hidden";
  ph.innerHTML = elem.innerHTML;
  toBox.appendChild(ph);

  toBox.scrollLeft = toBox.scrollWidth;
  const end = ph.getBoundingClientRect();

  const clone = elem.cloneNode(true);
  clone.className = "flying-proc";
  clone.style.left = start.left + "px";
  clone.style.top = start.top + "px";
  document.body.appendChild(clone);

  elem.classList.add("moving");

  requestAnimationFrame(() => {
    clone.style.transform =
      `translate(${end.left - start.left}px, ${end.top - start.top}px)`;
    clone.style.opacity = "0";
  });

  setTimeout(() => {
    clone.remove();
    ph.remove();
    elem.classList.remove("moving");
    callback();
  }, DURACION_ANIM);
}

function mostrarPaso() {
  if (bloqueado || paso >= gantt.length) {
    if (paso >= gantt.length) {
      detener();
      document.getElementById("final").style.display = "block";
    }
    return;
  }

  bloqueado = true;

  const g = gantt[paso];
  const proc = g[0];
  const ini = g[1];
  const fin = g[2];

  renderCola("cplBox", cpl[paso] || []);

  animarMovimiento(proc, "cplBox", "cpuBox", () => {

    if (ini > ultimoFinCPU) {
      agregarCPUIdle(ultimoFinCPU, ini);
    }

    agregarCPU(proc, ini, fin);
    ultimoFinCPU = fin;

    if (cesIndex < ces.length && ces[cesIndex].nombre === proc) {
      animarMovimiento(proc, "cpuBox", "cesBox", () => {
        renderCola("cesBox", ces.slice(0, cesIndex + 1));
        cesActivos.push(proc);
        cesIndex++;
        paso++;
        bloqueado = false;
      });
    } else {
      paso++;
      bloqueado = false;
    }
  });
}

function siguiente() {
  mostrarPaso();
}

function auto() {
  if (!timer) {
    timer = setInterval(() => {
      if (!bloqueado) mostrarPaso();
    }, ESPERA_AUTO);
  }
}

function detener() {
  clearInterval(timer);
  timer = null;
}

function reiniciar() {
  detener();
  paso = 0;
  cesIndex = 0;
  cesActivos = [];
  ultimoFinCPU = 0;

  document.getElementById("cpuBox").innerHTML = "";
  document.getElementById("cplBox").innerHTML = "";
  document.getElementById("cesBox").innerHTML = "";
  document.getElementById("final").style.display = "none";
}

