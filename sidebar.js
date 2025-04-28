// side bar js code 
const toggleBtn = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');

toggleBtn.addEventListener('click', () => {
  sidebar.classList.toggle('open');
});
// sidebar.js or new script
const words = ["Tic Tac Toe", "Let's Play!", "Challenge Your Friends!"];
let i = 0;
let timer;
function typingEffect() {
  let word = words[i].split("");
  var loopTyping = function () {
    if (word.length > 0) {
      document.getElementById('typed').innerHTML += word.shift();
    } else {
      deletingEffect();
      return false;
    }
    timer = setTimeout(loopTyping, 200);
  };
  loopTyping();
}
function deletingEffect() {
  let word = words[i].split("");
  var loopDeleting = function () {
    if (word.length > 0) {
      word.pop();
      document.getElementById('typed').innerHTML = word.join("");
    } else {
      i = (i + 1) % words.length;
      typingEffect();
      return false;
    }
    timer = setTimeout(loopDeleting, 100);
  };
  loopDeleting();
}
typingEffect();
