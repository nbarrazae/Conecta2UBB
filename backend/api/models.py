from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.base_user import BaseUserManager

from django.core.mail import EmailMultiAlternatives
from django.dispatch import receiver
from django.template.loader import render_to_string
from django.urls import reverse
from django_rest_passwordreset.signals import reset_password_token_created
from django.utils.html import strip_tags
from django.contrib.auth import get_user_model
# Create your models here.
class CustomUserManager(BaseUserManager): 
    def create_user(self, email, password=None, **extra_fields ): 
        if not email:   
            raise ValueError('Email is a required field')
        
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self,email, password=None, **extra_fields): 
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)
    
class CustomUser(AbstractUser):
    
    email = models.EmailField(max_length=200, unique=True)
    birthday = models.DateField(null=True, blank=True)
    username = models.CharField(max_length=200, null=True, blank=True, unique=True)

    # Nuevos campos para el perfil (no obligatorios)
    full_name = models.CharField(max_length=100, blank=True)
    bio = models.TextField(blank=True)
    profile_picture = models.ImageField(upload_to='profiles/', null=True, blank=True)
    
    interests = models.ManyToManyField('Category', blank=True, related_name='interested_users')

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []


@receiver(reset_password_token_created)
def password_reset_token_created(reset_password_token, *args, **kwargs):
    sitelink = "http://localhost:5173/"
    token = "{}".format(reset_password_token.key)
    full_link = str(sitelink)+str("password-reset/")+str(token)

    print(token)
    print(full_link)

    context = {
        'full_link': full_link,
        'email_adress': reset_password_token.user.email
    }

    html_message = render_to_string("backend/email.html", context=context)
    plain_message = strip_tags(html_message)

    msg = EmailMultiAlternatives(
        subject = "Request for resetting password for {title}".format(title=reset_password_token.user.email), 
        body=plain_message,
        from_email = "sender@example.com", 
        to=[reset_password_token.user.email]
    )

    msg.attach_alternative(html_message, "text/html")
    msg.send()

class Category(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Evento(models.Model):
    STATE_CHOICES = [
        ('activa', 'Activa'),
        ('finalizada', 'Finalizada'),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField()
    # images = models.ImageField(
    #     upload_to='event_images/',
    #     blank=True,
    #     null=True
    # )
    createdAt = models.DateTimeField(auto_now_add=True)
    event_date = models.DateTimeField("Event date and time")
    location = models.CharField("Event location", max_length=255)
    state = models.CharField(max_length=15, choices=STATE_CHOICES, default='activa')

    author = models.ForeignKey(
        'CustomUser',
        on_delete=models.CASCADE,
        related_name='eventos_creados'
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        related_name='eventos'
    )
    participants = models.ManyToManyField(
        'CustomUser',
        related_name='eventos_participados',
        blank=True
    )
    max_participants = models.PositiveIntegerField(default=10)

    def __str__(self):
        return self.title

class EventReport(models.Model):
    REASON_CHOICES = [
        ('offensive', 'Contenido ofensivo o lenguaje inapropiado'),
        ('discriminatory', 'Contenido discriminatorio (sexo, raza, religión, política, etc.)'),
        ('spam', 'Spam o publicidad no autorizada'),
        ('unrelated', 'Contenido no relacionado con la actividad'),
        ('false', 'Información falsa o engañosa'),
        ('violence', 'Incitación a la violencia o actividades ilegales'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('accepted', 'Aceptado'),
        ('rejected', 'Rechazado'),
    ]

    event = models.ForeignKey(Evento, on_delete=models.SET_NULL, null=True, related_name='reports')
    reporter = models.ForeignKey('CustomUser', on_delete=models.CASCADE)
    reason = models.CharField(max_length=30, choices=REASON_CHOICES)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Reporte de {self.event.title} por {self.reporter.email} ({self.get_reason_display()})"
    

class Comment(models.Model):
    evento = models.ForeignKey(Evento, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    content = models.TextField()
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='replies')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.author.email} on {self.evento.title}"
    
User = get_user_model()

class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ('evento', 'Evento'),
        ('comentario', 'Comentario'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    message = models.CharField(max_length=255)
    url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f'{self.notification_type} - {self.message} - {self.user}'

class CommentReport(models.Model):
    REASON_CHOICES = [
        ('offensive', 'Contenido ofensivo o lenguaje inapropiado'),
        ('discriminatory', 'Contenido discriminatorio (sexo, raza, religión, política, etc.)'),
        ('spam', 'Spam o publicidad no autorizada'),
        ('unrelated', 'Contenido no relacionado con la actividad'),
        ('false', 'Información falsa o engañosa'),
        ('violence', 'Incitación a la violencia o actividades ilegales'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('accepted', 'Aceptado'),
        ('rejected', 'Rechazado'),
    ]

    comment = models.ForeignKey('Comment', on_delete=models.SET_NULL, null=True, related_name='reports')
    reporter = models.ForeignKey('CustomUser', on_delete=models.CASCADE)
    reason = models.CharField(max_length=30, choices=REASON_CHOICES)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Reporte de comentario {self.comment.id if self.comment else 'eliminado'} por {self.reporter.email} ({self.get_reason_display()})"