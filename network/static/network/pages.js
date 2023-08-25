document.addEventListener('DOMContentLoaded', function() {
    // Use buttons to toggle between views
    document.querySelector('#all_posts').addEventListener('click', () => load_all_posts());
    
    var user_is_logged_in = document.querySelector('#logout_button') !== null;
    if (user_is_logged_in) {
      document.querySelector('#user_page').addEventListener('click', function() {
        user = this.textContent;
        load_user_page(user)
      });
      document.querySelector('#network').addEventListener('click', () => load_all_posts());
      document.querySelector('#new_post').addEventListener('click', () => create_new_post());
      document.querySelector('#following').addEventListener('click', () => load_following());
    }
  
    // By default, load the inbox
    load_all_posts()
  });

  function create_new_post() {
    // Show the mailbox and hide other views
    document.querySelector('#user_page_view').style.display = 'none';
    document.querySelector('#following_view').style.display = 'none';
    document.querySelector('#new_post_view').style.display = 'block';
    document.querySelector('#posts_view').style.display = 'none';

    document.querySelector('#post_content').value = '';

    document.querySelector('#post_form').onsubmit = () => {
      const content = document.querySelector('#post_content').value;
      fetch('/new_post', {
        method: 'POST',
        body: JSON.stringify({
          content: content
        })
      })
      .then(response => response.json())
      .then(result => {
        // Print result
        console.log(result);
        load_all_posts()
      })
      .catch(error => {
        console.error('Error', error);
      });
      return false; 
    };

    
  }

  function load_user_page(author) {
    // Show the mailbox and hide other views 
    document.querySelector('#new_post_view').style.display = 'none';
    document.querySelector('#following_view').style.display = 'none';
    document.querySelector('#user_page_view').style.display = 'block';
    document.querySelector('#posts_view').style.display = 'none';

    var user_is_logged_in = document.querySelector('#logout_button') !== null;

    fetch(`/user_info/${author}`)
    .then(response => response.json())
    .then(data => {
      console.log(data)

      //-------------- user icon and button section
      const username_col = document.querySelector('#username-col');
      username_col.innerHTML = '';

      const userCenterBox = document.createElement('div');
      const usernameHeader = document.createElement('h2');
      usernameHeader.innerHTML = author;
      usernameHeader.style.fontWeight = "bold";
      usernameHeader.style.fontSize = "1.5rem";
      userCenterBox.appendChild(usernameHeader);

      if(user_is_logged_in && author !== document.querySelector('#user_page').textContent){
        const followButton = document.createElement('button');
        if(data.is_follower){
          followButton.className = "btn btn-primary";
          followButton.innerHTML = "Unfollow :(";
        } else {
          followButton.className = "btn btn-outline-primary";
          followButton.innerHTML = "Follow :)";
        }

        followButton.addEventListener('click', function() {         
          fetch(`/follow/${author}`, {
            method: 'PUT'
          })
          .then(updatedUser => {
            data.is_follower = updatedUser.is_follower
            load_user_page(author);
          })
          .catch(error => {
            console.error('Error', error);
          });
        });
        
        followButton.style.marginTop = "10px";
        followButton.style.width = '120px';

        userCenterBox.appendChild(followButton);

      } else if(user_is_logged_in) {
        const userDescription = document.createElement('h3');
        userDescription.innerHTML = "<em>Welcome on your Page:)</em>";
        userDescription.style.fontSize = "1.2rem";
        userCenterBox.appendChild(userDescription);
      }
      username_col.appendChild(userCenterBox);
      
      
      //-------------- followers section
      const followersDiv = 'followers-col'
      const people_icon_d = "M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7Zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-5.784 6A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216ZM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z";
      const people_icon_class = "bi bi-people-fill";
      const followers_color = "#b82d14";
      const followers_content = data.followersCount; 
      const followers_description = "Followers";
      create_icon_and_description(followersDiv, people_icon_d, people_icon_class, followers_color, followers_content, followers_description);
      
      //-------------- following section
      const followingDiv = 'following-col'
      const following_color = "#033387";
      const following_content = data.followingCount; 
      const following_description = "Following";
      create_icon_and_description(followingDiv, people_icon_d, people_icon_class, following_color, following_content, following_description);

      //-------------- posts info section
      const postsDiv = 'posts-col'
      const post_icon_d = "M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z";
      const post_icon2_d ='M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z';
      const number_fill_d = 2;
      const post_icon_class = "bi bi-pencil-square";
      const post_icon_fill_rule = "evenodd";
      const posts_color = "#1b8729";
      const posts_content = data.postsCount;
      const posts_description = "Written posts";
      create_icon_and_description(postsDiv, post_icon_d, post_icon_class, posts_color, posts_content, posts_description, post_icon_fill_rule, post_icon2_d, number_fill_d);     
    

      //-------------- posts displaying section
      //TODO


      })
    .catch(error => {
      console.error('Error:', error);
    });
  
  }

  function create_icon_and_description(default_div, svg_d, svg_class, svg_color, content, description, fill_rule = null, svg2_d = null, num = 0){
    const main_container = document.querySelector(`#${default_div}`);
    main_container.innerHTML='';

    const center_box = document.createElement('div');
    center_box.className = 'centerBox';
    
    const followingSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    followingSvg.setAttribute("width", "40");
    followingSvg.setAttribute("height", "40");
    followingSvg.setAttribute("fill", svg_color);       
    followingSvg.setAttribute("viewBox", "0 0 16 16");
    followingSvg.setAttribute("class", svg_class);
    
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", svg_d);

    if(svg2_d){
      const path2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
      if(fill_rule && num === 1){
        path.setAttribute("fill-rule", fill_rule);
      }else{
        path2.setAttribute("d", svg2_d);
        path2.setAttribute("fill-rule", fill_rule);
        followingSvg.appendChild(path2);
      }
    } else if(fill_rule){
      path.setAttribute("fill-rule", fill_rule);
    }
    

    const followingCount = document.createElement('span');
    followingCount.className = 'count';
    followingCount.textContent = content;
    followingCount.style.fontSize = '18px';
    followingCount.style.paddingLeft = '5px';

    const followingDescription = document.createElement('span');
    followingDescription.className = 'count';
    followingDescription.textContent = description;
    followingDescription.style.fontSize = '18px';
    followingDescription.style.paddingLeft = '5px';

    var brElement = document.createElement('br');
    
    followingSvg.appendChild(path);
    center_box.appendChild(followingSvg);
    center_box.appendChild(followingCount);
    center_box.appendChild(brElement);
    center_box.appendChild(followingDescription);
    main_container.appendChild(center_box);
  }

  function load_following() {
    // Show the mailbox and hide other views
    document.querySelector('#user_page_view').style.display = 'none';
    document.querySelector('#new_post_view').style.display = 'none';
    document.querySelector('#following_view').style.display = 'block';
    document.querySelector('#posts_view').style.display = 'none';

  }



  function load_all_posts(){
    document.querySelector('#user_page_view').style.display = 'none';
    document.querySelector('#following_view').style.display = 'none';
    document.querySelector('#new_post_view').style.display = 'none';
    document.querySelector('#posts_view').style.display = 'block';

    const main_container = document.querySelector('#posts_view');
    var user_is_logged_in = document.querySelector('#logout_button') !== null;
    main_container.innerHTML = '';
    const title = document.createElement('h1');
    title.textContent = `Posts`;
    main_container.appendChild(title);

    fetch('/posts')
    .then(response => response.json())
    .then(posts => {
      console.log(posts);
      
      posts.forEach(post => {
        const element = document.createElement('div');
        element.className = "post";
        element.id = "displayed_post";
        element.innerHTML = `
          <strong class="author-clickable">${post.author}</strong><br>
          <em>${post.created_date}</em><br>
          <hr>${post.content}<hr>`;
          
        
        const authorElement = element.querySelector('.author-clickable');
        authorElement.addEventListener('click', () => {
          load_user_page(post.author);
        });

        const heartButton = document.createElement('button');
        heartButton.type = "button";
        heartButton.className = "btn btn-outline-danger";
        
        const heartSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        heartSvg.setAttribute("width", "16");
        heartSvg.setAttribute("height", "16");
        heartSvg.setAttribute("fill", "currentColor");       
        heartSvg.setAttribute("viewBox", "0 0 16 16");
        
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");


        if(user_is_logged_in){
          get_user().then(user => {
            if(post.likes.includes(user)){
              heartSvg.setAttribute("class", "bi bi-heart-fill");
              path.setAttribute("fill-rule", "evenodd");
              path.setAttribute("d", "M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z");
            } else{
              heartSvg.setAttribute("class", "bi bi-heart");
              path.setAttribute("d", "m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z");
            }   
          })
          .catch(error => {
            console.error('Error', error);
          });      
        }
        else{
          heartSvg.setAttribute("class", "bi bi-heart");
          path.setAttribute("d", "m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z");
        }
        
        
        heartSvg.appendChild(path);
        heartButton.appendChild(heartSvg);
        
        const heartCount = document.createElement('span');
        heartCount.className = 'count';
        heartCount.textContent = post.likes_count;
        heartCount.style.fontSize = '18px';
        heartCount.style.paddingLeft = '5px';

        heartButton.appendChild(heartCount);
        heartButton.style.display = 'flex';
        heartButton.style.alignItems = 'center';


        if(user_is_logged_in){
          heartButton.addEventListener('click', function() {
            
            fetch(`/like_post/${post.id}`, {
              method: 'PUT'
            })
            .then(updatedPost => {
              post.likes_count = updatedPost.likes_count;
              post.user_liked = updatedPost.user_liked;
              load_all_posts();
            })
            .catch(error => {
              console.error('Error', error);
            });
          });
        }

        element.appendChild(heartButton);
      
        const commentsSection = document.createElement('div');
        commentsSection.className = 'comments-section';
        commentsSection.textContent = 'Comments';
        element.appendChild(commentsSection);
      
        main_container.append(element);
        console.log(post);
      });
    });
  }
  

  function get_user() {
    return fetch(`/get_user`)
      .then(response => response.json())
      .then(request => {
        return request.user;
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }