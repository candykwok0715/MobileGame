#pragma strict
import MiniJSON;
import System.Collections.Generic;

var autoLoad : boolean = false;
var player : GameObject;
private var menu : boolean = false;
private var lastPosition : Vector3;
private var mainCam : Transform;
var oldPlayer : GameObject;
private var presave : int = 0;
private var loading_mode = 0;
private var warning_msg = "Loading...";

var server_url : String = "http://localhost/gamepro/";

function Start() {
	if (!player) {
		player = GameObject.FindWithTag("Player");
	}
	//If PlayerPrefs Loadgame = 10 That mean You Start with Load Game Menu.
	//If You Set Autoload = true It will LoadGame when you start.
	if (PlayerPrefs.GetInt("Loadgame") == 10 || autoLoad) {
		//LoadGame();
		LoadData(true);
		if (!autoLoad) {
			//If You didn't Set autoLoad then reset PlayerPrefs Loadgame to 0 after LoadGame.
			PlayerPrefs.SetInt("Loadgame", 0);
		}
	}
	presave = PlayerPrefs.GetInt("PreviousSave");

}

function Update() {
	if (Input.GetKeyDown(KeyCode.Escape)) {
		//Open Save Load Menu
		OnOffMenu();
	}

}

function OnOffMenu() {
	//Freeze Time Scale to 0 if Window is Showing
	if (!menu && Time.timeScale != 0.0) {
		menu = true;
		Time.timeScale = 0.0;
		Screen.lockCursor = false;
		loading_mode = 0;
		warning_msg = "Loading...";
	} else if (menu) {
		loading_mode = 0;
		menu = false;
		Time.timeScale = 1.0;
		Screen.lockCursor = true;
	}
}

function OnGUI() {
	if (menu) {
		var customButton : GUIStyle = new GUIStyle("button");
		customButton.fontSize = 30f;
		var customMenu : GUIStyle = new GUIStyle("box");
		customMenu.fontSize = 30f;
		GUI.Box(new Rect(Screen.width / 2 - 125, Screen.height / 2 - 150, 250, 200), "Menu", customMenu);
		if (GUI.Button(new Rect(Screen.width / 2 - 95, Screen.height / 2 - 90, 190, 50), "Save Game", customButton)) {
			SaveData(false);
		}

		if (GUI.Button(new Rect(Screen.width / 2 - 95, Screen.height / 2 - 30, 190, 50), "Load Game", customButton)) {
			if (presave == 10) {
				LoadData(false);
			}
		}

		if (GUI.Button(new Rect(Screen.width / 2 + 75, Screen.height / 2 - 150, 50, 50), "X", customButton)) {
			OnOffMenu();
		}
	}

	if (loading_mode == 1) {
		var loadingLabel : GUIStyle = new GUIStyle("label");
		loadingLabel.fontSize = 60f;
		var customBox : GUIStyle = new GUIStyle("box");
		customBox.normal.textColor = Color.white;
		customBox.fontSize = 40f;
		customBox.normal.background = MakeTex(600, 1, new Color(0.0f, 0.0f, 0.0f, 0.5f));
		GUI.depth = -1;
		GUI.Box(Rect(0, 0, Screen.width, Screen.height), "", customBox);
		GUI.Label(Rect(Screen.width / 2 - 200, Screen.height / 2 - 60, 400, 120), warning_msg, loadingLabel);
	}
}

function MakeTex(width : int, height : int, col : Color) {
	var pix = new Color[width * height];

	for (var i = 0; i < pix.Length; i++) {
		pix[i] = col;
	}

	var result = new Texture2D(width, height);
	result.SetPixels(pix);
	result.Apply();
	return result;
}

