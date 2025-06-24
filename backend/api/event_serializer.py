from rest_framework import serializers
from .models import Evento, Category, EventReport

class CategorySerializer(serializers.ModelSerializer):
    """Serializer for the Category model."""
    class Meta:
        """Meta class for CategorySerializer."""
        model = Category
        fields = ['id', 'name']

class EventoSerializer(serializers.ModelSerializer):
    """Serializer for the Evento model, including related fields."""
    author = serializers.StringRelatedField(read_only=True)
    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all()
    )
    category_name = serializers.CharField(source='category.name', read_only=True)
    participants = serializers.StringRelatedField(many=True, read_only=True)

    class Meta:
        """Serializer for the Evento model, including related fields."""
        model = Evento
        fields = [
            'id',
            'title',
            'description',
            'createdAt',
            'event_date',
            'location',
            'state',
            'author',
            'category',
            'category_name',
            'participants',
            'max_participants',
        ]

class EventReportSerializer(serializers.ModelSerializer):
    reporter = serializers.StringRelatedField(read_only=True)
    event = serializers.PrimaryKeyRelatedField(queryset=Evento.objects.all())

    class Meta:
        model = EventReport
        fields = ['id', 'event', 'reporter', 'reason', 'status', 'created_at']
        read_only_fields = ['status', 'created_at', 'reporter']