def sjf_simular(procesos):

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

        # llegadas
        for p in pendientes[:]:
            if p.tiempo_llegada <= tiempo:
                listos.append(p)
                pendientes.remove(p)

        # retorno E/S
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

            # próxima E/S
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

            # entra a E/S
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

    # métricas
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

    return gantt, cpl, ces, resultados, prom_tep, prom_teje
