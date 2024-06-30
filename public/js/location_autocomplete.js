var apiKey = '7fa23b5a9b194102a9be9a11ce64a57c'; // Replace with your Geoapify API key

var locationInput = document.getElementById('locationInput');
var suggestionsContainer = document.getElementById('suggestions');

locationInput.addEventListener('input', function () {
  var input = this.value;
  if (input.trim() === '') {
    clearSuggestions();
    return;
  }
  fetchSuggestions(input);
});

function fetchSuggestions(input) {
  var url =
    'https://api.geoapify.com/v1/geocode/autocomplete?text=' +
    encodeURIComponent(input) +
    '&apiKey=' +
    apiKey;

  axios
    .get(url)
    .then(function (response) {
      displaySuggestions(response.data.features);
    })
    .catch(function (error) {
      console.error('Error fetching suggestions:', error);
    });
}

function displaySuggestions(suggestions) {
  suggestionsContainer.innerHTML = '';

  suggestions.forEach(function (suggestion) {
    var suggestionText = suggestion.properties.formatted;
    var suggestionItem = document.createElement('div');
    suggestionItem.textContent = suggestionText;
    suggestionItem.classList.add('suggestion');
    suggestionItem.addEventListener('click', function () {
      locationInput.value = suggestionText;
      clearSuggestions();
    });
    suggestionsContainer.appendChild(suggestionItem);
  });
}

function clearSuggestions() {
  suggestionsContainer.innerHTML = '';
}
