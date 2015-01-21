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
	undoArray: []
};


var Shape = Base.extend({
	constructor: function (x0, y0, x, y) {
		this.x0 = x0;
		this.y0 = y0;
	},
	draw: function (ctx) {

	}
});

var global = {
	Line: Shape.extend({
		constructor: function (x0, y0, x, y) {
			this.base(x0, y0, x, y);
		},
		draw: function (ctx) {
			if (canvasProps.isDrawing) {
				ctx.clearRect(0, 0, canvasProps.canvasWidth, canvasProps.canvasHeight);
			}
			ctx.beginPath();
			ctx.moveTo(this.x0, this.y0);
			ctx.lineTo(this.x, this.y);
			ctx.stroke();
		},
		move: function (x, y) {
			this.x = x;
			this.y = y;
		}
	}),
	Rectangle: Shape.extend({
		constructor: function (x0, y0, x, y) {
			this.base(x0, y0, x, y);
		},
		draw: function (ctx) {
			if (canvasProps.isDrawing) {
				ctx.clearRect(0, 0, canvasProps.canvasWidth, canvasProps.canvasHeight);
			}
			ctx.beginPath();
			ctx.rect(this.x, this.y, this.width, this.height);
			ctx.stroke();
		},
		move: function (x, y) {
			this.x = Math.min(x, this.x0);
			this.y = Math.min(y, this.y0);
			this.width = Math.abs(x - this.x0);
			this.height = Math.abs(y - this.y0);
		}
	}),
	Circle: Shape.extend({
		constructor: function (x0, y0, x, y) {
			this.base(x0, y0, x, y);
		},
		draw: function (ctx) {
			if (canvasProps.isDrawing) {
				ctx.clearRect(0, 0, canvasProps.canvasWidth, canvasProps.canvasHeight);
			}
			ctx.beginPath();
			ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
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
		constructor: function (x0, y0) {
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
			ctx.stroke();
		}
	})
};

$('.shapeChoice').click(function (e) {
	canvasProps.currentType = $(this).data('shape');
});

$('#mainCanvas').mousedown(function (e) {
	if (!canvasProps.isDrawing) {
		canvasProps.undoArray = [];

		canvasProps.isDrawing = true;
		var x0 = e.pageX - this.offsetLeft;
		var y0 = e.pageY - this.offsetTop;
		canvasProps.currentShape = new global[canvasProps.currentType](x0, y0, x0, y0);

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

$('#lineColor').spectrum({
	color: '#000',
	change: function (color) {
		console.log('changed line color to:', color.toHexString());
	}
});

$('#fillColor').spectrum({
	color: '#000',
	change: function (color) {
		console.log('changed line color to:', color.toHexString());
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
		console.log('val is', val);
	}
});