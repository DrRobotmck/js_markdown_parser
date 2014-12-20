function parser(input) {

	var parseHeaders = function(inputString) {
		var parsedString = inputString.map(function(string, idx, splitUpString) {
			if ((/^#+/).test(string)) {
				var headerDelimiter = string.match(/^#+/)[0];
				var headerSize = headerDelimiter.length;
				var stringContent = string.replace(headerDelimiter, '');
				var compiledString = [
															'<h', headerSize,'>',
															stringContent,
															'</h', headerSize,'>'
														 ].join('');
				return compiledString;
			} else {
				return string;
			}
		});
		return parsedString;
	};

	var parseItalics = function(inputString) {
		var parsedString = inputString.map(function(string, idx, splitUpString) {
			if ((/(\s[*]{1}[^*_].{1,}[*]{1}\s*|\s[_]{1}[^*_].{1,}[_]{1}\s*)/).test(string)) {
				string = string.replace(/\s[_*]{1}/g, ' <span class="md-italicize">');
				string = string.replace(/[_*]{1}\s/g, '</span> ');
			}
			return string;

		});
		return parsedString;
	};

	var parseBolds = function(inputString) {
		var parsedString = inputString.map(function(string, idx, splitUpString) {
			if ((/([*]{2}[^*_].{1,}[*]{2}|[_]{2}[^*_].{1,}[_]{2})/).test(string)) {
				string = string.replace(/[_*]{2}/g, '<strong>');
				var indexOfLastTag = string.lastIndexOf('<strong>');
				string = string.substring(0,indexOfLastTag) + '</strong>' + string.substring(indexOfLastTag + 8);
			}

			return string;
		});
		return parsedString;
	};

	var parseImages = function(inputString) {
		var parsedString = inputString.map(function(string, idx, splitUpString) {
			if ((/!\[\w*\]\({1}https?:.+\){1}/).test(string)) {
				var images = string.match(/!\[\w*\]\({1}https?:\/\/[\w.*-\/*]+\){1}/g);
				var imagesLength = images.length;
				var renderedImage = images.map(function(imgString) {
					imgString = imgString.replace('![', '<img alt="');
					imgString = imgString.replace(']', '" src="');
					imgString = imgString.replace('(', '');
					imgString = imgString.replace(')', '">');
					return imgString;
				});
				for (var i = 0; i < imagesLength; i++) {
					string = string.replace(images[i], renderedImage[i]);
				}
			}

			return string;
		});
		return parsedString;
	};

	var parseLinks = function(inputString) {
		var parsedString = inputString.map(function(string, idx, splitUpString) {
			if ((/!{0}\[.*\]\({1}https?:.+\){1}/).test(string)) {
				var links = string.match(/!{0}\[.*\]\({1}https?:.+\){1}/);
				var linksLength = links.length;
				var renderedLinks = links.map(function(linkString) {
					var lastBracketIdx = linkString.lastIndexOf(']');
					var linkText = linkString.slice(1,lastBracketIdx);
					linkString = linkString.replace(/\[.*\]\({1}/, '<a href="');
					linkString = linkString.replace(')', '">' + linkText + "</a>");

					return linkString;
				});
				for( var i = 0; i < linksLength; i++) {
					string = string.replace(links[i], renderedLinks[i]);
				}
			}

			return string;
		});
		return parsedString;
	};

	var parseUnorderedLists = function(inputString) {
		var parsedString = inputString.map(function(string, idx, splitUpString) {
			var parseTags = function(regEx) {
				if (regEx.test(splitUpString[idx - 1])) {
					string = string.replace(regEx, "<li>");
				} else {
					string = string.replace(regEx, "<ul><li>");
				}
				if ((/^[*-]\s/).test(splitUpString[idx + 1])) {
					string += "</li>";
				} else if (!(/^\s{2}[*-]\s/).test(splitUpString[idx + 1])) {
					string += "</li></ul>";
				}
			};

			if ((/^[*-]\s/).test(string)) {
				parseTags(/^[*-]\s/);
			} else if ((/^\s{2}[*-]\s/).test(string)) {
				parseTags(/^\s{2}[*-]\s/);
			}

			return string;
		});
		return parsedString;
	};

	var parseOrderedLists = function(inputString) {
		var parsedString = inputString.map(function(string, idx, splitUpString) {
			var parseTags = function(regEx) {
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
		return parsedString;
	};

	var markdownParser = function(inputString) {
		var splitString = inputString.split('\n');
		var parsedWithHeaders = parseHeaders(splitString);
		var parsedWithItalics = parseItalics(parsedWithHeaders);
		var parsedWithBolds = parseBolds(parsedWithItalics);
		var parsedForImages = parseImages(parsedWithBolds);
		var parsedForLinks = parseLinks(parsedForImages);
		var parsedForUnorderedList = parseUnorderedLists(parsedForLinks);
		var finalParsedString = parseOrderedLists(parsedForUnorderedList);
		return finalParsedString.join('\n');
	};

	return markdownParser(input);
}

window.onload = function() {
	document.getElementById('button').addEventListener('click', function() {
		document.getElementById('viewer').innerHTML = parser(document.getElementById('text').value);
	});
};