from django_filters import rest_framework as filters
from django.db.models import Q
from .models import Evento

class EventoFilter(filters.FilterSet):
    palabra_clave = filters.CharFilter(method='buscar_por_palabra', label='Buscar')
    categoria = filters.CharFilter(field_name='category__name', lookup_expr='icontains')
    ubicacion = filters.CharFilter(field_name='location', lookup_expr='icontains')
    fecha__gte = filters.DateFilter(field_name='event_date', lookup_expr='gte')
    fecha__lte = filters.DateFilter(field_name='event_date', lookup_expr='lte')

    class Meta:
        model = Evento
        fields = ['palabra_clave', 'categoria', 'ubicacion', 'fecha__gte', 'fecha__lte']

    def buscar_por_palabra(self, queryset, name, value):
        return queryset.filter(
            Q(title__icontains=value) |
            Q(description__icontains=value) |
            Q(location__icontains=value)
        )
