from django.shortcuts import render, redirect, get_object_or_404
from .forms import ProcesoForm
from .models import Proceso
from .sjf import sjf_simular
import json


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

    gantt, cpl, ces, completados, prom_tep, prom_teje = sjf_simular(procesos)

    # 🔹 Para JS (objetos completos)
    gantt_js = json.dumps(gantt)
    cpl_js = json.dumps(cpl)
    ces_js = json.dumps(ces)

    # 🔹 Para mostrar en resultados finales (solo nombres)
    cpl_nombres = [p["nombre"] for p in cpl]
    ces_nombres = [p["nombre"] for p in ces]

    return render(request, "resultado.html", {
        "procesos": procesos,

        # Backend
        "gantt": gantt,
        "completados": completados,
        "prom_tep": prom_tep,
        "prom_teje": prom_teje,

        # Vistas finales (texto)
        "cpl": cpl_nombres,
        "ces": ces_nombres,

        # Frontend JS
        "gantt_js": gantt_js,
        "cpl_js": cpl_js,
        "ces_js": ces_js,
    })
