#pragma strict
var teleportToMap : String = "Level1";
var spawnPointName : String = "PlayerSpawn1"; //Use for Move Player to the SpawnPoint Position
//var spawnPosition : Vector3;

function Start () {

}

function OnTriggerEnter (other : Collider) {
		if(other.tag == "Player"){
			other.GetComponent(Status).spawnPointName = spawnPointName;
			ChangeMap();
		}

}

function ChangeMap(){
	PlayerPrefs.SetString("currentMap",teleportToMap);
	Application.LoadLevel (teleportToMap);
}