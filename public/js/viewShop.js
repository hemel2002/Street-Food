document.addEventListener('DOMContentLoaded', function () {
  const foodsPerPage = 3;
  let currentPage = 1;
  const foods = [
    {
      title: 'Nostalgic waves',
      image:
        'https://images.unsplash.com/photo-1565958011703-44f9829ba187?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5NjI0M3wwfDF8c2VhcmNofDl8fGZvb2R8ZW58MHx8fHwxNzIwNzE1NDIyfDA&ixlib=rb-4.0.3&q=80&w=1080',
      description:
        'Ut pretium ultricies dignissim. Sed sit amet mi eget urna placerat vulputate. Ut vulputate est non quam dignissim elementum. Donec a ullamcorper diam.',
      date: '2 days ago',
    },
    {
      title: 'Melodic tunes',
      image:
        'https://images.unsplash.com/photo-1594007654729-407eedc4be65?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5NjI0M3wwfDF8c2VhcmNofDN8fGZvb2R8ZW58MHx8fHwxNzIwNzE1Mzg0fDA&ixlib=rb-4.0.3&q=80&w=1080',
      description:
        'Ut pretium ultricies dignissim. Sed sit amet mi eget urna placerat vulputate. Ut vulputate est non quam dignissim elementum. Donec a ullamcorper diam.',
      date: '5 days ago',
    },
    {
      title: 'Peaceful sounds',
      image:
        'https://images.unsplash.com/photo-1558818498-58c672d81a9c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5NjI0M3wwfDF8c2VhcmNofDEwfHxmb29kfGVufDB8fHx8MTcyMDcyNDk4M3ww&ixlib=rb-4.0.3&q=80&w=1080',
      description:
        'Ut pretium ultricies dignissim. Sed sit amet mi eget urna placerat vulputate. Ut vulputate est non quam dignissim elementum. Donec a ullamcorper diam.',
      date: '1 week ago',
    },
    {
      title: 'Euphoric moments',
      image:
        'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5NjI0M3wwfDF8c2VhcmNofDF8fGVufDB8fHx8MTUyMjc5ODMyOHww&ixlib=rb-4.0.3&q=80&w=1080',
      description:
        'Ut pretium ultricies dignissim. Sed sit amet mi eget urna placerat vulputate. Ut vulputate est non quam dignissim elementum. Donec a ullamcorper diam.',
      date: '2 weeks ago',
    },
    // Add more food objects as needed
  ];

  function displayFoods(page) {
    const start = (page - 1) * foodsPerPage;
    const end = page * foodsPerPage;
    const foodsToShow = foods.slice(start, end);

    const foodsContainer = document.getElementById('foods-container');
    foodsContainer.innerHTML = '';

    foodsToShow.forEach((food) => {
      const foodCard = document.createElement('div');
      foodCard.classList.add('col-lg-4', 'col-md-12', 'mb-4', 'mb-lg-0');
      foodCard.innerHTML = `
                <div class="card card-custom">
                    <div class="bg-image hover-overlay ripple ripple-surface-light" data-ripple-color="light">
                        <img src="${food.image}" class="img-fluid" alt="">
                        <svg class="position-absolute" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" style="left: 0; bottom: 0">
                            <path fill="#fff" d="M0,288L48,272C96,256,192,224,288,192C384,160,480,128,576,128C672,128,768,160,864,176C960,192,1056,192,1152,165.3C1248,139,1344,85,1392,58.7L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                        </svg>
                        <a href="#!">
                            <div class="mask"></div>
                        </a>
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">${food.title}</h5>
                        <p class="card-text">${food.description}</p>
                    </div>
                    <div class="card-footer">
                        <p class="text-muted">Published ${food.date}</p>
                    </div>
                </div>
            `;
      foodsContainer.appendChild(foodCard);
    });
  }

  function setupPagination() {
    const paginationContainer = document.getElementById('foods-pagination');
    paginationContainer.innerHTML = '';

    const totalPages = Math.ceil(foods.length / foodsPerPage);

    for (let i = 1; i <= totalPages; i++) {
      const pageItem = document.createElement('li');
      pageItem.classList.add('page-item', i === currentPage ? 'active' : '');
      pageItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;
      pageItem.addEventListener('click', function (event) {
        event.preventDefault();
        currentPage = i;
        displayFoods(currentPage);
        setupPagination();
      });
      paginationContainer.appendChild(pageItem);
    }
  }

  displayFoods(currentPage);
  setupPagination();
});
