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

from rest_framework.decorators import action
from django.db.models import Q
from django.db import IntegrityError


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
            if not user.is_active:
                return Response(
                    {"message": "Tu cuenta ha sido suspendida por un moderador."},
                    status=403
                )
            # Actualiza el campo last_login
            user.last_login = timezone.now()
            user.save(update_fields=["last_login"])
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
    
    @action(detail=False, methods=['get'], url_path='buscar')
    def buscar_usuarios(self, request):
        search = request.query_params.get('search', '')
        queryset = CustomUser.objects.filter(
            Q(username__icontains=search) |
            Q(full_name__icontains=search) |
            Q(email__icontains=search)
        )
        serializer = ProfileSerializer(queryset, many=True)
        return Response(serializer.data)


#devolver el username del usuario autenticado
class UserDataViewset(viewsets.ViewSet):
    queryset = User.objects.all()
    serializer_class = ProfileSerializer  # ✅ Este incluye los intereses
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request, *args, **kwargs): 
        user = request.user
        serializer = self.serializer_class(user)
        return Response(serializer.data, status=200)
    
# --- FUNCIONALIDAD DE SEGUIR / DEJAR DE SEGUIR / VER FOLLOWERS ---

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def seguir_usuario(request, user_id):
    target_user = get_object_or_404(CustomUser, id=user_id)
    if target_user == request.user:
        return Response({'error': 'No puedes seguirte a ti mismo.'}, status=status.HTTP_400_BAD_REQUEST)
    if request.user.following.filter(id=target_user.id).exists():
        return Response({'error': 'Ya estás siguiendo a este usuario.'}, status=status.HTTP_400_BAD_REQUEST)
    
    request.user.following.add(target_user)
    Notification.objects.create(
        user=target_user,
        emisor=request.user,
        notification_type='seguimiento',
        message=f'{request.user.username} comenzó a seguirte',
        url=f'http://localhost:5173/perfil-publico/{request.user.username}/'
    )
    return Response({'status': f'Siguiendo a {target_user.username}.'}, status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def dejar_de_seguir_usuario(request, user_id):
    target_user = get_object_or_404(CustomUser, id=user_id)
    request.user.following.remove(target_user)
    return Response({'status': f'Dejaste de seguir a {target_user.username}.'}, status=200)

@api_view(['GET'])
def ver_seguidores(request, user_id):
    user = get_object_or_404(CustomUser, id=user_id)
    seguidores = user.followers.all()
    serializer = SimpleUserSerializer(seguidores, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['GET'])
def ver_seguidos(request, user_id):
    user = get_object_or_404(CustomUser, id=user_id)
    seguidos = user.following.all()
    serializer = SimpleUserSerializer(seguidos, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def esta_siguiendo(request, user_id):
    target_user = get_object_or_404(CustomUser, id=user_id)
    is_following = request.user.following.filter(id=target_user.id).exists()
    return Response({'esta_siguiendo': is_following})

# ---------------------------------------------------------------------------------
import uuid
from datetime import timedelta
from django.conf import settings
from minio import Minio
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

# Inicializar cliente MinIO
minio_client = Minio(
    settings.MINIO_ENDPOINT,
    access_key=settings.MINIO_ACCESS_KEY,
    secret_key=settings.MINIO_SECRET_KEY,
    secure=settings.MINIO_USE_SSL,
)

# Verificar que el bucket existe (lo crea si no existe)
found = minio_client.bucket_exists(settings.MINIO_BUCKET_NAME)
if not found:
    minio_client.make_bucket(settings.MINIO_BUCKET_NAME)
class EventoViewSet(viewsets.ModelViewSet):
    queryset = Evento.objects.all()
    serializer_class = EventoSerializer
    permission_classes = [IsAuthorOrReadOnly]
    filter_backends = [DjangoFilterBackend, OrderingFilter]  # 👈 Agrega OrderingFilter aquí
    filterset_class = EventoFilter
    ordering_fields = ['event_date']  # 👈 Campos que puedes ordenar (puedes agregar más si quieres)
    ordering = ['-event_date']  # 👈 Orden por defecto: eventos más recientes primero

    def perform_create(self, serializer):
        if not self.request.user.is_active:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Tu usuario está suspendido y no puede crear eventos.")

        evento = serializer.save(author=self.request.user)

        imagenes = self.request.FILES.getlist('imagenes')
        print(f"Se recibieron {len(imagenes)} imágenes")
        uploaded_urls = []

        for img in imagenes:
            print(f"Subiendo {img.name}...")
            try:
                file_extension = img.name.split('.')[-1]
                file_name = f"{uuid.uuid4()}.{file_extension}"

                minio_client.put_object(
                    settings.MINIO_BUCKET_NAME,
                    file_name,
                    img,
                    length=img.size,
                    content_type=img.content_type,
                )
                url = minio_client.presigned_get_object(
                    settings.MINIO_BUCKET_NAME,
                    file_name,
                    expires=timedelta(days=7)
                )
                uploaded_urls.append(url)
                print(f"Subida correcta: {url}")
            except Exception as e:
                print(f"Error subiendo imagen {img.name}: {e}")

        # Puedes guardar las URLs en un campo JSON del modelo Evento si lo tienes
        evento.imagenes_urls = uploaded_urls
        evento.save()

        # Registro actividad creación
        Actividad.objects.create(
            usuario=self.request.user,
            tipo="creacion",
            evento=evento
        )


    def create(self, request, *args, **kwargs):
        imagenes = request.FILES.getlist('imagenes')
        response = super().create(request, *args, **kwargs)
        print("hola2")

        print(f"Se recibieron {len(imagenes)} imágenes")

        if response.status_code == 201:
            uploaded_urls = []
            for img in imagenes:
                print(f"Subiendo {img.name}...")
                try:
                    file_extension = img.name.split('.')[-1]
                    file_name = f"{uuid.uuid4()}.{file_extension}"

                    minio_client.put_object(
                        settings.MINIO_BUCKET_NAME,
                        file_name,
                        img,
                        length=img.size,
                        content_type=img.content_type,
                    )
                    url = minio_client.presigned_get_object(
                        settings.MINIO_BUCKET_NAME,
                        file_name,
                        expires=timedelta(days=7)
                    )
                    uploaded_urls.append(url)
                    print(f"Subida correcta: {url}")
                except Exception as e:
                    print(f"Error subiendo imagen {img.name}: {e}")

            response.data['uploaded_images_urls'] = uploaded_urls

            # Registro actividad creación
            try:
                evento_id = response.data.get("id")
                evento = Evento.objects.get(id=evento_id)
                Actividad.objects.create(
                    usuario=request.user,
                    tipo="creacion",
                    evento=evento
                )
            except Exception:
                pass

        return response



    def perform_update(self, serializer):
        # Obtener el objeto antes de las modificaciones
        original_instance = self.get_object()
        
        # Campos importantes que justifican una notificación
        important_fields = ['title', 'description', 'event_date', 'location', 'max_participants', 'category']
        
        # Verificar si hubo cambios en campos importantes
        has_important_changes = False
        for field in important_fields:
            old_value = getattr(original_instance, field, None)
            new_value = serializer.validated_data.get(field, old_value)
            
            # Comparar valores (considerando diferentes tipos de datos)
            if field == 'category' and old_value and new_value:
                # Para campos relacionados, comparar IDs
                if hasattr(old_value, 'id') and hasattr(new_value, 'id'):
                    if old_value.id != new_value.id:
                        has_important_changes = True
                        break
                elif old_value != new_value:
                    has_important_changes = True
                    break
            elif old_value != new_value:
                has_important_changes = True
                break
        
        # Guardar los cambios
        instance = serializer.save()
        
        # Solo notificar si hubo cambios importantes
        if has_important_changes:
            participantes = instance.participants.exclude(id=self.request.user.id)
            for user in participantes:
                Notification.objects.create(
                    user=user,
                    notification_type='evento',
                    message=f'El evento "{instance.title}" ha sido modificado.',
                    url=f'http://localhost:5173/ver-evento/{instance.id}' 
                )

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def inscribirse(self, request, pk=None):
        if not request.user.is_active:
            return Response({"error": "Tu usuario está suspendido y no puede inscribirse a eventos."}, status=status.HTTP_403_FORBIDDEN)
        evento = self.get_object()

        if evento.state != 'activa':
            return Response({"error": "Este evento no está activo."}, status=status.HTTP_400_BAD_REQUEST)

        if evento.participants.filter(id=request.user.id).exists():
            return Response({"error": "Ya estás inscrito en este evento."}, status=status.HTTP_400_BAD_REQUEST)

        if evento.participants.count() >= evento.max_participants:
            return Response({"error": "No hay cupos disponibles para este evento."}, status=status.HTTP_400_BAD_REQUEST)

        evento.participants.add(request.user)

        # 🔽 Registrar actividad reciente
        Actividad.objects.create(
            usuario=request.user,
            tipo='inscripcion',
            evento=evento
        )

        return Response({"message": "Inscripción exitosa."}, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def inscritos(self, request, pk=None):
        evento = self.get_object()
        inscritos = evento.participants.all()

        data = [
            {
                "id": usuario.id,
                "full_name": usuario.full_name,
                "username": usuario.username,
                "email": usuario.email,
                "profile_picture": request.build_absolute_uri(usuario.profile_picture.url)
                if usuario.profile_picture else None
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
    
    def get_queryset(self):
        queryset = Evento.objects.all()
        user = self.request.user

        siguiendo = self.request.query_params.get("siguiendo")

        if siguiendo and siguiendo.lower() == "true" and user.is_authenticated:
            seguidos = user.following.all()
            queryset = queryset.filter(author__in=seguidos)

        return queryset

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)

    # Después de guardar el evento con éxito, registramos la actividad
        if response.status_code == 201:
            evento_id = response.data.get("id")
            try:
                evento = Evento.objects.get(id=evento_id)
                Actividad.objects.create(
                    usuario=request.user,
                    tipo="creacion",
                    evento=evento
                )
            except Evento.DoesNotExist:
                pass  # Silencioso: no rompemos nada si falla

        return response


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
        evento = serializer.validated_data.get('event')
        usuario = self.request.user
        if evento.author == usuario:
            raise serializers.ValidationError("No puedes reportar tu propio evento.")
        serializer.save(reporter=usuario)

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
        motivo = report.get_reason_display()
        autor = report.event.author if report.event else None
        if autor:
            Notification.objects.create(
                user=autor,
                notification_type='evento',
                message=f'Tu evento "{report.event.title}" fue eliminado por moderación. Motivo: {motivo}',
                url=f'http://localhost:5173/home'
            )
        if report.event:
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


class UsuarioPorUsernameView(APIView):
    def get(self, request, username):
        user = get_object_or_404(User, username=username)
        serializer = ProfileSerializer(user)
        return Response(serializer.data)


class CommentPagination(pagination.PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    pagination_class = CommentPagination

    def get_queryset(self):
        evento_id = self.request.query_params.get('evento')
        if self.action == 'list' and evento_id:
            # Solo retornar comentarios raíz para evitar duplicados en la lista
            return Comment.objects.filter(evento_id=evento_id, parent__isnull=True).order_by('-created_at')
        # Para retrieve (detalle), permite buscar por ID
        return Comment.objects.all()

    def perform_create(self, serializer):
        if not self.request.user.is_active:
            raise PermissionDenied("Tu usuario está suspendido y no puede comentar.")
        instance = serializer.save()
        
        # Notificar al autor del comentario padre si es una respuesta
        if instance.parent:
            parent_user = instance.parent.author
            if parent_user != self.request.user:
                # Truncar la respuesta si es muy larga
                reply_preview = instance.content[:40] + "..." if len(instance.content) > 40 else instance.content
                Notification.objects.create(
                    user=parent_user,
                    notification_type='comentario',
                    message=f'{self.request.user.username} te respondió: "{reply_preview}"',
                    url=f'http://localhost:5173/ver-evento/{instance.evento.id}'
                )
        
        # Notificar al creador del evento cuando alguien comenta (solo si es comentario raíz)
        if not instance.parent and instance.evento:
            event_author = instance.evento.author
            if event_author != self.request.user:
                # Truncar el comentario si es muy largo
                comment_preview = instance.content[:50] + "..." if len(instance.content) > 50 else instance.content
                Notification.objects.create(
                    user=event_author,
                    notification_type='comentario',
                    message=f'{self.request.user.username} comentó en tu evento "{instance.evento.title}": "{comment_preview}"',
                    url=f'http://localhost:5173/ver-evento/{instance.evento.id}'
                )



class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context

    @action(detail=False, methods=['post'])
    def mark_as_read(self, request):
        ids = request.data.get('ids', [])
        Notification.objects.filter(id__in=ids, user=request.user).update(is_read=True)
        return Response({'status': 'marked as read'})

    @action(detail=False, methods=['patch'])
    def mark_all_as_read(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({'status': 'all marked as read'})
    


class CommentReportViewSet(viewsets.ModelViewSet):
    queryset = CommentReport.objects.all()
    serializer_class = CommentReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        comentario = serializer.validated_data.get('comment')
        usuario = self.request.user
        if comentario and comentario.author == usuario:
            raise serializers.ValidationError("No puedes reportar tu propio comentario.")
        serializer.save(reporter=usuario)

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.is_superuser:
            return CommentReport.objects.all()
        return CommentReport.objects.filter(reporter=user)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def accept(self, request, pk=None):
        report = self.get_object()
        report.status = 'accepted'
        report.save()
        motivo = report.get_reason_display()
        autor = report.comment.author if report.comment else None
        if autor and report.comment:
            Notification.objects.create(
                user=autor,
                notification_type='comentario',
                message=(
                    f'Tu comentario "{report.comment.content}" fue eliminado por moderación. '
                    f'Motivo: {motivo}'
                ),
                url=f'http://localhost:5173/ver-evento/{report.comment.evento.id}' if report.comment.evento else ''
            )
        if report.comment:
            report.comment.delete()
        return Response({'message': 'Reporte aceptado y comentario eliminado.'}, status=200)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def reject(self, request, pk=None):
        report = self.get_object()
        report.status = 'rejected'
        report.save()
        return Response({'message': 'Reporte rechazado.'}, status=200)

class UserAdminViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAdminUser]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token = ResetPasswordToken.objects.create(user=user)
        send_welcome_email(user, token)
        return Response(self.get_serializer(user).data, status=201)

    def partial_update(self, request, pk=None):
        user = self.get_object()
        serializer = self.get_serializer(user, data=request.data, partial=True, context={'request': request})
        try:
            serializer.is_valid(raise_exception=True)
            serializer.save()
        except IntegrityError as e:
            error_str = str(e).lower()
            # Busca por 'unique' o 'llave duplicada' y 'email' o el nombre de la restricción
            if (
                ('unique' in error_str or 'llave duplicada' in error_str)
                and ('email' in error_str or 'correo' in error_str or 'api_customuser_email_key' in error_str)
            ):
                return Response({'error': 'El correo ya existe.'}, status=400)
            return Response({'error': 'Error de integridad.'}, status=400)
        return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def actividad_reciente(request):
    seguidos = request.user.following.all()
    actividades = Actividad.objects.filter(usuario__in=seguidos).order_by('-fecha')[:50]
    serializer = ActividadSerializer(actividades, many=True)
    return Response(serializer.data)



class FileUploadView(APIView):
    def post(self, request, *args, **kwargs):
        files = request.FILES.getlist("files")  # Obtener lista de archivos

        if not files:
            return Response({"error": "No files uploaded."}, status=status.HTTP_400_BAD_REQUEST)

        uploaded_files = []

        for file_obj in files:
            try:
                file_extension = file_obj.name.split('.')[-1]
                file_name = f"{uuid.uuid4()}.{file_extension}"

                minio_client.put_object(
                    settings.MINIO_BUCKET_NAME,
                    file_name,
                    file_obj.file,
                    length=file_obj.size,
                    content_type=file_obj.content_type,
                )

                url = minio_client.presigned_get_object(
                    settings.MINIO_BUCKET_NAME,
                    file_name,
                    expires=timedelta(days=7)
                )

                uploaded_files.append({"file_name": file_name, "url": url})

            except Exception as e:
                # Puedes decidir si abortar todo o solo reportar error en ese archivo
                return Response({"error": f"Error uploading {file_obj.name}: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({"uploaded_files": uploaded_files}, status=status.HTTP_201_CREATED)
