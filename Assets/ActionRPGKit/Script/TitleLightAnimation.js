#pragma strict

var light_arr : Transform[];
private var count:int = 0;
function Start () {

}

function Update () {

}

function OnGUI(){
	if(light_arr.Length > 0){
		for(var i=0;i<light_arr.Length;i++){
			light_arr[i].transform.position.z += 0.05;
		}
		count++;
		if(count>=100){
			for(i=0;i<light_arr.Length;i++){
				light_arr[i].transform.position.z -= 5;
			}
			count = 0;
		}
	}
}