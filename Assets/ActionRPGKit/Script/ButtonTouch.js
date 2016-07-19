#pragma strict
var flag : boolean;

function start() {
	flag = false;
}

function Update() {
	flag = false;
	for (var touch : Touch in Input.touches) {
		if (guiTexture.HitTest(touch.position)) {
			flag = true;
		}
	}
}