function SaveData(finish_game : boolean) {

	loading_mode = 1;

	//local parameter
	PlayerPrefs.SetInt("PreviousSave", 10);

	//WWW process
	var form : WWWForm = new WWWForm();
	var username = PlayerPrefs.GetString("username");
	var uid = PlayerPrefs.GetInt("UID");
	form.AddField("username", username);
	form.AddField("UID", uid);

	var currentMap = PlayerPrefs.GetString("currentMap");
	form.AddField("currentMap", currentMap);

	form.AddField("PlayerX", player.transform.position.x);
	form.AddField("PlayerY", player.transform.position.y + 2);
	form.AddField("PlayerZ", player.transform.position.z);
	form.AddField("PlayerLevel", player.GetComponent(Status).level);
	form.AddField("PlayerATK", player.GetComponent(Status).atk);
	form.AddField("PlayerDEF", player.GetComponent(Status).def);
	form.AddField("PlayerMATK", player.GetComponent(Status).matk);
	form.AddField("PlayerMDEF", player.GetComponent(Status).mdef);
	form.AddField("PlayerEXP", player.GetComponent(Status).exp);
	form.AddField("PlayerMaxEXP", player.GetComponent(Status).maxExp);
	form.AddField("PlayerMaxHP", player.GetComponent(Status).maxHealth);
	form.AddField("PlayerHP", player.GetComponent(Status).health);
	form.AddField("PlayerMaxMP", player.GetComponent(Status).maxMana);
	form.AddField("PlayerSTP", player.GetComponent(Status).statusPoint);
	form.AddField("Cash", player.GetComponent(Inventory).cash);

	var itemSize : int = player.GetComponent(Inventory).itemSlot.length;
	var a : int = 0;
	var itemStr = "";
	var itemQtyStr = "";
	if (itemSize > 0) {
		while (a < itemSize) {
			itemStr += player.GetComponent(Inventory).itemSlot[a] + ",";
			itemQtyStr += player.GetComponent(Inventory).itemQuantity[a] + ",";
			a++;
		}
	}
	form.AddField("Item", itemStr);
	form.AddField("ItemQty", itemQtyStr);

	var equipSize : int = player.GetComponent(Inventory).equipment.length;
	a = 0;
	var equipStr = "";
	if (equipSize > 0) {
		while (a < equipSize) {
			equipStr += player.GetComponent(Inventory).equipment[a] + ",";
			a++;
		}
	}
	form.AddField("Equipm", equipStr);

	form.AddField("WeaEquip", player.GetComponent(Inventory).weaponEquip);
	form.AddField("ArmoEquip", player.GetComponent(Inventory).armorEquip);

	var questSize : int = player.GetComponent(QuestStat).questProgress.length;
	form.AddField("QuestSize", questSize);

	a = 0;
	var questpStr = "";
	if (questSize > 0) {
		while (a < questSize) {
			questpStr += player.GetComponent(QuestStat).questProgress[a] + ",";
			a++;
		}
	}
	form.AddField("Questp", questpStr);

	var questSlotSize : int = player.GetComponent(QuestStat).questSlot.length;
	form.AddField("QuestSlotSize", questSlotSize);

	a = 0;
	var questSlotSizeStr = "";
	if (questSlotSize > 0) {
		while (a < questSlotSize) {
			questSlotSizeStr += player.GetComponent(QuestStat).questSlot[a] + ",";
			a++;
		}
	}
	form.AddField("Questslot", questSlotSizeStr);

	//Save Skill Slot
	a = 0;
	var skillStr = "";
	while (a <= 2) {
		skillStr += player.GetComponent(SkillWindow).skill[a] + ",";
		a++;
	}
	form.AddField("Skill", skillStr);

	var getData : WWW = WWW(server_url + "save.php", form);
	yield getData;
	if (getData.error != null) {
		Debug.Log(getData.error);
		warning_msg = "Server error: " + getData.error;
	} else {
		Debug.Log(getData.text);
		if (getData.text.Trim() == "error") {
			warning_msg = "Server error!";
		}
	}

	//original save function
	PlayerPrefs.SetFloat("PlayerX", player.transform.position.x);
	PlayerPrefs.SetFloat("PlayerY", player.transform.position.y + 2);
	PlayerPrefs.SetFloat("PlayerZ", player.transform.position.z);
	PlayerPrefs.SetInt("PlayerLevel", player.GetComponent(Status).level);
	PlayerPrefs.SetInt("PlayerATK", player.GetComponent(Status).atk);
	PlayerPrefs.SetInt("PlayerDEF", player.GetComponent(Status).def);
	PlayerPrefs.SetInt("PlayerMATK", player.GetComponent(Status).matk);
	PlayerPrefs.SetInt("PlayerMDEF", player.GetComponent(Status).mdef);
	PlayerPrefs.SetInt("PlayerEXP", player.GetComponent(Status).exp);
	PlayerPrefs.SetInt("PlayerMaxEXP", player.GetComponent(Status).maxExp);
	PlayerPrefs.SetInt("PlayerMaxHP", player.GetComponent(Status).maxHealth);
	PlayerPrefs.SetInt("PlayerHP", player.GetComponent(Status).health);
	PlayerPrefs.SetInt("PlayerMaxMP", player.GetComponent(Status).maxMana);
	//	PlayerPrefs.SetInt("PlayerMP", player.GetComponent(Status).mana);
	PlayerPrefs.SetInt("PlayerSTP", player.GetComponent(Status).statusPoint);

	PlayerPrefs.SetInt("Cash", player.GetComponent(Inventory).cash);
	itemSize = player.GetComponent(Inventory).itemSlot.length;
	a = 0;
	if (itemSize > 0) {
		while (a < itemSize) {
			PlayerPrefs.SetInt("Item" + a.ToString(), player.GetComponent(Inventory).itemSlot[a]);
			PlayerPrefs.SetInt("ItemQty" + a.ToString(), player.GetComponent(Inventory).itemQuantity[a]);
			a++;
		}
	}

	equipSize = player.GetComponent(Inventory).equipment.length;
	a = 0;
	if (equipSize > 0) {
		while (a < equipSize) {
			PlayerPrefs.SetInt("Equipm" + a.ToString(), player.GetComponent(Inventory).equipment[a]);
			a++;
		}
	}
	PlayerPrefs.SetInt("WeaEquip", player.GetComponent(Inventory).weaponEquip);
	PlayerPrefs.SetInt("ArmoEquip", player.GetComponent(Inventory).armorEquip);
	//Save Quest
	questSize = player.GetComponent(QuestStat).questProgress.length;
	PlayerPrefs.SetInt("QuestSize", questSize);
	a = 0;
	if (questSize > 0) {
		while (a < questSize) {
			PlayerPrefs.SetInt("Questp" + a.ToString(), player.GetComponent(QuestStat).questProgress[a]);
			a++;
		}
	}
	questSlotSize = player.GetComponent(QuestStat).questSlot.length;
	PlayerPrefs.SetInt("QuestSlotSize", questSlotSize);
	a = 0;
	if (questSlotSize > 0) {
		while (a < questSlotSize) {
			PlayerPrefs.SetInt("Questslot" + a.ToString(), player.GetComponent(QuestStat).questSlot[a]);
			a++;
		}
	}
	//Save Skill Slot
	a = 0;
	while (a <= 2) {
		PlayerPrefs.SetInt("Skill" + a.ToString(), player.GetComponent(SkillWindow).skill[a]);
		a++;
	}

	print("Saved");

	presave = 10;

	if (finish_game) {
		var mainCam = GameObject.FindWithTag("MainCamera");
		var player = GameObject.FindWithTag("Player");
		Destroy(mainCam.transform.gameObject); //Destroy Main Camera
		Destroy(player.transform.gameObject); //Destroy Player
		print("Go to title scene");
		Application.LoadLevel("Title");
	} else {
		OnOffMenu();
	}
}

