#pragma strict
import MiniJSON;
import System.Collections.Generic;

var tip : Texture2D;
var title: Texture2D;
var goToScene : String = "Field1";
var server_url :String = "http://localhost/gamepro/";
var buttonSound : AudioClip;

private var btn_sound: AudioSource;

private var page : int = 0;
private var presave : int = 0;
private var stage = 0;
private var uid = 0;
private var ranking_mode = 0;

private var username = "";
private var password = "";
private var con_password = "";

private var warning_msg = "";
private var error = false;

private var loading_mode = 0;

private var ranking_list = new Array();
private var rankingwindow_rect = Rect (Screen.width / 2 - 270, 30,520,Screen.height-100);
private var tmp_obj:Dictionary.<String,System.Object>;


function Awake() {

	//for testing
	//PlayerPrefs.DeleteAll();
	
	presave = PlayerPrefs.GetInt("PreviousSave");
	uid = PlayerPrefs.GetInt("UID");	//return 0 if not found
	
	btn_sound = GetComponent("AudioSource");
	btn_sound.clip = buttonSound;
}

function OnGUI() {
	var customButton:GUIStyle = new GUIStyle("button");
	var customLabel:GUIStyle = new GUIStyle("label");
	customLabel.fontSize = 30f;
	customLabel.normal.textColor = Color.white;
	
	var customText:GUIStyle = new GUIStyle("label");
	customButton.fontSize = 30f;
	
	var customBox:GUIStyle = new GUIStyle("box");
	customBox.normal.textColor = Color.white;
	customBox.normal.background = MakeTex(600, 1, new Color(1.0f, 1.0f, 1.0f, 0.1f));
	customBox.fontSize = 40f;
	
	customText.fontSize = 30f;
	customText.normal.textColor = Color.white;
	customText.normal.background = MakeTex(600, 1, new Color(1.0f, 1.0f, 1.0f, 0.1f));
	
	var warningText:GUIStyle = new GUIStyle("label");
	warningText.fontSize = 30f;
	warningText.normal.textColor = Color.red;
		
	//title
	if(ranking_mode != 1)
		GUI.DrawTexture (Rect (Screen.width / 2 - 500,Screen.height - 250,900,200), title);
	
	if (page == 0 && stage == 0) {
		//Menu
		//Start new game
		if (GUI.Button(Rect(Screen.width - 300, 80, 220, 80), "Start Game", customButton)) {
			stage = 1;
			btn_sound.Play();
		}
		if (GUI.Button(Rect(Screen.width - 300, 200, 220, 80), "Load Game", customButton)) {
			btn_sound.Play();
			//Check for previous Save Data
			print(presave);
			if (presave == 10) {
				PlayerPrefs.SetInt("Loadgame", 10);
				Application.LoadLevel(goToScene);
			}
		}
		if (GUI.Button(Rect(Screen.width - 300, 320, 220, 80), "How to Play", customButton)) {
			btn_sound.Play();
			page = 1;
		}
		
		if (GUI.Button(Rect(Screen.width - 300, 440, 220, 80), "Ranking", customButton)) {
			btn_sound.Play();
			loadRankingData();
			page = 1;
			ranking_mode = 1;
		}
	}

	if (page == 1) {
		if(ranking_mode == 1){
			GUI.Window(0, rankingwindow_rect, RankingWindow, "Ranking", customBox);
		}else{
			//Help
			//GUI.Box (Rect (Screen.width /2 -250,85,500,400), tip);
			GUI.Box (Rect (50, 50 ,800,600), tip);
		}
		
		if (GUI.Button(Rect(Screen.width - 180, Screen.height - 110, 120, 60), "Back", customButton)) {
			btn_sound.Play();
			page = 0;
			ranking_mode = 0;
		}
	}
	
	if (stage == 1){
		if(uid == 0){
			GUI.Box(Rect (Screen.width / 2 - 270, 110,520,300), "", customBox);
			
			//New player
			if (GUI.Button(Rect (Screen.width / 2 - 200, 190,400,60), "New player", customButton)) {
				btn_sound.Play();
				stage = 2;
			}
			
			//Existing account
			if (GUI.Button(Rect (Screen.width / 2 - 200, 290,400,60), "Existing player", customButton)) {
				btn_sound.Play();
				stage = 3;
			}			
		}else{
			//existing player
			PlayerPrefs.SetInt("Loadgame", 0);
			Application.LoadLevel(goToScene);
		}
	}else if(stage == 2){
			//New player
			
			GUI.Box(Rect (Screen.width / 2 - 270, 110,520,300), "Register", customBox);
			
			//Draw underline
			GUI.Label (Rect (Screen.width / 2 - 95, 130,400,40), "__________", customLabel);
			//Label
			GUI.Label (Rect (Screen.width / 2 - 250, 190,400,40), "User name:", customLabel);
			GUI.Label (Rect (Screen.width / 2 - 250, 240,400,40), "Password:", customLabel);
			GUI.Label (Rect (Screen.width / 2 - 250, 290,400,40), "Confirm password:", customLabel);
			//input
			username = 		GUI.TextField (Rect (Screen.width / 2 - 250 + 260, 190,230,40), username, customText);			
			password = 		GUI.PasswordField (Rect (Screen.width / 2 - 250 + 260, 240,230,40), password, "*"[0], customText);
			con_password = 	GUI.PasswordField (Rect (Screen.width / 2 - 250 + 260, 290,230,40), con_password, "*"[0], customText);
			warning_msg = 	GUI.TextField (Rect (Screen.width / 2 - 250, 340,500,40), warning_msg, warningText);
			
			//new game player and no account
			if (GUI.Button(Rect(Screen.width - 320, Screen.height - 110, 120, 60), "Create", customButton)) {
				btn_sound.Play();
				error = false;
				if(password!=con_password){
					warning_msg = "Password not the same!";
					error = true;
				}else if(username.Trim()==""){
					warning_msg = "Username cannot be blank!";
					error = true;
				}else if(password.Trim()==""){
					warning_msg = "Password cannot be blank!";
					error = true;
				}
				
				if(!error){
					warning_msg = "";
					username = username.Trim();
					password = username.Trim();
					con_password = username.Trim();
					CreateNewAC();
				}
			}
	}else if(stage == 3){
			//Existing player
			
			GUI.Box(Rect (Screen.width / 2 - 270, 110,520,300), "Login", customBox);
			
			//Draw underline
			GUI.Label (Rect (Screen.width / 2 - 95, 130,400,40), "__________", customLabel);
			//Label
			GUI.Label (Rect (Screen.width / 2 - 250, 190,400,40), "User name:", customLabel);
			GUI.Label (Rect (Screen.width / 2 - 250, 240,400,40), "Password:", customLabel);
			//input
			username = GUI.TextField (Rect (Screen.width / 2 - 250 + 260, 190,230,40), username, customText);			
			password = GUI.PasswordField (Rect (Screen.width / 2 - 250 + 260, 240,230,40), password, "*"[0], customText);
			warning_msg = 	GUI.TextField (Rect (Screen.width / 2 - 250, 340,500,40), warning_msg, warningText);
			
			//Login with old record
			if (GUI.Button(Rect(Screen.width - 320, Screen.height - 110, 120, 60), "Login", customButton)) {
				btn_sound.Play();
				error = false;
				if(username.Trim()==""){
					warning_msg = "Username cannot be blank!";
					error = true;
				}else if(password.Trim()==""){
					warning_msg = "Password cannot be blank!";
					error = true;
				}
				
				if(!error){
					warning_msg = "";
					username = username.Trim();
					password = username.Trim();
					LoginProcess();
				}
			}
	}
	
	if(stage != 0){
		if (GUI.Button(Rect(Screen.width - 180, Screen.height - 110, 120, 60), "Back", customButton)) {
			btn_sound.Play();
			username = "";
			password = "";
			con_password = "";
			warning_msg = "";
			stage = 0;
			error = false;
		}
	}
	
	if(loading_mode==1){
		var loadingLabel:GUIStyle = new GUIStyle("label");
		loadingLabel.fontSize = 60f;
		customBox.normal.background = MakeTex(600, 1, new Color(0.0f, 0.0f, 0.0f, 0.5f));
		GUI.Box(Rect (0, 0,Screen.width,Screen.height), "", customBox);
		GUI.Label (Rect (Screen.width / 2 - 200, Screen.height / 2 - 60,400,120), "Loading...", loadingLabel);
	}

}

