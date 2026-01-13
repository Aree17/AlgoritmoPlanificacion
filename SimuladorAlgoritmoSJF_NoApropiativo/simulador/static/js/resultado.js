let paso = 0;
let timer = null;

function mostrarPaso(){

    if(paso >= gantt.length){
        detener();
        document.getElementById("final").style.display = "block";
        return;
    }

    let g = gantt[paso];

    // Historial CPU
    let cpuBox = document.getElementById("cpuBox");
    let cpuDiv = document.createElement("div");
    cpuDiv.className = "proc";
    cpuDiv.innerHTML = `${g[0]}<br>${g[1]} → ${g[2]}`;
    cpuBox.appendChild(cpuDiv);

    // Cola CPL
    actualizarCola("cplBox", cpl.slice(0, paso+1));
    // Cola O E/S
    actualizarCola("cesBox", ces.slice(0, paso+1));
    paso++;
}

function actualizarCola(id, lista){
    let box = document.getElementById(id);
    box.innerHTML = "";

    lista.forEach(p => {
        let d = document.createElement("div");
        d.className = "proc";
        d.innerText = p;
        box.appendChild(d);
    });
}

function siguiente(){
    mostrarPaso();
}

function auto(){
    if(timer == null){
        timer = setInterval(mostrarPaso, 1200);
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
    document.getElementById("cpuBox").innerHTML = "";
    document.getElementById("cplBox").innerHTML = "";
    document.getElementById("cesBox").innerHTML = "";
    document.getElementById("final").style.display = "none";
}
