
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("new_post", views.new_post, name="new_post"),
    path("posts/<str:category>", views.posts, name="posts"), 
    path("posts/<str:category>/<str:username>", views.posts, name="user_posts"),
    path("like_post/<int:post_id>", views.like_post, name="like_post"),
    path("get_user", views.get_user, name="get_user"),
    path("user_info/<str:username>", views.user_info, name="user_info"),
    path("follow/<str:username>", views.follow, name="follow"),
    path("<str:username>", views.user_page, name='user_page')
]
