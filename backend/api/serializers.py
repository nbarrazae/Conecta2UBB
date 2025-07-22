from rest_framework import serializers
from .models import *
from django.contrib.auth import get_user_model
from django.utils.crypto import get_random_string
from django.utils import timezone

User = get_user_model()


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret.pop('password', None)  # Elimina el campo de contraseña de la representación
        return ret

    def validate(self, data):
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            raise serializers.ValidationError("Email and password are required.")

        user = User.objects.filter(email=email).first()
        if user is None or not user.check_password(password):
            raise serializers.ValidationError("Invalid credentials.")

        data['user'] = user
        return data



class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'is_staff', 'is_superuser')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        email = validated_data.get("email")
        validated_data["username"] = email.split("@")[0]  # genera el username automáticamente
        # pasword random
        validated_data["password"] = get_random_string(length=10)
        print(validated_data["password"])
        user = User.objects.create_user(**validated_data)
        return user 
    
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']

class ProfileSerializer(serializers.ModelSerializer):
    birthday = serializers.DateField(
        format="%d/%m/%Y",
        input_formats=["%d/%m/%Y", "%Y-%m-%d"],
        required=False,
        allow_null=True
    )
    interests = CategorySerializer(many=True, read_only=True)

    interest_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False,
        allow_empty=True
    )

    eventos_participados = serializers.SerializerMethodField()
    eventos_organizados = serializers.SerializerMethodField()  # 🔹 Nuevo campo
    date_joined = serializers.DateTimeField(format="%d/%m/%Y %H:%M", read_only=True)
    last_login = serializers.DateTimeField(format="%d/%m/%Y %H:%M", read_only=True)

    class Meta:
        model = CustomUser
        fields = [
            'id', 'email', 'username', 'birthday',
            'full_name', 'bio', 'profile_picture',
            'interests', 'interest_ids',
            'eventos_participados',
            'eventos_organizados',
            'is_active', 'date_joined', 'last_login'
        ]
        read_only_fields = ['id', 'date_joined', 'last_login']


    def get_eventos_participados(self, obj):
        eventos = obj.eventos_participados.all()
        return EventoSimpleSerializer(eventos, many=True).data

    def get_eventos_organizados(self, obj):
        eventos = obj.eventos_creados.all()  # 👈 Asumiendo que tienes related_name='eventos_creados'
        return EventoSimpleSerializer(eventos, many=True).data

    def update(self, instance, validated_data):
        print("DEBUG validated_data:", validated_data)
        request = self.context.get('request')
        raw_interest_ids = []
        if request:
            # Si viene como lista (por ejemplo, desde form-data)
            if hasattr(request.data, "getlist"):
                raw_interest_ids = request.data.getlist('interest_ids')
            # Si viene como JSON
            elif 'interest_ids' in request.data:
                raw_interest_ids = request.data['interest_ids']
                if isinstance(raw_interest_ids, str):
                    # Intenta convertir string de números separados por coma a lista
                    raw_interest_ids = [int(i) for i in raw_interest_ids.split(",") if i.strip().isdigit()]
        if raw_interest_ids == ["0"] or raw_interest_ids == []:
            instance.interests.clear()
            validated_data.pop('interest_ids', None)
        elif 'interest_ids' in validated_data:
            interest_ids = validated_data.pop('interest_ids')
            if isinstance(interest_ids, str):
                interest_ids = [int(i) for i in interest_ids.split(",") if i.strip().isdigit()]
            instance.interests.set(interest_ids)
        return super().update(instance, validated_data)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # ajustar date_joined
        if instance.date_joined:
            local_date_joined = timezone.localtime(instance.date_joined)
            data['date_joined'] = local_date_joined.strftime("%d/%m/%Y %H:%M")
        # ajustar last_login
        if instance.last_login:
            local_last_login = timezone.localtime(instance.last_login)
            data['last_login'] = local_last_login.strftime("%d/%m/%Y %H:%M")
        return data

    def validate_birthday(self, value):
        if value in ("", None):
            return None
        return value




class EventoSimpleSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    category = serializers.StringRelatedField(read_only=True)  # 👈 Añádelo de nuevo
    participants = serializers.SerializerMethodField()
    author_username = serializers.CharField(source="author.username", read_only=True)
    author_profile_picture = serializers.SerializerMethodField()
    comment_count = serializers.SerializerMethodField()  # ✅ Nuevo campo

    class Meta:
        model = Evento
        fields = [
            'id',
            'title',
            'category',               # 👈 campo tipo string (fallback)
            'category_name',          # 👈 campo que usas para mostrar chip
            'event_date',
            'location',
            'state',
            'max_participants',
            'participants',
            'author_username',
            'author_profile_picture',
            'comment_count',  # ✅ Nuevo campo
        ]


    def get_participants(self, obj):
        return list(obj.participants.values_list('email', flat=True))

    def get_author_profile_picture(self, obj):
        if obj.author.profile_picture:
            return obj.author.profile_picture.url
        return None
    
    def get_comment_count(self, obj):  # ✅ Nuevo método
        return obj.comments.count()



class RecursiveField(serializers.Serializer):
    def to_representation(self, value):
        serializer = self.parent.parent.__class__(value, context=self.context)
        return serializer.data

class CommentSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source='author.username', read_only=True)
    author_profile_picture = serializers.SerializerMethodField()
    replies = RecursiveField(many=True, read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'evento', 'author', 'author_username', 'author_profile_picture', 'content', 'parent', 'replies', 'created_at']
        read_only_fields = ['author', 'created_at']

    def get_author_profile_picture(self, obj):
        request = self.context.get('request')
        if obj.author.profile_picture:
            if request:
                return request.build_absolute_uri(obj.author.profile_picture.url)
            return obj.author.profile_picture.url
        return None

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['author'] = request.user
        return super().create(validated_data)
    

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'

class CommentReportSerializer(serializers.ModelSerializer):
    comment = serializers.PrimaryKeyRelatedField(
        queryset=Comment.objects.all(),
        required=True
    )
    reporter = serializers.SerializerMethodField()
    reason_display = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()

    def get_reporter(self, obj):
        return obj.reporter.email if obj.reporter else None

    def get_reason_display(self, obj):
        return obj.get_reason_display()

    def get_status_display(self, obj):
        return obj.get_status_display()

    def validate_comment(self, value):
        if value is None:
            raise serializers.ValidationError("Debes seleccionar un comentario para reportar.")
        if not Comment.objects.filter(id=value.id).exists():
            raise serializers.ValidationError("El comentario no existe.")
        return value

    class Meta:
        model = CommentReport
        fields = ['id', 'comment', 'reporter', 'reason', 'reason_display', 'status', 'status_display', 'created_at']
        read_only_fields = ['status', 'created_at', 'reporter']