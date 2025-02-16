let currfolder;
let songs = [];
let currentSong = null;
let audio = null;
let songindex = 0;

async function getSongs(folder) {
  try {
    currfolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/${currfolder}`);
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;

    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
      const element = as[index];
      if (element.href.endsWith(".mp3")) {
        songs.push(element.href.split(`${currfolder}`)[1]);
      }
    }

    // Call function to populate song list after fetching
    populateSongList();

    return songs;
  } catch (error) {
    return [];
  }
}

function convertToTimeFormat(seconds) {
  let minutes = Math.floor(seconds / 60);
  let remainingSeconds = Math.floor(seconds % 60);
  let formattedMinutes = minutes.toString().padStart(2, '0');
  let formattedSeconds = remainingSeconds.toString().padStart(2, '0');
  return `${formattedMinutes}:${formattedSeconds}`;
}

function cleanSongName(songName) {
  return decodeURIComponent(songName).replace(/[^\w\s\.-]/g, "").trim();
}

function populateSongList() {
  let songUl = document.querySelector(".songlist ul");
  if (!songUl) {
    return;
  }

  songUl.innerHTML = ''; // Clear the existing list

  songs.forEach((song, index) => {
    let cleanName = cleanSongName(song);
    let li = document.createElement("li");
    li.title = cleanName;
    li.textContent = cleanName;
    li.addEventListener("click", () => playSong(index));
    songUl.appendChild(li);
  });
}

function playSong(index) {
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }

  currentSong = songs[index];
  audio = new Audio(`/${currfolder}/${currentSong}`);
  audio.play();
  document.querySelector(".songinfo").innerHTML = currentSong;
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";

  audio.addEventListener("timeupdate", () => {
    let currentTime = convertToTimeFormat(audio.currentTime);
    let totalTime = convertToTimeFormat(audio.duration);
    document.querySelector(".songtime").innerHTML = `${currentTime} / ${totalTime}`;

    let circle = document.querySelector('.circle');
    if (circle && audio.duration > 0) {
      let progressPercentage = (audio.currentTime / audio.duration) * 100;
      circle.style.left = `${progressPercentage}%`;
    }
  });
}

async function displyAlbums() {
  let a = await fetch(`http://127.0.0.1:3000/songs/`);
  let response = await a.text();

  let div = document.createElement("div");
  div.innerHTML = response;

  let anchors = div.getElementsByTagName("a");
  let cardContainers = document.getElementsByClassName('cardContainer');

  // Loop over each anchor tag and process the album info
  Array.from(anchors).forEach(async e => {
    if (e.href.includes('/songs/')) {
      let folder = e.href.split('/').splice(-2)[0];

      try {
        let albumInfoResponse = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
        let albumInfo = await albumInfoResponse.json();
        console.log(albumInfo);

        // Prepare the HTML for the card
        let cardHTML = `
          <div data-folder="${folder}" class="card round">
            <div class="play">
              <img src="/play-circle-svgrepo-com (1).svg" alt="Play Icon">
            </div>
            <img src="/songs/${folder}.cover.jpg" alt="${albumInfo.title} image">
            <h3>${albumInfo.title}</h3>
            <p>${albumInfo.Status}</p>
          </div>
        `;

        // Assuming you're appending to the first cardContainer
        if (cardContainers.length > 0) {
          // Use the first cardContainer to add the card
          cardContainers[0].innerHTML += cardHTML;
        } else {
          console.error("Card container not found!");
        }

      } catch (error) {
        console.error("Error fetching album info:", error);
      }
    }
  });
    
  }



async function main() {
  displyAlbums();
  let play = document.getElementById("playbtn");
  let previous = document.getElementById("previousbtn");
  let next = document.getElementById("nextbtn");

  play.addEventListener("click", () => {
    if (audio && audio.paused) {
      audio.play();
      play.src = "play-circle-stroke-rounded.svg";
      
    } else if (audio) {
      audio.pause();
      play.src = "pause.svg";
      
    } else {
      
    }
  });

  previous.addEventListener("click", () => {
    if (songindex <= 0) {
      alert("No previous song available");
    } else {
      songindex -= 1;
      playSong(songindex);
    }
  });

  next.addEventListener("click", () => {
    if (songindex >= songs.length - 1) {
      alert("No next song available");
    } else {
      songindex += 1;
      playSong(songindex);
    }
  });

  document.querySelector('.menu').addEventListener('click', () => {
    document.querySelector('.left').style.left = '0';
  });

  document.querySelector('.closebtn').addEventListener('click', () => {
    document.querySelector('.left').style.left = '-120%';
  });

  document.getElementById('volcontroller').addEventListener('change', (e) => {
    if (audio) {
      audio.volume = parseInt(e.target.value) / 100;
    }
  });

  Array.from(document.getElementsByClassName('card')).forEach(e => {
    e.addEventListener('click', async item => {
      let folder = item.currentTarget.dataset.folder;
      songs = await getSongs(`songs/${folder}/`);
    });
  });

  // Load songs and play first song
  await getSongs("songs/crs/");
  playSong(0);
}

main();
