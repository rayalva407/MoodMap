const map = L.map('map').setView([30, 0], 2);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);
const err = document.querySelector("#error");
const moodIcons = document.querySelectorAll(".mood-icon");
let currentLocation = null;

function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(success, error);
    }
    else {
      err.innerHTML = "Geolocation is not supported by this browser.";
    }

    return location;
}

function success(position) {
    currentLocation = [position.coords.latitude, position.coords.longitude]
    map.setView(currentLocation, 17);
}
  
function error() {
    err.innerHTML = "Please allow location permission to add a marker to the mood map";
}

// ---------------------------------------------------------------------------------------------

getLocation();

moodIcons.forEach((item) => {
  
  item.addEventListener('click', () => {
    const iconPath = item.getAttribute("src");
    const icon = L.icon({
      iconUrl: iconPath,
      iconSize: [20, 20]
    });

    L.marker(currentLocation, {icon: icon}).addTo(map);
  });

})

