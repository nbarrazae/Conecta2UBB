from rest_framework import permissions

class IsAuthorOrReadOnly(permissions.BasePermission):
    """
    Permiso personalizado para que sólo los autores de un evento puedan editarlo o eliminarlo.
    """

    def has_object_permission(self, request, view, obj):
        # se permiten permisos de lectura a cualquier petición,
        # por lo que siempre permitiremos peticiones GET, HEAD u OPTIONS.
        if request.method in permissions.SAFE_METHODS:
            return True

        # permisos de escritura sólo están permitidos al autor del evento.
        return obj.author == request.user