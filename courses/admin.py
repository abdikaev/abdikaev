from django.contrib import admin
from .models import Course, Lesson, Enrollment, Assignment

class LessonInline(admin.TabularInline):
    model = Lesson
    extra = 1

class CourseAdmin(admin.ModelAdmin):
    inlines = [LessonInline]
    list_display = ('title', 'instructor', 'created_by', 'duration', 'is_free', 'created_at')
    list_filter = ('is_free', 'created_at')
    search_fields = ('title', 'description', 'instructor__username')

admin.site.register(Course, CourseAdmin)
admin.site.register(Enrollment)
admin.site.register(Assignment)