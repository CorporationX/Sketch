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
	currentFillColor: '#000000',
	currentLineWidth: 10,
	currentFontSize: 12,
	currentFontStyle: 'Georgia'
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
	moveTo: function (xChange, yChange) {

	},
	contains: function (x, y) {

	},
	drawTo: function (x, y) {

	}
});

var global = {
	Line: Shape.extend({
		constructor: function (x0, y0, x, y, lineWidth, lineColor) {
			this.base(x0, y0, x, y, lineWidth, lineColor);
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
		constructor: function (x0, y0, x, y, lineWidth, lineColor, fillColor) {
			this.base(x0, y0, x, y, lineWidth, lineColor, fillColor);
		},
		draw: function (ctx) {
			if (canvasProps.isDrawing || canvasProps.isMoving) {
				ctx.clearRect(0, 0, canvasProps.canvasWidth, canvasProps.canvasHeight);
			}
			ctx.beginPath();
			ctx.rect(this.x, this.y, this.width, this.height);
			ctx.lineWidth = this.lineWidth;
			ctx.strokeStyle = this.lineColor;
			ctx.stroke();
		},
		drawTo: function (x, y) {
			this.x = Math.min(x, this.x0);
			this.y = Math.min(y, this.y0);
			this.width = Math.abs(x - this.x0);
			this.height = Math.abs(y - this.y0);
		},
		contains: function (x, y) {

			console.log('width', this.width, '   height', this.height);

			var offset = this.lineWidth / 2;
			var leftEdge = this.x0 - offset;
			var rightEdge = this.x0 + offset + this.width;
			var topEdge = this.y0 - offset;
			var bottomEdge = this.y0 + offset + this.height;

			if (x < leftEdge || x > rightEdge || y < topEdge || y > bottomEdge) {
				return false;
			}
			return true;
		},
		moveTo: function (xChange, yChange) {
			this.x += xChange;
			this.y += yChange;
		}
	}),
	Circle: Shape.extend({
		constructor: function (x0, y0, x, y, lineWidth, lineColor, fillColor) {
			this.base(x0, y0, x, y, lineWidth, lineColor, fillColor);
		},
		draw: function (ctx) {
			if (canvasProps.isDrawing || canvasProps.isMoving) {
				ctx.clearRect(0, 0, canvasProps.canvasWidth, canvasProps.canvasHeight);
			}
			ctx.beginPath();
			ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
			ctx.lineWidth = this.lineWidth;
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
		constructor: function (x0, y0, text, lineColor, fontSize, fontStyle) {
			this.base(x0, y0, undefined, undefined, undefined, lineColor);
			this.fontSize = fontSize;
			this.fontStyle = fontStyle;
			this.text = text;
		},
		draw: function (ctx) {

			if (canvasProps.isDrawing || canvasProps.isMoving) {
				ctx.clearRect(0, 0, canvasProps.canvasWidth, canvasProps.canvasHeight);
			}

			ctx.font = this.fontSize + 'px' + ' ' + this.fontStyle;
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
	var x0 = e.pageX - this.offsetLeft;
	var y0 = e.pageY - this.offsetTop;

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
		canvasProps.currentShape = new global[canvasProps.currentType](x0, y0, x0, y0, canvasProps.currentLineWidth, canvasProps.currentLineColor, canvasProps.currentFillColor);

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

	var x = e.pageX - this.offsetLeft;
	var y = e.pageY - this.offsetTop;

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

		var x = e.pageX - this.offsetLeft;
		var y = e.pageY - this.offsetTop;

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

function resetState() {

	$('#textBox').hide();

	$('#textBox').val('');

	canvasProps.isWriting = false;

}

$('#undo').click(function (e) {
	resetState();
	var undoShape = canvasProps.shapes.pop();
	if (undoShape) {
		canvasProps.undoArray.push(undoShape);
		canvasProps.drawAll();
	}
});

$('#redo').click(function (e) {
	resetState();
	var redoShape = canvasProps.undoArray.pop();
	if (redoShape) {
		canvasProps.shapes.push(redoShape);
		canvasProps.drawAll();
	}
});

$('.shapeChoice').click(function (e) {
	resetState();
	canvasProps.currentType = $(this).data('shape');
	canvasProps.canDraw = true;
	canvasProps.canMove = false;
	canvasProps.canWrite = false;
});

$('#move').click(function (e) {
	resetState();
	canvasProps.canDraw = false;
	canvasProps.canMove = true;
	canvasProps.canWrite = false;
});

$('#text').click(function (e) {
	resetState();
	canvasProps.canDraw = false;
	canvasProps.canMove = false;
	canvasProps.canWrite = true;
});

$('#textBox').bind('keypress', function (e) {


	var code = e.keyCode || e.which;
	if (code == 13) {
		e.preventDefault();

		var text = $('#textBox').val();

		canvasProps.currentShape = new global.Text(canvasProps.start.x0, canvasProps.start.y0, text, canvasProps.currentLineColor, canvasProps.currentFontSize, canvasProps.currentFontStyle);

		canvasProps.shapes.push(canvasProps.currentShape);

		$('#textBox').hide();

		$('#textBox').val('');

		canvasProps.drawAll();

		canvasProps.isWriting = false;
	}

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