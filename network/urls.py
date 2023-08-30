
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("<int:currentPage>", views.index, name="index_pages"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("new_post", views.new_post, name="new_post"),
    path("like_post/<int:post_id>", views.like_post, name="like_post"),
    path("follow/<str:username>/<str:page_owner_name>", views.follow, name="follow"),
    path("get_users/<str:type>/<str:username>", views.get_users, name="get_users"),
    path("following_posts/<str:user>/<int:currentPage>", views.following_posts, name="following_posts"),
    path("edit_post/<int:post_id>", views.edit_post, name="edit_post"),
    path("add_comment/<int:post_id>", views.add_comment, name="add_comment"),
    path("delete_comment/<int:comment_id>", views.delete_comment, name="delete_comment"),
    path("<str:username>/<int:currentPage>", views.user_page, name='user_page')
]

