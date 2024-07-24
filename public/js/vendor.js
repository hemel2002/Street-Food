//Review list

document.addEventListener('DOMContentLoaded', function () {
  // Simulated review data (replace this with your actual data)
  const reviewData = [
    {
      customerId: 1,
      customerName: 'Shahriar Sakif ',
      customerPic: '../img/Founder/sakk.jpg',
      testRating: 7,
      hygieneRating: 8,
      comment: 'Great food! Will definitely visit again.',
      reply:
        'Thank you for your feedback. We look forward to serving you again!',
    },
    {
      customerId: 2,
      customerName: 'Shahriar Hemal',
      customerPic: '../img/Founder/hemal.jpg',
      testRating: 9,
      hygieneRating: 9,
      comment: 'Amazing experience! Loved the variety of dishes.',
      reply:
        'We are glad you enjoyed our offerings. Looking forward to your next visit!',
    },
    // Add more review objects as needed
    {
      customerId: 3,
      customerName: 'Nahidur Zaman',
      customerPic: '../img/Founder/tush.jpg',
      testRating: 8,
      hygieneRating: 7,
      comment: 'Very good service and clean environment.',
      reply: 'Thank you, Alice! We hope to see you again soon!',
    },
    {
      customerId: 4,
      customerName: 'Fahim Sikder',
      customerPic: '../img/Founder/sakk.jpg',
      testRating: 6,
      hygieneRating: 8,
      comment: 'Food was nice but could be improved.',
      reply:
        'Thank you for your feedback, Bob. We will work on improving our food.',
    },
    {
      customerId: 5,
      customerName: 'Arif ',
      customerPic: '../img/Founder/sakk.jpg',
      testRating: 5,
      hygieneRating: 6,
      comment: 'Average experience. Could be better.',
      reply:
        'Thank you for your feedback, Charlie. We will strive to do better.',
    },
    // More reviews...
  ];

  const reviewsPerPage = 4;
  let currentPage = 1;

  const reviewContainer = document.getElementById('review-history');
  const paginationContainer = document.getElementById('pagination');

  const displayReviews = (page) => {
    reviewContainer.innerHTML = '';
    const startIndex = (page - 1) * reviewsPerPage;
    const endIndex = Math.min(startIndex + reviewsPerPage, reviewData.length);

    for (let i = startIndex; i < endIndex; i++) {
      const review = reviewData[i];
      const card = document.createElement('div');
      card.classList.add('col');
      card.innerHTML = `
          <div class="card h-100">
            <img src="${review.customerPic}" class="card-img-top" alt="Customer Image">
            <div class="card-body">
              <h5 class="card-title">Customer ID: ${review.customerId}</h5>
              <h6 class="card-subtitle mb-2 text-muted">${review.customerName}</h6>
              <p class="card-text">Test Rating: ${review.testRating}</p>
              <p class="card-text">Hygiene Rating: ${review.hygieneRating}</p>
              <p class="card-text">Comment: ${review.comment}</p>
              <div class="form-floating">
                <textarea class="form-control" placeholder="Reply">${review.reply}</textarea>
                <label for="reply">Reply</label>
              </div>
              <button class="btn btn-primary mt-3">Save Reply</button>
            </div>
          </div>
        `;
      reviewContainer.appendChild(card);
    }
  };

  const updatePagination = () => {
    paginationContainer.innerHTML = '';
    const totalPages = Math.ceil(reviewData.length / reviewsPerPage);

    const createPageItem = (page, isActive, isDisabled, text = null) => {
      const li = document.createElement('li');
      li.classList.add('page-item');
      if (isActive) li.classList.add('active');
      if (isDisabled) li.classList.add('disabled');
      const a = document.createElement('a');
      a.classList.add('page-link');
      a.textContent = text || page;
      a.href = '#';
      a.addEventListener('click', (e) => {
        e.preventDefault();
        if (!isDisabled) {
          currentPage = page;
          displayReviews(currentPage);
          updatePagination();
        }
      });
      li.appendChild(a);
      return li;
    };

    paginationContainer.appendChild(
      createPageItem(currentPage - 1, false, currentPage === 1, 'Previous')
    );
    for (let i = 1; i <= totalPages; i++) {
      paginationContainer.appendChild(
        createPageItem(i, currentPage === i, false)
      );
    }
    paginationContainer.appendChild(
      createPageItem(currentPage + 1, false, currentPage === totalPages, 'Next')
    );
  };

  displayReviews(currentPage);
  updatePagination();
});

