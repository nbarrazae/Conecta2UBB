from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from .serializers import *
from .models import *
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model, authenticate
from knox.models import AuthToken

from .event_serializer import EventoSerializer, CategorySerializer, EventReportSerializer
from .permissions import IsAuthorOrReadOnly

from django_filters.rest_framework import DjangoFilterBackend
from .filters import EventoFilter  #

from django_rest_passwordreset.models import ResetPasswordToken
from django_rest_passwordreset.signals import reset_password_token_created
from utils.email_utils import send_welcome_email


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
            _, token = AuthToken.objects.create(user)
            user_data = {
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "is_staff": user.is_staff,
                "is_superuser": user.is_superuser,
            }
            return Response({
                "user": user_data,
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

        # Generar token de recuperación de contraseña
        token = ResetPasswordToken.objects.create(user=user)

        # Enviar correo de bienvenida personalizado
        send_welcome_email(user, token)

        return Response({
            "user": RegisterSerializer(user).data,
            "message": "Usuario creado. Revisa tu correo para establecer tu contraseña."
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
    permission_classes = [IsAuthorOrReadOnly]
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

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({"message": "Evento eliminado correctamente."}, status=status.HTTP_200_OK)

class MisInscripcionesViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        eventos = request.user.eventos_participados.all()
        serializer = EventoSerializer(eventos, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

from rest_framework import viewsets
from .models import Category
from .event_serializer import CategorySerializer

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class EventReportViewSet(viewsets.ModelViewSet):
    queryset = EventReport.objects.all()
    serializer_class = EventReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(reporter=self.request.user)

    def get_queryset(self):
        user = self.request.user
        # solo los moderadores pueden ver todos los reportes
        if user.is_staff or user.is_superuser:
            return EventReport.objects.all()
        # los usuarios solo ven sus propios reportes
        return EventReport.objects.filter(reporter=user)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def accept(self, request, pk=None):
        report = self.get_object()
        report.status = 'accepted'
        report.save()
        report.event.delete()
        return Response({'message': 'Reporte aceptado y evento eliminado.'}, status=200)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def reject(self, request, pk=None):
        report = self.get_object()
        report.status = 'rejected'
        report.save()
        return Response({'message': 'Reporte rechazado.'}, status=200)
