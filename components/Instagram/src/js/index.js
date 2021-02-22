export const Autorun = function() {
  for (let el of document.querySelectorAll(".c-instagram [data-userId]")) {
    let target = el.id;
    let accessToken = el.dataset.accesstoken;
    let userId = parseInt(el.dataset.userid);
    let limit = el.dataset.limit;
    let resolution = el.dataset.resolution;
    let endpointBase = el.dataset.endpoint;

    // GENERATOR TODO: move to soy2js
    let template = "<div class=\"c-instagram-photo-wrapper col-spaced col-sm-3 col-xs-6\"><a href=\"{{link}}\" target=_blank rel=\"noopener noreferrer\"><img class=\"c-instagram-photo\" src=\"{{image}}\" alt=\"{{comments}}\" /></a><div class=\"c-instagram-photo-info\"><span class=\"fa fa-heart\"></span><span class=\"c-instagram-photo-info-likes\">{{likes}}</span><span class=\"fa fa-comment\"></span><span class=\"c-instagram-photo-info-comments\">{{comments}}</span></div></div>";

    if (window.instagramTemplates && window.instagramTemplates[target]) {
      template = window.instagramTemplates[target];
    }

    let after = null;

    if (window.instagramCallbacks && window.instagramCallbacks[target]) {
      after = window.instagramCallbacks[target];
    }

    let feed = new Instafeed({
      get: "user",
      target,
      accessToken,
      userId,
      limit,
      resolution,
      template,
      after,
      endpointBase
    });

    return feed.run();
  }
};

// From https://github.com/stevenschobert/instafeed.js/tree/f6d241fea5056187966736e898a5be5a8d8ab059
export class Instafeed {
  constructor(params, context) {
    // default options
    this.options = {
      target: 'instafeed',
      get: 'popular',
      resolution: 'thumbnail',
      sortBy: 'none',
      links: true,
      mock: false,
      useHttp: false,
    };

    // if an object is passed in, override the default options
    if (typeof params === 'object') {
      for (let option in params) { let value = params[option]; this.options[option] = value; }
    }

    // save a reference to context, which defaults to curr scope
    // this will be used to cache data from parsing to the real
    // instance the user interacts with (for pagination)
    this.context = (context != null) ? context : this;

    // generate a unique key for the instance
    this.unique = this._genKey();
  }

  // method to check if there are more results to load
  hasNext() {
    return (typeof this.context.nextUrl === 'string') && (this.context.nextUrl.length > 0);
  }

  // method to display next results using the pagination
  // data from API. Manually passing a url to .run() will
  // bypass the URL creation from options.
  next() {
    // check for a valid next url first
    if (!this.hasNext()) { return false; }

    // call run with the next results
    return this.run(this.context.nextUrl);
  }

  // MAKE IT GO!
  run(url) {
    // make sure either a client id or access token is set
    if (typeof this.options.clientId !== 'string') {
      if (typeof this.options.accessToken !== 'string') {
        throw new Error("Missing clientId or accessToken.");
      }
    }
    if (typeof this.options.accessToken !== 'string') {
      if (typeof this.options.clientId !== 'string') {
        throw new Error("Missing clientId or accessToken.");
      }
    }

    // run the before() callback, if one is set
    if ((this.options.before != null) && (typeof this.options.before === 'function')) {
      this.options.before.call(this);
    }

    // to make it easier to test various parts of the class,
    // any DOM manipulation first checks for the DOM to exist
    if (typeof document !== 'undefined' && document !== null) {
      // make a new script element
      let script = document.createElement('script');

      // give the script an id so it can removed later
      script.id = 'instafeed-fetcher';

      // assign the script src using _buildUrl(), or by
      // using the argument passed to the function
      script.src = url || this._buildUrl();

      // add the new script object to the header
      let header = document.getElementsByTagName('head');
      header[0].appendChild(script);

      // create a global object to cache the options
      let instanceName = `instafeedCache${this.unique}`;
      window[instanceName] = new Instafeed(this.options, this);
      window[instanceName].unique = this.unique;
    }

    // return true if everything ran
    return true;
  }

