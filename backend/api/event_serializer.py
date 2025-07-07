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
    author_username = serializers.CharField(source='author.username', read_only=True)  # nuevo
    author_profile_picture = serializers.SerializerMethodField()  # 👈 nuevo
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
            'author_username',  # nuevo
            'author_profile_picture',  # 👈 nuevo
            'category',
            'category_name',
            'participants',
            'max_participants',
        ]

    def get_author_profile_picture(self, obj):  # ✅ Esta función debe estar aquí
        request = self.context.get('request')
        if obj.author.profile_picture:
            if request:
                return request.build_absolute_uri(obj.author.profile_picture.url)
            return obj.author.profile_picture.url
        return None

class EventReportSerializer(serializers.ModelSerializer):
    reporter = serializers.StringRelatedField(read_only=True)
    event = serializers.PrimaryKeyRelatedField(queryset=Evento.objects.all())

    class Meta:
        model = EventReport
        fields = ['id', 'event', 'reporter', 'reason', 'status', 'created_at']
        read_only_fields = ['status', 'created_at', 'reporter']