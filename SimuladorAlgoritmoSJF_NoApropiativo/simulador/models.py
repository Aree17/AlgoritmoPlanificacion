from django.db import models

class Proceso(models.Model):
    nombre = models.CharField(max_length=10)
    tiempo_llegada = models.IntegerField()
    rafaga_cpu = models.IntegerField()
    es = models.JSONField(default=list, blank=True)

