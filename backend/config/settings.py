import os
from pathlib import Path
from datetime import timedelta

from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parent.parent


load_dotenv(
    BASE_DIR / ".env"
)


SECRET_KEY = os.getenv(
    "SECRET_KEY"
)


DEBUG = os.getenv(
    "DEBUG",
    "True"
) == "True"


ALLOWED_HOSTS = [

    "127.0.0.1",

    "localhost",

    "https://alumni-networking-backend-gmk4.onrender.com/",

]


INSTALLED_APPS = [

    "django.contrib.admin",

    "django.contrib.auth",

    "django.contrib.contenttypes",

    "django.contrib.sessions",

    "django.contrib.messages",

    "django.contrib.staticfiles",

    "rest_framework",

    "corsheaders",

    "api",

]


MIDDLEWARE = [

    "django.middleware.security.SecurityMiddleware",

    "corsheaders.middleware.CorsMiddleware",

    "django.contrib.sessions.middleware.SessionMiddleware",

    "django.middleware.common.CommonMiddleware",

    "django.middleware.csrf.CsrfViewMiddleware",

    "django.contrib.auth.middleware.AuthenticationMiddleware",

    "django.contrib.messages.middleware.MessageMiddleware",

    "django.middleware.clickjacking.XFrameOptionsMiddleware",

]


ROOT_URLCONF = "config.urls"


TEMPLATES = [

    {

        "BACKEND":
            "django.template.backends.django.DjangoTemplates",

        "DIRS": [],

        "APP_DIRS": True,

        "OPTIONS": {

            "context_processors": [

                "django.template.context_processors.request",

                "django.contrib.auth.context_processors.auth",

                "django.contrib.messages.context_processors.messages",

            ],

        },

    },

]


WSGI_APPLICATION = "config.wsgi.application"


DATABASES = {

    "default": {

        "ENGINE":
            "django.db.backends.mysql",

        "NAME":
            os.getenv("DB_NAME"),

        "USER":
            os.getenv("DB_USER"),

        "PASSWORD":
            os.getenv("DB_PASSWORD"),

        "HOST":
            os.getenv("DB_HOST"),

        "PORT":
            os.getenv("DB_PORT"),

    }

}


AUTH_PASSWORD_VALIDATORS = []


LANGUAGE_CODE = "en-us"


TIME_ZONE = "Asia/Kolkata"


USE_I18N = True


USE_TZ = True


STATIC_URL = "static/"


STATIC_ROOT = BASE_DIR / "staticfiles"


MEDIA_URL = "/media/"


MEDIA_ROOT = BASE_DIR / "media"


DEFAULT_AUTO_FIELD = (
    "django.db.models.BigAutoField"
)


CORS_ALLOWED_ORIGINS = [

    "http://localhost:5173",

    "http://127.0.0.1:5173",

]


REST_FRAMEWORK = {

    "DEFAULT_AUTHENTICATION_CLASSES": [

        "rest_framework_simplejwt.authentication.JWTAuthentication",

    ],

}


SIMPLE_JWT = {

    "ACCESS_TOKEN_LIFETIME":
        timedelta(hours=1),

    "REFRESH_TOKEN_LIFETIME":
        timedelta(days=7),

}