function RankingWindow(windowID : int){

	var customLabel:GUIStyle = new GUIStyle("label");
	customLabel.fontSize = 30f;
	customLabel.normal.textColor = Color.white;
	
	//Draw underline
	GUI.Label (Rect (rankingwindow_rect.width / 2 - 90, 20,400,40), "__________", customLabel);
	
	//width = 
	if(ranking_list.length > 0){
		for(var i=0;i<ranking_list.length;i++){
			tmp_obj = ranking_list[i];
			GUI.Label (Rect (rankingwindow_rect.width * 0.1, 70 + 40*i,rankingwindow_rect.width * 0.2,40), tmp_obj["rank"] + "", customLabel);
			GUI.Label (Rect (rankingwindow_rect.width * 0.3, 70 + 40*i,rankingwindow_rect.width * 0.5,40), tmp_obj["username"] + "", customLabel);
			GUI.Label (Rect (rankingwindow_rect.width * 0.7, 70 + 40*i,rankingwindow_rect.width * 0.3,40), tmp_obj["score"] + "", customLabel);
		}
	}else{
		GUI.Label (Rect (rankingwindow_rect.width * 0.1, 70 ,rankingwindow_rect.width / 2 - 30,40), "No records exist", customLabel);
	
	}
}

function MakeTex(width: int, height: int, col: Color) {
    var pix = new Color[width * height];
   
    for (var i = 0; i < pix.Length; i++) {
        pix[i] = col;
    }
   
    var result = new Texture2D(width, height);
    result.SetPixels(pix);
    result.Apply();
    return result;
}

