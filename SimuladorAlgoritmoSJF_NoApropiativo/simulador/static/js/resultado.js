let paso = 0;
let timer = null;
let cesIndex = 0;
let cesActivos = [];
let bloqueado = false;

const DURACION_ANIM = 1200;
const ESPERA_AUTO = 1600;

function renderCola(id, lista, bloqueados = []) {
    let box = document.getElementById(id);
    box.innerHTML = "";

    lista.forEach(p => {
        let d = document.createElement("div");

        let html = `<strong>${p.nombre}</strong>`;

        if (id === "cplBox" && p.restante !== undefined) {
            html += `<div class="tiempo"> ${p.restante}</div>`;
        }

        if (id === "cesBox" && p.retorno !== undefined) {
    html += `
        <div class="tiempo">
            R: ${p.restante} <br>
            Retorno: ${p.retorno}
        </div>
    `;
    }


        d.innerHTML = html;

        if (id === "cesBox") d.className = "proc-es";
        else if (id === "cplBox" && bloqueados.includes(p.nombre)) d.className = "proc-es";
        else d.className = "proc";

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

function animarMovimiento(nombre, fromId, toId, callback){
  const fromBox = document.getElementById(fromId);
  const toBox   = document.getElementById(toId);

  if(!fromBox || !toBox){ callback(); return; }

  // Tomar el elemento exacto por nombre (evita animar el incorrecto)
  const items = fromBox.querySelectorAll(".proc, .proc-es");
  const elem  = [...items].find(el => el.textContent.trim().startsWith(nombre)) || items[items.length - 1];

  if(!elem){ callback(); return; }

  const start = elem.getBoundingClientRect();

  // 1) Placeholder invisible AL FINAL del destino (flex calcula posición real de "append")
  const ph = document.createElement("div");
  ph.className = elem.className;          // mismo tamaño que un proc real
  ph.textContent = nombre;
  ph.style.visibility = "hidden";
  ph.style.pointerEvents = "none";
  toBox.appendChild(ph);

  // Si hay overflow horizontal, ve al final para que el end sea real/visible
  toBox.scrollLeft = toBox.scrollWidth;

  const end = ph.getBoundingClientRect();

  // 2) Clon que vuela
  const clone = elem.cloneNode(true);
  clone.className = "flying-proc";
  clone.innerText = nombre;

  clone.style.left = start.left + "px";
  clone.style.top  = start.top  + "px";
  document.body.appendChild(clone);

  // Atenuar el original mientras vuela
  elem.classList.add("moving");

  // 3) Mover hacia el placeholder (sin offsets fijos +40/+60)
  requestAnimationFrame(() => {
    const dx = end.left - start.left;
    const dy = end.top  - start.top;

    clone.style.transform = `translate(${dx}px, ${dy}px)`;
    clone.style.opacity = "0";
  });

  setTimeout(() => {
    clone.remove();
    ph.remove();
    elem.classList.remove("moving");
    callback();
  }, DURACION_ANIM + 50);
}

function mostrarPaso() {
    const TOTAL_PASOS = Math.max(gantt.length, cpl.length, ces.length);

    if (bloqueado || paso >= TOTAL_PASOS) {
        if (paso >= TOTAL_PASOS) {
            detener();
            document.getElementById("final").style.display = "block";
        }
        return;
    }
    bloqueado = true;
    if (paso < gantt.length) {

        const g = gantt[paso];
        const proc = g[0];

        renderCola("cplBox", cpl.slice(0, paso + 1), cesActivos);

        animarMovimiento(proc, "cplBox", "cpuBox", () => {
            agregarCPU(proc, g[1], g[2]);

            if (
                cesIndex < ces.length &&
                ces[cesIndex].nombre === proc
            ) {
                renderCola("cesBox", ces.slice(0, cesIndex + 1));

                animarMovimiento(proc, "cpuBox", "cesBox", () => {
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

    } else {
        renderCola("cplBox", cpl.slice(0, paso + 1), cesActivos);
        renderCola("cesBox", ces.slice(0, paso + 1));
        paso++;
        bloqueado = false;
    }
}


function siguiente(){ mostrarPaso(); }
function auto(){
    if(!timer) timer = setInterval(() => !bloqueado && mostrarPaso(), ESPERA_AUTO);
}
function detener(){ clearInterval(timer); timer = null; }
function reiniciar(){
    detener();
    paso = cesIndex = 0;
    cesActivos = [];
    document.getElementById("cpuBox").innerHTML = "";
    document.getElementById("cplBox").innerHTML = "";
    document.getElementById("cesBox").innerHTML = "";
}


