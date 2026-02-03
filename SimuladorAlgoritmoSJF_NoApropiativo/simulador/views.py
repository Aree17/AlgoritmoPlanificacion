from django.shortcuts import render, redirect, get_object_or_404
from .models import Proceso
from .sjf import sjf_simular
import json

def ingresar_proceso(request):
    if request.method == "POST":
        total = int(request.POST.get("num_procesos", 0))

        for i in range(total):
            nombre = request.POST.get(f"nombre_{i}")
            llegada = request.POST.get(f"llegada_{i}")
            rafaga = request.POST.get(f"rafaga_{i}")
            es = []
            j = 0
            while True:
                t = request.POST.get(f"es_t_{i}_{j}")
                d = request.POST.get(f"es_d_{i}_{j}")

                if t is None or d is None:
                    break

                if t != "" and d != "":
                    es.append([int(t), int(d)])

                j += 1

            Proceso.objects.create(
                nombre=nombre,
                tiempo_llegada=int(llegada),
                rafaga_cpu=int(rafaga),
                es=es
            )

        return redirect("lista_procesos")

    return render(request, "ingresar.html")


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

    gantt, cpl, ces, completados, prom_tep, prom_teje = sjf_simular(procesos)
    gantt_js = json.dumps(gantt)
    cpl_js = json.dumps(cpl)
    ces_js = json.dumps(ces)
    def nombres_finales(cola):
        if not cola:
            return []

        if isinstance(cola[0], list):
            ultima = cola[-1] or []
            return [p["nombre"] for p in ultima]

        return [p["nombre"] for p in cola]

    cpl_nombres = nombres_finales(cpl)
    ces_nombres = nombres_finales(ces)

    return render(request, "resultado.html", {
        "procesos": procesos,

        # Backend
        "gantt": gantt,
        "completados": completados,
        "prom_tep": prom_tep,
        "prom_teje": prom_teje,

        # Vistas finales
        "cpl": cpl_nombres,
        "ces": ces_nombres,

        # Frontend
        "gantt_js": gantt_js,
        "cpl_js": cpl_js,
        "ces_js": ces_js,
    })
