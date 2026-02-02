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
            restante: ${p.restante} <br>
            vuelve: ${p.retorno}
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

function animarMovimiento(nombre, fromId, toId, callback) {
    const from = document.getElementById(fromId);
    const to = document.getElementById(toId);
    const items = from.querySelectorAll(".proc, .proc-es");
    if (!items.length) return callback();

    const elem = items[items.length - 1];
    const clone = elem.cloneNode(true);
    clone.className = "flying-proc";

    const a = elem.getBoundingClientRect();
    const b = to.getBoundingClientRect();

    clone.style.left = a.left + "px";
    clone.style.top = a.top + "px";
    document.body.appendChild(clone);

    requestAnimationFrame(() => {
        clone.style.transform = `translate(${b.left - a.left + 40}px, ${b.top - a.top + 60}px)`;
        clone.style.opacity = "0";
    });

    setTimeout(() => {
        clone.remove();
        callback();
    }, DURACION_ANIM);
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


