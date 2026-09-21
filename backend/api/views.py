from rest_framework import viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    Profile,
    Post,
    Job,
    Mentorship,
    Message
)

from .serializers import (
    ProfileSerializer,
    PostSerializer,
    JobSerializer,
    MentorshipSerializer,
    MessageSerializer
)

from .services import check_and_convert_student


class ProfileViewSet(viewsets.ModelViewSet):

    queryset = Profile.objects.all()

    serializer_class = ProfileSerializer

    permission_classes = [AllowAny]

    def retrieve(
        self,
        request,
        *args,
        **kwargs
    ):

        profile = self.get_object()

        check_and_convert_student(profile)

        return super().retrieve(
            request,
            *args,
            **kwargs
        )


class PostViewSet(viewsets.ModelViewSet):

    queryset = Post.objects.all().order_by(
        "-created_at"
    )

    serializer_class = PostSerializer

    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):

        serializer.save(
            user=self.request.user
        )


class JobViewSet(viewsets.ModelViewSet):

    queryset = Job.objects.all()

    serializer_class = JobSerializer

    permission_classes = [AllowAny]


class MentorshipViewSet(viewsets.ModelViewSet):

    queryset = Mentorship.objects.all()

    serializer_class = MentorshipSerializer

    permission_classes = [IsAuthenticated]


class MessageViewSet(viewsets.ModelViewSet):

    queryset = Message.objects.all()

    serializer_class = MessageSerializer

    permission_classes = [IsAuthenticated]


class MyProfileView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        try:

            profile = Profile.objects.get(
                user=request.user
            )

            check_and_convert_student(
                profile
            )

            serializer = ProfileSerializer(
                profile
            )

            data = serializer.data

            data["email"] = request.user.email

            return Response(data)

        except Profile.DoesNotExist:

            return Response(
                {
                    "error": "Profile not found."
                },
                status=404
            )


    def put(self, request):

        try:

            profile = Profile.objects.get(
                user=request.user
            )

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
                status=400
            )

        except Profile.DoesNotExist:

            return Response(
                {
                    "error": "Profile not found."
                },
                status=404
            )


class AdminDashboardView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        try:

            admin_profile = Profile.objects.get(
                user=request.user
            )

        except Profile.DoesNotExist:

            return Response(
                {
                    "error": "Profile not found."
                },
                status=404
            )

        if admin_profile.role != "admin":

            return Response(
                {
                    "error": "Admin access required."
                },
                status=403
            )

        profiles = Profile.objects.all()

        students = profiles.filter(
            role="student"
        )

        alumni = profiles.filter(
            role="alumni"
        )

        admins = profiles.filter(
            role="admin"
        )

        posts = Post.objects.all()

        jobs = Job.objects.all()

        mentorships = Mentorship.objects.all()

        messages = Message.objects.all()

        return Response(
            {
                "total_users": profiles.count(),
                "total_students": students.count(),
                "total_alumni": alumni.count(),
                "total_admins": admins.count(),
                "total_posts": posts.count(),
                "total_jobs": jobs.count(),
                "total_mentorships": mentorships.count(),
                "total_messages": messages.count(),
            }
        )


class AdminUsersView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        try:

            admin_profile = Profile.objects.get(
                user=request.user
            )

        except Profile.DoesNotExist:

            return Response(
                {
                    "error": "Profile not found."
                },
                status=404
            )

        if admin_profile.role != "admin":

            return Response(
                {
                    "error": "Admin access required."
                },
                status=403
            )

        profiles = Profile.objects.all().order_by(
            "-created_at"
        )

        users = []

        for profile in profiles:

            users.append(
                {
                    "id": profile.id,
                    "full_name": profile.full_name,
                    "email": profile.user.email,
                    "role": profile.role,
                    "department": profile.department,
                    "company": profile.company,
                    "job_role": profile.job_role,
                    "graduation_year": profile.graduation_year,
                    "graduation_status":
                        profile.graduation_status,
                }
            )

        return Response(users)