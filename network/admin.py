from django.contrib import admin
from .models import Post, User, Comment

# Register your models here.
class UserAdmin(admin.ModelAdmin):
    search_fields = ['username']
    ordering = ['username']

class PostAdmin(admin.ModelAdmin):
    search_fields=['id']
    list_display = ['id', 'author', 'created_date']
    ordering = ['id']

class CommentAdmin(admin.ModelAdmin):
    search_fields=['id']
    list_display = ['id', 'author', 'post', 'created_date']
    ordering = ['post', 'id']


admin.site.register(Post, PostAdmin)
admin.site.register(User, UserAdmin)
admin.site.register(Comment, CommentAdmin)
