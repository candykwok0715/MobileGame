#pragma strict
var target : Transform;
var zoomMin : float = 20;
var zoomMax : float = 70;

function Start () {
	if(!target){
		yield WaitForSeconds(0.1);
    	target = GameObject.FindWithTag ("Player").transform;
    }

}

function Update () {
	if(!target){
    	return;
    }
  	transform.position = new Vector3(target.position.x ,transform.position.y ,target.position.z);
  	
  	if(Input.GetKeyDown(KeyCode.KeypadPlus) && camera.orthographicSize >= zoomMin){
  		camera.orthographic = true;
		camera.orthographicSize -= 10;
  	}
  	if(Input.GetKeyDown(KeyCode.KeypadMinus) && camera.orthographicSize <= zoomMax){
  		camera.orthographic = true;
		camera.orthographicSize += 10;
  	}
}

function FindTarget(){
	if(target){
		return;
	}
	var newTarget : Transform = GameObject.FindWithTag ("Player").transform;
	if(newTarget){
			target = newTarget;
	}
}