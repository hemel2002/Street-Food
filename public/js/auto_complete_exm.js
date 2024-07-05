$(document).ready(function () {
  $('#search-input').on('input', function () {
    let query = $(this).val();
    console.log(`User input: ${query}`); // Log the input

    if (query.length > 2) {
      $.ajax({
        url: '/search', // The search endpoint
        method: 'GET',
        data: { q: query },
        success: function (data) {
          console.log('Search results:', data); // Log the results
          displayResults(data);
        },
        error: function (error) {
          console.log('Error:', error); // Log the error
        },
      });
    } else {
      $('#search-results').empty();
    }
  });

  function displayResults(data) {
    let results = data; // Assume data is already a parsed JSON object
    let resultsList = $('#search-results');
    resultsList.empty();

    results.forEach(function (item) {
      let listItem = $('<li class="list-group-item"></li>').text(item.name);
      resultsList.append(listItem);
    });
  }
});