  // Data parser (must be a json object)
  parse(response) {
    // throw an error if not an object
    if (typeof response !== 'object') {
      // either throw an error or call the error callback
      if ((this.options.error != null) && (typeof this.options.error === 'function')) {
        this.options.error.call(this, 'Invalid JSON data');
        return false;
      } else {
        throw new Error('Invalid JSON response');
      }
    }

    // check if the api returned an error code
    if (response.meta.code !== 200) {
      // either throw an error or call the error callback
      if ((this.options.error != null) && (typeof this.options.error === 'function')) {
        this.options.error.call(this, response.meta.error_message);
        return false;
      } else {
        throw new Error(`Error from Instagram: ${response.meta.error_message}`);
      }
    }

    // check if the returned data is empty
    if (response.data.length === 0) {
      // either throw an error or call the error callback
      if ((this.options.error != null) && (typeof this.options.error === 'function')) {
        this.options.error.call(this, 'No images were returned from Instagram');
        return false;
      } else {
        throw new Error('No images were returned from Instagram');
      }
    }

    // call the success callback if no errors in response
    if ((this.options.success != null) && (typeof this.options.success === 'function')) {
      this.options.success.call(this, response);
    }

    // cache the pagination data, if it exists. Apply the value
    // to the "context" object, which will be a true reference
    // if this instance was created just for parsing
    this.context.nextUrl = '';
    if (response.pagination != null) {
      this.context.nextUrl = response.pagination.next_url;
    }

    // before images are inserted into the DOM, check for sorting
    if (this.options.sortBy !== 'none') {
      // if sort is set to random, don't check for polarity
      let sortSettings;
      if (this.options.sortBy === 'random') {
        sortSettings = ['', 'random'];
      } else {
        // get the sort settings from @options
        sortSettings = this.options.sortBy.split('-');
      }

      // determine if the order should be inverse
      let reverse = sortSettings[0] === 'least' ? true : false;

      // handle the case for sorting
      switch (sortSettings[1]) {
        case 'random':
          response.data.sort(() => 0.5 - Math.random());
          break;

        case 'recent':
          response.data = this._sortBy(response.data, 'created_time', reverse);
          break;

        case 'liked':
          response.data = this._sortBy(response.data, 'likes.count', reverse);
          break;

        case 'commented':
          response.data = this._sortBy(response.data, 'comments.count', reverse);
          break;

        default: throw new Error(`Invalid option for sortBy: '${this.options.sortBy}'.`);
      }
    }

    // to make it easier to test various parts of the class,
    // any DOM manipulation first checks for the DOM to exist
    if ((typeof document !== 'undefined' && document !== null) && (this.options.mock === false)) {
      // limit the number of images if needed
      let image, imageUrl, node, tmpEl;
      let images = response.data;
      if (this.options.limit != null) {
        if (images.length > this.options.limit) { images = images.slice(0, +this.options.limit + 1 || undefined); }
      }

      // create the document fragment
      let fragment = document.createDocumentFragment();

      // filter the results
      if ((this.options.filter != null) && (typeof this.options.filter === 'function')) {
        images = this._filter(images, this.options.filter);
      }

      if ((this.options.template != null) && (typeof this.options.template === 'function')) {
        // create a temp dom node that will hold the html
        tmpEl = document.createElement('div');

        // add the html string generated from soy to the temp node
        tmpEl.innerHTML = this.options.template(images);

        // loop through the contents of the temp node
        // and append them to the fragment
        for (node of Array.from([].slice.call(tmpEl.childNodes))) {
          fragment.appendChild(node);
        }

      // determine whether to parse a template, or use html fragments
      } else if ((this.options.template != null) && (typeof this.options.template === 'string')) {
        // create an html string
        let htmlString = '';
        let imageString = '';
        let imgUrl = '';

        // create a temp dom node that will hold the html
        tmpEl = document.createElement('div');

        // loop through the images
        for (image of Array.from(images)) {
          // use protocol relative image url
          imageUrl = image.images[this.options.resolution].url;
          if (!this.options.useHttp) { imageUrl = imageUrl.replace('http://', '//'); }

          // parse the template
          imageString = this._makeTemplate(this.options.template, {
            model: image,
            id: image.id,
            link: image.link,
            image: imageUrl,
            caption: this._getObjectProperty(image, 'caption.text'),
            likes: image.likes.count,
            comments: image.comments.count,
            location: this._getObjectProperty(image, 'location.name')
          }
          );

          // add the image partial to the html string
          htmlString += imageString;
        }

        // add the final html string to the temp node
        tmpEl.innerHTML = htmlString;

        // loop through the contents of the temp node
        // and append them to the fragment
        for (node of Array.from([].slice.call(tmpEl.childNodes))) {
          fragment.appendChild(node);
        }
      } else {
        // loop through the images
        for (image of Array.from(images)) {
          // create the image using the @options's resolution
          let img = document.createElement('img');

          // use protocol relative image url
          imageUrl = image.images[this.options.resolution].url;
          if (!this.options.useHttp) { imageUrl = imageUrl.replace('http://', '//'); }
          img.src = imageUrl;

          // wrap the image in an anchor tag, unless turned off
          if (this.options.links === true) {
            // create an anchor link
            let anchor = document.createElement('a');
            anchor.href = image.link;

            // add the image to it
            anchor.appendChild(img);

            // add the anchor to the fragment
            fragment.appendChild(anchor);
          } else {
            // add the image (without link) to the fragment
            fragment.appendChild(img);
          }
        }
      }

      // Add the fragment to the DOM
      document.getElementById(this.options.target).appendChild(fragment);

      // remove the injected script tag
      let header = document.getElementsByTagName('head')[0];
      header.removeChild(document.getElementById('instafeed-fetcher'));

      // delete the cached instance of the class
      let instanceName = `instafeedCache${this.unique}`;
      window[instanceName] = undefined;
      try {
        delete window[instanceName];
      } catch (error) {}
    }
    // END if document?

    // run after callback function, if one is set
    if ((this.options.after != null) && (typeof this.options.after === 'function')) {
      this.options.after.call(this);
    }

    // return true if everything ran
    return true;
  }

