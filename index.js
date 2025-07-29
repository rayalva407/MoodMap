const map = L.map('map').setView([30, 0], 3);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

const err = document.querySelector("#error");
const moodSection = document.querySelector("#mood-section");
const loader = document.querySelector(".loader");
let currentLocation;

// Mood icons
let moods = {
  "happy": "assets/happy.png",
  "sad": "assets/sad.png",
  "angry": "assets/angry.png",
  "afraid": "assets/afraid.png",
  "disgusted": "assets/disgusted.png",
  "surprised": "assets/surprised.png"
}

// Create mood icons
for (const key in moods) {
  const moodIcon = document.createElement("img");
  moodIcon.className = "mood-icon";
  moodIcon.setAttribute("src", moods[key]);
  moodIcon.setAttribute("alt", key + " mood");
  moodIcon.setAttribute("title", key.charAt(0).toUpperCase() + key.slice(1));
  moodSection.append(moodIcon);
}

// Get user location
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(success, error);
  } else {
    err.innerHTML = "Geolocation is not supported by this browser.";
  }
}

function success(position) {
  currentLocation = [position.coords.latitude, position.coords.longitude];
  map.setView(currentLocation, 13);
}

function error(error) {
  err.innerHTML = "Please allow location permission to add a marker to the mood map";
}

// Load existing moods
function getMoods() {
  fetch("https://safe-cliffs-04944-45eff5e74913.herokuapp.com/moods")
    .then(res => res.json())
    .then(data => {
      data.forEach(mood => {
        const icon = L.icon({
          iconUrl: moods[mood.mood_name],
          iconSize: [20, 20]
        });
        const marker = L.marker([mood.latitude, mood.longitude], { icon: icon, riseOnHover: true })
          .addTo(map)
          .bindPopup(`<h3>${mood.mood_name[0].toUpperCase() + mood.mood_name.substring(1)}</h3><p>${mood.mood_description}</p>`, { closeButton: false, className: "popup" });

        marker.addEventListener("mouseover", e => {
          marker.openPopup();
        })

        marker.addEventListener("mouseout", e => {
          marker.closePopup();
        })

      })
    })
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", (event) => {
  getMoods();
  getLocation();
});

// Mood selection functionality
const moodIcons = document.querySelectorAll(".mood-icon");

moodIcons.forEach((item) => {
  item.addEventListener('click', () => {
    // Reset active state for all icons
    moodIcons.forEach(icon => icon.classList.remove('active'));
    // Set active state for clicked icon
    item.classList.add('active');

    const iconPath = item.getAttribute("src");
    const currentMood = Object.keys(moods).find((key) => moods[key] === iconPath);

    // Remove existing form if present
    let formDiv = document.getElementById("form-div");
    if (formDiv) {
      formDiv.remove();
    }

    // Create form
    formDiv = document.createElement('div');
    formDiv.setAttribute("id", "form-div");

    const descriptionTitle = document.createElement('h3');
    const descriptionInput = document.createElement('textarea');
    const submitButton = document.createElement("button");
    const closeButton = document.createElement("button");

    closeButton.textContent = "Cancel";
    closeButton.className = "btn-cancel";

    submitButton.textContent = "Submit";
    descriptionTitle.innerText = "Why are you feeling this way?";
    descriptionInput.placeholder = "Share what's making you feel this emotion...";

    formDiv.appendChild(descriptionTitle);
    formDiv.appendChild(descriptionInput);
    formDiv.appendChild(submitButton);
    formDiv.appendChild(closeButton);

    document.querySelector('.controls-section').appendChild(formDiv);

    let moodDescription = "";

    descriptionInput.addEventListener("input", (e) => {
      moodDescription = e.target.value;
    });

    // Cancel button handler
    closeButton.addEventListener('click', () => {
      formDiv.remove();
      item.classList.remove('active');
    });

    // Submit button handler
    submitButton.addEventListener('click', () => {
      fetch("https://safe-cliffs-04944-45eff5e74913.herokuapp.com/moods", {
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

      if (!currentLocation) {
        err.innerHTML = "Unable to get your location. Please try again.";
        return;
      }

      if (!moodDescription.trim()) {
        err.innerHTML = "Please describe why you're feeling this way";
        return;
      }

      // Create marker
      const icon = L.icon({
        iconUrl: iconPath,
        iconSize: [36, 36]
      });

      const marker = L.marker(currentLocation, { icon: icon })
        .addTo(map)
        .bindPopup(`
                            <div class="popup-content">
                                <h3>${currentMood[0].toUpperCase() + currentMood.substring(1)}</h3>
                                <p>${moodDescription}</p>
                            </div>
                        `, {
          closeButton: false,
          className: "popup",
          maxWidth: 250
        });

      marker.addEventListener("mouseover", e => {
        marker.openPopup();
      });

      marker.addEventListener("mouseout", e => {
        marker.closePopup();
      });

      // Show success message
      err.innerHTML = "Your mood has been added to the map!";
      err.style.color = "#27ae60";

      // Reset after delay
      setTimeout(() => {
        err.innerHTML = "";
        err.style.color = "#e74c3c";
      }, 3000);

      formDiv.remove();
      item.classList.remove('active');
    });
  });
});