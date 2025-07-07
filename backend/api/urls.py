from django.urls import path
from .views import RegisterViewset, LoginViewset, UserViewset, UserDataViewset, MisInscripcionesViewSet
from rest_framework.routers import DefaultRouter
from .views import EventoViewSet, CategoryViewSet, EventReportViewSet
from .views import CommentViewSet

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

urlpatterns = router.urls