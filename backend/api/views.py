from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from .serializers import *
from .models import *
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model, authenticate
from knox.models import AuthToken
from .event_serializer import EventoSerializer

from django_filters.rest_framework import DjangoFilterBackend
from .filters import EventoFilter  #

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

class EventoViewSet(viewsets.ModelViewSet):
    queryset = Evento.objects.all()
    serializer_class = EventoSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_class = EventoFilter

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def inscribirse(self, request, pk=None):
        evento = self.get_object()

        if evento.state != 'activa':
            return Response({"error": "Este evento no está activo."}, status=status.HTTP_400_BAD_REQUEST)

        if evento.participants.filter(id=request.user.id).exists():
            return Response({"error": "Ya estás inscrito en este evento."}, status=status.HTTP_400_BAD_REQUEST)

        if evento.participants.count() >= evento.max_participants:
            return Response({"error": "No hay cupos disponibles para este evento."}, status=status.HTTP_400_BAD_REQUEST)

        evento.participants.add(request.user)
        return Response({"message": "Inscripción exitosa."}, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def inscritos(self, request, pk=None):
        evento = self.get_object()
        inscritos = evento.participants.all()
        data = [
            {
                "id": usuario.id,
                "username": usuario.username,
                "email": usuario.email
            }
            for usuario in inscritos
        ]
        return Response(data, status=status.HTTP_200_OK)

class MisInscripcionesViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        eventos = request.user.eventos_participados.all()
        serializer = EventoSerializer(eventos, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
