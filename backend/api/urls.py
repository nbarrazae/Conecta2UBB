from django.urls import path
from .views import RegisterViewset, LoginViewset
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'register', RegisterViewset, basename='register')
router.register(r'login', LoginViewset, basename='login')


urlpatterns = router.urls
