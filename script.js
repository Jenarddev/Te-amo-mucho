// script.js (cleaned: no auto-generated lyrics + local vinyl support)
// Compact style, combines previous features + lyrics typewriter ready (but empty)

const p1 = document.getElementById('page-1'),
      p2 = document.getElementById('page-2'),
      p3 = document.getElementById('page-3'),
      beginBtn = document.getElementById('beginBtn'),
      countdownEl = document.getElementById('countdown'),
      cdNum = document.getElementById('cd-num'),
      nextToMusic = document.getElementById('nextToMusic'),
      vinyl = document.getElementById('vinyl'),   // local image element (in HTML)
      audio = document.getElementById('audio'),
      playBtn = document.getElementById('playBtn'),
      playRequired = document.getElementById('playRequired'),
      forcePlay = document.getElementById('forcePlay');

// ------- Page switcher -------
function showPage(n){
  [p1,p2,p3].forEach(p=>{ 
    p.classList.remove('visible'); 
    p.classList.add('hidden'); 
    p.setAttribute('aria-hidden','true'); 
  });
  if(n===1){ 
    p1.classList.add('visible'); 
    p1.classList.remove('hidden'); 
    p1.setAttribute('aria-hidden','false'); 
  }
  if(n===2){ 
    p2.classList.add('visible'); 
    p2.classList.remove('hidden'); 
    p2.setAttribute('aria-hidden','false'); 
    startShuffleSequence(); 
  }
  if(n===3){ 
    p3.classList.add('visible'); 
    p3.classList.remove('hidden'); 
    p3.setAttribute('aria-hidden','false'); 
    attemptAutoplay(); 
  }
}

// ------- Welcome -> Photos flow -------
beginBtn.addEventListener('click', ()=>{
  beginBtn.disabled = true;
  countdownEl.style.display = 'block';
  let n = 3; cdNum.textContent = n;
  const t = setInterval(()=>{
    n--; 
    if(n>=0) cdNum.textContent = n; 
    if(n<=0){ clearInterval(t); showPage(2); } 
  }, 900);
});
beginBtn.addEventListener('keyup', (e)=>{ if(e.key==='Enter' || e.key===' ') beginBtn.click(); });

// ------- Polaroid shuffle (C2) -------
function startShuffleSequence(){
  const polaroids = Array.from(document.querySelectorAll('.polaroid'));
  let moves = 0;
  nextToMusic.disabled = true;
  setTimeout(() => {
    const shuffleInterval = setInterval(() => {
      if (moves >= polaroids.length) {
        clearInterval(shuffleInterval);
        nextToMusic.disabled = false;
        return;
      }
      const first = polaroids.shift();
      polaroids.push(first);
      polaroids.forEach((el, idx) => { el.className = `polaroid p${idx + 1}`; });
      moves++;
    }, 2000);
  }, 1000);
}
nextToMusic.addEventListener('click', ()=>{ 
  nextToMusic.disabled = true; 
  setTimeout(()=> showPage(3), 420); 
});

// ------- Vinyl & audio handling -------
// The <img id="vinyl"> in your HTML should point to your local image, e.g.:
// <img id="vinyl" src="images/vinyl.png" alt="Vinyl" />
function startVinyl(){ vinyl.classList.add('rotating'); playBtn.textContent='⏸'; }
function stopVinyl(){ vinyl.classList.remove('rotating'); playBtn.textContent='▶️'; }

playBtn.addEventListener('click', ()=>{ 
  if(audio.paused) playAudio(); 
  else { audio.pause(); stopVinyl(); } 
});
forcePlay && forcePlay.addEventListener('click', ()=> playAudio().catch(()=>{}));

function playAudio(){
  return audio.play().then(()=>{ 
    startVinyl(); 
    playRequired.style.display='none'; 
    onAudioPlay(); 
  }).catch(err=>{
    playRequired.style.display='block';
    console.warn('Autoplay blocked', err);
  });
}
function attemptAutoplay(){
  if(!audio.src){
    playRequired.style.display = 'block';
    playRequired.innerHTML = 'No track set — add audio src. <button id="forcePlay2" class="btn" style="margin-left:8px">Play</button>';
    document.getElementById('forcePlay2').addEventListener('click', ()=> audio.play().catch(()=>{}));
    return;
  }
  playAudio();
}
audio.addEventListener('ended', ()=> stopVinyl());

// ------- Lyrics (empty by default) -------
const lyricsLines = [];

// Ensure there's a lyrics container in the DOM; if not, create it under the track-card
function ensureLyricsContainer(){
  let lyrics = document.getElementById('lyrics');
  if(lyrics) return lyrics;
  const trackCard = document.querySelector('.track-card');
  lyrics = document.createElement('div');
  lyrics.id = 'lyrics';
  lyrics.className = 'lyrics';
  lyrics.style.marginTop = '14px';
  lyrics.setAttribute('aria-live','polite');
  lyrics.innerHTML = '<div class="lyrics-body"></div>';
  trackCard.parentNode.insertBefore(lyrics, trackCard.nextSibling);
  return lyrics;
}

// Typewriter implementation (line-by-line)
let lyricsTyped = false; // don't re-run if already typed
function typeLyrics(lines){
  if(lyricsTyped || lines.length === 0) return;
  const container = ensureLyricsContainer();
  const body = container.querySelector('.lyrics-body');
  body.innerHTML = '';
  let lineIndex = 0, charIndex = 0;
  const typingSpeed = 40; 
  const linePause = 700; 
  function typeChar(){
    if(lineIndex >= lines.length){ lyricsTyped = true; return; }
    const line = lines[lineIndex];
    if(charIndex < line.length){
      body.innerHTML = body.innerHTML + line[charIndex];
      charIndex++;
      setTimeout(typeChar, typingSpeed);
    } else {
      body.innerHTML = body.innerHTML + '<br>';
      lineIndex++; charIndex = 0;
      setTimeout(typeChar, linePause);
    }
  }
  typeChar();
}



// --- Secret Message Button + Envelope ---
const secretMessageBtn = document.getElementById('secretMessageBtn');
const envelopeTrigger = document.getElementById('envelopeTrigger');
const secretModal = document.getElementById('secretModal');
const closeModal = document.getElementById('closeModal');

function openSecretMessage() {
  secretModal.classList.remove('hidden');
  secretModal.setAttribute('aria-hidden','false');
}
function closeSecretMessage() {
  secretModal.classList.add('hidden');
  secretModal.setAttribute('aria-hidden','true');
}

secretMessageBtn.addEventListener('click', openSecretMessage);
envelopeTrigger.addEventListener('click', openSecretMessage);
envelopeTrigger.addEventListener('keyup', (e)=>{ if(e.key==='Enter' || e.key===' ') openSecretMessage(); });
closeModal.addEventListener('click', closeSecretMessage);
secretModal.addEventListener('click', (e)=>{ if(e.target===secretModal) closeSecretMessage(); });




// Called when audio actually begins playing successfully
function onAudioPlay(){
  typeLyrics(lyricsLines);
}

// Safety: if user clicks Play button and audio is playing, trigger onAudioPlay as well
audio.addEventListener('play', ()=> onAudioPlay());

// ------- Init to first page -------
showPage(1);