function LoadData(from_start_page : boolean) {

	loading_mode = 1;
	print("Load start");

	//oldPlayer = GameObject.FindWithTag ("Player");
	var respawn : GameObject = GameObject.FindWithTag("Player");
	var currentMap = PlayerPrefs.GetString("currentMap");

	//Http process
	var form : WWWForm = new WWWForm();
	var username = PlayerPrefs.GetString("username");
	var uid = PlayerPrefs.GetInt("UID");
	form.AddField("username", username);
	form.AddField("UID", uid);
	var getData : WWW = WWW(server_url + "load.php", form);
	yield getData;
	if (getData.error != null) {
		Debug.Log(getData.error);
		warning_msg = "Server error: " + getData.error;
	} else {
		if (getData.text.Trim() == "error") {
			if (from_start_page) {
				OnOffMenu();
				loading_mode = 1;
			}
			warning_msg = "Server error!";
		} else if (getData.text.Trim() == "-1") {
			//no record on the server
			if (from_start_page)
				OnOffMenu();
			SaveData(false);
		} else {
			var data = Json.Deserialize(getData.text.Trim())as Dictionary. < String,
			System.Object > ;

			var PlayerX : float = parseFloat(data['PlayerX'].ToString());
			var PlayerY : float = parseFloat(data['PlayerY'].ToString());
			var PlayerZ : float = parseFloat(data['PlayerZ'].ToString());
			var PlayerLevel : int = parseInt(data['PlayerLevel'].ToString());
			var PlayerATK : int = parseInt(data['PlayerATK'].ToString());
			var PlayerDEF : int = parseInt(data['PlayerDEF'].ToString());
			var PlayerMATK : int = parseInt(data['PlayerMATK'].ToString());
			var PlayerMDEF : int = parseInt(data['PlayerMDEF'].ToString());
			var PlayerEXP : int = parseInt(data['PlayerEXP'].ToString());
			var PlayerMaxEXP : int = parseInt(data['PlayerMaxEXP'].ToString());
			var PlayerMaxHP : int = parseInt(data['PlayerMaxHP'].ToString());
			var PlayerHP : int = parseInt(data['PlayerHP'].ToString());
			var PlayerMaxMP : int = parseInt(data['PlayerMaxMP'].ToString());
			var PlayerSTP : int = parseInt(data['PlayerSTP'].ToString());

			var Cash : int = parseInt(data['Cash'].ToString());

			lastPosition.x = PlayerX;
			lastPosition.y = PlayerY;
			lastPosition.z = PlayerZ;
			respawn.transform.position = lastPosition;
			//var respawn : GameObject = Instantiate(player, lastPosition , transform.rotation);
			respawn.GetComponent(Status).level = PlayerLevel;
			respawn.GetComponent(Status).atk = PlayerATK;
			respawn.GetComponent(Status).def = PlayerDEF;
			respawn.GetComponent(Status).matk = PlayerMATK;
			respawn.GetComponent(Status).mdef = PlayerMDEF;
			respawn.GetComponent(Status).exp = PlayerEXP;
			respawn.GetComponent(Status).maxExp = PlayerMaxEXP;
			respawn.GetComponent(Status).maxHealth = PlayerMaxHP;
			respawn.GetComponent(Status).health = PlayerHP;
			//respawn.GetComponent(Status).health = PlayerPrefs.GetInt("PlayerMaxHP");
			respawn.GetComponent(Status).maxMana = PlayerMaxMP;
			respawn.GetComponent(Status).mana = PlayerMaxMP;
			respawn.GetComponent(Status).statusPoint = PlayerSTP;
			mainCam = GameObject.FindWithTag("MainCamera").transform;
			mainCam.GetComponent(ARPGcamera).target = respawn.transform;
			//-------------------------------
			respawn.GetComponent(Inventory).cash = Cash;
			var itemSize : int = player.GetComponent(Inventory).itemSlot.length;
			var a : int = 0;
			var item_arr_str : String = data["Item"];
			var item_arr = item_arr_str.Split(","[0]);
			var itemqty_arr_str : String = data["ItemQty"];
			var itemqty_arr = itemqty_arr_str.Split(","[0]);
			if (itemSize > 0) {
				while (a < itemSize) {
					respawn.GetComponent(Inventory).itemSlot[a] = parseInt(item_arr[a]);
					respawn.GetComponent(Inventory).itemQuantity[a] = parseInt(itemqty_arr[a]);
					//-------
					a++;
				}
			}

			var equipSize : int = player.GetComponent(Inventory).equipment.length;
			a = 0;
			var equipmy_arr_str : String = data["Equipm"];
			var equipmy_arr = equipmy_arr_str.Split(","[0]);
			if (equipSize > 0) {
				while (a < equipSize) {
					respawn.GetComponent(Inventory).equipment[a] = parseInt(equipmy_arr[a]);
					a++;
				}
			}
			respawn.GetComponent(Inventory).weaponEquip = 0;
			var data_armo : int = parseInt(data['ArmoEquip'].ToString());
			respawn.GetComponent(Inventory).armorEquip = data_armo;
			var WeaEquip : int = parseInt(data['WeaEquip'].ToString());
			if (WeaEquip == 0) {
				respawn.GetComponent(Inventory).RemoveWeaponMesh();
			} else {
				respawn.GetComponent(Inventory).EquipItem(WeaEquip, respawn.GetComponent(Inventory).equipment.Length + 5);
			}
			//----------------------------------
			Screen.lockCursor = true;

			var mon : GameObject[];
			mon = GameObject.FindGameObjectsWithTag("Enemy");
			for (var mo : GameObject in mon) {
				if (mo) {
					mo.GetComponent(AIset).followTarget = respawn.transform;
				}
			}

			//Load Quest
			var data_questsize : int = parseInt(data['QuestSize'].ToString());
			respawn.GetComponent(QuestStat).questProgress = new int[data_questsize];
			var questSize : int = respawn.GetComponent(QuestStat).questProgress.length;
			var Questp_arr_str : String = data["Questp"];
			var Questp_arr = Questp_arr_str.Split(","[0]);
			a = 0;
			if (questSize > 0) {
				while (a < questSize) {
					respawn.GetComponent(QuestStat).questProgress[a] = parseInt(Questp_arr[a]);
					a++;
				}
			}

			var data_QuestSlotSize : int = parseInt(data['QuestSlotSize'].ToString());
			respawn.GetComponent(QuestStat).questSlot = new int[data_QuestSlotSize];
			var questSlotSize : int = respawn.GetComponent(QuestStat).questSlot.length;
			a = 0;
			var Questslot_arr_str : String = data["Questslot"];
			var Questslot_arr = Questslot_arr_str.Split(","[0]);
			if (questSlotSize > 0) {
				while (a < questSlotSize) {
					respawn.GetComponent(QuestStat).questSlot[a] = parseInt(Questslot_arr[a]);
					a++;
				}
			}

			//Load Skill Slot
			a = 0;
			var Skill_arr_str : String = data["Skill"];
			var Skill_arr = Skill_arr_str.Split(","[0]);
			while (a <= 2) {
				respawn.GetComponent(SkillWindow).skill[a] = parseInt(Skill_arr[a]);
				a++;
			}
			respawn.GetComponent(SkillWindow).AssignAllSkill();
			//---------------Set Target to Minimap--------------
			var minimap : GameObject = GameObject.FindWithTag("Minimap");
			if (minimap) {
				var mapcam : GameObject = minimap.GetComponent(MinimapOnOff).minimapCam;
				mapcam.GetComponent(MinimapCamera).target = respawn.transform;
			}

			player = GameObject.FindWithTag("Player");

			print("Loaded");
			if (!from_start_page)
				OnOffMenu();
			else
				loading_mode = 0;

			var recordMap : String = data['currentMap'].ToString();

			if (currentMap != recordMap) {
				PlayerPrefs.SetString("currentMap", recordMap);
				Application.LoadLevel(recordMap);
			}
			return;
		}
	}

	print("Load error");

	/*
	lastPosition.x = PlayerPrefs.GetFloat("PlayerX");
	lastPosition.y = PlayerPrefs.GetFloat("PlayerY");
	lastPosition.z = PlayerPrefs.GetFloat("PlayerZ");
	respawn.transform.position = lastPosition;
	//var respawn : GameObject = Instantiate(player, lastPosition , transform.rotation);
	respawn.GetComponent(Status).level = PlayerPrefs.GetInt("PlayerLevel");
	respawn.GetComponent(Status).atk = PlayerPrefs.GetInt("PlayerATK");
	respawn.GetComponent(Status).def = PlayerPrefs.GetInt("PlayerDEF");
	respawn.GetComponent(Status).matk = PlayerPrefs.GetInt("PlayerMATK");
	respawn.GetComponent(Status).mdef = PlayerPrefs.GetInt("PlayerMDEF");
	respawn.GetComponent(Status).exp = PlayerPrefs.GetInt("PlayerEXP");
	respawn.GetComponent(Status).maxExp = PlayerPrefs.GetInt("PlayerMaxEXP");
	respawn.GetComponent(Status).maxHealth = PlayerPrefs.GetInt("PlayerMaxHP");
	respawn.GetComponent(Status).health = PlayerPrefs.GetInt("PlayerHP");
	//respawn.GetComponent(Status).health = PlayerPrefs.GetInt("PlayerMaxHP");
	respawn.GetComponent(Status).maxMana = PlayerPrefs.GetInt("PlayerMaxMP");
	respawn.GetComponent(Status).mana = PlayerPrefs.GetInt("PlayerMaxMP");
	respawn.GetComponent(Status).statusPoint = PlayerPrefs.GetInt("PlayerSTP");
	mainCam = GameObject.FindWithTag ("MainCamera").transform;
	mainCam.GetComponent(ARPGcamera).target = respawn.transform;
	//-------------------------------
	respawn.GetComponent(Inventory).cash = PlayerPrefs.GetInt("Cash");
	var itemSize : int = player.GetComponent(Inventory).itemSlot.length;
	var a : int = 0;
	if(itemSize > 0){
	while(a < itemSize){
	respawn.GetComponent(Inventory).itemSlot[a] = PlayerPrefs.GetInt("Item" + a.ToString());
	respawn.GetComponent(Inventory).itemQuantity[a] = PlayerPrefs.GetInt("ItemQty" + a.ToString());
	//-------
	a++;
	}
	}

	var equipSize : int = player.GetComponent(Inventory).equipment.length;
	a = 0;
	if(equipSize > 0){
	while(a < equipSize){
	respawn.GetComponent(Inventory).equipment[a] = PlayerPrefs.GetInt("Equipm" + a.ToString());
	a++;
	}
	}
	respawn.GetComponent(Inventory).weaponEquip = 0;
	respawn.GetComponent(Inventory).armorEquip = PlayerPrefs.GetInt("ArmoEquip");
	if(PlayerPrefs.GetInt("WeaEquip") == 0){
	respawn.GetComponent(Inventory).RemoveWeaponMesh();
	}else{
	respawn.GetComponent(Inventory).EquipItem(PlayerPrefs.GetInt("WeaEquip") , respawn.GetComponent(Inventory).equipment.Length + 5);
	}
	//----------------------------------
	Screen.lockCursor = true;

	var mon : GameObject[];
	mon = GameObject.FindGameObjectsWithTag("Enemy");
	for (var mo : GameObject in mon) {
	if(mo){
	mo.GetComponent(AIset).followTarget = respawn.transform;
	}
	}

	//Load Quest
	respawn.GetComponent(QuestStat).questProgress = new int[PlayerPrefs.GetInt("QuestSize")];
	var questSize : int = respawn.GetComponent(QuestStat).questProgress.length;
	a = 0;
	if(questSize > 0){
	while(a < questSize){
	respawn.GetComponent(QuestStat).questProgress[a] = PlayerPrefs.GetInt("Questp" + a.ToString());
	a++;
	}
	}

	respawn.GetComponent(QuestStat).questSlot = new int[PlayerPrefs.GetInt("QuestSlotSize")];
	var questSlotSize : int = respawn.GetComponent(QuestStat).questSlot.length;
	a = 0;
	if(questSlotSize > 0){
	while(a < questSlotSize){
	respawn.GetComponent(QuestStat).questSlot[a] = PlayerPrefs.GetInt("Questslot" + a.ToString());
	a++;
	}
	}

	//Load Skill Slot
	a = 0;
	while(a <= 2){
	respawn.GetComponent(SkillWindow).skill[a] = PlayerPrefs.GetInt("Skill" + a.ToString());
	a++;
	}
	respawn.GetComponent(SkillWindow).AssignAllSkill();
	//---------------Set Target to Minimap--------------
	var minimap : GameObject = GameObject.FindWithTag("Minimap");
	if(minimap){
	var mapcam : GameObject = minimap.GetComponent(MinimapOnOff).minimapCam;
	mapcam.GetComponent(MinimapCamera).target = respawn.transform;
	}

	player = GameObject.FindWithTag ("Player");
	 */
	/*if(oldPlayer){
	Destroy(gameObject);
	}*/
}

