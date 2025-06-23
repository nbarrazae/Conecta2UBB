from rest_framework import serializers
from .models import Evento, Category

class CategorySerializer(serializers.ModelSerializer):
    """Serializer for the Category model."""
    class Meta:
        """Meta class for CategorySerializer."""
        model = Category
        fields = ['id', 'name']

class EventoSerializer(serializers.ModelSerializer):
    """Serializer for the Evento model, including related fields."""
    author = serializers.StringRelatedField(read_only=True)
    category = CategorySerializer(read_only=True)
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
            'participants',
            'max_participants',
        ]
