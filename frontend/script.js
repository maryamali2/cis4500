// Sample data to simulate backend responses
const sampleRoutes = [
  {
    id: 1,
    distance: 500,
    averageRating: 4.5,
    cities: [
      { id: 1, name: 'City A', latitude: 40.7128, longitude: -74.0060 },
      { id: 2, name: 'City B', latitude: 41.8781, longitude: -87.6298 },
      { id: 3, name: 'City C', latitude: 34.0522, longitude: -118.2437 },
    ],
  },
  {
    id: 2,
    distance: 600,
    averageRating: 4.2,
    cities: [
      { id: 4, name: 'City D', latitude: 29.7604, longitude: -95.3698 },
      { id: 5, name: 'City E', latitude: 39.7392, longitude: -104.9903 },
    ],
  },
];

const sampleAttractions = {
  1: [
    { name: 'Attraction A1', category: 'Active Life', rating: 4.7 },
    { name: 'Attraction A2', category: 'Arts & Entertainment', rating: 4.5 },
  ],
  2: [
    { name: 'Attraction B1', category: 'Food', rating: 4.6 },
    { name: 'Attraction B2', category: 'Nightlife', rating: 4.2 },
  ],
  3: [
    { name: 'Attraction C1', category: 'Outdoors', rating: 4.8 },
    { name: 'Attraction C2', category: 'Shopping', rating: 4.3 },
  ],
  // ... Add attractions for other cities
};

// Handle form submission on Home Page
const travelForm = document.getElementById('travel-form');
if (travelForm) {
  travelForm.addEventListener('submit', function (event) {
    event.preventDefault();
    // Get form data
    const startCity = document.getElementById('start-city').value;
    const endCity = document.getElementById('end-city').value;
    const maxCities = document.getElementById('max-cities').value;
    const categories = Array.from(
      document.getElementById('categories').selectedOptions
    ).map((option) => option.value);

    // Save data to localStorage to pass to Routes Page
    const formData = {
      startCity,
      endCity,
      maxCities,
      categories,
    };
    localStorage.setItem('formData', JSON.stringify(formData));

    // Redirect to Routes Page
    window.location.href = 'routes.html';
  });
}

// Load routes and handle interactions on Routes Page
const routesList = document.getElementById('routes');
if (routesList) {
  // Retrieve form data
  const formData = JSON.parse(localStorage.getItem('formData'));

  // Simulate route generation based on form data
  let routes = sampleRoutes; // In real application, this would be fetched based on formData

  // Function to display routes
  function displayRoutes() {
    routesList.innerHTML = '';
    routes.forEach((route) => {
      const li = document.createElement('li');
      li.textContent = `Route ${route.id}: ${route.cities
        .map((city) => city.name)
        .join(' → ')} (Distance: ${route.distance} miles, Avg Rating: ${
        route.averageRating
      })`;
      li.addEventListener('click', () => showRouteDetails(route));
      routesList.appendChild(li);
    });
  }

  // Handle sorting/filtering
  const filterSelect = document.getElementById('filter');
  filterSelect.addEventListener('change', function () {
    if (this.value === 'distance') {
      routes.sort((a, b) => a.distance - b.distance);
    } else if (this.value === 'rating') {
      routes.sort((a, b) => b.averageRating - a.averageRating);
    }
    displayRoutes();
  });

  displayRoutes();

  // Show route details
  const routeDetailsSection = document.getElementById('route-details');
  const routeListSection = document.getElementById('route-list');
  const backToRoutesButton = document.getElementById('back-to-routes');
  const citiesInfoDiv = document.getElementById('cities-info');

  function showRouteDetails(route) {
    routeListSection.style.display = 'none';
    routeDetailsSection.style.display = 'block';
    citiesInfoDiv.innerHTML = '';

    route.cities.forEach((city) => {
      const cityPanel = document.createElement('div');
      cityPanel.classList.add('city-panel');

      const cityTitle = document.createElement('h3');
      cityTitle.textContent = city.name;
      cityPanel.appendChild(cityTitle);

      const cityInfo = document.createElement('p');
      cityInfo.textContent = `Latitude: ${city.latitude}, Longitude: ${city.longitude}`;
      cityPanel.appendChild(cityInfo);

      // Attractions
      const attractionsDiv = document.createElement('div');
      attractionsDiv.classList.add('attractions');

      const attractionsTitle = document.createElement('h4');
      attractionsTitle.textContent = 'Attractions:';
      attractionsDiv.appendChild(attractionsTitle);

      const attractionsList = document.createElement('ul');
      const attractions = sampleAttractions[city.id] || [];
      attractions.forEach((attraction) => {
        const attractionItem = document.createElement('li');
        attractionItem.textContent = `${attraction.name} (Category: ${attraction.category}, Rating: ${attraction.rating})`;
        attractionsList.appendChild(attractionItem);
      });

      attractionsDiv.appendChild(attractionsList);
      cityPanel.appendChild(attractionsDiv);

      citiesInfoDiv.appendChild(cityPanel);
    });
  }

  backToRoutesButton.addEventListener('click', () => {
    routeDetailsSection.style.display = 'none';
    routeListSection.style.display = 'block';
  });
}
