#pragma strict
var cashMin : int = 10;
var cashMax : int = 50;
var duration : float = 30.0;

function Start () {
	if(duration > 0){
		Destroy (gameObject, duration);
	}
}

function OnTriggerEnter (other : Collider) {
		//Pick up Item
	if (other.gameObject.tag == "Player") {
		var gotCash = Random.Range(cashMin , cashMax);
		other.GetComponent(Inventory).cash += gotCash;
		Destroy (gameObject);
     }
 }
 
 
 
 
