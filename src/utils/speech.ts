/**
 * Triggers Web Speech API pronunciation for Sinhala (si-LK), Tamil (ta-LK / ta-IN), or English.
 */
export function speakText(text: string, lang: 'si-LK' | 'ta-LK' | 'en-US' = 'si-LK', fallbackRoman?: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.88;

    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find((v) =>
      v.lang.toLowerCase().startsWith(lang.slice(0, 2).toLowerCase())
    );
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    } else if (lang === 'si-LK' && fallbackRoman) {
      // If system doesn't have an si-LK voice installed, read phonetic Romanization clearly
      utterance.text = fallbackRoman;
    }

    window.speechSynthesis.speak(utterance);
  } catch {
    // Ignore speech synthesis errors on headless browsers
  }
}
