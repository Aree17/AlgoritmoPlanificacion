from django.shortcuts import render, redirect, get_object_or_404
from .forms import ProcesoForm
from .models import Proceso

def ingresar_proceso(request):
    if request.method == 'POST':
        form = ProcesoForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('lista_procesos')
    else:
        form = ProcesoForm()
    return render(request, 'ingresar.html', {'form': form})

def lista_procesos(request):
    procesos = Proceso.objects.all()
    return render(request, 'lista.html', {'procesos': procesos})

def eliminar_proceso(request, id):
    proceso = get_object_or_404(Proceso, id=id)
    proceso.delete()
    return redirect('lista_procesos')

def eliminar_todos_procesos(request):
    if request.method == "POST":
        Proceso.objects.all().delete()
    return redirect('lista_procesos')

def simular(request):
    procesos = list(Proceso.objects.all())

    tiempo = 0
    gantt = []

    pendientes = procesos.copy()
    listos = []
    en_es = []
    completados = []

    estado = {}

    for p in procesos:
        estado[p.nombre] = {
            "llegada": p.tiempo_llegada,
            "rafaga": p.rafaga_cpu,
            "es": p.es if isinstance(p.es, list) else [],
            "es_index": 0,
            "ejecutado": 0,
            "fin": None
        }

    cpl = []
    ces = []

    while pendientes or listos or en_es:

        for p in pendientes[:]:
            if p.tiempo_llegada <= tiempo:
                listos.append(p)
                pendientes.remove(p)

        for e in en_es[:]:
            if e["fin"] <= tiempo:
                listos.append(e["proceso"])
                en_es.remove(e)

        if listos:

            listos.sort(key=lambda x: (
                estado[x.nombre]["rafaga"] - estado[x.nombre]["ejecutado"],
                estado[x.nombre]["llegada"]
            ))

            p = listos.pop(0)
            cpl.append(p.nombre)

            info = estado[p.nombre]

            restante = info["rafaga"] - info["ejecutado"]
            inicio = tiempo

            if info["es_index"] < len(info["es"]) and len(info["es"][info["es_index"]]) == 2:
                proxima_es = info["es"][info["es_index"]][0]
                dur_es = info["es"][info["es_index"]][1]
            else:
                proxima_es = None
                dur_es = None

            if proxima_es is not None and info["ejecutado"] < proxima_es:
                ejecutar = min(restante, proxima_es - info["ejecutado"])
            else:
                ejecutar = restante

            fin = tiempo + ejecutar
            gantt.append((p.nombre, inicio, fin))

            info["ejecutado"] += ejecutar
            tiempo = fin

            # Entra a E/S
            if proxima_es is not None and info["ejecutado"] == proxima_es:
                info["es_index"] += 1

                en_es.append({
                    "proceso": p,
                    "fin": tiempo + dur_es
                })

                ces.append(p.nombre)

            elif info["ejecutado"] == info["rafaga"]:
                info["fin"] = tiempo
                completados.append(p)

            else:
                listos.append(p)

        else:
            tiempo += 1

    resultados = []
    total_tep = 0
    total_teje = 0

    for p in completados:
        info = estado[p.nombre]
        total_es = sum(d[1] for d in info["es"] if len(d) == 2)

        tep = info["fin"] - info["llegada"] - info["rafaga"] - total_es
        teje = info["fin"] - info["llegada"]

        total_tep += tep
        total_teje += teje

        resultados.append({
            "proceso": p.nombre,
            "TEP": tep,
            "TEjeP": teje
        })

    prom_tep = total_tep / len(resultados) if resultados else 0
    prom_teje = total_teje / len(resultados) if resultados else 0

    return render(request, "resultado.html", {
        "gantt": gantt,
        "cpl": cpl,
        "ces": ces,
        "completados": resultados,
        "prom_tep": prom_tep,
        "prom_teje": prom_teje
    })
