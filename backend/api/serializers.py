from rest_framework import serializers
from .models import *
from django.contrib.auth import get_user_model
User = get_user_model()


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
