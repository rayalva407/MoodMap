const map = L.map('map').setView([30, 0], 4);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);
const err = document.querySelector("#error");
const moodSection = document.querySelector("#mood-section")
let currentLocation;

let moods = {
  "happy": "assets/happy.png",
  "sad": "assets/sad.png",
  "angry": "assets/angry.png",
  "afraid": "assets/afraid.png",
  "disgusted": "assets/disgusted.png",
  "surprised": "assets/surprised.png"
}

for (const key in moods) {
  const moodIcon = document.createElement("img");
  moodIcon.className = "mood-icon"
  moodIcon.setAttribute("src", moods[key])
  moodSection.append(moodIcon)
  document.querySelectorAll(".mood-icon");
}

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
  err.innerHTML = "Please allow location permission to add a marker to the mood map";
}

function getMoods() {
  fetch("http://localhost:3000/moods")
  .then(res => res.json())
  .then(data => {
    data.forEach(mood => {
      const icon = L.icon({
        iconUrl: moods[mood.mood_name],
        iconSize: [20, 20]
      });
      const marker = L.marker([mood.latitude, mood.longitude], { icon: icon, riseOnHover: true }).addTo(map).bindPopup(`<h1>${mood.mood_name}</h1><p>${mood.mood_description}</p>`);

      marker.addEventListener("mouseover", e => {
        marker.openPopup();
      })

      marker.addEventListener("mouseout", e => {
        marker.closePopup();
      })

    })
  })
}

// ---------------------------------------------------------------------------------------------
const moodIcons = document.querySelectorAll(".mood-icon")

document.addEventListener("DOMContentLoaded", (event) => {
  getMoods();
  getLocation();
})

moodIcons.forEach((item) => {
  
  item.addEventListener('click', () => {
    const iconPath = item.getAttribute("src");
    const currentMood = Object.keys(moods).find((key) => moods[key] === iconPath);
    const icon = L.icon({
      iconUrl: iconPath,
      iconSize: [35, 35]
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
    let moodDescription = "";

    submitButton.textContent = "Submit";
    descriptionTitle.innerText = "Tell us why you are feeling this way";
    bodyElement.appendChild(formDiv);
    formDiv.appendChild(descriptionTitle);
    formDiv.appendChild(descriptionInput);
    formDiv.appendChild(submitButton);

    descriptionInput.addEventListener("input", (e) => {
      moodDescription = e.target.value;
    })
    
    submitButton.addEventListener('click', () => {
      L.marker(currentLocation, {icon: icon}).addTo(map);

      fetch("http://localhost:3000/moods", {
        method: "POST",
        body: JSON.stringify({
          mood_name: currentMood,
          latitude: currentLocation[0],
          longitude: currentLocation[1],
          mood_description: moodDescription
        }),
        headers: {
          "Content-type": "application/json; charset=UTF-8"
        }
      });

      formDiv.remove();
    })
  });

})

