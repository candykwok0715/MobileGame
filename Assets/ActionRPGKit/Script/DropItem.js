#pragma strict
private var dropRate1 : int[];
private var dropRate2 : int[];
var dropPercentMax = 100;

class ItemDr {
		var itemPrefab : GameObject;
		var dropRateMin : int;
		var dropRateMax : int;
}

var itemDrop : ItemDr[] = new ItemDr[3];

function Start () {
	//dropRate1 = new int[itemDrop.Length];
	//dropRate2 = new int[itemDrop.Length];
	
	var got = Random.Range(0,dropPercentMax);
	var gi = 0;
	while(gi < itemDrop.Length){
		if(got >= itemDrop[gi].dropRateMin && got <= itemDrop[gi].dropRateMax){
			Instantiate(itemDrop[gi].itemPrefab, transform.position , itemDrop[gi].itemPrefab.transform.rotation);
			gi = itemDrop.Length;
		}else{
			gi++;
		}
	
	}

}

function Update () {

}