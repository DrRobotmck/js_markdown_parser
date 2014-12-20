function parser(input) {
	var finalParsedString = null;
	return markdownParser(input);

	function markdownParser(inputString) {
		var parsedWithHeaders = parseHeaders(inputString);
		var parsedWithItalics = parseItalics(parsedWithHeaders);
		var parsedWithBolds = parseBolds(parsedWithItalics);
		var parsedForImages = parseImages(parsedWithBolds);
		return parsedForImages;
	}

	function parseHeaders(inputString) {
		var splitString = inputString.split('\n');
		var parsedString = splitString.map(function(string, idx, splitUpString) {
			if ((/^#+/).test(string)) {
				var headerDelimiter = string.match(/^#+/)[0];
				var headerSize = headerDelimiter.length;
				var stringContent = string.replace(headerDelimiter, '');
				var compiledString = [
															'<h', headerSize,'>',
															stringContent,
															'</h', headerSize,'><hr>'
														 ].join('');
				return compiledString;
			} else {
				return string;
			}
		});
		return parsedString.join('\n');
	}

	function parseItalics(inputString) {
		var splitString = inputString.split('\n');
		var parsedString = splitString.map(function(string, idx, splitUpString) {
			if ((/(\s[*]{1}[^*_].{1,}[*]{1}\s*|\s[_]{1}[^*_].{1,}[_]{1}\s*)/).test(string)) {
				string = string.replace(/\s[_*]{1}/g, ' <span class="md-italicize">');
				string = string.replace(/[_*]{1}\s/g, '</span> ');
			}
			return string;
		});
		return parsedString.join('\n');
	}

	function parseBolds(inputString) {
		var splitString = inputString.split('\n');
		var parsedString = splitString.map(function(string, idx, splitUpString) {
			if ((/([*]{2}[^*_].{1,}[*]{2}|[_]{2}[^*_].{1,}[_]{2})/).test(string)) {
				string = string.replace(/[_*]{2}/g, '<strong>');
				var indexOfLastTag = string.lastIndexOf('<strong>');
				string = string.substring(0,indexOfLastTag) + '</strong>';
				console.log(string)
			}
			return string;
		});
		return	parsedString.join('\n');
	}

	function parseImages(inputString) {
		var splitString = inputString.split('\n');
		var parsedString = splitString.map(function(string, idx, splitUpString) {
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
				console.log(images, renderedImage)
				for (var i = 0; i < imagesLength; i++) {
					string = string.replace(images[i], renderedImage[i]);
				}
			}
			return string;
		});
		return parsedString.join('\n');
	}
}

var toBeParsed = ["#poop", " asdfadf # asdfasdfsfsdfa", "###poop", "words and stuff _suppppp_ _sup yo_ adsfasdf", "words and *stuff* yo", "some **word bro** ", "another __bold me baby__ bro bro", "![hey](http://placecage.com/200/200) ![alt](http://placecage.com/200/200) "];
window.onload = function() {
	var a;
	document.getElementById('button').addEventListener('click', function() {
		a = document.getElementById('text').value;
		a = parser(a);
		document.getElementById('viewer').innerHTML = a;
	})
}