function CreateNewAC(){
	loading_mode = 1;
	//Create post
	var form : WWWForm = new WWWForm();  
	form.AddField("username", username);  
	form.AddField("password", password);  
	var getData : WWW = WWW(server_url + "create.php", form);  
	yield getData;  
	loading_mode = 0;
	if(getData.error != null) {  
		Debug.Log(getData.error);  
		warning_msg = "Server error: " + getData.error;
	}else{  
		Debug.Log(getData.text);
		
		if(getData.text.Trim()=="error"){
			warning_msg = "Server error!";
		}else if(getData.text.Trim()=="-1"){
			warning_msg = "This username used!";
		}else{
			PlayerPrefs.SetInt("UID", parseInt(getData.text));
			PlayerPrefs.SetString("username", username);
			PlayerPrefs.SetInt("Loadgame", 0);
			Application.LoadLevel(goToScene);
		}
	}
}

function LoginProcess(){
	loading_mode = 1;
	//Login post
	var form : WWWForm = new WWWForm();  
	form.AddField("username", username);  
	form.AddField("password", password);  
	var getData : WWW = WWW(server_url + "login.php", form);  
	yield getData;  
	loading_mode = 0;
	if(getData.error != null) {  
		Debug.Log(getData.error);  
		warning_msg = "Server error: " + getData.error;
	}else{  
		Debug.Log(getData.text);
		
		if(getData.text.Trim()=="error"){
			warning_msg = "Server error!";
		}if(getData.text.Trim()=="-1"){	//no this user
			warning_msg = "User does not exists!";
		}if(getData.text.Trim()=="-2"){	//password error
			warning_msg = "Wrong password!";
		}else{
			Debug.Log(getData.text);
			PlayerPrefs.SetInt("UID", parseInt(getData.text));
			PlayerPrefs.SetString("username", username);
			
			PlayerPrefs.SetInt("Loadgame", 10);
			PlayerPrefs.SetInt("PreviousSave",10);
			Application.LoadLevel(goToScene);
		}
	}
}

function loadRankingData(){
	loading_mode = 1;
	ranking_list.Clear();
	
	var getData : WWW = WWW(server_url + "ranking_exp.php");  
	yield getData;  
	if(getData.error != null) {  
		Debug.Log(getData.error);  
		warning_msg = "Server error: " + getData.error;
	}else{
		if(getData.text.Trim()=="error"){
			warning_msg = "Server error!";
		}
		if(getData.text.Trim()!="-1"){//have record
		
			var data = Json.Deserialize(getData.text.Trim()) as Dictionary.<String,System.Object>;
			
			var record : List.<Object> = (data["data"]) as List.<Object>;
			for(var obj:Dictionary.<String,System.Object> in record)
			{
				ranking_list.push(obj);
			}
		}
	}	
	
	loading_mode = 0;
}
