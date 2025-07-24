from django.urls import path, re_path
from .views import RegisterViewset, LoginViewset, UserViewset, UserDataViewset, MisInscripcionesViewSet
from rest_framework.routers import DefaultRouter
from .views import EventoViewSet, CategoryViewSet, EventReportViewSet, NotificationViewSet,CommentViewSet, CommentReportViewSet, UsuarioPorUsernameView, UserAdminViewSet, FileUploadView
from .views import (
    seguir_usuario,
    dejar_de_seguir_usuario,
    ver_seguidores,
    ver_seguidos,
    esta_siguiendo,
    actividad_reciente
)

router = DefaultRouter()
router.register(r'register', RegisterViewset, basename='register')
router.register(r'login', LoginViewset, basename='login')
router.register(r'users', UserViewset, basename='users')
router.register(r'user_data', UserDataViewset, basename='user_data')
router.register(r'eventos', EventoViewSet, basename='evento')
router.register(r'mis_inscripciones', MisInscripcionesViewSet, basename='mis_inscripciones')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'event-reports', EventReportViewSet, basename='eventreport')
router.register(r'comments', CommentViewSet, basename='comments')
router.register(r'notifications', NotificationViewSet, basename='notifications')
router.register(r'comment-reports', CommentReportViewSet, basename='comment-report')
router.register(r'user-admin', UserAdminViewSet, basename='user-admin')

urlpatterns = router.urls + [
    re_path(r'^buscar-usuario/(?P<username>[\w.@+-]+)/$', UsuarioPorUsernameView.as_view()),
     # 🔽 Endpoints de seguimiento
    path('seguir/<int:user_id>/', seguir_usuario, name='seguir-usuario'),
    path('dejar_de_seguir/<int:user_id>/', dejar_de_seguir_usuario, name='dejar-de-seguir-usuario'),
    path('seguidores/<int:user_id>/', ver_seguidores, name='ver-seguidores'),
    path('seguidos/<int:user_id>/', ver_seguidos, name='ver-seguidos'),
    path('esta_siguiendo/<int:user_id>/', esta_siguiendo, name='esta-siguiendo'),
    path('actividad_reciente/', actividad_reciente, name='actividad-reciente'),
    path('upload/', FileUploadView.as_view(), name='file-upload'),]

