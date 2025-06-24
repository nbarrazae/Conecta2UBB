# utils/email_utils.py
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags

def send_welcome_email(user, token):
    full_link = f"http://localhost:5173/password-reset/{token.key}"
    context = {
        'full_link': full_link,
        'email_address': user.email
    }
    html_message = render_to_string("backend/welcome_email.html", context)
    plain_message = strip_tags(html_message)

    msg = EmailMultiAlternatives(
        subject="Bienvenido a la plataforma",
        body=plain_message,
        from_email="sender@example.com",
        to=[user.email]
    )
    msg.attach_alternative(html_message, "text/html")
    msg.send()
