#pragma strict

var playerPrefab : GameObject[] = new GameObject[3];
var playerPic : Texture2D[] = new Texture2D[3];
var startScene : String = "Field1";
private var menu : boolean = true;
private var charSelectMenu : boolean = false;
private var loadMenu : boolean = false;

function OnGUI(){
	if(charSelectMenu){
		GUI.Box ( new Rect(Screen.width / 2 - 350,100,700,500), "Select Player");
		if (GUI.Button ( new Rect(Screen.width / 2 + 295,105,30,30), "X")) {
			loadMenu = false;
			charSelectMenu = false;
			menu = true;
		}
		if (GUI.Button ( new Rect(Screen.width / 2 - 285,175,280,373), playerPic[0])) {
				//Spawn playerPrefab[0]
				NewGame(0);
		}
		if (GUI.Button ( new Rect(Screen.width / 2 + 35,175,280,373), playerPic[1])) {
				//Spawn playerPrefab[1]
				NewGame(1);
		}
	}
}

function NewGame(id : int){
	Time.timeScale = 1.0f;
	//Spawn Player from received ID
	var spawn : GameObject = Instantiate(playerPrefab[id] , transform.position , transform.rotation);
	var dst : DontDestroyOnload  = spawn.GetComponent(DontDestroyOnload);
	if(!dst){
		spawn.gameObject.AddComponent(DontDestroyOnload);
	}
	Application.LoadLevel(startScene);
}