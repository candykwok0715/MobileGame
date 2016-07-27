#pragma strict
var minimapCam : GameObject;
private var state : boolean = true;

function Update () {
	if(Input.GetKeyDown("m") && minimapCam){
			OnOffCamera();
	}

}

function OnOffCamera(){
	if(minimapCam.active == true){
			minimapCam.active = false;
	}else{
			minimapCam.active = true;
	}
}