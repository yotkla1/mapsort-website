// This project is based on NEARBY

let map;
let service;
let infowindow;

const inputMinRating = document.getElementById("insertMinRating");
const inputMinTotalRatings = document.getElementById("insertMinTotalRatings");
const inputRadius = document.getElementById("insertRadius");
const inputSearch = document.getElementById("searchTextField");

function enterParameters() {
  inputRadius.focus();
  inputRadius.placeholder = "Please enter a search radius (meters)";

  inputRadius.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      inputMinRating.focus();
      inputMinRating.placeholder = "Please enter minimum rating (0-5)";
    }
  });

  inputMinRating.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      inputMinTotalRatings.focus();
      inputMinTotalRatings.placeholder = "Please enter minimum total ratings";
    }
  });

  inputMinTotalRatings.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      inputSearch.disabled = false;
      inputSearch.style.opacity = 1;
      inputSearch.focus();
    }
  });
}

function initialize() {
  const pyrmont = new google.maps.LatLng(-33.8665433, 151.195663);

  map = new google.maps.Map(document.getElementById("map"), {
    center: pyrmont,
    zoom: 15,
    mapId: "DEMO_MAP_ID",
  });

  inputSearch.disabled = true;
  inputSearch.style.opacity = 0;

  let autocomplete = new google.maps.places.Autocomplete(inputSearch);
  autocomplete.bindTo("bounds", map);

  google.maps.event.addListener(autocomplete, "place_changed", () => {
    let place = autocomplete.getPlace();
    if (place.geometry.viewport) {
      map.fitBounds(place.geometry.viewport);
    } else {
      map.setCenter(place.geometry.location);
      map.setZoom(17);
    }
    let request = {
      location: place.geometry.location,
      radius: inputRadius.value.toString(),
      type: ["restaurant"],
      fields: ["name", "rating", "user_ratings_total"],
    };
    service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, callback);
  });
}

function callback(results, status) {
  if (status === google.maps.places.PlacesServiceStatus.OK) {
    for (let i = 0; i < results.length; i++) {
      const place = results[i];
      const name = place.name;
      const rating = place.rating;
      const totalRatings = place.user_ratings_total;
      const labelText = `${name} | ${rating} (${totalRatings})`;
      if (
        totalRatings >= inputMinTotalRatings.value &&
        rating >= inputMinRating.value
      )
        createMarker(results[i], labelText);
    }
  }
}

async function createMarker(place, labelText) {
  const marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location,
    icon: {
      url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
      labelOrigin: new google.maps.Point(labelText.length * 4, 32),
      size: new google.maps.Size(32, 32),
      anchor: new google.maps.Point(16, 32),
    },
    label: {
      text: labelText,
      color: "#C70E20",
      fontWeight: "bold",
    },
  });

  //   google.maps.event.addListener(marker, "click", function () {
  //     alert(place.name);
  //     window.open(place.photos[0].getUrl(), "_blank");
  //   });
  // }

  google.maps.event.addListener(marker, "click", function () {
    const placeId = place.place_id;
    if (placeId) {
      const restaurantUrl = `https://www.google.com/maps/place/?q=place_id:${placeId}`;
      window.open(restaurantUrl, "_blank");
    }
  });
}

addEventListener("load", () => {
  enterParameters();
  initialize();
});
