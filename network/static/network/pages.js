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

  function load_user_page(user) {
    // Show the mailbox and hide other views 
    document.querySelector('#new_post_view').style.display = 'none';
    document.querySelector('#following_view').style.display = 'none';
    document.querySelector('#user_page_view').style.display = 'block';
    document.querySelector('#posts_view').style.display = 'none';

    const username_col = document.querySelector('#username-col');
    username_col.innerHTML = '';
    
    const usernameHeader = document.createElement('h2');
    usernameHeader.innerHTML = user;
    usernameHeader.style.fontWeight = "bold";
    usernameHeader.style.fontSize = "1.5rem";

    const followButton = document.createElement('button');
    followButton.innerHTML = "Follow";
    followButton.style.marginTop = "10px";
    followButton.style.width = '80%';

    username_col.appendChild(usernameHeader);
    username_col.appendChild(followButton);

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
            console.error('Błąd:', error);
          });      
        }
        else{
          heartSvg.setAttribute("class", "bi bi-heart");
          path.setAttribute("d", "m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z");
        }
        
        
        heartSvg.appendChild(path);
        heartButton.appendChild(heartSvg);
        
        const heartCount = document.createElement('span');
        heartCount.className = 'heart-count';
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
              // Aktualizacja danych o polubieniach
              post.likes_count = updatedPost.likes_count;
              post.user_liked = updatedPost.user_liked;
              // Odświeżenie widoku postów
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