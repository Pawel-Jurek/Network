from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    following = models.ManyToManyField('self', symmetrical=False, related_name='followers')
    
    def followers_count(self):
        return self.followers.all().count()

    def following_count(self):
        return self.following.all().count()

    def __str__(self):
        return f'{self.username} followers: {self.followers_count()} following: {self.following_count()}'

class Post(models.Model):
    content = models.CharField(max_length=500)
    created_date = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='post_author')
    likes = models.ManyToManyField(User, blank=True, related_name='liked_posts')
    like_count = models.IntegerField(default=0)
    def __str__(self):
        return f'{self.author}: {self.content[:10]}'


class Comment(models.Model):
    text = models.CharField(max_length=254)
    created_date = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="comment_owner")
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="post_comment")
    def __str__(self):
        return f'{self.user}: {self.post}'