from rest_framework import serializers
from .models import *
from django.contrib.auth import get_user_model
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
        fields = ('id', 'email', 'password')  # no hace falta incluir username aquí
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        email = validated_data.get("email")
        validated_data["username"] = email.split("@")[0]  # genera el username automáticamente
        user = User.objects.create_user(**validated_data)
        return user 
