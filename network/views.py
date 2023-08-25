import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt

from .models import Post, User


def index(request):
    return render(request, "network/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")

@csrf_exempt
@login_required
def new_post(request):
    data = json.loads(request.body)
    content = data.get("content", "")
    if (content is None):
        return JsonResponse({"message": "Your post content is Empty."}, status=400)
    else:
        post = Post(
            author = request.user,
            content = content   
        )
        post.save()
        return JsonResponse({"message": "Post created successfully."}, status=201)


def posts(request):
    '''
    if category == "all":
        posts_list = Post.objects.all()
    elif category == "liked":
        current_user = request.user       
        posts_list = Post.objects.filter(likes=current_user)
    elif category == "created":
        posts_list = Post.objects.filter(
            author=request.user
        )
    else:
        return JsonResponse({"error": "Invalid mailbox."}, status=400)
    '''

    posts_list = Post.objects.all()
    # Return emails in reverse chronologial order
    posts_list = posts_list.order_by("-created_date").all()

    return JsonResponse([post.serialize() for post in posts_list], safe=False)


@csrf_exempt
@login_required
def like_post(request, post_id):
    try:
        post = Post.objects.get(pk = post_id)
    except Post.DoesNotExist:
        return JsonResponse({"error": "Post not found."}, status=404)

    # Return email contents
    if request.method == "GET":
        return JsonResponse(post.serialize())

    # Update whether email is read or should be archived
    elif request.method == "PUT":
        try:
            post = Post.objects.get(pk=post_id)
        except Post.DoesNotExist:
            return JsonResponse({"error": "Post does not exist"}, status=404)
  
        if request.user not in post.likes.all():
            post.likes.add(request.user)
        else:
            post.likes.remove(request.user)
        post.save()
        return HttpResponse(status=204)

    # Post must be via GET or PUT
    else:
        return JsonResponse({
            "error": "GET or PUT request required."
        }, status=400)

@csrf_exempt
@login_required   
def get_user(request):
    return JsonResponse({
        "user": request.user.username
    })


def user_info(request, username):
    post_author = User.objects.get(username = username)
    posts_list = Post.objects.filter(author = post_author).order_by("-created_date").all()
    # Return emails in reverse chronologial order
    followers = post_author.followers_count()
    following = post_author.following_count()
    #print(f'\nuser:{post_author.username}, following:{following}, followers: {followers}, posts: {posts_list.count()}')
    
    jsonData = {
        "followingCount": following,
        "followersCount": followers,
        "postsCount": posts_list.count(),
        "is_follower": request.user in post_author.followers.all()
    }
    for post in posts_list:
        jsonData.update(post.serialize())

    return JsonResponse(jsonData, safe=False)


@csrf_exempt
@login_required 
def follow(request, username):
    if request.method == "PUT":
        try:
            user_to_follow = User.objects.get(username = username)
        except Post.DoesNotExist:
            return JsonResponse({"error": "User does not exist"}, status=404)
  
        
        if request.user not in user_to_follow.followers.all():
           user_to_follow.followers.add(request.user)
        else:
            user_to_follow.followers.remove(request.user)
        user_to_follow.save()
        return HttpResponse(status=204)

    else:
        return JsonResponse({
            "error": "GET or PUT request required."
        }, status=400)
