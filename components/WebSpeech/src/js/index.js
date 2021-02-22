export class WebSpeech {
  static initClass() {
    window.SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    this.speechRecognitionButton = null;
  }

  static startDictation(recognition, button) {
    if (this.speechRecognitionButton != null) {
      recognition.stop();
      return;
    }
    /* If language is not specified, defaults to the HTML lang attribute value
     * or the user agent's language setting if the HTML lang attribtue value
     * is not set */
    recognition.lang = 'en-US';
    this.speechRecognitionButton = button;
    this.searchInput = this.speechRecognitionButton.nextSibling.querySelector('input[type=text]');
    recognition.start();
  }

  static initSpeechRecognition() {
    const recognition = new SpeechRecognition();

    recognition.continuous = true;

    recognition.onstart = () => {
      this.speechRecognitionButton.classList.add('active');
    };

    recognition.onend = () => {
      this.speechRecognitionButton.classList.remove('active');
      this.speechRecognitionButton = null;
    };

    recognition.onresult = (event) => {
      this.searchInput.value = event.results[0][0].transcript;
      recognition.stop();
    }

    var speechWrappers = document.querySelectorAll('.js-speech-wrapper');
    for (let wrapper of speechWrappers) {
      let button = wrapper.querySelector('.speech-button');
      button.addEventListener('click', () => {
        this.startDictation(recognition, button);
      });
    }
  }

  static loadAndRun() {
    if (window.SpeechRecognition) {
      this.initSpeechRecognition();
    }
  }
}

