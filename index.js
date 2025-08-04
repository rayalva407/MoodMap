const map = L.map('map').setView([30, 0], 3);
const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  detectRetina: true
}).addTo(map);

const err = document.querySelector("#error");
const moodSection = document.querySelector("#mood-section");
const loader = document.querySelector(".loader");
let currentLocation;
const locateBtn = document.getElementById('locate-btn');
const permissionPrompt = document.getElementById('permission-prompt');
const enableLocationBtn = document.getElementById('enable-location');
const cancelLocationBtn = document.getElementById('cancel-location');
let locationPermissionRequested = false;

function isAppleDevice() {
  if (navigator.userAgentData) {
    return navigator.userAgentData.brands.some(brand =>
      brand.brand.includes('Apple') ||
      brand.brand.includes('Safari')
    );
  }

  const ua = navigator.userAgent;
  return /(iPhone|iPod|iPad|Macintosh|Mac OS X)/i.test(ua);
}

function isIOS() {
  if (!isAppleDevice()) return false;

  const isTouchDevice = 'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator.msMaxTouchPoints && navigator.msMaxTouchPoints > 0);

  const ua = navigator.userAgent;
  const isIPhone = /iPhone|iPod/i.test(ua);
  const isIPad = /iPad/i.test(ua);

  const isDesktopIPad = /Macintosh/i.test(ua) && isTouchDevice;

  return isIPhone || isIPad || isDesktopIPad;
}


function isMacOS() {
  if (!isAppleDevice()) return false;

  const ua = navigator.userAgent;
  const isMac = /Macintosh|Mac OS X/i.test(ua);

  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  return isMac && !isTouchDevice;
}

function fixAppleMapRendering() {
  if (isIOS() || isMacOS()) {
    // Use requestAnimationFrame for better timing
    requestAnimationFrame(() => {
      map.invalidateSize();
      requestAnimationFrame(() => {
        map.invalidateSize();
      });
    });
  }
}

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
    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };
    loader.style.display = "block";

    navigator.geolocation.getCurrentPosition(
      success,
      error,
      options
    );
  } else {
    err.innerHTML = "Geolocation is not supported by this browser.";
    loader.style.display = "none";

    if (isIOS()) {
      err.innerHTML += " Please enable location services in Settings > Privacy.";
    }
  }
}

function success(position) {
  currentLocation = [position.coords.latitude, position.coords.longitude];
  map.setView(currentLocation, 13);
  loader.style.display = "none";
}

function error(error) {
  loader.style.display = "none";

  if (isIOS()) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        err.innerHTML = "Location permission denied. Please enable it in Settings > Privacy > Location Services.";
        break;
      case error.POSITION_UNAVAILABLE:
        err.innerHTML = "Location services are unavailable on this iOS device.";
        break;
      case error.TIMEOUT:
        err.innerHTML = "Location request timed out. Please check your internet connection.";
        break;
      default:
        err.innerHTML = "Location error on iOS device.";
    }
    return;
  }

  if (isMacOS()) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        err.innerHTML = "Location permission denied. Please check Safari preferences.";
        break;
      default:
        err.innerHTML = "Location error on macOS.";
    }
    return;
  }

  switch (error.code) {
    case error.PERMISSION_DENIED:
      err.innerHTML = "Location permission denied.";
      break;
    case error.POSITION_UNAVAILABLE:
      err.innerHTML = "Location information unavailable.";
      break;
    case error.TIMEOUT:
      err.innerHTML = "Location request timed out.";
      break;
    case error.UNKNOWN_ERROR:
      err.innerHTML = "Unknown location error.";
      break;
  }
}

function showPermissionPrompt() {
  permissionPrompt.style.display = "flex";
}

function hidePermissionPrompt() {
  permissionPrompt.style.display = "none";
}

// Load existing moods
function getMoods() {
  loader.style.display = "block";
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

        loader.style.display = "none";

        marker.addEventListener("mouseover", e => {
          marker.openPopup();
        })

        marker.addEventListener("mouseout", e => {
          marker.closePopup();
        })

      })
    })
    .catch(error => {
      console.error('Error fetching moods:', error);
      err.innerHTML = "Failed to load mood data";
      loader.style.display = "none";
    });
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", (event) => {
  if (isIOS()) {
    document.body.classList.add('ios-device');
  }
  else if (isMacOS()) {
    document.body.classList.add('macos-device');
  }

  // Fix iOS map rendering issues
  fixAppleMapRendering();

  // Load data
  getMoods();

  // Get location after a short delay
  setTimeout(() => {
    getLocation();
  }, 500);

  // Add event listeners for permission buttons
  enableLocationBtn.addEventListener('click', () => {
    hidePermissionPrompt();
    getLocation();
  });

  cancelLocationBtn.addEventListener('click', hidePermissionPrompt);
});

const moodIcons = document.querySelectorAll(".mood-icon");

locateBtn.addEventListener('click', () => {
  if (isIOS()) {
    loader.style.display = "block";
  }

  if (currentLocation) {
    map.setView(currentLocation, 13);
  } else {
    getLocation();
  }

  // Additional iOS fix
  if (isIOS()) {
    setTimeout(() => {
      map.invalidateSize();
    }, 300);
  }
});

document.addEventListener('focusin', function () {
  if (isIOS()) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});

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

      if (isIOS() || isMacOS()) {
        // Force map re-render on iOS after adding marker
        setTimeout(() => {
          map.invalidateSize();
        }, 300);
      }

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