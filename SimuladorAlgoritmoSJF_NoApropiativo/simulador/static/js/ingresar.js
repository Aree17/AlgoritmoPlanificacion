console.log("JS ingresar_multiple cargado");

function generarProcesos() {
    const n = document.getElementById("numProcesos").value;
    document.getElementById("num_procesos").value = n;

    const cont = document.getElementById("contenedorProcesos");
    cont.innerHTML = "";

    for (let i = 0; i < n; i++) {
        cont.innerHTML += `
        <fieldset class="proc-box">
            <legend>Proceso ${i + 1}</legend>

            <label>Nombre</label>
            <input name="nombre_${i}" value="P${i + 1}" required>

            <label>Llegada</label>
            <input type="number" name="llegada_${i}" required>

            <label>Ráfaga CPU</label>
            <input type="number" name="rafaga_${i}" required>

            <div id="es_${i}">
                <h4>Operaciones E/S</h4>
            </div>

            <button type="button" onclick="agregarES(${i})">+ E/S</button>
        </fieldset>
        `;
    }
}

function agregarES(i) {
    const cont = document.getElementById(`es_${i}`);
    const idx = cont.querySelectorAll(".es-line").length;

    cont.innerHTML += `
        <div class="es-line">
            <input type="number" name="es_t_${i}_${idx}" placeholder="Instante">
            <input type="number" name="es_d_${i}_${idx}" placeholder="Duración">
        </div>
    `;
}
