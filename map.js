let img = {"w": 750, "h": 625};
let canvas = {"w": 1600, "h": 900};
let limits = {"min": 0.5, "max": 100};

let map = [];
let posx = 0;
let posy = 0;
let startDragX = 0;
let startDragY = 0;
let dragging = false;
let debug = false;
let zoomFactor = 1;
let zoomLevel = 1;
let ctx;

function initMap() {
	for(let x = 0;x<Math.pow(2, zoomLevel-1);x++) {
		map[x] = [];
		for(let y = 0;y<Math.pow(2, zoomLevel-1);y++) {
			map[x][y] = new Image();
			map[x][y].onload = function(){ if(debug){console.log("loaded !");} drawMap(); }
			map[x][y].src = "img/"+(zoomLevel-1)+"/"+x+"-"+y+".png";
			//map[x][y].src = "http://lorempixel.com/"+img.w+"/"+img.h;
		}
	}
}

function drawMap() {
	if(debug){ console.log("ZoomFactor: "+zoomFactor+" at level "+zoomLevel); }
	ctx.clearRect(0, 0, canvas.w, canvas.h);
	for(let x = 0;x<Math.pow(2, zoomLevel-1);x++) {
		for(let y = 0;y<Math.pow(2, zoomLevel-1);y++) {
			if(map[x][y].complete) { ctx.drawImage(map[x][y], 
				x*img.w*zoomFactor/Math.pow(2, zoomLevel-1) - posx +x * (debug ? 1 : -1), 
				y*img.h*zoomFactor/Math.pow(2, zoomLevel-1) - posy +y * (debug ? 1 : -1), 
				img.w*zoomFactor/Math.pow(2, zoomLevel-1), 
				img.h*zoomFactor/Math.pow(2, zoomLevel-1)); }
		}
	}
}

$("body").append("<canvas id=\"scene\" width=\""+canvas.w+"\" height=\""+canvas.h+"\"></canvas>");
let cvs = document.getElementById("scene");
if (cvs.getContext) {
	ctx = cvs.getContext("2d");
	initMap();
	drawMap(ctx);
	
	$("#scene").mousedown((e) => { dragging = true; startDragX = e.clientX + posx; startDragY = e.clientY + posy; })
	.mouseup(() => { dragging = false; })
	.mousemove((e) => {
		if(dragging) {
			posx = startDragX - e.clientX;
			posy = startDragY - e.clientY;
			drawMap(ctx);
		}
	})
	$(window).on("DOMMouseScroll", (e) => {
		e.preventDefault();
		if (e.originalEvent.wheelDelta > 0 || e.originalEvent.detail < 0) {
			// zoom in
			if(zoomFactor < limits.max) {
				zoomFactor *= 1.1;
				if(zoomFactor/Math.pow(2, zoomLevel-1) > 1 && zoomLevel < 5) { zoomLevel++; initMap(); }
				posx += (e.originalEvent.clientX + posx) * 0.1;
				posy += (e.originalEvent.clientY + posy) * 0.1;
			}
		}
		else {
			// zoom out
			if(zoomFactor > limits.min) {
				zoomFactor *= 0.9;
				if(zoomFactor/Math.pow(2, zoomLevel-2) < 1 && zoomLevel > 1) { zoomLevel--; initMap(); }
				posx -= (e.originalEvent.clientX + posx) * 0.1;
				posy -= (e.originalEvent.clientY + posy) * 0.1;
			}
		}
		drawMap();
	})
	.on("keypress", (e) => {
		if(e.which == 100) { debug = !debug; drawMap(); }
	});
}