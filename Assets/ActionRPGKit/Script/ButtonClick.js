#pragma strict
var flag : boolean;

function Start() {
	flag = false;
}

function OnMouseDown(){
	if (flag){
		flag = false;
		Time.timeScale = 1.0;
	} else {
		flag = true;
		Time.timeScale = 0.0;
	}
}
