from rest_framework import serializers
from .models import *
from django.contrib.auth import get_user_model
from django.utils.crypto import get_random_string
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
        fields = ('id', 'email', 'username') 
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

    # ✔ Acepta una lista vacía como []
    interest_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False,
        allow_empty=True
    )

    eventos_participados = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = [
            'id', 'email', 'username', 'birthday',
            'full_name', 'bio', 'profile_picture',
            'interests', 'interest_ids', 'eventos_participados'
        ]
        read_only_fields = ['id', 'email']

    def get_eventos_participados(self, obj):
        eventos = obj.eventos_participados.all()
        return EventoSimpleSerializer(eventos, many=True).data

    def update(self, instance, validated_data):
        request = self.context.get('request')
        raw_interest_ids = request.data.getlist('interest_ids') if request else []

    # Si solo llega un "0" como interés, vaciar intereses
        if raw_interest_ids == ["0"]:
            instance.interests.clear()
            validated_data.pop('interest_ids', None)  # 👈 evitar doble procesamiento
        elif 'interest_ids' in validated_data:
            interest_ids = validated_data.pop('interest_ids')
            instance.interests.set(interest_ids)

        return super().update(instance, validated_data)





class EventoSimpleSerializer(serializers.ModelSerializer):
    category = serializers.StringRelatedField()
    participants = serializers.SerializerMethodField()  # 👈 nuevo campo

    class Meta:
        model = Evento
        fields = [
            'id',
            'title',
            'category',
            'event_date',
            'location',
            'state',
            'max_participants',
            'participants',  # 👈 incluirlo en la salida
        ]

    def get_participants(self, obj):
        # Devuelve lista de correos de los inscritos
        return list(obj.participants.values_list('email', flat=True))
