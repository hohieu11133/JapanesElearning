// ── Text-to-Speech (Web Speech API) ─────────────────────────────────────────
let _ttsVoice = null;

export function initTTS() {
  if (!('speechSynthesis' in window)) return;
  function loadVoices() {
    const voices = window.speechSynthesis.getVoices();
    // Prefer a native Japanese voice; fall back to first available
    _ttsVoice = voices.find(v => v.lang === 'ja-JP' && v.localService)
      || voices.find(v => v.lang === 'ja-JP')
      || voices.find(v => v.lang.startsWith('ja'))
      || null;
  }
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

export function speakWord(text) {
  if (!text || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel(); // stop any current speech
  const utt = new SpeechSynthesisUtterance(text.trim());
  utt.lang = 'ja-JP';
  utt.rate = 0.85;   // slightly slower for learning
  utt.pitch = 1;
  if (_ttsVoice) utt.voice = _ttsVoice;

  // Animate the button while speaking
  const btns = document.querySelectorAll('.btn-speak');
  btns.forEach(b => b.classList.add('speaking'));
  utt.onend = utt.onerror = () => btns.forEach(b => b.classList.remove('speaking'));

  window.speechSynthesis.speak(utt);
}
