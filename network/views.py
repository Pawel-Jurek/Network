import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import redirect, render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt

from .models import Post, User


def index(request):
    posts_list = get_posts('all')
    return render(request, "network/index.html", {"posts": [post.serialize() for post in posts_list]})


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
    if request.method == 'POST':
        content = request.POST.get('content')
        if content:
            post = Post(
                author = request.user,
                content = content   
            )
            post.save()
            return redirect('/')
    return render(request, "network/new_post.html")


@login_required
def edit_post(request, post_id):   
    if request.method == 'POST' and Post.objects.get(pk=post_id).author == request.user:
        data = json.loads(request.body)
        content = data.get('content')
        if(content):
            post = Post.objects.get(pk=post_id)
            post.content = content
            post.save()
            return JsonResponse({'status': 'success'})
        else:
            return JsonResponse({'error': 'content cannot be empty'})
        
    return JsonResponse({'status': 'failure'})
    


def get_posts(category, username = None):
    if category == "all":
        posts_list = Post.objects.all()
    elif category == "following":
        user = User.objects.get(username = username)
        followings = user.following.all()
        posts_list = Post.objects.filter(author__in=followings)
    elif category == "created_by":       
        author = User.objects.get(username=username)
        posts_list = Post.objects.filter(author=author)
    else:
        return []

    posts_list = posts_list.order_by("-created_date").all()

    return posts_list


@csrf_exempt
@login_required
def like_post(request, post_id):
    try:
        post = Post.objects.get(pk = post_id)
    except Post.DoesNotExist:
        return JsonResponse({"error": "Post not found."}, status=404)
    if request.method == "PUT":
        try:
            post = Post.objects.get(pk=post_id)
        except Post.DoesNotExist:
            return JsonResponse({"error": "Post does not exist"}, status=404)
  
        if request.user not in post.likes.all():
            post.likes.add(request.user)
        else:
            post.likes.remove(request.user)
        post.save()
        
        response_data = {
            "is_liked": request.user in post.likes.all(),
            "likes_count": post.likes.count()
        }
        return JsonResponse(response_data, status=200)

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
    
    followersCount = post_author.followers_count()
    followingCount = post_author.following_count()
    
    print(f'\n\n{[user.username for user in post_author.following.all()]}\n\n')

    jsonData = {
        "followingCount": followingCount,
        "followersCount": followersCount,
        "postsCount": posts_list.count(),
        "is_follower": request.user in post_author.followers.all(),
        "allFollowers": [{'username': user.username, 'is_followed': user in request.user.following.all()} for user in post_author.followers.all()],
        "allFollowing": [{'username': user.username, 'is_followed': user in request.user.following.all()} for user in post_author.following.all()]
    }
    for post in posts_list:
        jsonData.update(post.serialize())

    return JsonResponse(jsonData, safe=False)


@csrf_exempt
@login_required 
def follow(request, username, page_owner_name):
    if request.method == "PUT":
        try:
            user_to_follow = User.objects.get(username = username)
            page_owner = User.objects.get(username = page_owner_name)
        except Post.DoesNotExist:
            return JsonResponse({"error": "User does not exist"}, status=404)
  
        if request.user not in user_to_follow.followers.all():
           user_to_follow.followers.add(request.user)
        else:
            user_to_follow.followers.remove(request.user)
        user_to_follow.save()
        response_data = {
            "is_followed": request.user in user_to_follow.followers.all(),
            "followingCount": page_owner.following_count(),
            "followersCount": page_owner.followers_count()
        }
        return JsonResponse(response_data, status=200)

    else:
        return JsonResponse({
            "error": "GET or PUT request required."
        }, status=400)


def user_page(request, username):
    try:
        page_owner = User.objects.get(username=username)
        posts_list = Post.objects.filter(author = page_owner).order_by("-created_date").all()
        
        followersCount = page_owner.followers_count()
        followingCount = page_owner.following_count()

        return render(request, 'network/user.html',{
            "username": username,
            "followingCount": followingCount,
            "followersCount": followersCount,
            "postsCount": posts_list.count(),
            "is_follower": request.user in page_owner.followers.all(),
            "allFollowers": [{'username': user.username, 'is_followed': user in request.user.following.all()} for user in page_owner.followers.all()],
            "allFollowing": [{'username': user.username, 'is_followed': user in request.user.following.all()} for user in page_owner.following.all()],
            "userPosts": [post.serialize() for post in Post.objects.filter(author = page_owner).order_by("-created_date")]
            
        })
    except User.DoesNotExist:
        return HttpResponse('User not found', status=404)
    

@csrf_exempt
@login_required 
def get_users(request, type, username):
    page_owner = User.objects.get(username = username)
    if type == 'following':
        users = [{'username': user.username, 'is_followed': user in request.user.following.all()} for user in page_owner.following.all()]
    elif type == 'followers':
        users = [{'username': user.username, 'is_followed': user in request.user.following.all()} for user in page_owner.followers.all()]
    else:
        users = []
    return JsonResponse({'users': users}, status=200)

def following_posts(request, user):
    posts_list = get_posts('following', user)
    return render(request, "network/following_posts.html", {"posts": [post.serialize() for post in posts_list]})