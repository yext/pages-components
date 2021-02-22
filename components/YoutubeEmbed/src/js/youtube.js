class YouTubeVideo {
  constructor(el) {
    this.element = el;
    this.youTubeSource = this.element.dataset.youtubeurl;
    this.videoId = this.getVideoId()
    this.thumbnailIndex = this.element.dataset.thumbnailindex || 0;
    if (this.isImage()) {
      this.element.setAttribute('src', this.getThumb());
    }
  }

  isImage() {
    return this.element.tagName == 'IMG';
  }

  getFrameData() {
    return {
      showinfo: this.element.dataset.showtitle,
      controls: this.element.dataset.showcontrols,
      playerId: this.element.id,
      rel: this.element.dataset.showrelated
    }
  }

  getThumb() {
    return `http://img.youtube.com/vi/${this.videoId}/${this.thumbnailIndex}.jpg`;
  }

  getVideoId() {
    let matches = /(youtu(?:\.be|be\.com)\/(?:.*v(?:\/|=)|(?:.*\/)?)([\w'-]+))/i.exec(this.youTubeSource);

    if ((matches != null ? matches.length : undefined)) {
      return matches[matches.length - 1];
    }
    return this.youTubeSource;
  };
}

class YouTubeLoader {
  static load(frameOptions, global) {
    this.options = frameOptions || {};
    this.scope = global || window;
    this.dom = this.scope.document;
    this.iframesToLoad = [];
    for (let el of this.dom.querySelectorAll('[data-youtubeurl]')) {
      el.YouTubeVideo = new YouTubeVideo(el);
      if (!el.YouTubeVideo.isImage()) {
        this.iframesToLoad.push(el.YouTubeVideo);
      }
    }

    this.scope.onYouTubeIframeAPIReady = this.onYouTubeIframeAPIReady.bind(this);

    if (this.iframesToLoad.length > 0) {
      let frameAPI = this.dom.createElement('script');
      frameAPI.src = "https://www.youtube.com/iframe_api";
      this.dom.head.appendChild(frameAPI);
    }
  }

  static onYouTubeIframeAPIReady() {
    for (let video of this.iframesToLoad) {
      let opts = {
        "videoId": video.getVideoId(),
        "playerVars": video.getFrameData(),
        ...this.options
      };
      video.player = new YT.Player(video.element.id, opts);
    }
  }
}

export {
  YouTubeVideo,
  YouTubeLoader
}

