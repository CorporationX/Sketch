// Authors: Kristjan Thor Jonsson and Bjorgheidur Margret Helgadottir
// 
//	
//
// We wrap all of our code in a jquery ready function so that no code is executed on anything that hasn't loaded yet and also
// we manage to avoid contaminating the global scope by doing this.
$(document).ready(function () {
	var canvas = document.getElementById('mainCanvas');
	var context = canvas.getContext('2d');

	var backgroundCanvas = document.createElement('canvas');
	var backgroundContext = backgroundCanvas.getContext('2d');

	backgroundCanvas.width = 500;
	backgroundCanvas.height = 500;
	backgroundCanvas.id = 'backgroundCanvas';

	var canvasParent = canvas.parentNode;
	canvasParent.appendChild(backgroundCanvas);

	var canvasProps = {
		isDrawing: false,
		isMoving: false,
		isWriting: false,
		canDraw: true,
		canMove: false,
		canWrite: false,
		start: {
			x0: 0,
			y0: 0
		},
		shapes: [],
		drawAll: function () {
			backgroundContext.clearRect(0, 0, 500, 500);
			context.clearRect(0, 0, 500, 500);
			for (var i = 0; i < canvasProps.shapes.length; i++) {
				canvasProps.shapes[i].draw(backgroundContext);
			}
		},
		currentShape: {},
		currentType: 'Pen',
		canvasWidth: 500,
		canvasHeight: 500,
		undoArray: [],
		currentLineColor: '#000000',
		currentFillColor: '#FFFFFF',
		currentLineWidth: 10,
		currentFontSize: 12,
		currentFontStyle: 'Georgia',
		currentFontBold: false,
		currentFontItalic: false,
		currentFill: false,
		loadedDrawings: [],
		init: function () {
			var shapes;

			var drawingData = {
				"user": "kristjanj11",
				"template": false
			};

			$.ajax({
				type: "GET",
				contentType: "application/json; charset='utf-8",
				url: "http://whiteboard.apphb.com/Home/GetList",
				data: drawingData,
				dataType: "jsonp",
				crossDomain: true,
				success: function (data) {

					var savedDrawings = $('#savedDrawings');

					for (var i = 0; i < data.length; i++) {
						var currentData = JSON.parse(data[i].WhiteboardContents);

						var currentTitle = data[i].WhiteboardTitle;

						canvasProps.loadedDrawings.push({
							data: currentData,
							title: currentTitle
						});

						var drawingElement = document.createElement('div');
						drawingElement.innerHTML = currentTitle;
						drawingElement.className = 'drawing';

						savedDrawings.append(drawingElement);

					}

				},
				error: function (xhr, err) {
					console.log('failed to load data. xhr: ', xhr, ' - err: ', err);
				}
			});
		},
		resetState: function () {

			$('#textBox').hide();

			$('#textBox').val('');

			canvasProps.isWriting = false;

		}
	};


	var Shape = Base.extend({
		constructor: function (shapeType, x0, y0, x, y, lineWidth, lineColor, fillColor) {
			this.x0 = x0;
			this.y0 = y0;
			this.x = x;
			this.y = y;
			this.lineWidth = lineWidth;
			this.lineColor = lineColor;
			this.fillColor = fillColor;
			this.shapeType = shapeType;
		},
		draw: function (ctx) {

		},
		moveTo: function (xChange, yChange) {

		},
		contains: function (x, y) {

		},
		drawTo: function (x, y) {

		}
	});

	var global = {
		Line: Shape.extend({
			constructor: function (shapeType, x0, y0, x, y, lineWidth, lineColor) {
				this.base(shapeType, x0, y0, x, y, lineWidth, lineColor);
			},
			draw: function (ctx) {
				if (canvasProps.isDrawing || canvasProps.isMoving) {
					ctx.clearRect(0, 0, canvasProps.canvasWidth, canvasProps.canvasHeight);
				}
				ctx.beginPath();
				ctx.moveTo(this.x0, this.y0);
				ctx.lineTo(this.x, this.y);
				ctx.lineWidth = this.lineWidth;
				ctx.strokeStyle = this.lineColor;
				ctx.stroke();
			},
			drawTo: function (x, y) {
				this.x = x;
				this.y = y;
			},
			contains: function (x, y) {

				var yStart = this.y0;
				var yEnd = this.y;
				var xStart = this.x0; //Math.min(this.x, this.x0);
				var xEnd = this.x; //Math.max(this.x, this.x0);

				var slope = (yEnd - yStart) / (xEnd - xStart);

				if (Math.abs(xEnd - xStart) <= 50) {
					var offset = this.lineWidth / 4;

					var leftEdge = xStart - offset;
					var rightEdge = xEnd + offset;
					var topEdge = Math.min(this.y, this.y0);
					var bottomEdge = Math.max(this.y, this.y0);

					if (x < leftEdge || x > rightEdge || y < topEdge || y > bottomEdge) {
						return false;
					}
					return true;
				}

				if ((y < (parseInt(slope * (x - xEnd) + yEnd - 10 - (this.lineWidth)))) ||
					(y > parseInt(slope * (x - xEnd) + yEnd + 10 + (this.lineWidth))) ||
					(x < Math.min(xStart, xEnd)) ||
					(x > Math.max(xStart, xEnd))) {
					return false;
				}
				return true;
			},
			moveTo: function (xChange, yChange) {
				this.x0 += xChange;
				this.y0 += yChange;
				this.x += xChange;
				this.y += yChange;

			}
		}),
		Rectangle: Shape.extend({
			constructor: function (shapeType, x0, y0, x, y, lineWidth, lineColor, fillColor, fill) {
				this.base(shapeType, x0, y0, x, y, lineWidth, lineColor, fillColor);
				this.fill = fill;
				this.width = Math.abs(this.x - this.x0);
				this.height = Math.abs(this.y - this.y0);
			},
			draw: function (ctx) {
				if (canvasProps.isDrawing || canvasProps.isMoving) {
					ctx.clearRect(0, 0, canvasProps.canvasWidth, canvasProps.canvasHeight);
				}

				ctx.beginPath();
				ctx.fillStyle = this.fillColor;
				if (this.fill) {
					ctx.fillRect(this.x, this.y, this.width, this.height);
				}
				ctx.strokeStyle = this.lineColor;
				ctx.rect(this.x, this.y, this.width, this.height);
				ctx.lineWidth = this.lineWidth;
				ctx.stroke();
			},
			drawTo: function (x, y) {
				this.x = Math.min(x, this.x0);
				this.y = Math.min(y, this.y0);
				this.width = Math.abs(x - this.x0);
				this.height = Math.abs(y - this.y0);
			},
			contains: function (x, y) {

				var offset = this.lineWidth / 2;
				var leftEdge = this.x - offset;
				var rightEdge = this.x + offset + this.width;
				var topEdge = this.y - offset;
				var bottomEdge = this.y + offset + this.height;

				if (x < leftEdge || x > rightEdge || y < topEdge || y > bottomEdge) {
					return false;
				}
				return true;
			},
			moveTo: function (xChange, yChange) {
				this.x += xChange;
				this.y += yChange;
				this.x0 += xChange;
				this.y0 += yChange;
			}
		}),
		Circle: Shape.extend({
			constructor: function (shapeType, x0, y0, x, y, lineWidth, lineColor, fillColor, fill, radius) {
				this.base(shapeType, x0, y0, x, y, lineWidth, lineColor, fillColor);
				this.fill = fill;
				this.radius = radius;
			},
			draw: function (ctx) {

				if (canvasProps.isDrawing || canvasProps.isMoving) {
					ctx.clearRect(0, 0, canvasProps.canvasWidth, canvasProps.canvasHeight);
				}
				ctx.beginPath();
				ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
				ctx.lineWidth = this.lineWidth;
				ctx.fillStyle = this.fillColor;
				if (this.fill) {
					ctx.fill();
				}
				ctx.strokeStyle = this.lineColor;
				ctx.stroke();
			},
			drawTo: function (x, y) {

				this.x = Math.abs(this.x0 - x) / 2 + Math.min(this.x0, x);
				this.y = Math.abs(this.y0 - y) / 2 + Math.min(this.y0, y);

				var distX = Math.abs(this.x0 - x) / 2;
				var distY = Math.abs(this.y0 - y) / 2;

				this.radius = Math.sqrt(distX * distX + distY * distY);
			},
			contains: function (x, y) {

				var xDist = Math.abs(x - this.x);
				var yDist = Math.abs(y - this.y);
				var radDist = this.radius + this.lineWidth / 4;

				if ((Math.pow((xDist), 2)) + (Math.pow((yDist), 2)) <= Math.pow(radDist, 2)) {
					return true;
				}
				return false;
			},
			moveTo: function (xChange, yChange) {
				this.x += xChange;
				this.y += yChange;
				this.x0 += xChange;
				this.y0 += yChange;
			}
		}),
		Pen: Shape.extend({
			constructor: function (shapeType, x0, y0, x, y, lineWidth, lineColor, fillColor, fill, arrayPoints) {
				this.base(shapeType, x0, y0, x, y, lineWidth, lineColor);
				this.points = arrayPoints;
				if (!arrayPoints) {
					this.points = [{
						x: x0,
						y: y0
					}];
				}
			},
			drawTo: function (x, y) {
				this.points.push({
					x: x,
					y: y
				});
			},
			draw: function (ctx) {
				if (canvasProps.isDrawing || canvasProps.isMoving) {
					ctx.clearRect(0, 0, canvasProps.canvasWidth, canvasProps.canvasHeight);
				}
				ctx.beginPath();
				for (var i = 0; i < this.points.length; i++) {
					if (i === 0) {
						ctx.moveTo(this.points[i].x, this.points[i].y);
					} else {
						ctx.lineTo(this.points[i].x, this.points[i].y);
					}
				}
				ctx.lineWidth = this.lineWidth;
				ctx.strokeStyle = this.lineColor;
				ctx.stroke();
			},
			contains: function (x, y) {

				for (var i = 0; i < this.points.length; i++) {

					var offset = this.lineWidth;
					var leftEdge = this.points[i].x - offset;
					var rightEdge = this.points[i].x + offset;
					var topEdge = this.points[i].y - offset;
					var bottomEdge = this.points[i].y + offset;


					if (x < leftEdge || x > rightEdge || y < topEdge || y > bottomEdge) {

					} else {
						return true;
					}
				}
				return false;
			},
			moveTo: function (xChange, yChange) {
				for (var i = 0; i < this.points.length; i++) {
					this.points[i].x += xChange;
					this.points[i].y += yChange;
				}
			}
		}),
		Text: Shape.extend({
			constructor: function (shapeType, x0, y0, text, lineColor, fontSize, fontStyle, bold, italic) {
				this.base(shapeType, x0, y0, undefined, undefined, undefined, lineColor);
				this.fontSize = fontSize;
				this.fontStyle = fontStyle;
				this.text = text;
				this.bold = bold;
				this.italic = italic;
			},
			draw: function (ctx) {

				if (canvasProps.isDrawing || canvasProps.isMoving) {
					ctx.clearRect(0, 0, canvasProps.canvasWidth, canvasProps.canvasHeight);
				}

				var font = '';

				if (this.italic) {
					font += 'italic ';
				}

				if (this.bold) {
					font += 'bold ';
				}

				font += this.fontSize + 'px' + ' ' + this.fontStyle;

				ctx.font = font;

				ctx.fillStyle = this.lineColor;
				ctx.textBaseline = 'top';
				ctx.fillText(this.text, this.x0, this.y0);

			},
			contains: function (x, y) {

				context.font = this.fontSize + 'px' + ' ' + this.fontStyle;
				var width = context.measureText(this.text).width + 5;
				var fontSize = parseInt(this.fontSize);
				var height = fontSize + 5;

				if (x < this.x0 || x > this.x0 + width || y < this.y0 || y > this.y0 + height) {
					return false;
				}
				return true;
			},
			moveTo: function (xChange, yChange) {
				this.x0 += xChange;
				this.y0 += yChange;
			}
		})

	};


	$('#mainCanvas').mousedown(function (e) {
		var x0 = e.pageX - $(this).offset().left;
		var y0 = e.pageY - $(this).offset().top;

		console.log(this.offsetLeft);
		console.log(this.offsetTop);

		if (canvasProps.canMove) {

			for (var i = canvasProps.shapes.length - 1; i >= 0; i--) {
				if (canvasProps.shapes[i].contains(x0, y0)) {

					canvasProps.currentShape = canvasProps.shapes[i];
					canvasProps.shapes.splice(i, 1);
					canvasProps.start.x0 = x0;

					canvasProps.start.y0 = y0;

					canvasProps.drawAll();

					canvasProps.isMoving = true;

					canvasProps.currentShape.draw(context);
					break;

				}
			}
		} else if (canvasProps.canDraw) {
			canvasProps.undoArray = [];

			canvasProps.isDrawing = true;

			// TODO: Check if function and comment what on earth this does
			canvasProps.currentShape = new global[canvasProps.currentType](canvasProps.currentType, x0, y0, x0, y0, canvasProps.currentLineWidth, canvasProps.currentLineColor, canvasProps.currentFillColor, canvasProps.currentFill);

		} else if (canvasProps.canWrite) {

			if (!canvasProps.isWriting) {

				canvasProps.isWriting = true;

				canvasProps.start.x0 = x0;

				canvasProps.start.y0 = y0;

				$('#textBox').show();

				$('#textBox').offset({
					top: y0,
					left: x0
				});

				$('#textBox').css('z-index', 10);

			}
		}
	});

	$('#mainCanvas').mousemove(function (e) {

		var x = e.pageX - $(this).offset().left;
		var y = e.pageY - $(this).offset().top;

		if (canvasProps.isDrawing) {

			canvasProps.currentShape.drawTo(x, y);

			canvasProps.currentShape.draw(context);

		} else if (canvasProps.isMoving) {

			var xChange = x - canvasProps.start.x0;
			var yChange = y - canvasProps.start.y0;

			canvasProps.currentShape.moveTo(xChange, yChange);

			canvasProps.currentShape.draw(context);

			canvasProps.start.x0 = x;
			canvasProps.start.y0 = y;

		} else if (canvasProps.isWriting) {

		}
	});

	$('#mainCanvas').mouseup(function (e) {
		if (canvasProps.isDrawing) {

			var x = e.pageX - $(this).offset().left;
			var y = e.pageY - $(this).offset().top;

			canvasProps.currentShape.drawTo(x, y);

			canvasProps.shapes.push(canvasProps.currentShape);

			canvasProps.isDrawing = false;

			canvasProps.drawAll();

		} else if (canvasProps.isMoving) {

			canvasProps.shapes.push(canvasProps.currentShape);

			canvasProps.isMoving = false;

			canvasProps.drawAll();

		} else if (canvasProps.isWriting) {

		}
	});

	$('#undo').click(function (e) {
		canvasProps.resetState();
		var undoShape = canvasProps.shapes.pop();
		if (undoShape) {
			canvasProps.undoArray.push(undoShape);
			canvasProps.drawAll();
		}
	});

	$('#redo').click(function (e) {
		canvasProps.resetState();
		var redoShape = canvasProps.undoArray.pop();
		if (redoShape) {
			canvasProps.shapes.push(redoShape);
			canvasProps.drawAll();
		}
	});
	$('.shapeChoice').click(function (e) {
		canvasProps.resetState();
		canvasProps.currentType = $(this).data('shape');
		canvasProps.canDraw = true;
		canvasProps.canMove = false;
		canvasProps.canWrite = false;
		$('.shapeChoice').removeClass('toggled');
		$('#text').removeClass('toggled');
		$('#move').removeClass('toggled');
		$(this).addClass('toggled');
	});

	$('#move').click(function (e) {
		$('.shapeChoice').removeClass('toggled');
		$('#text').removeClass('toggled');
		$('#move').addClass('toggled');
		canvasProps.resetState();
		canvasProps.canDraw = false;
		canvasProps.canMove = true;
		canvasProps.canWrite = false;
	});

	$('#text').click(function (e) {
		$('.shapeChoice').removeClass('toggled');
		$('#text').addClass('toggled');
		$('#move').removeClass('toggled');
		canvasProps.resetState();
		canvasProps.canDraw = false;
		canvasProps.canMove = false;
		canvasProps.canWrite = true;
	});

	$('#textBox').bind('keypress', function (e) {


		var code = e.keyCode || e.which;
		if (code == 13) {
			e.preventDefault();

			var text = $('#textBox').val();

			canvasProps.currentShape = new global.Text("Text", canvasProps.start.x0, canvasProps.start.y0, text, canvasProps.currentLineColor, canvasProps.currentFontSize, canvasProps.currentFontStyle, canvasProps.currentFontBold, canvasProps.currentFontItalic);

			canvasProps.shapes.push(canvasProps.currentShape);

			$('#textBox').hide();

			$('#textBox').val('');

			canvasProps.drawAll();

			canvasProps.isWriting = false;
		}

	});

	$('#lineColor').spectrum({
		color: '#000',
		showPalette: true,
		change: function (color) {
			canvasProps.currentLineColor = color.toHexString();
		}
	});

	$('#fillColor').spectrum({
		color: '#FFF',
		showPalette: true,
		change: function (color) {
			canvasProps.currentFillColor = color.toHexString();
		}
	});

	$('#lineWidth').jRange({
		from: 1,
		to: 50,
		showLabels: true,
		step: 1,
		width: 150,
		showScale: false,
		onstatechange: function (val) {
			canvasProps.currentLineWidth = parseInt(val);
		}
	});

	$('#fontSize').change(function (e) {
		canvasProps.currentFontSize = parseInt($(this).val());
	});

	$('#fontStyle').change(function (e) {
		canvasProps.currentFontStyle = $(this).val();
	});

	$('#fontBold').click(function (e) {
		$(this).toggleClass('toggled');
		canvasProps.currentFontBold = !canvasProps.currentFontBold;
	});

	$('#fontItalic').click(function (e) {
		$(this).toggleClass('toggled');
		canvasProps.currentFontItalic = !canvasProps.currentFontItalic;
	});

	$('#fillShape').click(function (e) {
		$(this).toggleClass('toggled');
		canvasProps.currentFill = !canvasProps.currentFill;
	});

	$('#saveDrawing').click(function (e) {
		var drawingName = window.prompt("Please name your drawing");

		var shapes = JSON.stringify(canvasProps.shapes);

		if (drawingName) {
			var drawingData = {
				"user": "kristjanj11",
				"name": drawingName,
				"content": shapes,
				"template": false
			};

			$.ajax({
				type: "POST",
				contentType: "application/json; charset='utf-8",
				url: "http://whiteboard.apphb.com/Home/Save",
				data: drawingData,
				dataType: "jsonp",
				crossDomain: true,
				success: function (data) {

				},
				error: function (xhr, err) {
					console.log('failed to load data. xhr: ', xhr, ' - err: ', err);
				}
			});
		}

	});

	$(document).on('click', '.drawing', function (e) {
		var keyToFind = $(this).html();


		for (var i = 0; i < canvasProps.loadedDrawings.length; i++) {
			if (canvasProps.loadedDrawings[i].title === keyToFind) {

				canvasProps.undoArray = [];
				canvasProps.shapes = [];
				var foundObject = canvasProps.loadedDrawings[i];
				var currObj = [];
				var newItem = [];

				for (var j = 0; j < foundObject.data.length; j++) {
					if (foundObject.data[j].shapeType === 'Text') {
						currObj = foundObject.data[j];
						newItem = new global.Text(currObj.shapeType, currObj.x0, currObj.y0, currObj.text, currObj.lineColor, currObj.fontSize, currObj.fontStyle, currObj.bold, currObj.italic);
					} else {

						currObj = foundObject.data[j];
						// Handle the creation of rectangles
						if (currObj.shapeType === 'Rectangle') {

							currObj.x0 = currObj.x + currObj.width;
							currObj.y0 = currObj.y + currObj.height;
							newItem = new global[currObj.shapeType](currObj.shapeType, currObj.x0, currObj.y0, currObj.x, currObj.y, currObj.lineWidth,
								currObj.lineColor, currObj.fillColor, currObj.fill);

						} else if (currObj.shapeType === 'Circle') {

							newItem = new global.Circle(currObj.shapeType, currObj.x0, currObj.y0, currObj.x, currObj.y, currObj.lineWidth,
								currObj.lineColor, currObj.fillColor, currObj.fill, currObj.radius);

						} else if (currObj.shapeType === 'Pen') {

							newItem = new global.Pen(currObj.shapeType, currObj.x0, currObj.y0, currObj.x, currObj.y, currObj.lineWidth,
								currObj.lineColor, currObj.fillColor, currObj.fill, currObj.points);

						} else {
							newItem = new global[currObj.shapeType](currObj.shapeType, currObj.x0, currObj.y0, currObj.x, currObj.y, currObj.lineWidth,
								currObj.lineColor, currObj.fillColor, currObj.fill);
						}



					}
					canvasProps.shapes.push(newItem);
				}
				canvasProps.drawAll();

			}
		}

	});


	canvasProps.init();
});