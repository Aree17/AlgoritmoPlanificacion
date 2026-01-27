let paso = 0;
let timer = null;
let cesIndex = 0;
let cesActivos = [];


// Duraciones (más lento para ver)
const DURACION_ANIM = 1200;//1200
const ESPERA_AUTO = 1600; //1600

// Evita que el automático dispare pasos antes de terminar la animación
let bloqueado = false;

// Render CPL / CES como listas completas
function renderCola(id, lista, bloqueados = []){
    let box = document.getElementById(id);
    box.innerHTML = "";

    lista.forEach(p=>{
        let d = document.createElement("div");
        d.innerText = p;

        if (id === "cesBox") {
            d.className = "proc-es";
        }
        else if (id === "cplBox" && bloqueados.includes(p)) {
            d.className = "proc-es";
        }
        else {
            d.className = "proc";
        }

        box.appendChild(d);
    });
}
// Historial CPU acumulado
function agregarCPU(nombre, ini, fin){
    let cpuBox = document.getElementById("cpuBox");
    let cpuDiv = document.createElement("div");
    cpuDiv.className = "proc";
    cpuDiv.innerHTML = `${nombre}<br>${ini} → ${fin}`;
    cpuBox.appendChild(cpuDiv);
}

// Animación real: toma el último bloque del contenedor origen y lo "vuela" al destino
function animarMovimiento(nombre, fromId, toId, callback){
    const fromBox = document.getElementById(fromId);
    const toBox = document.getElementById(toId);

    if(!fromBox || !toBox){
        callback();
        return;
    }

    const items = fromBox.querySelectorAll(".proc, .proc-es");

    if(items.length === 0){
        callback();
        return;
    }

    // El último elemento visible en esa cola
    const elem = items[items.length - 1];
    elem.classList.add("moving");

    // Clonar para volar
    const clone = elem.cloneNode(true);
    clone.className = "flying-proc";
    clone.innerText = nombre;

    const start = elem.getBoundingClientRect();
    const end = toBox.getBoundingClientRect();

    clone.style.left = start.left + "px";
    clone.style.top = start.top + "px";

    document.body.appendChild(clone);

    requestAnimationFrame(()=>{
        const dx = (end.left + 40) - start.left;
        const dy = (end.top + 60) - start.top;

        clone.style.transform = `translate(${dx}px, ${dy}px) scale(1.15)`;
        clone.style.opacity = "0";
    });

    setTimeout(()=>{
        clone.remove();
        elem.classList.remove("moving");
        callback();
    }, DURACION_ANIM + 50);
}
function mostrarPaso(){
    if(bloqueado) return;
    bloqueado = true;

    if(paso >= gantt.length){
        detener();
        document.getElementById("final").style.display = "block";
        bloqueado = false;
        return;
    }

    const g = gantt[paso];
    const procesoActual = g[0];

    if (cesActivos.includes(procesoActual)) {
    cesActivos = cesActivos.filter(p => p !== procesoActual);
}

    // ===== CPL actual en este paso (cola completa hasta ahora) =====
    const cplActual = cpl.slice(0, paso + 1);
    renderCola("cplBox", cplActual, cesActivos);

    if (cesActivos.includes(procesoActual)) {
    salirDeES(procesoActual, cplActual);
    return;
}
    // ===== Animación CPL → CPU =====
    animarMovimiento(procesoActual, "cplBox", "cpuBox", ()=>{

        // aterriza en CPU: agrego al historial
        agregarCPU(g[0], g[1], g[2]);

        // ¿entra a E/S en este paso?
        const entraES = (cesIndex < ces.length && ces[cesIndex] === procesoActual);

        if(entraES){

            // pre-render CES para que exista donde aterrizar
            const cesPrev = ces.slice(0, cesIndex + 1);
            renderCola("cesBox", cesPrev);

            // ===== Animación CPU → E/S =====
            animarMovimiento(procesoActual, "cpuBox", "cesBox", ()=>{
                cesIndex++;
                if (!cesActivos.includes(procesoActual)) {
                    cesActivos.push(procesoActual);
                }

                const cesActual = ces.slice(0, cesIndex);
                renderCola("cesBox", cesActual);
                renderCola("cplBox", cplActual, cesActivos)

                paso++;
                bloqueado = false;
            });

        } else {

            const cesActual = ces.slice(0, cesIndex);
            renderCola("cplBox", cplActual, cesActivos);
            renderCola("cesBox", cesActual);

            paso++;
            bloqueado = false;
        }
    });
}
function salirDeES(procesoActual, cplActual){
    bloqueado = true;

    animarMovimiento(procesoActual, "cesBox", "cplBox", () => {

        cesActivos = cesActivos.filter(p => p !== procesoActual);

        renderCola("cesBox", cesActivos);
        renderCola("cplBox", cplActual,cesActivos);

        paso++;
        bloqueado = false;
    });
}
function siguiente(){
    mostrarPaso();
}

function auto(){
    if(timer == null){
        timer = setInterval(()=>{
            if(!bloqueado){
                mostrarPaso();
            }
        }, ESPERA_AUTO);
    }
}

function detener(){
    if(timer != null){
        clearInterval(timer);
        timer = null;
    }
}

function reiniciar(){
    detener();
    paso = 0;
    cesIndex = 0;
    bloqueado = false;

    document.getElementById("cpuBox").innerHTML = "";
    document.getElementById("cplBox").innerHTML = "";
    document.getElementById("cesBox").innerHTML = "";
    document.getElementById("final").style.display = "none";
}

