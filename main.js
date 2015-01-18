var canvas = document.getElementById('mainCanvas');
var context = canvas.getContext('2d');

var canvasProps = {
	isDrawing: false,
	shapes: [],
	drawAll: function () {
		context.clearRect(0, 0, 500, 400);
		for (var i = 0; i < canvasProps.shapes.length; i++) {
			canvasProps.shapes[i].draw(context);
		}
	},
	currentShape: {},
	currentType: 'Line'
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
	})
};

$('.shapeChoice').click(function (e) {
	canvasProps.currentType = $(this).data('shape');
});

$('#mainCanvas').mousedown(function (e) {
	if (!canvasProps.isDrawing) {

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

		canvasProps.drawAll();
		canvasProps.currentShape.draw(context);

	}
});

$('#mainCanvas').mouseup(function (e) {
	if (canvasProps.isDrawing) {

		var x = e.pageX - this.offsetLeft;
		var y = e.pageY - this.offsetTop;

		canvasProps.currentShape.move(x, y);

		canvasProps.currentShape.draw(context);

		canvasProps.shapes.push(canvasProps.currentShape);

		canvasProps.drawAll();

		canvasProps.isDrawing = false;

	}
});