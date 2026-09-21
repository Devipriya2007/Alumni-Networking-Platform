from django.db import models
from django.contrib.auth.models import User


class Profile(models.Model):

    ROLE_CHOICES = [
        ("student", "Student"),
        ("alumni", "Alumni"),
        ("admin", "Admin"),
    ]

    STATUS_CHOICES = [
        ("ongoing", "Ongoing"),
        ("completed", "Completed"),
    ]

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default="student"
    )

    full_name = models.CharField(
        max_length=100
    )

    department = models.CharField(
        max_length=100,
        blank=True
    )

    admission_year = models.IntegerField(
        null=True,
        blank=True
    )

    graduation_year = models.IntegerField(
        null=True,
        blank=True
    )

    graduation_status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="ongoing"
    )

    company = models.CharField(
        max_length=150,
        blank=True
    )

    job_role = models.CharField(
        max_length=150,
        blank=True
    )

    skills = models.TextField(
        blank=True
    )

    bio = models.TextField(
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.full_name


class Post(models.Model):

    POST_TYPE_CHOICES = [
        ("student", "Student"),
        ("alumni", "Alumni"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    content = models.TextField()

    image = models.ImageField(
        upload_to="posts/",
        blank=True,
        null=True
    )

    post_type = models.CharField(
        max_length=20,
        choices=POST_TYPE_CHOICES
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.content[:50]


class Job(models.Model):

    posted_by = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE
    )

    title = models.CharField(
        max_length=150
    )

    company = models.CharField(
        max_length=150
    )

    description = models.TextField()

    location = models.CharField(
        max_length=100,
        blank=True
    )

    application_link = models.URLField(
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.title


class Mentorship(models.Model):

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("accepted", "Accepted"),
        ("rejected", "Rejected"),
    ]

    student = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name="mentorship_requests_sent"
    )

    alumni = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name="mentorship_requests_received"
    )

    message = models.TextField(
        blank=True
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return (
            f"{self.student.full_name} → "
            f"{self.alumni.full_name}"
        )


class Message(models.Model):

    sender = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name="sent_messages"
    )

    receiver = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name="received_messages"
    )

    content = models.TextField()

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return (
            f"{self.sender.full_name} → "
            f"{self.receiver.full_name}"
        )