//Blogger List  --->>>>
document.addEventListener('DOMContentLoaded', function () {
  // Simulated blogger data (replace this with your actual data)
  const bloggerData = [
    {
      customerId: 101,
      bloggerName: 'John Doe',
      channelName: 'Foodie Fun',
      videoTitle: 'Delicious Street Food',
      videoDescription: 'Exploring the best street food in the city...',
      reply: '',
      videoUrl: 'https://www.example.com/video1', // Add actual video URLs
      profileUrl: 'https://www.example.com/profile1', // Add actual profile URLs
    },
    {
      customerId: 102,
      bloggerName: 'Jane Smith',
      channelName: 'Gourmet Adventures',
      videoTitle: 'Top 5 Restaurants',
      videoDescription: 'Ranking the top 5 restaurants in town...',
      reply: '',
      videoUrl: 'https://www.example.com/video2',
      profileUrl: 'https://www.example.com/profile2',
    },
    // Add more blogger objects as needed
    {
      customerId: 103,
      bloggerName: 'Mike Johnson',
      channelName: '',
      videoTitle: 'Homemade Pizza Recipe',
      videoDescription: 'A step-by-step guide to making homemade pizza...',
      reply: '',
      videoUrl: 'https://www.example.com/video3',
      profileUrl: 'https://www.example.com/profile3',
    },
    {
      customerId: 104,
      bloggerName: 'Emily White',
      channelName: 'Tasty Travels',
      videoTitle: 'Exotic Dishes',
      videoDescription: 'Trying out exotic dishes from around the world...',
      reply: '',
      videoUrl: 'https://www.example.com/video4',
      profileUrl: 'https://www.example.com/profile4',
    },
    // More bloggers...
  ];

  const bloggersPerPage = 4;
  let currentBloggerPage = 1;

  const bloggerContainer = document.getElementById('blogger-list');
  const bloggerPaginationContainer =
    document.getElementById('blogger-pagination');

  const displayBloggers = (page) => {
    bloggerContainer.innerHTML = '';
    const startIndex = (page - 1) * bloggersPerPage;
    const endIndex = Math.min(startIndex + bloggersPerPage, bloggerData.length);

    for (let i = startIndex; i < endIndex; i++) {
      const blogger = bloggerData[i];
      const row = document.createElement('tr');
      row.innerHTML = `
          <td>${i + 1}</td>
          <td><a href="${blogger.profileUrl}" target="_blank">${
        blogger.customerId
      }</a></td>
          <td>${blogger.bloggerName}</td>
          <td>${blogger.channelName || 'N/A'}</td>
          <td><a href="${blogger.videoUrl}" target="_blank">${
        blogger.videoTitle
      }</a></td>
          <td>${blogger.videoDescription}</td>

          
        `;
      bloggerContainer.appendChild(row);
    }

    // Add event listeners for editable replies and reply buttons
    const textareas = bloggerContainer.querySelectorAll('textarea');
    const replyButtons = bloggerContainer.querySelectorAll('.btn-reply');

    textareas.forEach((textarea) => {
      textarea.addEventListener('input', (event) => {
        const customerId = event.target.getAttribute('data-id');
        const reply = event.target.value;
        const blogger = bloggerData.find((b) => b.customerId == customerId);
        if (blogger) {
          blogger.reply = reply;
        }
      });
    });

    replyButtons.forEach((button) => {
      button.addEventListener('click', (event) => {
        const customerId = event.target.getAttribute('data-id');
        const blogger = bloggerData.find((b) => b.customerId == customerId);
        if (blogger) {
          alert(
            `Reply sent for Customer ID: ${customerId}\nReply: ${blogger.reply}`
          );
        }
      });
    });
  };

  const updatePagination = (
    container,
    totalPages,
    currentPage,
    onPageChange
  ) => {
    container.innerHTML = '';

    const createPageItem = (page, isActive, isDisabled, text = null) => {
      const li = document.createElement('li');
      li.classList.add('page-item');
      if (isActive) li.classList.add('active');
      if (isDisabled) li.classList.add('disabled');
      const a = document.createElement('a');
      a.classList.add('page-link');
      a.textContent = text || page;
      a.href = '#';
      a.addEventListener('click', (e) => {
        e.preventDefault();
        if (!isDisabled) {
          onPageChange(page);
        }
      });
      li.appendChild(a);
      return li;
    };

    container.appendChild(
      createPageItem(currentPage - 1, false, currentPage === 1, 'Previous')
    );
    for (let i = 1; i <= totalPages; i++) {
      container.appendChild(createPageItem(i, currentPage === i, false));
    }
    container.appendChild(
      createPageItem(currentPage + 1, false, currentPage === totalPages, 'Next')
    );
  };

  const onPageChangeBlogger = (page) => {
    currentBloggerPage = page;
    displayBloggers(currentBloggerPage);
    updatePagination(
      bloggerPaginationContainer,
      Math.ceil(bloggerData.length / bloggersPerPage),
      currentBloggerPage,
      onPageChangeBlogger
    );
  };

  displayBloggers(currentBloggerPage);
  updatePagination(
    bloggerPaginationContainer,
    Math.ceil(bloggerData.length / bloggersPerPage),
    currentBloggerPage,
    onPageChangeBlogger
  );
});
