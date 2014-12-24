var markdownParser = {

  _parseHeaders: function () {
    this.inputString = this.inputString.map(function (string) {
      if ((/^#+/).test(string)) {
        var headerDelimiter = string.match(/^#+/)[0];
        var headerSize = headerDelimiter.length;
        var stringContent = string.replace(headerDelimiter, '');
        var compiledString = [
            '<h', headerSize, '>',
            stringContent,
            '</h', headerSize, '>'
          ].join('');
        return compiledString;
      } else {
        return string;
      }
    });

    return this;
  },

  _parseItalics: function () {
    this.inputString = this.inputString.map(function (string) {
      if ((/(\s[*]{1}[^*_].{1,}[*]{1}\s*|\s[_]{1}[^*_].{1,}[_]{1}\s*)/).test(string)) {
        string = string.replace(/\s[_*]{1}/g, ' <span class="md-italicize">');
        string = string.replace(/[_*]{1}\s/g, '</span> ');
      }
      return string;
    });

    return this;
  },

  _parseBolds: function () {
    this.inputString = this.inputString.map(function (string) {
      if ((/([*]{2}[^*_].{1,}[*]{2}|[_]{2}[^*_].{1,}[_]{2})/).test(string)) {
        string = string.replace(/[_*]{2}/g, '<strong>');
        var indexOfLastTag = string.lastIndexOf('<strong>');
        string = string.substring(0, indexOfLastTag) + '</strong>' + string.substring(indexOfLastTag + 8);
      }
      return string;
    });

    return this;
  },

  _parseImages: function () {
    this.inputString = this.inputString.map(function (string) {
      var i;
      if ((/!\[\w*\]\({1}https?:.+\){1}/).test(string)) {
        var images = string.match(/!\[\w*\]\({1}https?:\/\/[\w.*-\/*]+\){1}/g);
        var imagesLength = images.length;
        var renderedImage = images.map(function (imgString) {
          imgString = imgString.replace('![', '<img alt="');
          imgString = imgString.replace(']', '" src="');
          imgString = imgString.replace('(', '');
          imgString = imgString.replace(')', '">');
          return imgString;
        });
        for (i = 0; i < imagesLength; i++) {
          string = string.replace(images[i], renderedImage[i]);
        }
      }
      return string;
    });

    return this;
  },

  _parseLinks: function () {
    this.inputString = this.inputString.map(function (string) {
      if ((/!{0}\[.*\]\({1}https?:.+\){1}/).test(string)) {
        var i;
        var links = string.match(/!{0}\[.*\]\({1}https?:.+\){1}/);
        var linksLength = links.length;
        var renderedLinks = links.map(function (linkString) {
          var lastBracketIdx = linkString.lastIndexOf(']');
          var linkText = linkString.slice(1, lastBracketIdx);
          linkString = linkString.replace(/\[.*\]\({1}/, '<a href="');
          linkString = linkString.replace(')', '">' + linkText + "</a>");

          return linkString;
        });
        for (i = 0; i < linksLength; i++) {
          string = string.replace(links[i], renderedLinks[i]);
        }
      }
      return string;
    });

    return this;
  },

  _parseUnorderedLists: function () {
    this.inputString = this.inputString.map(function (string, idx, splitUpString) {
      console.log(string)
      var parseTags = function (regEx) {
        if (regEx.test(splitUpString[idx - 1])) {
          console.log('item')
          string = string.replace(regEx, "<li>");
        } else {
          console.log('list', splitUpString[idx - 1])
          string = string.replace(regEx, "<ul><li>");
        }
        console.log((/^(\s{2}|\t)[*-]\s/).test(splitUpString[idx + 1]))
        if (regEx.test(splitUpString[idx + 1])) {
          string += '</li>';
        } else if ((/^(\s{2}|\t)[*-]\s/).test(splitUpString[idx + 1])) {
          string += '</li></ul>';
        } else if((/^(\s{2}|\t)[*-]\s/).test(string) && (/^[*-]\s/).test(splitUpString[idx + 1])){
          console.log("hi")
          string += '</li></ul>'
        }


        if ((/^[*-]\s/).test(splitUpString[idx + 1])) {
          string += "</li>";
        } else if ((/^(\s{2}|\t)[*-]\s/).test(splitUpString[idx + 1])) {
          string += "</li></ul>";
        }
      };

      if ((/^[*-]\s/).test(string)) {
        parseTags(/^[*-]\s/);
      } else if ((/^(\s{2}|\t)[*-]\s/).test(string)) {
        parseTags(/^(\s{2}|\t)[*-]\s/);
      }
      return string;
    });

    return this;
  },

  _parseOrderedLists: function () {
    this.inputString = this.inputString.map(function (string, idx, splitUpString) {
      var parseTags = function (regEx) {
        if (regEx.test(splitUpString[idx - 1])) {
          string = string.replace(regEx, "<li>");
        } else {
          string = string.replace(regEx, "<ol><li>");
        }
        if ((/^\d{1,}[.]\s/).test(splitUpString[idx + 1])) {
          string += "</li>";
        } else if (!(/^\s{2}\d{1,}[.]\s/).test(splitUpString[idx + 1])) {
          string += "</li></ol>";
        }
      };

      if ((/^\d{1,}[.]\s/).test(string)) {
        parseTags(/^\d{1,}[.]\s/);
      } else if ((/^\s{2}\d{1,}[.]\s/).test(string)) {
        parseTags(/^\s{2}\d{1,}[.]\s/);
      }
      return string;
    });

    return this;
  },

  _parseInlineCode: function () {
    this.inputString = this.inputString.map(function (string) {
      if ((/`.+`/).test(string)) {
        if ((/>`/).test(string)) {
          string = string.replace(/>`/g, '> <code>');
        } else {
          string = string.replace(/(^|[\s])`/g, ' <code>');
        }
        string = string.replace(/`/g, '</code>');
      }
      return string;
    });
    return this;
  },

  _parseCodeBlock: function () {
    var blockDelimiters = [];
    var i, length;
    for (i = 0, length = this.inputString.length; i < length; i++) {
      if ((/^`{3}$/).test(this.inputString[i])) { blockDelimiters.push(i); }
    }
    blockDelimiters.forEach(function (indexOfDelimiter, idx) {
      if (idx % 2 === 0) {
        this.inputString[indexOfDelimiter] = '<pre><code>';
      } else if (idx % 2 === 1) {
        this.inputString[indexOfDelimiter] = '</code></pre>';
      }
    }.bind(this));
    return this;
  },

  parse: function (inputString) {
    this.inputString = inputString.split('\n');
    this._parseHeaders()
        ._parseItalics()
        ._parseBolds()
        ._parseImages()
        ._parseLinks()
        ._parseUnorderedLists()
        ._parseOrderedLists()
        ._parseCodeBlock()
        ._parseInlineCode();
    return this.inputString.join('\n');
  }

};

window.onload = function () {
  document.getElementById('button').addEventListener('click', function () {
    document.getElementById('viewer').innerHTML = markdownParser.parse(document.getElementById('text').value);
  });
};