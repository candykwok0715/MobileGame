#pragma strict
var player : GameObject;
var direction_joystick : GameObject;
var camera_joystick : GameObject;
private var mainCam : Transform;
private var mainDirection : Transform;
private var mainCamera : Transform;
private var spawnDirection : GameObject;
private var spawnCamera : GameObject;

function Start() {

	//save current scene name
	//var path : String [] = EditorApplication.currentScene.Split(char.Parse("/"));
	//path[path.Length -1] = path[path.Length-1].Replace(".unity","");	
	PlayerPrefs.SetString("currentMap",Application.loadedLevelName);

	//Check for Current Player in the scene
	var currentPlayer : GameObject = GameObject.FindWithTag("Player");
	if (currentPlayer) {
		// If there are the player in the scene already. Check for the Spawn Point Name
		// If it match then Move Player to the SpawnpointPosition
		var spawnPointName : String = currentPlayer.GetComponent(Status).spawnPointName;
		var spawnPoint : GameObject = GameObject.Find(spawnPointName);
		if (spawnPoint) {
			currentPlayer.transform.position = spawnPoint.transform.position;
			currentPlayer.transform.rotation = spawnPoint.transform.rotation;
		}
		var oldCam : GameObject = currentPlayer.GetComponent(AttackTrigger).Maincam.gameObject;
		if (!oldCam) {
			return;
		}
		var cam : GameObject[] = GameObject.FindGameObjectsWithTag("MainCamera");
		for (var cam2 : GameObject in cam) {
			if (cam2 != oldCam) {
				Destroy(cam2.gameObject);
			}
		}

		spawnDirection = Instantiate(direction_joystick);
		spawnCamera = Instantiate(camera_joystick);
		mainDirection = GameObject.FindWithTag("DirectionJoy").transform;
		mainCamera = GameObject.FindWithTag("CameraJoy").transform;
		//Check for Main Camera
		oldCam.GetComponent(ARPGcamera).camera_direction = mainCamera.transform;
		oldCam.GetComponent(ARPGcamera).player_direction = mainDirection.transform;
		// If there are the player in the scene already. We will not spawn the new player.
		return;
	}

	//Spawn Player
	var spawnPlayer : GameObject = Instantiate(player, transform.position, transform.rotation);
	spawnDirection = Instantiate(direction_joystick);
	spawnCamera = Instantiate(camera_joystick);
	mainCam = GameObject.FindWithTag("MainCamera").transform;
	mainDirection = GameObject.FindWithTag("DirectionJoy").transform;
	mainCamera = GameObject.FindWithTag("CameraJoy").transform;
	var checkCam : ARPGcamera = mainCam.GetComponent(ARPGcamera);
	//Check for Main Camera
	if (mainCam && checkCam) {
		mainCam.GetComponent(ARPGcamera).target = spawnPlayer.transform;
		mainCam.GetComponent(ARPGcamera).camera_direction = mainCamera.transform;
		mainCam.GetComponent(ARPGcamera).player_direction = mainDirection.transform;
	}

	Screen.lockCursor = true;

}
