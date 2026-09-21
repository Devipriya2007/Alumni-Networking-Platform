from django.utils import timezone

from .models import Profile, Post


def check_and_convert_student(profile):
    if profile.role != "student":
        return profile

    if not profile.graduation_year:
        return profile

    current_year = timezone.now().year

    if current_year > profile.graduation_year:
        profile.role = "alumni"
        profile.graduation_status = "completed"
        profile.save(update_fields=["role", "graduation_status"])

        Post.objects.filter(
            user=profile.user,
            post_type="student",
        ).delete()

    return profile