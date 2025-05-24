function getLocation() {
    if (navigator.geolocation) {
      const location = navigator.geolocation.getCurrentPosition(success, error);
    }
    else {
      err.innerHTML = "Geolocation is not supported by this browser.";
    }

    return location;
}

function success(position) {
    let location = [position.coords.latitude, position.coords.longitude]

    map.setView(location, 17);

    return location
}
  
function error() {
    err.innerHTML = "Please allow location permission to add a marker to the mood map";
}

// ---------------------------------------------------------------------------------------------


const map = L.map('map').setView([30, 0], 2);
const err = document.querySelector("#error");

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);

const currentLocation = getLocation();

const myIcon = L.icon({
    iconUrl: "./assets/icons8-happy-face-48.png",
    iconSize: [20, 20]
});

L.marker([50.505, 30.57], {icon: myIcon}).addTo(map);



