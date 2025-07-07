<template>
    <!-- full-viewport wrapper -->
    <div class="conf-wrapper tw-relative tw-w-full tw-h-screen tw-overflow-hidden" :class="{ 'opened': isOpened }">
  
      <!-- hidden checkbox – toggles everything -->
      
  
      <!-- fading background -->
      <div class="bg"></div>
  
      <!-- helper text -->
      <p class="instruction">Click the heart!</p>
  
      <!-- ♥ -->
      <div class="heart" @click="openLetter">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/4/42/Love_Heart_SVG.svg"
          alt="Heart icon"
        />
      </div>
  
      <!-- love letter -->
      <article class="message">
        <h1 class="tw-font-[Cinzel] tw-text-[40px] tw-tracking-[1.2px]">To the love of my life</h1>
  
        <p class="tw-my-4 tw-font-[Quicksand] tw-text-[clamp(16px,10vw,17px)] tw-leading-[1.5em] tw-text-justify">
          <span>
            &emsp; HAPPY BIRTHDAY BABY KO!! Same na tayo ng age sa wakas hehehe pero maduga ka mukhang bata ka parin,
            pag magkasama tayo neto baka pagkamalan pa ako na pedo naku HAHAHAHAHAHAHA kidding aside HAPPY BIRTHDAY
            MAHAL KO napaka swerte ko mahal na ako yung pinili or napili mong partner, maraming beses ko na ata nasabi
            yan pero di ako magsasawang sabihin yan. Nagpapasalamat ako lagi kay Lord na binigay ka niya sakin mahal ko. Alam mo baby life is better with i'm with you or you with me, ay ano ba yan basta masarap lalo tumanda kasi kasama kita baby ko hehehe.Marami pang birthday tayo magkasama baby ko promise ko sayo yan!!. Sorry
            baby ko kung wala tayong budget now, ngayon lang mahal sa susunod baby promise ko sayo meron na lagi hehehehe. 
            HAPPIEST BIRTHDAY MAHAL KO ENJOY YOUR DAY!! SEE YOU LATER BABY KO!! MAHAL NA MAHAL KITA PALAGI ERLYN KO!! I LOVE YOU WITH ALL MY SENSES BABY❤️❤️❤️
          </span><br/><br/>
          <!-- <span>
            &emsp;
          </span> -->
        </p>
  
        <!-- <footer class="tw-text-left tw-mb-2">
          <p class="tw-font-bold">With Love,</p>
          <p>Your Admirer</p>
        </footer> -->

        <NuxtLink to="/valentine">
            <button v-if="showNextButton" class="next-button">
                Next
            </button>
        </NuxtLink>
      </article>
    </div>
  </template>   
  
  <script setup lang="ts">
import { ref } from 'vue'

const isOpened = ref(false)
const showNextButton = ref(false)



const openLetter = () => {
  if (isOpened.value) return
  isOpened.value = true
  setTimeout(() => {
    showNextButton.value = true
  }, 5000)
}

</script>
  
  <style>
  /* ------------- Google fonts (CSS import) --------------------- */
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400..900&family=Quicksand:wght@300..700&display=swap');
  
  /* ------------- layout helpers -------------------------------- */
  body { margin: 0; overflow: hidden; }          /* keep old behaviour */
  
  .conf-wrapper { font-family: Quicksand, sans-serif; }
  
  /* hide the checkbox itself */
  .toggle {
    position: absolute;
    width: 0;
    height: 0;
    opacity: 0;
  }
  
  /* helper text */
  .instruction {
  position: absolute;
  font-size: 1.6rem;
  color: #795548; /* warm brown for better contrast on yellow */
  top: 36%;
  left: 50%;
  transform: translate(-50%, -50%);
  transition: opacity 0.4s linear;
}
  
  /* fade helper when opened */
  .opened .instruction { opacity: 0; }
  
  /* ------------- background panel ------------------------------ */
  .bg {
  position: absolute;
  inset: 0;
  background: #fff9c4; /* light yellow (closed) */
  transition: background-color 2s linear;
  z-index: 0;
}
.opened .bg {
  background: #fff59d; /* deeper yellow */
}
  
  /* ------------- heart ----------------------------------------- */
  .heart {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    cursor: pointer;
    z-index: 2;
  }
  
  /* beat forever when closed */
  .heart > img {
    width: 50px;
    height: auto;
    animation: beat 2s ease-in-out infinite;
  }
  
  /* when opened, slide down & stop beating  */
  .opened .heart           { animation: heartMove 2s linear forwards; }
  .opened .heart > img     { animation: none; }
  
  /* ------------- letter card ----------------------------------- */
  .message {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 80%;
    max-width: 550px;
    height: 0;              /* closed */
    padding: 0 20px;        /* only horizontal until open */
    background: #fffde7; /* light creamy background */
    color: #5d4037; /* deep brown text for readability */
    border-radius: 5px;
    box-shadow: 0 10px 20px rgba(0,0,0,0.19),
                0  6px  6px rgba(0,0,0,0.23);
    overflow-y: auto;
    z-index: 1;
  
    /* opening tween – paused by default */
    animation: openmsg 2s linear forwards;
    animation-play-state: paused;
  }
  
  /* play the animation when checkbox is checked */
  .opened .message { animation-play-state: running; }
  
  /* ------------- key-frames ------------------------------------ */
  @keyframes beat {
    0%, 30%, 60%, 100% { width: 50px; }
    25%, 75%           { width: 58px; }
    50%                { width: 45px; }
  }
  
  @keyframes heartMove {
    0%   { top: 50%; transform: translate(-50%, -50%); }
    100% { top: 85%; transform: translate(-50%, 0);    }
  }
  
    .next-button {
    position: absolute;
    bottom: 20px;
    right: 20px;
    padding: 10px 20px;
    background-color: #fbc02d; /* vibrant yellow-gold */
    color: #4e342e; /* dark brown text */
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
    opacity: 0;
    animation: fadeIn 1s forwards;
  }

  @keyframes fadeIn {
    to {
      opacity: 1;
    }
  }

  @keyframes openmsg {
    0%   { height: 0;   padding-top: 0; }
    100% { height: 75%; padding-top: 20px; }
  }
  </style>
  