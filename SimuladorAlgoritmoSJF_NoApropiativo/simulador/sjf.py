def sjf_no_apropiativo(procesos):
    tiempo = 0
    listos = []
    cola_es = []
    gantt = []

    # inicializar campos internos
    for p in procesos:
        p.cpu_restante = p.rafaga_cpu
        p.estado = "nuevo"
        p.fin_es = None

    procesos = sorted(procesos, key=lambda p: p.tiempo_llegada)

    while procesos or listos or cola_es:

        # Llegadas
        while procesos and procesos[0].tiempo_llegada <= tiempo:
            p = procesos.pop(0)
            listos.append(p)

        # Retorno de E/S
        for p in cola_es[:]:
            if p.fin_es <= tiempo:
                cola_es.remove(p)
                listos.append(p)

        if listos:
            listos.sort(key=lambda p: p.cpu_restante)
            p = listos.pop(0)

            inicio = tiempo

            # ¿tiene E/S pendiente?
            ejecutado = p.rafaga_cpu - p.cpu_restante

            if p.inicio_es is not None and ejecutado < p.inicio_es:
                hasta_es = p.inicio_es - ejecutado

                if hasta_es < p.cpu_restante:
                    # Ejecuta hasta E/S
                    tiempo += hasta_es
                    p.cpu_restante -= hasta_es

                    gantt.append((p.nombre, inicio, tiempo))

                    # entra a E/S
                    p.fin_es = tiempo + p.duracion_es
                    cola_es.append(p)
                    continue

            # Ejecuta lo restante
            tiempo += p.cpu_restante
            gantt.append((p.nombre, inicio, tiempo))
            p.cpu_restante = 0

        else:
            tiempo += 1

    return gantt

def metricas(completados):
    for c in completados:
        c["TEjeP"] = c["fin"] - c["llegada"]
        c["TEP"] = c["TEjeP"] - c["rafaga"]
    return completados
