
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
    ApplyForJobView,
    AdminApplicationStatsView,
    NotificationListView,
    NotificationMarkReadView,
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

    path(
        "jobs/<int:job_id>/apply/",
        ApplyForJobView.as_view(),
        name="apply-for-job"
    ),

    path(
        "jobs/application-stats/",
        AdminApplicationStatsView.as_view(),
        name="application-stats"
    ),

    path(
        "notifications/",
        NotificationListView.as_view(),
        name="notifications"
    ),

    path(
        "notifications/<int:pk>/read/",
        NotificationMarkReadView.as_view(),
        name="notification-mark-read"
    ),
]