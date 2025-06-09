from django.urls import path
from .views import RegisterViewset, LoginViewset, UserViewset
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'register', RegisterViewset, basename='register')
router.register(r'login', LoginViewset, basename='login')
router.register(r'users', UserViewset, basename='users')


urlpatterns = router.urls
