document.addEventListener('DOMContentLoaded', () => {
  if (typeof items !== 'undefined') {
    console.log('Array from server:', items);

    // Example usage: dynamically append items to the list
    const fruitsList = document.getElementById('fruits-list');
    items.forEach((item) => {
      const li = document.createElement('li');
      li.textContent = item;
      fruitsList.appendChild(li);
    });
  } else {
    console.error('items is not defined');
  }
});
