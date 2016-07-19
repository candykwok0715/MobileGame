#pragma strict

function Start () {
	var win = GameObject.FindWithTag("MainCamera");
	if(win){
		var obj:Win = win.GetComponent("Win");
		obj.StartCoroutine (obj.execute());
	}
}

function Update () {

}