document.addEventListener('DOMContentLoaded', function() {
    const heartButtons = document.querySelectorAll('.heart-button');
    heartButtons.forEach(heartButton => {        
        heartButton.addEventListener('click', function() {
            const postId = heartButton.getAttribute('data-id');
            fetch(`/like_post/${postId}`, {
                method: 'PUT'
            })
            .then(response => response.json())
            .then(updatedPost => {
                const heartIcon = heartButton.querySelector('.heart-icon');
                const heartCount = heartButton.querySelector('.likesCount');
                heartIcon.innerHTML = updatedPost.is_liked ? `
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-heart-fill" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"/>
                    </svg>` :
                    `
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-heart" viewBox="0 0 16 16">
                        <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z"/>
                    </svg>`;
                heartCount.textContent = updatedPost.likes_count;
            })
            .catch(error => {
                console.error('Error', error);
            });
        });
    });


    const editButtons = document.querySelectorAll('.editButton');

    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const postId = this.getAttribute('data-postid');

            const textField = document.querySelector(`#post_text${postId}`);
            textField.style.display = 'none';
            const form = document.querySelector(`#edit_post_form${postId}`);
            form.style.display = 'block';
            
            const textarea = document.querySelector(`#editTextarea${postId}`);
            textarea.value = textField.textContent;
            const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
            form.onsubmit = () => {
                fetch(`/edit_post/${postId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken,
                    },
                    body: JSON.stringify({
                        content: textarea.value
                    })
                })
                .then(response => response.json())
                .then(result => {
                    console.log(result);
                    form.style.display = 'none';         
                    textField.style.display = 'block';
                    textField.textContent = textarea.value;
                })
                .catch(error => {
                    console.error('Error', error);
                });
                return false;
            }
           
        });
    });

    const comment_buttons = document.querySelectorAll('.submitCommentButton');
    comment_buttons.forEach(button => {
        button.addEventListener('click', function() {
            const postId = this.getAttribute('data-postid');
            const authorUrl = this.getAttribute('data-new-author');
            const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
            const form = document.querySelector(`#comment_form${postId}`);
            form.onsubmit = () =>{
                const text = document.querySelector(`#commentTextarea${postId}`).value;
                fetch(`/add_comment/${postId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken,
                    },
                    body: JSON.stringify({
                        content: text
                    })
                })
                .then(response => response.json())
                .then(result => {
                    const newCommentElement = document.createElement('div');
                    newCommentElement.className = 'comment';
                    newCommentElement.id = `comment${result.id}`;


                    const authorLink = document.createElement('a');
                    authorLink.className = 'author-clickable';
                    authorLink.href = authorUrl;
                    authorLink.textContent = result.author;

                    const createdDate = document.createElement('em');
                    createdDate.textContent = result.created_date;

                    const commentContent = document.createElement('a');
                    commentContent.textContent = result.content;

                    const hr = document.createElement('hr');
                    const defaultDiv = document.createElement('div');
                    const delete_button = document.createElement('button');
                    delete_button.className = 'btn btn-danger';
                    delete_button.style.marginBottom = '10px';
                    delete_button.setAttribute('data-id', result.id);
                    delete_button.textContent = 'Delete comment';
                    delete_button.addEventListener('click', function(){
                        delete_post(delete_button);
                    })

                    newCommentElement.appendChild(authorLink);
                    newCommentElement.appendChild(document.createElement('br'));
                    newCommentElement.appendChild(createdDate);
                    newCommentElement.appendChild(document.createElement('br'));
                    newCommentElement.appendChild(commentContent);
                    defaultDiv.appendChild(delete_button);
                    newCommentElement.appendChild(defaultDiv);
                    newCommentElement.appendChild(hr);
                    

                    const commentsSection = document.querySelector(`.comments-section${postId}`);
                    commentsSection.appendChild(newCommentElement);

                    document.querySelector(`#commentTextarea${postId}`).value='';
                    newCommentElement.scrollIntoView({ behavior: 'smooth' });
                })
                .catch(error => {
                    console.error('Error', error);
                });
                return false;
            }
        })
    })


    const deleteButtons = document.querySelectorAll('.delete_comment');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            delete_post(button);
        })
    })
});

function delete_post(button){
    const commentId = button.getAttribute('data-id');
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    fetch(`/delete_comment/${commentId}`, {
        method: 'PUT',
        headers: {'X-CSRFToken': csrfToken}
    })
    .then(response => response.json())
    .then(result => {
        console.log(result);
        const comment = document.querySelector(`#comment${commentId}`);
        comment.innerHTML = '';
    })
    return false;
}