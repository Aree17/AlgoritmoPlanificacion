from django.urls import path
from . import views

urlpatterns = [
    path('', views.ingresar_proceso, name='ingresar'),
    path('lista/', views.lista_procesos, name='lista_procesos'),
    path('simular/', views.simular, name='simular'),
    path('eliminar/<int:id>/', views.eliminar_proceso, name='eliminar_proceso'),
    path('eliminar_todos/', views.eliminar_todos_procesos, name='eliminar_todos_procesos'),
]