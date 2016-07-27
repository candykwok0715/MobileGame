#pragma strict
var itemID : int = 0;
var itemQuantity : int = 1;

enum ItType {
	Usable = 0,
	Equipment = 1,
}

var itemType : ItType = ItType.Usable; 

var duration : float = 30.0;

function Start () {
	if(duration > 0){
		Destroy (gameObject, duration);
	}
}

function OnTriggerEnter (other : Collider) {
		//Pick up Item
	if (other.gameObject.tag == "Player") {
		if(itemType == ItType.Usable){
			var full : boolean = other.GetComponent(Inventory).AddItem(itemID , itemQuantity);
		}else{
			full = other.GetComponent(Inventory).AddEquipment(itemID);
		}
 		
		if(!full){
    		Destroy (gameObject);
    	}  	
     }
 }
 
 
 
 
