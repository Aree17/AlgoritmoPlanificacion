from django.contrib import messages
from django.shortcuts import render, redirect, get_object_or_404
from .models import Proceso
from .sjf import sjf_simular
import json
import re

def _siguiente_numero_proceso():
    nombres = Proceso.objects.values_list("nombre", flat=True)
    max_n = 0
    for nom in nombres:
        if not nom:
            continue
        m = re.fullmatch(r"P(\d+)", str(nom).strip())
        if m:
            num = int(m.group(1))
            if num > max_n:
                max_n = num
    return max_n + 1

def ingresar_proceso(request):
    if request.method == "POST":
        num_raw = request.POST.get("num_procesos")
        if not num_raw or not num_raw.isdigit():
            messages.error(
                request,
                "Debe generar al menos un proceso antes de guardar."
            )
            return redirect("ingresar")

        total = int(num_raw)

        if total <= 0:
            messages.error(
                request,
                "Debe generar al menos un proceso antes de guardar."
            )
            return redirect("ingresar")

        siguiente = _siguiente_numero_proceso()

        for i in range(total):
            llegada = request.POST.get(f"llegada_{i}")
            rafaga = request.POST.get(f"rafaga_{i}")

            if not llegada or not rafaga:
                messages.error(
                    request,
                    f"El proceso {i + 1} tiene campos incompletos."
                )
                return redirect("ingresar")

            llegada = int(llegada)
            rafaga = int(rafaga)

            nombre = f"P{siguiente}"
            while Proceso.objects.filter(nombre=nombre).exists():
                siguiente += 1
                nombre = f"P{siguiente}"

            es = []
            j = 0
            while True:
                t = request.POST.get(f"es_t_{i}_{j}")
                d = request.POST.get(f"es_d_{i}_{j}")

                if t is None or d is None:
                    break

                if t != "" and d != "":
                    t = int(t)
                    d = int(d)

                    if t >= rafaga:
                        messages.error(
                            request,
                            f"Error en {nombre}: el inicio de E/S ({t}) "
                            f"no puede ser mayor o igual que la ráfaga ({rafaga})."
                        )
                        return redirect("ingresar")

                    es.append([t, d])

                j += 1

            Proceso.objects.create(
                nombre=nombre,
                tiempo_llegada=llegada,
                rafaga_cpu=rafaga,
                es=es
            )

            siguiente += 1

        messages.success(request, "Procesos guardados correctamente.")
        return redirect("lista_procesos")

    return render(request, "ingresar.html", {"siguiente_proceso": _siguiente_numero_proceso()})


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
        "gantt": gantt,
        "completados": completados,
        "prom_tep": prom_tep,
        "prom_teje": prom_teje,
        "cpl": cpl_nombres,
        "ces": ces_nombres,
        "gantt_js": gantt_js,
        "cpl_js": cpl_js,
        "ces_js": ces_js,
    })
