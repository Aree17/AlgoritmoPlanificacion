document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("formProceso");

    form.addEventListener("submit", function(e){

        const nombre = document.getElementById("id_nombre").value.trim();
        const llegada = document.getElementById("id_tiempo_llegada").value;
        const rafaga = document.getElementById("id_rafaga_cpu").value;
        const es = document.getElementById("id_es").value.trim();

        if(nombre === ""){
            alert("El nombre del proceso es obligatorio");
            e.preventDefault();
            return;
        }

        if(llegada === "" || llegada < 0){
            alert("El tiempo de llegada debe ser válido");
            e.preventDefault();
            return;
        }

        if(rafaga === "" || rafaga <= 0){
            alert("La ráfaga CPU debe ser mayor que 0");
            e.preventDefault();
            return;
        }

        // Validación formato [[x,y],[x,y]]
        if(es !== ""){
            try{
                const data = JSON.parse(es.replace(/'/g,'"'));

                if(!Array.isArray(data)){
                    throw "Formato incorrecto";
                }

                for(let par of data){
                    if(!Array.isArray(par) || par.length !== 2){
                        throw "Formato incorrecto";
                    }
                    if(isNaN(par[0]) || isNaN(par[1])){
                        throw "Formato incorrecto";
                    }
                }
            }
            catch(err){
                alert("Formato E/S inválido. Use: [[3,3],[4,4]]");
                e.preventDefault();
            }
        }

    });

});
