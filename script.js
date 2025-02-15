async function getSongs() {
  try {
    // Fetch the HTML from the server
    let a = await fetch("http://127.0.0.1:3000/songs/");
    let response = await a.text();

    // Create a div and set its innerHTML to the fetched HTML
    let div = document.createElement("div");
    div.innerHTML = response;

    // Extract .mp3 links
    let as = div.getElementsByTagName("a");
    let songs = [];
    for (let index = 0; index < as.length; index++) {
      const element = as[index];
      if (element.href.endsWith(".mp3")) {
        songs.push(element.href.split("/songs/")[1]);
      }
    }
    return songs;
  } catch (error) {
    console.error("Error fetching or processing data:", error);
    return [];
  }
}

async function main() {
  let currentSong = null; // Keep track of the current song
  let audio = null; // Single Audio instance to avoid overlapping
  let songindex = 0;
  let songs = await getSongs();
  console.log(songs);

  function convertToTimeFormat(seconds) {
    // Calculate minutes and seconds
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = Math.floor(seconds % 60);

    // Pad minutes and seconds with leading zeros if needed
    let formattedMinutes = minutes.toString().padStart(2, '0');
    let formattedSeconds = remainingSeconds.toString().padStart(2, '0');

    // Return the formatted string
    return `${formattedMinutes}:${formattedSeconds}`;
  }

  if (!songs || songs.length === 0) {
    console.log("No songs found!");
    return;
  }

  let songUl = document.querySelector(".songlist ul");
  if (!songUl) {
    console.error("The song list container is missing!");
    return;
  }

  function cleanSongName(songName) {
    // Decode percent-encoded characters and clean up the name
    return decodeURIComponent(songName)
      .replace(/[^\w\s\.-]/g, "")
      .trim();
  }

  // Populate the song list
  for (const element of songs) {
    let cleanName = cleanSongName(element);
    songUl.innerHTML += `<li title="${cleanName}">${cleanName}</li>`;
  }

  // Add event listeners to each list item
  Array.from(songUl.getElementsByTagName("li")).forEach((e, index) => {
    e.addEventListener("click", () => {
      let selectedSong = songs[index]; // Get the song corresponding to the clicked list item

      if (audio) {
        audio.pause(); // Pause the currently playing song
        audio.currentTime = 0; // Reset playback
      }

      // Play the selected song
      currentSong = selectedSong;
      audio = new Audio(`/songs/${currentSong}`);
      audio.play();
      console.log(`Now playing: ${currentSong}`);
      document.querySelector(".songinfo").innerHTML = `${currentSong}`;
      document.querySelector(".songtime").innerHTML = "00:00 / 00:00"; // Reset time to "00:00 / 00:00"
      
      // Update the time for this song
      audio.addEventListener("timeupdate", () => {
        let currentTime = convertToTimeFormat(audio.currentTime);
        let totalTime = convertToTimeFormat(audio.duration);
        document.querySelector(".songtime").innerHTML = `${currentTime} / ${totalTime}`;

        // Ensure circle element exists before updating
        let circle = document.querySelector('.circle');  // Make sure to adjust the selector to your circle element
        if (circle && audio.duration > 0) {
          let progressPercentage = (audio.currentTime / audio.duration) * 100;
          circle.style.left = `${progressPercentage}%`;  // Move the circle based on progress
        }
      });
    });
  });

  let play = document.getElementById("playbtn");
  let previous = document.getElementById("previousbtn");
  let next = document.getElementById("nextbtn");

  // Add event listeners to the play button
  play.addEventListener("click", () => {
    if (audio && audio.paused) {
      // Check if audio exists and is paused
      audio.play();
      play.src = "play-circle-stroke-rounded.svg"; // Change to your "playing" icon
      console.log("song play now");
    } else if (audio) {
      audio.pause();
      play.src = "pause.svg"; // Change to your "paused" icon
      console.log("song paused");
    } else {
      console.log("No audio object available.");
    }
  });

  if (!currentSong) {
    currentSong = songs[songindex]; // Select the first song
    audio = new Audio(`/songs/${currentSong}`);
    audio.play();
    console.log(`Now playing: ${currentSong}`);
    play.src = "play-circle-stroke-rounded.svg"; // Change to your "playing" icon

    document.querySelector(".songinfo").innerHTML = `${currentSong}`;
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"; // Reset time to "00:00 / 00:00"
    
    // Update the time for this song
    audio.addEventListener("timeupdate", () => {
      let currentTime = convertToTimeFormat(audio.currentTime);
      let totalTime = convertToTimeFormat(audio.duration);
      document.querySelector(".songtime").innerHTML = `${currentTime} / ${totalTime}`;

      // Ensure circle element exists before updating
      let circle = document.querySelector('.circle');
      if (circle && audio.duration > 0) {
        let progressPercentage = (audio.currentTime / audio.duration) * 100;
        circle.style.left = `${progressPercentage}%`;  // Move the circle based on progress
      }
    });
  }

  // Previous song logic
  previous.addEventListener("click", () => {
    if (songindex <= 0) {
      alert("No previous song available");
    } else {
      songindex -= 1;
      if (audio) {
        audio.pause();
      }
      currentSong = songs[songindex];
      audio = new Audio(`/songs/${currentSong}`);
      audio.play();
      console.log("play previous song");

      document.querySelector(".songinfo").innerHTML = `${currentSong}`;
      document.querySelector(".songtime").innerHTML = "00:00 / 00:00"; // Reset time to "00:00 / 00:00"
      
      // Update the time for this song
      audio.addEventListener("timeupdate", () => {
        let currentTime = convertToTimeFormat(audio.currentTime);
        let totalTime = convertToTimeFormat(audio.duration);
        document.querySelector(".songtime").innerHTML = `${currentTime} / ${totalTime}`;

        // Ensure circle element exists before updating
        let circle = document.querySelector('.circle');
        if (circle && audio.duration > 0) {
          let progressPercentage = (audio.currentTime / audio.duration) * 100;
          circle.style.left = `${progressPercentage}%`;  // Move the circle based on progress
        }
      });
    }
  });

  // Next song logic
  next.addEventListener("click", () => {
    if (songindex >= songs.length - 1) {
      alert("No next song available");
    } else {
      songindex += 1;
      if (audio) {
        audio.pause();
      }
      currentSong = songs[songindex];
      audio = new Audio(`/songs/${currentSong}`);
      audio.play();
      console.log("play next song");

      document.querySelector(".songinfo").innerHTML = `${currentSong}`;
      document.querySelector(".songtime").innerHTML = "00:00 / 00:00"; // Reset time to "00:00 / 00:00"
      
      // Update the time for this song
      audio.addEventListener("timeupdate", () => {
        let currentTime = convertToTimeFormat(audio.currentTime);
        let totalTime = convertToTimeFormat(audio.duration);
        document.querySelector(".songtime").innerHTML = `${currentTime} / ${totalTime}`;

        // Ensure circle element exists before updating
        let circle = document.querySelector('.circle');
        if (circle && audio.duration > 0) {
          let progressPercentage = (audio.currentTime / audio.duration) * 100;
          circle.style.left = `${progressPercentage}%`;  // Move the circle based on progress
        }
      });
    }
  });

  // add event on the hamburger to show the left menu bar
  document.querySelector('.menu').addEventListener('click',()=>{
    document.querySelector('.left').style.left = '0';
  })

  // add event into the close button to close the left ment
  document.querySelector('.closebtn').addEventListener('click',()=>{
    document.querySelector('.left').style.left = '-120% ';
  })
}

main();