  // helper function that structures a url for the run()
  // function to inject into the document hearder
  _buildUrl() {
    // set the base API URL
    let endpoint;
    let base = this.endpointBase;

    // get the endpoint based on @options.get
    switch (this.options.get) {
      case "popular": endpoint = "media/popular"; break;
      case "tagged":
        // make sure a tag is defined
        if (typeof this.options.tagName !== 'string') {
          throw new Error("No tag name specified. Use the 'tagName' option.");
        }

        // set the endpoint
        endpoint = `tags/${this.options.tagName}/media/recent`;
        break;

      case "location":
        // make sure a location id is defined
        if (typeof this.options.locationId !== 'number') {
          throw new Error("No location specified. Use the 'locationId' option.");
        }

        // set the endpoint
        endpoint = `locations/${this.options.locationId}/media/recent`;
        break;

      case "user":
        // make sure there is a user id set
        if (typeof this.options.userId !== 'number') {
          throw new Error("No user specified. Use the 'userId' option.");
        }

        // make sure there is an access token
        if (typeof this.options.accessToken !== 'string') {
          throw new Error("No access token. Use the 'accessToken' option.");
        }

        endpoint = `users/${this.options.userId}/media/recent`;
        break;
      // throw an error if any other option is given
      default: throw new Error(`Invalid option for get: '${this.options.get}'.`);
    }

    // build the final url (uses the instance name)
    let final = `${base}/${endpoint}`;

    // use the access token for auth when it's available
    // otherwise fall back to the client id
    if (this.options.accessToken != null) {
      final += `?access_token=${this.options.accessToken}`;
    } else {
      final += `?client_id=${this.options.clientId}`;
    }

    // add the count limit
    if (this.options.limit != null) {
      final += `&count=${this.options.limit}`;
    }

    // add the jsonp callback
    final += `&callback=instafeedCache${this.unique}.parse`;

    // return the final url
    return final;
  }

  // helper function to generate a unique key
  _genKey() {
    let S4 = () => (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    return `${S4()}${S4()}${S4()}${S4()}`;
  }

  // helper function to parse a template
  _makeTemplate(template, data) {
    // regex pattern
    let pattern = new RegExp(`\
(?:\\{{2})\
([\\w\\[\\]\\.]+)\
(?:\\}{2})\
`);

    // copy the template
    let output = template;

    // process the template (null defaults to empty strings)
    while (pattern.test(output)) {
      var left;
      let varName = output.match(pattern)[1];
      let varValue = (left = this._getObjectProperty(data, varName)) != null ? left : '';
      output = output.replace(pattern, `${varValue}`);
    }

    // send back the new string
    return output;
  }

  // helper function to access an object property by string
  _getObjectProperty(object, property) {
    // convert [] to dot-syntax
    property = property.replace(/\[(\w+)\]/g, '.$1');

    // split the object into arrays
    let pieces = property.split('.');

    // run through the array to find the
    // nested property
    while (pieces.length) {
      // move down the property chain
      let piece = pieces.shift();

      // if they key exists, copy the value
      // into 'object', otherwise return null
      if ((object != null) && piece in object) {
        object = object[piece];
      } else {
        return null;
      }
    }

    // send back the final object
    return object;
  }

  // helper function to sort an array objects by an
  // object property (sorts highest to lowest)
  _sortBy(data, property, reverse) {
    // comparator function
    let sorter = function(a, b) {
      let valueA = this._getObjectProperty(a, property);
      let valueB = this._getObjectProperty(b, property);
      // sort lowest-to-highest if reverse is true
      if (reverse) {
        if (valueA > valueB) { return 1; } else { return -1; }
      }

      // otherwise sort highest to lowest
      if (valueA < valueB) { return 1; } else { return -1; }
    };

    // sort the data
    data.sort(sorter.bind(this));

    return data;
  }

  // helper method to filter out images
  _filter(images, filter) {
    let filteredImages = [];
    for (let image of Array.from(images)) {
      (function(image) {
        if (filter(image)) { return filteredImages.push(image); }
      })(image);
    }
    return filteredImages;
  }
}
