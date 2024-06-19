import { GeocoderAutocomplete } from '@geoapify/geocoder-autocomplete';

// Initialize the autocomplete
const autocomplete = new GeocoderAutocomplete(
  document.getElementById('autocomplete'),
  '7fa23b5a9b194102a9be9a11ce64a57c',
  {
    /* Geocoder options */
  }
);

// Handle selection event
autocomplete.on('select', (location) => {
  // Handle selected location here
  console.log(location);
});
