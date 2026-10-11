
from django.db.models import Count

from rest_framework import viewsets, status, generics, permissions
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    Profile,
    Post,
    Job,
    JobApplication,
    Mentorship,
    Message,
    Notification
)

from .serializers import (
    ProfileSerializer,
    PostSerializer,
    JobSerializer,
    MentorshipSerializer,
    MessageSerializer,
    NotificationSerializer
)

from .services import check_and_convert_student


class ProfileViewSet(viewsets.ModelViewSet):

    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [AllowAny]

    def retrieve(self, request, *args, **kwargs):

        profile = self.get_object()

        check_and_convert_student(profile)

        return super().retrieve(
            request,
            *args,
            **kwargs
        )


class PostViewSet(viewsets.ModelViewSet):

    queryset = Post.objects.all().order_by("-created_at")
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):

        serializer.save(user=self.request.user)


class JobViewSet(viewsets.ModelViewSet):

    queryset = Job.objects.all().order_by("-created_at")
    serializer_class = JobSerializer
    permission_classes = [AllowAny]


class ApplyForJobView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, job_id):

        try:
            profile = Profile.objects.get(user=request.user)

        except Profile.DoesNotExist:
            return Response(
                {"message": "Profile not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        if profile.role != "student":
            return Response(
                {"message": "Only students can apply for jobs."},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            job = Job.objects.get(id=job_id)

        except Job.DoesNotExist:
            return Response(
                {"message": "Job not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        application, created = JobApplication.objects.get_or_create(
            job=job,
            student=profile
        )

        if not created:
            return Response(
                {"message": "You have already applied for this job."},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            {"message": "Application submitted successfully."},
            status=status.HTTP_201_CREATED
        )


class AdminApplicationStatsView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        try:
            profile = Profile.objects.get(user=request.user)

        except Profile.DoesNotExist:
            return Response(
                {"error": "Profile not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        if profile.role != "admin":
            return Response(
                {"error": "Admin access required."},
                status=status.HTTP_403_FORBIDDEN
            )

        jobs = Job.objects.annotate(
            application_count=Count("applications")
        ).order_by("-created_at")

        job_data = []

        for job in jobs:
            job_data.append({
                "id": job.id,
                "title": job.title,
                "company": job.company,
                "application_count": job.application_count,
            })

        return Response({
            "total_applications": JobApplication.objects.count(),
            "jobs": job_data,
        })


class MentorshipViewSet(viewsets.ModelViewSet):

    queryset = Mentorship.objects.all()
    serializer_class = MentorshipSerializer
    permission_classes = [IsAuthenticated]


class MessageViewSet(viewsets.ModelViewSet):

    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):

        sender_profile = Profile.objects.get(
            user=self.request.user
        )

        message = serializer.save(
            sender=sender_profile
        )

        if message.receiver != sender_profile:
            Notification.objects.create(
                recipient=message.receiver,
                title=f"New message from {sender_profile.full_name}",
                message=message.content[:200]
            )


class MyProfileView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        try:
            profile = Profile.objects.get(user=request.user)

            check_and_convert_student(profile)

            serializer = ProfileSerializer(profile)
            data = serializer.data
            data["email"] = request.user.email

            return Response(data)

        except Profile.DoesNotExist:
            return Response(
                {"error": "Profile not found."},
                status=status.HTTP_404_NOT_FOUND
            )

    def put(self, request):

        try:
            profile = Profile.objects.get(user=request.user)

            serializer = ProfileSerializer(
                profile,
                data=request.data,
                partial=True
            )

            if serializer.is_valid():
                serializer.save()

                data = serializer.data
                data["email"] = request.user.email

                return Response(data)

            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        except Profile.DoesNotExist:
            return Response(
                {"error": "Profile not found."},
                status=status.HTTP_404_NOT_FOUND
            )


class AdminDashboardView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        try:
            admin_profile = Profile.objects.get(user=request.user)

        except Profile.DoesNotExist:
            return Response(
                {"error": "Profile not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        if admin_profile.role != "admin":
            return Response(
                {"error": "Admin access required."},
                status=status.HTTP_403_FORBIDDEN
            )

        profiles = Profile.objects.all()

        students = profiles.filter(role="student")
        alumni = profiles.filter(role="alumni")
        admins = profiles.filter(role="admin")

        posts = Post.objects.all()
        jobs = Job.objects.all()
        mentorships = Mentorship.objects.all()
        messages = Message.objects.all()

        return Response({
            "total_users": profiles.count(),
            "total_students": students.count(),
            "total_alumni": alumni.count(),
            "total_admins": admins.count(),
            "total_posts": posts.count(),
            "total_jobs": jobs.count(),
            "total_mentorships": mentorships.count(),
            "total_messages": messages.count(),
            "total_applications": JobApplication.objects.count(),
        })


class AdminUsersView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        try:
            admin_profile = Profile.objects.get(user=request.user)

        except Profile.DoesNotExist:
            return Response(
                {"error": "Profile not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        if admin_profile.role != "admin":
            return Response(
                {"error": "Admin access required."},
                status=status.HTTP_403_FORBIDDEN
            )

        profiles = Profile.objects.all().order_by("-created_at")

        users = []

        for profile in profiles:
            users.append({
                "id": profile.id,
                "full_name": profile.full_name,
                "email": profile.user.email,
                "role": profile.role,
                "department": profile.department,
                "company": profile.company,
                "job_role": profile.job_role,
                "graduation_year": profile.graduation_year,
                "graduation_status": profile.graduation_status,
            })

        return Response(users)


class NotificationListView(generics.ListAPIView):

    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        return Notification.objects.filter(
            recipient__user=self.request.user
        ).order_by("-created_at")


class NotificationMarkReadView(generics.UpdateAPIView):

    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["patch"]

    def get_queryset(self):

        return Notification.objects.filter(
            recipient__user=self.request.user
        )