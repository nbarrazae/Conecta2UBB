from django.shortcuts import render
from rest_framework import viewsets, permissions, status, generics,pagination,filters
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
from rest_framework.filters import OrderingFilter 

from django_rest_passwordreset.models import ResetPasswordToken
from django_rest_passwordreset.signals import reset_password_token_created
from utils.email_utils import send_welcome_email

from django.shortcuts import get_object_or_404
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from rest_framework import viewsets, permissions
from .models import Comment
from .serializers import CommentSerializer

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from django.utils import timezone

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
    
    def retrieve(self, request, pk=None):  # 👈 nuevo método
        user = get_object_or_404(CustomUser, pk=pk)
        serializer = ProfileSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def ver_perfil(self, request):
        user = request.user
        serializer = ProfileSerializer(user)
        return Response(serializer.data)

    @action(detail=False, methods=['put'], parser_classes=[MultiPartParser, FormParser, JSONParser])
    def editar_perfil(self, request):
        user = request.user

        data = request.data.copy()
        ids = data.getlist('interest_ids') if hasattr(data, 'getlist') else data.get('interest_ids')

        if ids == ["0"] or ids == []:
            user.interests.clear()
            data.pop("interest_ids", None)

        serializer = ProfileSerializer(user, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Perfil actualizado correctamente"})
        return Response(serializer.errors, status=400)
    
    @action(detail=False, methods=['get'], url_path='username/(?P<username>[^/.]+)')
    def perfil_por_username(self, request, username=None):
        user = get_object_or_404(CustomUser, username=username)
        serializer = ProfileSerializer(user)
        return Response(serializer.data)

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
    filter_backends = [DjangoFilterBackend, OrderingFilter]  # 👈 Agrega OrderingFilter aquí
    filterset_class = EventoFilter
    ordering_fields = ['event_date']  # 👈 Campos que puedes ordenar (puedes agregar más si quieres)
    ordering = ['-event_date']  # 👈 Orden por defecto: eventos más recientes primero

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def perform_update(self, serializer):
        instance = serializer.save()
        participantes = instance.participants.all()
        for user in participantes:
            Notification.objects.create(
                user=user,
                notification_type='evento',
                message=f'El evento "{instance.title}" ha sido modificado.',
                url=f'http://localhost:3000/ver-evento/{instance.id}'
            )

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

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def desinscribirse(self, request, pk=None):
        evento = self.get_object()
        usuario = request.user

        if usuario not in evento.participants.all():
            return Response({"error": "No estás inscrito en este evento."}, status=status.HTTP_400_BAD_REQUEST)

        evento.participants.remove(usuario)
        return Response({"message": "Te has desinscrito del evento."}, status=status.HTTP_200_OK)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})  # 👈 necesario para obtener la URL completa de imagen
        return context

    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def upcoming(self, request):
        user = request.user
        now = timezone.now()
        eventos = Evento.objects.filter(
            participants=user,
            state='activa',
            event_date__gte=now
        ).order_by('event_date')

        data = [{
            'id': e.id,
            'titulo': e.title,
            #transformar la fecha a un formato legible
            'fecha_limite': e.event_date.strftime('%Y-%m-%d %H:%M:%S'),
        } for e in eventos]

        return Response(data)


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
        print("DATA ENVIADA AL SERIALIZER:", serializer.validated_data)
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

class VerPerfilDeOtroUsuarioView(generics.RetrieveAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'  # También podrías usar 'username' si prefieres




class CommentPagination(pagination.PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    pagination_class = CommentPagination

    def get_queryset(self):
        evento_id = self.request.query_params.get('evento')
        if evento_id:
            # Solo retornar comentarios raíz para evitar duplicados
            return Comment.objects.filter(evento_id=evento_id, parent__isnull=True).order_by('-created_at')
        return Comment.objects.none()

    def perform_create(self, serializer):
        instance = serializer.save()
        if instance.parent:
            parent_user = instance.parent.author
            if parent_user != self.request.user:
                Notification.objects.create(
                    user=parent_user,
                    notification_type='comentario',
                    message=f'Te han respondido en un comentario.',
                    url=f'http://localhost:5173/ver-evento/{instance.evento.id}'
                )



class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')

    @action(detail=False, methods=['post'])
    def mark_as_read(self, request):
        ids = request.data.get('ids', [])
        Notification.objects.filter(id__in=ids, user=request.user).update(is_read=True)
        return Response({'status': 'marked as read'})

    @action(detail=False, methods=['patch'])
    def mark_all_as_read(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({'status': 'all marked as read'})

    
    

