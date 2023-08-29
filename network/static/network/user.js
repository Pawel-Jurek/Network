document.addEventListener('DOMContentLoaded', function() {
  const followButton = document.querySelector('#main-follow-button');
  const user = document.querySelector('#userHeading').textContent;
  if (followButton) {
    followButton.addEventListener('click', function() {
      follow(user, followButton);
    });
  }
  // offcanvas body content
  // setting offcanvas content for followers button
  followersDiv = document.querySelector('#followers-col')
  followersDiv.addEventListener('click', function(){
    document.querySelector('#offcanvasLabel').innerHTML = "Followers:";
    load_offcanvas_content('followers', user);
  })

  // setting offcanvas content for following button
  followingDiv = document.querySelector('#following-col')
  followingDiv.addEventListener('click', function(){
    document.querySelector('#offcanvasLabel').innerHTML = "Following:";
    load_offcanvas_content('following', user);
  })
  

})

function follow(user, followButton){
  followersCount = document.querySelector('#followersCount');
  followingCount = document.querySelector('#followingCount');
  page_owner = document.querySelector('#userHeading').textContent;
  fetch(`/follow/${user}/${page_owner}`, {
      method: 'PUT'
  })
  .then(response => response.json())
  .then(updatedUser => {        
    if (updatedUser.is_followed) {
        followButton.className = "btn btn-primary";
        followButton.textContent = "Unfollow";
        
    } else {
        followButton.className = "btn btn-outline-primary";
        followButton.textContent = "Follow";
    }

    followersCount.textContent = updatedUser.followersCount;
    followingCount.textContent = updatedUser.followingCount;
    
  })
  .catch(error => {
      console.error('Error', error);
  });
      
}


function load_offcanvas_content(type, username){
    offcanvas_body = document.querySelector('.offcanvas-body'); 
    offcanvas_body.innerHTML = '';

    fetch(`/get_users/${type}/${username}`)
    .then(response => response.json())
    .then(data => {
      const users = data.users;
      console.log(type,users);
      users.forEach(user => {
        var rowDiv = document.createElement("div");
        rowDiv.classList.add("row");
        rowDiv.classList.add('highCenterRow');

        var col1Div = document.createElement("div");
        col1Div.classList.add("col-6");
        col1Div.classList.add('highCenterCol');
        col1Div.textContent = user.username;
        col1Div.style.fontSize = '20px';

        var col2Div = document.createElement("div");
        col2Div.classList.add('highCenterCol');
        col2Div.classList.add("col-6");

        var user_is_logged_in = document.querySelector('#logout_button') !== null;

        if(user_is_logged_in && user.username !== document.querySelector('#user_page').textContent){
          const followButton = document.createElement('button');
          if(user.is_followed){
            followButton.className = "btn btn-primary";
            followButton.textContent = "Unfollow :(";
          } else {
            followButton.className = "btn btn-outline-primary";
            followButton.textContent = "Follow :)";
          }
          followButton.style.width = '120px';

          followButton.addEventListener('click', function() {         
            follow(user.username, followButton, false);
          });
                
          col2Div.appendChild(followButton);

        } else if(user_is_logged_in) {
          const userDescription = document.createElement('p');
          userDescription.innerHTML = "<em>It's you</em>";
          userDescription.style.fontSize = '20px';
          col2Div.appendChild(userDescription);
        }

        rowDiv.appendChild(col1Div);
        rowDiv.appendChild(col2Div);

        offcanvas_body.appendChild(rowDiv);
        })
      })
  }
  