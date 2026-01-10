from django.shortcuts import render, redirect, get_object_or_404
from .forms import ProcesoForm
from .models import Proceso
from .sjf import sjf_simular


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

    gantt, cpl, ces, resultados, prom_tep, prom_teje = sjf_simular(procesos)

    return render(request, "resultado.html", {
        "gantt": gantt,
        "cpl": cpl,
        "ces": ces,
        "completados": resultados,
        "prom_tep": prom_tep,
        "prom_teje": prom_teje
    })
