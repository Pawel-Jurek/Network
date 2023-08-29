from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    following = models.ManyToManyField('self', symmetrical=False, related_name='followers')
    
    def followers_count(self):
        return self.followers.all().count()

    def following_count(self):
        return self.following.all().count()

    def __str__(self):
        return f'{self.username}'

class Post(models.Model):
    content = models.CharField(max_length=500)
    created_date = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='post_author')
    likes = models.ManyToManyField(User, blank=True, related_name='liked_posts')
    
    def __str__(self):
        return f'{self.author.username}: {self.content[:10]}'
    
    def serialize(self):
        return {
            "id": self.id,
            "content": self.content,
            "created_date": self.created_date.strftime("%b %d %Y, %I:%M %p"),
            "author": self.author.username,
            "likes": [user.username for user in self.likes.all()],
            "likes_count": self.count_likes(),
            "comments": [comment.serialize() for comment in Comment.objects.filter(post = self.id).order_by("-created_date")]
        }
    
    def count_likes(self):
        return self.likes.count()


class Comment(models.Model):
    content = models.CharField(max_length=254)
    created_date = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="comment_owner")
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="post_comment")
    def __str__(self):
        return f'{self.author}: {self.post}'
    
    def serialize(self):
        return {
            "id": self.id,
            "content": self.content,
            "created_date": self.created_date.strftime("%b %d %Y, %I:%M %p"),
            "author": self.author.username
        }