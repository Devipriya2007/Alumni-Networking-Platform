from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    ProfileViewSet,
    PostViewSet,
    JobViewSet,
    MentorshipViewSet,
    MessageViewSet,
    MyProfileView,
    AdminDashboardView,
    AdminUsersView,
)


router = DefaultRouter()

router.register(
    "profiles",
    ProfileViewSet
)

router.register(
    "posts",
    PostViewSet
)

router.register(
    "jobs",
    JobViewSet
)

router.register(
    "mentorships",
    MentorshipViewSet
)

router.register(
    "messages",
    MessageViewSet
)


urlpatterns = [
    path(
        "",
        include(router.urls)
    ),

    path(
        "my-profile/",
        MyProfileView.as_view(),
        name="my-profile"
    ),

    path(
        "admin-dashboard/",
        AdminDashboardView.as_view(),
        name="admin-dashboard"
    ),

    path(
        "admin-users/",
        AdminUsersView.as_view(),
        name="admin-users"
    ),
]