# eventos/filters.py
import django_filters
from django.db.models import Q
from .models import Evento

class EventoFilter(django_filters.FilterSet):
    palabra_clave = django_filters.CharFilter(method='buscar_por_palabra', label='Buscar')
    categoria = django_filters.CharFilter(field_name='category__name', lookup_expr='icontains')
    ubicacion = django_filters.CharFilter(field_name='location', lookup_expr='icontains')
    fecha = django_filters.DateFilter(field_name='event_date', lookup_expr='date')  # Filtra por día exacto

    class Meta:
        model = Evento
        fields = ['palabra_clave', 'categoria', 'ubicacion', 'fecha']

    def buscar_por_palabra(self, queryset, name, value):
        return queryset.filter(
            Q(title__icontains=value) | Q(description__icontains=value)
        )
