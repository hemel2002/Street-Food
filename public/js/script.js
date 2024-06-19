function addressAutocomplete(containerElement) {
  var inputElement = document.createElement('input');
  inputElement.setAttribute('type', 'text');
  inputElement.setAttribute('placeholder', 'Enter an address here');
  containerElement.appendChild(inputElement);

  /* Active request promise reject function. To be able to cancel the promise when a new request comes */
  var currentPromiseReject;

  /* Execute a function when someone writes in the text field: */
  inputElement.addEventListener('input', function (e) {
    var currentValue = this.value;

    // Cancel previous request promise
    if (currentPromiseReject) {
      currentPromiseReject({
        canceled: true,
      });
    }

    if (!currentValue) {
      return false;
    }

    /* Create a new promise and send geocoding request */
    var promise = new Promise((resolve, reject) => {
      currentPromiseReject = reject;

      var apiKey = '47f523a46b944b47862e39509a7833a9';
      var url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
        currentValue
      )}&limit=5&apiKey=${apiKey}`;

      fetch(url).then((response) => {
        // check if the call was successful
        if (response.ok) {
          response.json().then((data) => resolve(data));
        } else {
          response.json().then((data) => reject(data));
        }
      });
    });

    promise.then(
      (data) => {
        // we will process data here
      },
      (err) => {
        if (!err.canceled) {
          console.log(err);
        }
      }
    );
  });
}
addressAutocomplete(document.getElementById('autocomplete-container'));
