const map = L.map('map').setView([30, 0], 4);
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
  
function error(error) {
  console.log(error)
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

    let formDiv = document.getElementById("form-div");

    if (formDiv) {
      formDiv.remove();
    }

    formDiv = document.createElement('div');
    formDiv.setAttribute("id", "form-div")

    const descriptionTitle = document.createElement('h3');
    const descriptionInput = document.createElement('textarea');
    const submitButton = document.createElement("button");
    const bodyElement = document.querySelector('body');
    const moodDescription = descriptionTitle.textContent;

    submitButton.textContent = "Submit";
    descriptionTitle.innerText = "Tell us why you are feeling this way";
    bodyElement.appendChild(formDiv);
    formDiv.appendChild(descriptionTitle);
    formDiv.appendChild(descriptionInput);
    formDiv.appendChild(submitButton);


    
    submitButton.addEventListener('click', () => {
      L.marker(currentLocation, {icon: icon}).addTo(map);

      fetch("http://localhost:3000/moods", {
        method: "POST",
        body: JSON.stringify({
          latitude: currentLocation[0],
          longitude: currentLocation[1],
          moodDescription: moodDescription
        }),
        headers: {
          "Content-type": "application/json; charset=UTF-8"
        }
      });

      formDiv.remove();
    })
  });

})

