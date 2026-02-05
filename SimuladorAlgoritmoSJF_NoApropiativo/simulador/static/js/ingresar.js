console.log("JS ingresar_multiple cargado");

function generarProcesos() {
    const n = parseInt(document.getElementById("numProcesos").value);
    const hidden = document.getElementById("num_procesos");
    const cont = document.getElementById("contenedorProcesos");

    const baseInput = document.getElementById("baseNombre");
    const base = baseInput ? parseInt(baseInput.value) : 1;

    cont.innerHTML = "";
    hidden.value = "";

    if (!n || n <= 0) return;

    hidden.value = n;

    for (let i = 0; i < n; i++) {
        const nombreAuto = `P${base + i}`;

        cont.innerHTML += `
        <fieldset class="proc-box">

            <label>Nombre</label>
            <input name="nombre_${i}" value="${nombreAuto}" required readonly>

            <label>Llegada</label>
            <input type="number" name="llegada_${i}" required>

            <label>Ráfaga CPU</label>
            <input type="number" name="rafaga_${i}" required>

            <div id="es_${i}">
                <h4>Operaciones E/S</h4>
            </div>

            <button type="button" onclick="agregarES(${i})">+ E/S</button>

            <div class="error-proceso" style="display:none; color:red; margin-top:8px;"></div>
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

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");
    const msg = document.getElementById("msgError");

    form.addEventListener("submit", function (e) {
        msg.style.display = "none";
        msg.innerHTML = "";

        let hayError = false;

        const numProcesos = document.getElementById("num_procesos").value;
        if (!numProcesos || parseInt(numProcesos) <= 0) {
            e.preventDefault();
            msg.innerHTML = "⚠️ Debe generar al menos un proceso antes de guardar.";
            msg.style.display = "block";
            msg.scrollIntoView({ behavior: "smooth" });
            return;
        }

        const procesos = document.querySelectorAll(".proc-box");

        procesos.forEach((proc, i) => {
            const errorBox = proc.querySelector(".error-proceso");
            errorBox.innerHTML = "";
            errorBox.style.display = "none";

            const rafagaInput = proc.querySelector(`input[name="rafaga_${i}"]`);
            if (!rafagaInput) return;

            const rafaga = parseInt(rafagaInput.value);
            const esLineas = proc.querySelectorAll(".es-line");

            esLineas.forEach(linea => {
                const tInput = linea.querySelector('input[name^="es_t_"]');
                if (!tInput || tInput.value === "") return;

                const t = parseInt(tInput.value);

                if (t >= rafaga) {
                    hayError = true;
                    errorBox.innerHTML += `
                        Inicio de E/S (${t}) ≥ ráfaga CPU (${rafaga})<br>
                    `;
                    errorBox.style.display = "block";
                }
            });
        });

        if (hayError) {
            e.preventDefault();
            document.querySelector(".error-proceso").scrollIntoView({ behavior: "smooth" });
        }
    });
});
