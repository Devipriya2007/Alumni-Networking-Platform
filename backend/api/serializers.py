from django.contrib.auth.models import User
from rest_framework import serializers

from .models import (
    Profile,
    Post,
    Job,
    Mentorship,
    Message
)


class ProfileSerializer(serializers.ModelSerializer):

    email = serializers.EmailField(
        write_only=True
    )

    password = serializers.CharField(
        write_only=True,
        required=True
    )

    class Meta:

        model = Profile

        fields = [
            "id",
            "email",
            "password",
            "full_name",
            "role",
            "department",
            "admission_year",
            "graduation_year",
            "graduation_status",
            "company",
            "job_role",
            "skills",
            "bio",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "graduation_status",
            "created_at",
        ]

    def validate_email(self, value):

        if User.objects.filter(
            username=value
        ).exists():

            raise serializers.ValidationError(
                "Email already registered. Please use another email."
            )

        return value

    def create(self, validated_data):

        email = validated_data.pop("email")
        password = validated_data.pop("password")

        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
        )

        profile = Profile.objects.create(
            user=user,
            **validated_data
        )

        return profile


class PostSerializer(serializers.ModelSerializer):

    class Meta:

        model = Post

        fields = [
            "id",
            "user",
            "content",
            "image",
            "post_type",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "user",
            "created_at",
        ]


class JobSerializer(serializers.ModelSerializer):

    class Meta:

        model = Job

        fields = "__all__"


class MentorshipSerializer(serializers.ModelSerializer):

    class Meta:

        model = Mentorship

        fields = "__all__"

        read_only_fields = [
            "created_at",
            "updated_at",
        ]


class MessageSerializer(serializers.ModelSerializer):

    class Meta:

        model = Message

        fields = "__all__"

        read_only_fields = [
            "created_at",
        ]