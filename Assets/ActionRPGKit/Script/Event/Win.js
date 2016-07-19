#pragma strict

function Start () {

}

function execute(){
	var mainCam = GameObject.FindWithTag("MainCamera");
	var player = GameObject.FindWithTag("Player");
	var sound_list = mainCam.GetComponents(AudioSource);
	var bgm:AudioSource = sound_list[0];
	bgm.Stop();
	var win:AudioSource = sound_list[1];
	win.Play();
	if (player) {
		yield WaitForSeconds(10.0f);
		Application.LoadLevel("Field1");
		yield WaitForSeconds(5.0f);
		var saveload :SaveLoad = player.GetComponent("SaveLoad");
		saveload.SaveData(true);
	}else{
		Destroy(mainCam.transform.gameObject); //Destroy Main Camera
		Destroy(player.transform.gameObject); //Destroy Player
		print("Go to title scene - no save");
		Application.LoadLevel("Title");
	}
}

function Update () {

}