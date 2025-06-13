from django.shortcuts import render
from rest_framework import viewsets, permissions
from .serializers import *
from .models import *
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import get_user_model, authenticate
from knox.models import AuthToken

User = get_user_model()

# Create your views here.

class LoginViewset(viewsets.ViewSet):
    queryset = User.objects.all()
    serializer_class = LoginSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        user = authenticate(request, email=email, password=password)
        
        if user:
            _ , token = AuthToken.objects.create(user)
            return Response({
                "user": self.serializer_class(user).data,
                "token": token,
                "message": "Login successful"
            }, status=200)
        else:
            return Response({
                "message": "Invalid credentials"
            }, status=400)



class RegisterViewset(viewsets.ViewSet):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs): 
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()    
        return Response({
            "user": RegisterSerializer(user).data,
            "message": "User created successfully"
        }, status=201)


class UserViewset(viewsets.ViewSet):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request, *args, **kwargs): 
        queryset = User.objects.all()
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data, status=200)

#devolver el username del usuario autenticado
class UserDataViewset(viewsets.ViewSet):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request, *args, **kwargs): 
        user = request.user
        serializer = self.serializer_class(user)
        return Response(serializer.data, status=200)
    
