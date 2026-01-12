let paso = 0;
let timer = null;

function mostrarPaso() {

    let g = gantt[paso];

    document.getElementById("cpu").innerText = g[0];
    document.getElementById("inicio").innerText = g[1];
    document.getElementById("fin").innerText = g[2];

    document.getElementById("cpl").innerText =
        cpl.slice(0,paso+1).join(" → ");

    document.getElementById("ces").innerText =
        ces.slice(0,paso+1).join(" → ");

    paso++;

    if (paso >= gantt.length) {
        detener();
        document.getElementById("final").style.display = "block";
    }
}

function siguiente() {
    if (paso < gantt.length) {
        mostrarPaso();
    }
}

function auto() {
    if (timer == null) {
        timer = setInterval(mostrarPaso, 1200);
    }
}

function detener() {
    if (timer != null) {
        clearInterval(timer);
        timer = null;
    }
}
