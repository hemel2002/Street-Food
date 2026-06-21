let foodData = [];
const urlParams = new URLSearchParams(window.location.search);
const sellerId = urlParams.get('id');
const url = `http://localhost:3000/home/ViewShop?id=${sellerId}&responseType=json`;

document.addEventListener('DOMContentLoaded', () => {
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (Array.isArray(data.viewshop)) {
        foodData = data.viewshop;
        initializePagination();
      } else {
        console.error('Expected an array but got:', data);
      }
    })
    .catch((error) => console.error('Error fetching data:', error));
});

function initializePagination() {
  const itemsPerPage = 3;
  let currentPage = 1;
  const totalPages = Math.ceil(foodData.length / itemsPerPage);

  const foodCardsContainer = document.getElementById('food-cards');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const pageNumbers = document.getElementById('page-numbers');

  function renderFoodItems() {
    foodCardsContainer.innerHTML = '';
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const itemsToRender = foodData.slice(start, end);

    itemsToRender.forEach((item) => {
      const foodCard = document.createElement('div');
      foodCard.classList.add('col-lg-4', 'col-md-12', 'mb-4', 'mb-lg-0');
      foodCard.innerHTML = `
        <div class="card card-custom">
          <div class="bg-image hover-overlay ripple ripple-surface-light" data-ripple-color="light">
            <img src="${item.FOOD_PIC}" class="img-fluid" alt="" loading="lazy">
            <svg class="position-absolute" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" style="left: 0; bottom: 0">
              <path fill="#fff" d="M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,250.7C1248,256,1344,288,1392,304L1440,320L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            </svg>
          </div>
          <div class="card-body">
            <h5 class="card-title">${item.FOOD_NAME}</h5>
            <section class="p-4 d-flex justify-content-center text-center w-100">
              <ul class="rating">
                ${'<li><i class="fa-star fa-sm far" style="color: rgb(103, 58, 183);"></i></li>'.repeat(
                  item.RATING
                )}
              </ul>
            </section>
            <p class="card-text">${item.INGREDIENT}</p>
            <a href="#!" class="btn btn-primary">Details</a>
          </div>
        </div>
      `;
      foodCardsContainer.appendChild(foodCard);
    });
  }

  function renderPaginationControls() {
    pageNumbers.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
      const pageNumber = document.createElement('span');
      pageNumber.textContent = i;
      pageNumber.classList.add('btn', 'btn-outline-primary');
      if (i === currentPage) {
        pageNumber.classList.add('active');
      }
      pageNumber.addEventListener('click', () => {
        currentPage = i;
        updatePagination();
      });
      pageNumbers.appendChild(pageNumber);
    }
  }

  function updatePagination() {
    renderFoodItems();
    renderPaginationControls();
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
  }

  prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      updatePagination();
    }
  });

  nextBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      updatePagination();
    }
  });

  // Initial render
  updatePagination();
}
