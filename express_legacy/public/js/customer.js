document.addEventListener('DOMContentLoaded', function () {
    // Simulated rating data (replace this with your actual data)
    const ratingData = [
      {
        stallId: 202,
        imageUrl: '../img/All Satll/img-20170711-wa0008-500x500.webp',
        testRating: 7,
        hygieneRating: 8
      },
      {
        stallId: 203,
        imageUrl: '../img/All Satll/img-20170711-wa0008-500x500.webp',
        testRating: 9,
        hygieneRating: 9
      },
      // Add more rating objects as needed
      {
        stallId: 204,
        imageUrl: '../img/All Satll/img-20170711-wa0008-500x500.webp',
        testRating: 6,
        hygieneRating: 7
      },
      {
        stallId: 205,
        imageUrl: '../img/All Satll/img-20170711-wa0008-500x500.webp',
        testRating: 8,
        hygieneRating: 8
      },
      {
        stallId: 206,
        imageUrl: '../img/All Satll/img-20170711-wa0008-500x500.webp',
        testRating: 5,
        hygieneRating: 6
      }
      // More ratings...
    ];
  
    const blogData = [
      {
        blogId: 1,
        imageUrl: '../img/food Item/Bhelpuri.webp',
        title: 'First Blog Post',
        excerpt: 'This is a short description of the first blog post...'
      },
      {
        blogId: 2,
        imageUrl: '../img/Founder/hemal.jpg',
        title: 'Second Blog Post',
        excerpt: 'This is a short description of the second blog post...'
      },
      // Add more blog objects as needed
      {
        blogId: 3,
        imageUrl: '../img/Founder/sakk.jpg',
        title: 'Third Blog Post',
        excerpt: 'This is a short description of the third blog post...'
      },
      {
        blogId: 4,
        imageUrl: '../img/Founder/tush.jpg',
        title: 'Fourth Blog Post',
        excerpt: 'This is a short description of the fourth blog post...'
      },
      {
        blogId: 5,
        imageUrl: '../img/blog/blog5.jpg',
        title: 'Fifth Blog Post',
        excerpt: 'This is a short description of the fifth blog post...'
      }
      // More blogs...
    ];
  
    const ratingsPerPage = 4;
    let currentRatingPage = 1;
    const blogsPerPage = 4;
    let currentBlogPage = 1;
  
    const ratingContainer = document.getElementById('rating-history');
    const ratingPaginationContainer = document.getElementById('rating-pagination');
    const blogContainer = document.getElementById('blogging-history');
    const blogPaginationContainer = document.getElementById('blogging-pagination');
  
    const displayRatings = (page) => {
      ratingContainer.innerHTML = '';
      const startIndex = (page - 1) * ratingsPerPage;
      const endIndex = Math.min(startIndex + ratingsPerPage, ratingData.length);
  
      for (let i = startIndex; i < endIndex; i++) {
        const rating = ratingData[i];
        const card = document.createElement('div');
        card.classList.add('col');
        card.innerHTML = `
          <div class="card h-100">
            <img src="${rating.imageUrl}" class="card-img-top" alt="Stall Image">
            <div class="card-body">
              <h5 class="card-title">Stall ID: ${rating.stallId}</h5>
              <canvas id="rating-chart-${i}" width="400" height="400"></canvas>
              <a href="#" class="btn btn-primary mt-3">View Stall</a>
            </div>
          </div>
        `;
        ratingContainer.appendChild(card);
  
        const ctx = document.getElementById(`rating-chart-${i}`).getContext('2d');
        new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['Test Rating', 'Hygiene Rating'],
            datasets: [{
              label: 'Ratings',
              data: [rating.testRating, rating.hygieneRating],
              backgroundColor: [
                getColorForRating(rating.testRating),
                getColorForRating(rating.hygieneRating)
              ],
              borderColor: [
                getBorderColorForRating(rating.testRating),
                getBorderColorForRating(rating.hygieneRating)
              ],
              borderWidth: 1
            }]
          },
          options: {
            scales: {
              y: {
                beginAtZero: true,
                max: 10
              }
            },
            animation: {
              duration: 2000,
              easing: 'easeInOutQuart'
            }
          }
        });
      }
    };
  
    const displayBlogs = (page) => {
      blogContainer.innerHTML = '';
      const startIndex = (page - 1) * blogsPerPage;
      const endIndex = Math.min(startIndex + blogsPerPage, blogData.length);
  
      for (let i = startIndex; i < endIndex; i++) {
        const blog = blogData[i];
        const card = document.createElement('div');
        card.classList.add('col');
        card.innerHTML = `
          <div class="card h-100">
            <img src="${blog.imageUrl}" class="card-img-top" alt="Blog Image">
            <div class="card-body">
              <h5 class="card-title">${blog.title}</h5>
              <p class="card-text">${blog.excerpt}</p>
              <a href="#" class="btn btn-primary mt-3">Read More</a>
            </div>
          </div>
        `;
        blogContainer.appendChild(card);
      }
    };
  
    const getColorForRating = (rating) => {
      if (rating < 3) {
        return 'rgba(255, 99, 132, 0.2)'; // Red for low rating
      } else if (rating > 7) {
        return 'rgba(75, 192, 192, 0.2)'; // Green for high rating
      } else {
        return 'rgba(255, 206, 86, 0.2)'; // Yellow for medium rating
      }
    };
  
    const getBorderColorForRating = (rating) => {
      if (rating < 3) {
        return 'rgba(255, 99, 132, 1)'; // Red for low rating
      } else if (rating > 7) {
        return 'rgba(75, 192, 192, 1)'; // Green for high rating
      } else {
        return 'rgba(255, 206, 86, 1)'; // Yellow for medium rating
      }
    };
  
    const updatePagination = (container, totalPages, currentPage, onPageChange) => {
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
  
      container.appendChild(createPageItem(currentPage - 1, false, currentPage === 1, 'Previous'));
      for (let i = 1; i <= totalPages; i++) {
        container.appendChild(createPageItem(i, currentPage === i, false));
      }
      container.appendChild(createPageItem(currentPage + 1, false, currentPage === totalPages, 'Next'));
    };
  
    const onPageChangeRating = (page) => {
      currentRatingPage = page;
      displayRatings(currentRatingPage);
      updatePagination(ratingPaginationContainer, Math.ceil(ratingData.length / ratingsPerPage), currentRatingPage, onPageChangeRating);
    };
  
    const onPageChangeBlog = (page) => {
      currentBlogPage = page;
      displayBlogs(currentBlogPage);
      updatePagination(blogPaginationContainer, Math.ceil(blogData.length / blogsPerPage), currentBlogPage, onPageChangeBlog);
    };
  
    displayRatings(currentRatingPage);
    updatePagination(ratingPaginationContainer, Math.ceil(ratingData.length / ratingsPerPage), currentRatingPage, onPageChangeRating);
  
    displayBlogs(currentBlogPage);
    updatePagination(blogPaginationContainer, Math.ceil(blogData.length / blogsPerPage), currentBlogPage, onPageChangeBlog);
  });
  