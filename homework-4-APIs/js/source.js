// *********************************************************************
// Homework 4 APIs
// *********************************************************************

function convertMsToMinSec(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const paddedSeconds = String(seconds).padStart(2, '0');
  return `${minutes}:${paddedSeconds}`;
}

// **************** Update code below  **************** 


// IDs and secret token should come from Spotify

// These IDs identify the artist, tracks, and albums on Spotify.
localStorage.setItem("artist_id", "73sIBHcqh3Z3NyqHKZ7FOL");
// localStorage.setItem("access_token", "accessToken");
localStorage.setItem("track_id_1", "7ghKr0pCYyPPyp7t1FH8k4");
localStorage.setItem("track_id_2", "5AGQSF0ytihJyt96K5vW9d");
localStorage.setItem("track_id_3", "3vQ4T78TTMOjQXGfXVKQJo");
localStorage.setItem("album_id_1", "5h0KYWMZIg8xT6eRGYkNMh");
localStorage.setItem("album_id_2", "01MRGgNbfWrE291tQjw9ta");
localStorage.setItem("album_id_3", "4JCybsNZUXWrK2Jpyn12Ni");
localStorage.setItem("album_id_4", "7DtpLngwHYD5j0lZlMFuwU");

// This function requests Spotify data and updates the webpage.
//
// "async" allows us to use "await" inside the function.
// "await" pauses this function until an operation finishes.
// It does not freeze the entire browser.
async function load() {
  const artistID = localStorage.getItem("artist_id");
  let accessToken = localStorage.getItem("access_token");
 // If no token is stored, ask the user to enter one.
  if (!accessToken) {
    accessToken = prompt("Paste your Spotify access token here:");

      // Stop if the user clicks Cancel, enters nothing,
    // or enters only spaces.
    //
    // || means "or". If the first condition is true,
    // JavaScript skips the second condition.
    // This avoids calling trim() on null when Cancel is clicked.
    if (!accessToken || !accessToken.trim()) {
      return;
    }
    // Remove accidental spaces from the start and end.
    accessToken = accessToken.trim();
     // Store the token so it does not need to be entered on every refresh.
    // This saves it in the browser, not in your JavaScript source file.
    localStorage.setItem("access_token", accessToken);
  }

  // Group the three track IDs into an array so we can loop through them.
  // Array indexes start at 0: the positions here are 0, 1, and 2.
  const trackIDs = [
    localStorage.getItem("track_id_1"),
    localStorage.getItem("track_id_2"),
    localStorage.getItem("track_id_3")
  ];

  // These four IDs will fill the four album cards in the same order.
  const albumIDs = [
    localStorage.getItem("album_id_1"),
    localStorage.getItem("album_id_2"),
    localStorage.getItem("album_id_3"),
    localStorage.getItem("album_id_4")
  ];
// A reusable helper function for making Spotify requests.
  // "endpoint" is the final part of the URL, such as "tracks/123".
  // Because this function is inside load(), it can access accessToken.
  async function getSpotifyData(endpoint) {
     // fetch() sends an HTTP request. Its default method is GET.
    // await waits for the response to arrive.
    const response = await fetch(
      `https://api.spotify.com/v1/${endpoint}`,
      {
        headers: {
          // The Authorization header sends our token to Spotify.
          // "Bearer " must appear before the token.
          Authorization: `Bearer ${accessToken}`
        }
      }
    );
     // HTTP 401 means the request lacks valid authentication.
    // Remove the rejected token so the next refresh asks for another.
    if (response.status === 401) {
      localStorage.removeItem("access_token");

       // throw stops normal execution and sends this error
      // to the catch block below.
      throw new Error(
        "Your token is invalid or expired. Reload and enter a new token."
      );
    }

    // response.ok is true for HTTP status codes 200–299.
    // fetch() does not automatically throw for HTTP errors,
    // so we check the response ourselves.
    if (!response.ok) {
      throw new Error(
        `Request failed: ${endpoint} (HTTP ${response.status})`
      );
    }

      // Read the response body and parse its JSON into a JavaScript value.
    // Return that data to whichever line called this helper.
    return await response.json();
  }
 // try contains the operations that might fail.
  // If an error occurs, execution jumps to catch.
  try {
    // Request the artist's information and wait for the parsed data.
    const artist = await getSpotifyData(`artists/${artistID}`);

    // # selects an HTML element by its ID.
    // textContent replaces the text inside that element.
    document.querySelector("#artist-name").textContent = artist.name;
    // .artist-image selects a class.
    // The space followed by img selects an image inside that element.
    const artistImage = document.querySelector(".artist-image img");
    // Spotify returns images in an array.
    // Check that an image exists before accessing the first one.
    if (artist.images.length > 0) {
      artistImage.src = artist.images[0].url;
    }

     // alt provides a text description of the image.
    artistImage.alt = artist.name;

    // querySelectorAll() finds every matching element.
    // Here, it returns the three existing track rows in document order.
    const trackElements = document.querySelectorAll(".track");

    // Start at index 0 and repeat until all track IDs are processed.
    // i++ increases i by 1 after each iteration.
    for (let i = 0; i < trackIDs.length; i++) {
      // Request this track's data.
      // Each request finishes before the loop moves to the next track.
      const track = await getSpotifyData(`tracks/${trackIDs[i]}`);
       // Match the current track ID to the row at the same index.
      // trackElements is the whole collection.
      // trackElement is one individual row.
      const trackElement = trackElements[i];
       // Search only inside this row for its image.
      const trackImage = trackElement.querySelector("img");

       // Track data includes an album object, which contains its artwork.
      if (track.album.images.length > 0) {
        trackImage.src = track.album.images[0].url;
      }

      trackImage.alt = track.album.name;

            // Fill this row with the song title.
      trackElement.querySelector(".track-title").textContent =
        track.name;

        // Fill in the name of the album containing this song.
      trackElement.querySelector(".track-album").textContent =
        track.album.name;

        // This is the song's position on its album.
      // It is different from the row's displayed rank of 1, 2, or 3.
      trackElement.querySelector(".track-number").textContent =
        track.track_number;

        // Convert Spotify's milliseconds into a readable duration.
      trackElement.querySelector(".track-duration").textContent =
        convertMsToMinSec(track.duration_ms);
    }

    // Find the four existing album cards.
    const albumElements = document.querySelectorAll(".album-card");

    // Process each album ID and update its matching card.
    for (let i = 0; i < albumIDs.length; i++) {
      const album = await getSpotifyData(`albums/${albumIDs[i]}`);
      // Select the current card and the image inside it.
      const albumElement = albumElements[i];
      const albumImage = albumElement.querySelector("img");

    
      if (album.images.length > 0) {
        albumImage.src = album.images[0].url;
      }

      albumImage.alt = album.name;

      albumElement.querySelector("h3").textContent = album.name;

      const albumType =
        album.album_type.charAt(0).toUpperCase() +
        album.album_type.slice(1);

      albumElement.querySelector("p").textContent =
        `${album.release_date} • ${albumType}`;
    }
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
}

load();