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
	currentFillColor: '#000000',
	currentLineWidth: 10
};


var Shape = Base.extend({
	constructor: function (x0, y0, x, y, lineWidth, lineColor, fillColor) {
		this.x0 = x0;
		this.y0 = y0;
		this.lineWidth = lineWidth;
		this.lineColor = lineColor;
		this.fillColor = fillColor;
	},
	draw: function (ctx) {

	},
	move: function (x, y) {

	}
});

var global = {
	Line: Shape.extend({
		constructor: function (x0, y0, x, y, lineWidth, lineColor) {
			this.base(x0, y0, x, y, lineWidth, lineColor);
		},
		draw: function (ctx) {
			if (canvasProps.isDrawing) {
				ctx.clearRect(0, 0, canvasProps.canvasWidth, canvasProps.canvasHeight);
			}
			ctx.beginPath();
			ctx.moveTo(this.x0, this.y0);
			ctx.lineTo(this.x, this.y);
			ctx.lineWidth = this.lineWidth;
			ctx.strokeStyle = this.lineColor;
			ctx.stroke();
		},
		move: function (x, y) {
			this.x = x;
			this.y = y;
		},
		contains: function (x, y, ctx) {

			var yStart = this.y0;
			var yEnd = this.y;
			var xStart = Math.min(this.x, this.x0);
			var xEnd = Math.max(this.x, this.x0);

			var slope = (yEnd - yStart) / (xEnd - xStart);

			var xPoint = this.x0;
			var yPoint = this.y0;

			if (Math.abs(xEnd - xStart) <= 50) {
				var offset = this.lineWidth / 4;
				var leftEdge = xStart - offset;
				var rightEdge = xEnd + offset;
				var topEdge = Math.min(this.y, this.y0);
				var bottomEdge = Math.max(this.y, this.y0);

				if (x < leftEdge || x > rightEdge || y < topEdge || y > bottomEdge) {
					console.log('straight false');
					return false;
				}
				console.log('straight true');
				return true;
			}

			if ((y < (parseInt(slope * (x - xPoint) + yPoint - 10 - (this.lineWidth / 2)))) ||
				(y > parseInt(slope * (x - xPoint) + yPoint + 10 + (this.lineWidth / 2)))) {
				console.log('norm false');
				return false;
			}
			console.log('norm true');
			return true;
		}
	}),
	Rectangle: Shape.extend({
		constructor: function (x0, y0, x, y, lineWidth, lineColor, fillColor) {
			this.base(x0, y0, x, y, lineWidth, lineColor, fillColor);
		},
		draw: function (ctx) {
			if (canvasProps.isDrawing) {
				ctx.clearRect(0, 0, canvasProps.canvasWidth, canvasProps.canvasHeight);
			}
			ctx.beginPath();
			ctx.rect(this.x, this.y, this.width, this.height);
			ctx.lineWidth = this.lineWidth;
			ctx.strokeStyle = this.lineColor;
			ctx.stroke();
		},
		move: function (x, y) {
			this.x = Math.min(x, this.x0);
			this.y = Math.min(y, this.y0);
			this.width = Math.abs(x - this.x0);
			this.height = Math.abs(y - this.y0);
		},
		contains: function (x, y, ctx) {
			var offset = this.lineWidth / 2;
			var leftEdge = this.x0 - offset;
			var rightEdge = this.x0 + offset + this.width;
			var topEdge = this.y0 - offset;
			var bottomEdge = this.y0 + offset + this.height;

			if (x < leftEdge || x > rightEdge || y < topEdge || y > bottomEdge) {
				return false;
			}
			return true;
		}
	}),
	Circle: Shape.extend({
		constructor: function (x0, y0, x, y, lineWidth, lineColor, fillColor) {
			this.base(x0, y0, x, y, lineWidth, lineColor, fillColor);
		},
		draw: function (ctx) {
			if (canvasProps.isDrawing) {
				ctx.clearRect(0, 0, canvasProps.canvasWidth, canvasProps.canvasHeight);
			}
			ctx.beginPath();
			ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
			ctx.lineWidth = this.lineWidth;
			ctx.strokeStyle = this.lineColor;
			ctx.stroke();
		},
		move: function (x, y) {

			this.x = Math.abs(this.x0 - x) / 2 + Math.min(this.x0, x);
			this.y = Math.abs(this.y0 - y) / 2 + Math.min(this.y0, y);

			var distX = Math.abs(this.x0 - x) / 2;
			var distY = Math.abs(this.y0 - y) / 2;

			this.radius = Math.sqrt(distX * distX + distY * distY);
		}
	}),
	Pen: Shape.extend({
		constructor: function (x0, y0, x, y, lineWidth, lineColor) {
			this.base(x0, y0, x, y, lineWidth, lineColor, fillColor);
			this.points = [{
				x: x0,
				y: y0
			}];
		},
		move: function (x, y) {
			this.points.push({
				x: x,
				y: y
			});
		},
		draw: function (ctx) {
			if (canvasProps.isDrawing) {
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
		contains: function (x, y, ctx) {

			for (var i = 0; i < this.points.length; i++) {

				var offset = this.lineWidth;
				var leftEdge = this.points[i].x - offset;
				var rightEdge = this.points[i].x + offset;
				var topEdge = this.points[i].y - offset;
				var bottomEdge = this.points[i].y + offset;

				// console.log('x', x);
				// console.log('y', y);
				// console.log('leftEdge', leftEdge);
				// console.log('rightEdge', rightEdge);
				// console.log('bottomEdge', bottomEdge);
				// console.log('topEdge', topEdge);

				if (x < leftEdge || x > rightEdge || y < topEdge || y > bottomEdge) {

				} else {
					console.log('true');
					return true;
				}
			}
			console.log('false');
			return false;
		}
	})
};

$('.shapeChoice').click(function (e) {
	canvasProps.currentType = $(this).data('shape');
});

$('#mainCanvas').mousedown(function (e) {
	var tempx = e.pageX - this.offsetLeft;
	var tempy = e.pageY - this.offsetTop;
	console.log('clicked x: ', tempx, ' and y: ', tempy);

	if (canvasProps.isMoving) {
		for (var i = 0; i < canvasProps.shapes.length; i++) {
			canvasProps.shapes[i].contains(tempx, tempy, context);
		}
	} else if (!canvasProps.isDrawing) {
		canvasProps.undoArray = [];

		canvasProps.isDrawing = true;
		var x0 = e.pageX - this.offsetLeft;
		var y0 = e.pageY - this.offsetTop;

		// TODO: Check if function and comment what on earth this does
		canvasProps.currentShape = new global[canvasProps.currentType](x0, y0, x0, y0, canvasProps.currentLineWidth, canvasProps.currentLineColor, canvasProps.currentFillColor);

	}
});

$('#mainCanvas').mousemove(function (e) {
	if (canvasProps.isDrawing) {

		var x = e.pageX - this.offsetLeft;
		var y = e.pageY - this.offsetTop;

		canvasProps.currentShape.move(x, y);

		canvasProps.currentShape.draw(context);

	}
});

$('#mainCanvas').mouseup(function (e) {
	if (canvasProps.isDrawing) {

		var x = e.pageX - this.offsetLeft;
		var y = e.pageY - this.offsetTop;

		canvasProps.currentShape.move(x, y);

		canvasProps.shapes.push(canvasProps.currentShape);

		console.log('current shape', canvasProps.currentShape);

		canvasProps.isDrawing = false;

		canvasProps.drawAll();

	}
});

$('#undo').click(function (e) {
	var undoShape = canvasProps.shapes.pop();
	if (undoShape) {
		canvasProps.undoArray.push(undoShape);
		canvasProps.drawAll();
	}
});

$('#redo').click(function (e) {
	var redoShape = canvasProps.undoArray.pop();
	if (redoShape) {
		canvasProps.shapes.push(redoShape);
		canvasProps.drawAll();
	}
});

$('#move').click(function (e) {
	canvasProps.isDrawing = false;
	canvasProps.isMoving = true;
});

$('#lineColor').spectrum({
	color: '#000',
	change: function (color) {
		canvasProps.currentLineColor = color.toHexString();
	}
});

$('#fillColor').spectrum({
	color: '#000',
	change: function (color) {
		canvasProps.currentFillColor = color.toHexString();
	}
});

$('#lineWidth').jRange({
	from: 1,
	to: 100,
	showLabels: true,
	step: 1,
	width: 150,
	showScale: false,
	onstatechange: function (val) {
		canvasProps.currentLineWidth = parseInt(val);
	}
});