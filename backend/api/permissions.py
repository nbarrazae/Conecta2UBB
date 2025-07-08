from rest_framework import permissions

class IsAuthorOrReadOnly(permissions.BasePermission):
    """
    Permite que solo el autor o un staff/superuser pueda editar/eliminar.
    """
    def has_object_permission(self, request, view, obj):
        # SAFE_METHODS: GET, HEAD, OPTIONS
        if request.method in permissions.SAFE_METHODS:
            return True
        # Permitir si es staff o superuser
        if request.user.is_staff or request.user.is_superuser:
            return True
        # Permitir si es el autor
        return obj.author == request.user