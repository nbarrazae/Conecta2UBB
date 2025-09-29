# Conecta2UBB
Este proyecto ha sido clonado desde [Proyecto_GPS](https://github.com/VictorHM23/Proyecto_GPS).
Proyecto realizado para aprobar la asignatura Gestión de proyectos de software.

## Resumen del Proyecto

Conecta2UBB es una plataforma pensada para mejorar la gestión académica y apoyar la convivencia estudiantil en la Universidad del Bío-Bío. Permite a estudiantes, académicos y administración coordinar actividades, reportar incidencias, llevar seguimiento de eventos, evaluar la convivencia, etc.

## Características principales

Algunas de las funcionalidades que incluye la plataforma:

* Registro, inicio de sesión, recuperación de cuenta para distintos roles (estudiantes, profesores, administración).

* Creación, visualización y gestión de actividades académicas.

* Sistema de reportes/incidencias de convivencia estudiantil.

* Calendario de eventos y notificaciones.

* Panel administrativo para supervisar y moderar actividades y reportes.

## Tecnologías

Backend: Django Rest Framework 

Frontend: NodeJS y React

Base de datos: PostgreSQL

## Requisitos

Python >= 3.10

Node.js y npm 

## Installation

```bash
git clone https://github.com/nbarrazae/Conecta2UBB.git
cd Conecta2UBB
cd backend
python3 -m venv venv
source venv/bin/activate    # o venv\Scripts\activate en Windows
pip install -r requirements.txt
python manage.py migrate   # modificar .env
cd ../frontend
npm install   # o yarn install
npm run dev   # o npm start, preview
```



## ⚙️ Estructura del Código

El proyecto se organiza en directorios clave:

```bash
Conecta2UBB/
├── api/
├   ├── migrationes/
├   ├── views/
├   ├── serializers/      
├   ├── urls/
├   ├── models/
├   └── ...
├── backend/
│   ├── .env_copy/
│   ├── settings/
│   ├── urls/routers
├   └── ...
├── frontend/
├   ├── public/
├   └── ...
│   ├── src/
│       └── components/
│       ├── views/
│       ├── assets/
│       └── ...
├── .gitignore
├── README.md
└── ...

```



## Autores

* Nicolás Barraza

* Sebastián Araneda

* Vicente Sanhueza

* Víctor Herrera