//Function LoadGame is unlike the Function LoadData.
//This Function will not spawn new Player.
function LoadGame() {
	player.GetComponent(Status).level = PlayerPrefs.GetInt("PlayerLevel");
	player.GetComponent(Status).atk = PlayerPrefs.GetInt("PlayerATK");
	player.GetComponent(Status).def = PlayerPrefs.GetInt("PlayerDEF");
	player.GetComponent(Status).matk = PlayerPrefs.GetInt("PlayerMATK");
	player.GetComponent(Status).mdef = PlayerPrefs.GetInt("PlayerMDEF");
	player.GetComponent(Status).mdef = PlayerPrefs.GetInt("PlayerMDEF");
	player.GetComponent(Status).exp = PlayerPrefs.GetInt("PlayerEXP");
	player.GetComponent(Status).maxExp = PlayerPrefs.GetInt("PlayerMaxEXP");
	player.GetComponent(Status).maxHealth = PlayerPrefs.GetInt("PlayerMaxHP");
	player.GetComponent(Status).health = PlayerPrefs.GetInt("PlayerMaxHP");
	player.GetComponent(Status).maxMana = PlayerPrefs.GetInt("PlayerMaxMP");
	player.GetComponent(Status).mana = PlayerPrefs.GetInt("PlayerMaxMP");
	player.GetComponent(Status).statusPoint = PlayerPrefs.GetInt("PlayerSTP");
	//mainCam = GameObject.FindWithTag ("MainCamera").transform;
	//mainCam.GetComponent(ARPGcamera).target = respawn.transform;
	//-------------------------------
	player.GetComponent(Inventory).cash = PlayerPrefs.GetInt("Cash");
	var itemSize : int = player.GetComponent(Inventory).itemSlot.length;
	var a : int = 0;
	if (itemSize > 0) {
		while (a < itemSize) {
			player.GetComponent(Inventory).itemSlot[a] = PlayerPrefs.GetInt("Item" + a.ToString());
			player.GetComponent(Inventory).itemQuantity[a] = PlayerPrefs.GetInt("ItemQty" + a.ToString());
			//-------
			a++;
		}
	}

	var equipSize : int = player.GetComponent(Inventory).equipment.length;
	a = 0;
	if (equipSize > 0) {
		while (a < equipSize) {
			player.GetComponent(Inventory).equipment[a] = PlayerPrefs.GetInt("Equipm" + a.ToString());
			a++;
		}
	}
	player.GetComponent(Inventory).weaponEquip = 0;
	player.GetComponent(Inventory).armorEquip = PlayerPrefs.GetInt("ArmoEquip");
	if (PlayerPrefs.GetInt("WeaEquip") == 0) {
		player.GetComponent(Inventory).RemoveWeaponMesh();
	} else {
		player.GetComponent(Inventory).EquipItem(PlayerPrefs.GetInt("WeaEquip"), player.GetComponent(Inventory).equipment.Length + 5);
	}
	//----------------------------------
	Screen.lockCursor = true;

	var mon : GameObject[];
	mon = GameObject.FindGameObjectsWithTag("Enemy");
	for (var mo : GameObject in mon) {
		if (mo) {
			mo.GetComponent(AIset).followTarget = player.transform;
		}
	}

	//Load Quest
	player.GetComponent(QuestStat).questProgress = new int[PlayerPrefs.GetInt("QuestSize")];
	var questSize : int = player.GetComponent(QuestStat).questProgress.length;
	a = 0;
	if (questSize > 0) {
		while (a < questSize) {
			player.GetComponent(QuestStat).questProgress[a] = PlayerPrefs.GetInt("Questp" + a.ToString());
			a++;
		}
	}

	player.GetComponent(QuestStat).questSlot = new int[PlayerPrefs.GetInt("QuestSlotSize")];
	var questSlotSize : int = player.GetComponent(QuestStat).questSlot.length;
	a = 0;
	if (questSlotSize > 0) {
		while (a < questSlotSize) {
			player.GetComponent(QuestStat).questSlot[a] = PlayerPrefs.GetInt("Questslot" + a.ToString());
			a++;
		}
	}

	//Load Skill Slot
	a = 0;
	while (a <= 2) {
		player.GetComponent(SkillWindow).skill[a] = PlayerPrefs.GetInt("Skill" + a.ToString());
		a++;
	}
	player.GetComponent(SkillWindow).AssignAllSkill();

	print("Loaded");

}
