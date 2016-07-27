#pragma strict
var delay : float = 3.0;
var player : GameObject;
private var menu : boolean = false;
private var lastPosition : Vector3;
private var mainCam : Transform;
var oldPlayer : GameObject;

function Start() {
	yield WaitForSeconds(delay);
	menu = true;
	Screen.lockCursor = false;
}

function OnGUI() {
	if (menu) {
		var customButton : GUIStyle = new GUIStyle("button");
		customButton.fontSize = 30f;
		var customBox : GUIStyle = new GUIStyle("box");
		customBox.fontSize = 30f;
		GUI.Box(new Rect(Screen.width / 2 - 125, Screen.height / 2 - 150, 250, 200), "Game Over", customBox);
		if (GUI.Button(new Rect(Screen.width / 2 - 95, Screen.height / 2 - 90, 190, 50), "Retry", customButton)) {
			LoadData();
		}

		if (GUI.Button(new Rect(Screen.width / 2 - 95, Screen.height / 2 - 30, 190, 50), "Quit Game", customButton)) {
			mainCam = GameObject.FindWithTag("MainCamera").transform;
			var pp = GameObject.FindWithTag("Player");
			if(pp)
				Destroy(pp); //Destroy player
			Destroy(mainCam.gameObject); //Destroy Main Camera
			Application.LoadLevel("Title");
			//Application.Quit();
		}
	}
}

function LoadData() {
	oldPlayer = GameObject.FindWithTag("Player");
	if (oldPlayer) {
		Destroy(gameObject);
	} else {
		lastPosition.x = PlayerPrefs.GetFloat("PlayerX");
		lastPosition.y = PlayerPrefs.GetFloat("PlayerY");
		lastPosition.z = PlayerPrefs.GetFloat("PlayerZ");
		var respawn : GameObject = Instantiate(player, lastPosition, transform.rotation);
		respawn.GetComponent(Status).level = PlayerPrefs.GetInt("TempPlayerLevel");
		respawn.GetComponent(Status).atk = PlayerPrefs.GetInt("TempPlayerATK");
		respawn.GetComponent(Status).def = PlayerPrefs.GetInt("TempPlayerDEF");
		respawn.GetComponent(Status).matk = PlayerPrefs.GetInt("TempPlayerMATK");
		respawn.GetComponent(Status).mdef = PlayerPrefs.GetInt("TempPlayerMDEF");
		respawn.GetComponent(Status).mdef = PlayerPrefs.GetInt("TempPlayerMDEF");
		respawn.GetComponent(Status).exp = PlayerPrefs.GetInt("TempPlayerEXP");
		respawn.GetComponent(Status).maxExp = PlayerPrefs.GetInt("TempPlayerMaxEXP");
		respawn.GetComponent(Status).maxHealth = PlayerPrefs.GetInt("TempPlayerMaxHP");
		//respawn.GetComponent(Status).health = PlayerPrefs.GetInt("PlayerHP");
		respawn.GetComponent(Status).health = PlayerPrefs.GetInt("TempPlayerMaxHP");
		respawn.GetComponent(Status).maxMana = PlayerPrefs.GetInt("TempPlayerMaxMP");
		respawn.GetComponent(Status).mana = PlayerPrefs.GetInt("TempPlayerMaxMP");
		respawn.GetComponent(Status).statusPoint = PlayerPrefs.GetInt("TempPlayerSTP");
		mainCam = GameObject.FindWithTag("MainCamera").transform;
		mainCam.GetComponent(ARPGcamera).target = respawn.transform;
		//-------------------------------
		respawn.GetComponent(Inventory).cash = PlayerPrefs.GetInt("TempCash");
		var itemSize : int = player.GetComponent(Inventory).itemSlot.length;
		var a : int = 0;
		if (itemSize > 0) {
			while (a < itemSize) {
				respawn.GetComponent(Inventory).itemSlot[a] = PlayerPrefs.GetInt("TempItem" + a.ToString());
				respawn.GetComponent(Inventory).itemQuantity[a] = PlayerPrefs.GetInt("TempItemQty" + a.ToString());
				//-------
				a++;
			}
		}

		var equipSize : int = player.GetComponent(Inventory).equipment.length;
		a = 0;
		if (equipSize > 0) {
			while (a < equipSize) {
				respawn.GetComponent(Inventory).equipment[a] = PlayerPrefs.GetInt("TempEquipm" + a.ToString());
				a++;
			}
		}
		respawn.GetComponent(Inventory).weaponEquip = 0;
		respawn.GetComponent(Inventory).armorEquip = PlayerPrefs.GetInt("TempArmoEquip");
		if (PlayerPrefs.GetInt("TempWeaEquip") == 0) {
			respawn.GetComponent(Inventory).RemoveWeaponMesh();
		} else {
			respawn.GetComponent(Inventory).EquipItem(PlayerPrefs.GetInt("TempWeaEquip"), respawn.GetComponent(Inventory).equipment.Length + 5);
		}
		//----------------------------------
		Screen.lockCursor = true;
		//--------------Set Target to Monster---------------
		var mon : GameObject[];
		mon = GameObject.FindGameObjectsWithTag("Enemy");
		for (var mo : GameObject in mon) {
			if (mo) {
				mo.GetComponent(AIset).followTarget = respawn.transform;
			}
		}
		//---------------Set Target to Minimap--------------
		var minimap : GameObject = GameObject.FindWithTag("Minimap");
		if (minimap) {
			var mapcam : GameObject = minimap.GetComponent(MinimapOnOff).minimapCam;
			mapcam.GetComponent(MinimapCamera).target = respawn.transform;
		}

		//Load Quest
		respawn.GetComponent(QuestStat).questProgress = new int[PlayerPrefs.GetInt("TempQuestSize")];
		var questSize : int = respawn.GetComponent(QuestStat).questProgress.length;
		a = 0;
		if (questSize > 0) {
			while (a < questSize) {
				respawn.GetComponent(QuestStat).questProgress[a] = PlayerPrefs.GetInt("TempQuestp" + a.ToString());
				a++;
			}
		}

		respawn.GetComponent(QuestStat).questSlot = new int[PlayerPrefs.GetInt("TempQuestSlotSize")];
		var questSlotSize : int = respawn.GetComponent(QuestStat).questSlot.length;
		a = 0;
		if (questSlotSize > 0) {
			while (a < questSlotSize) {
				respawn.GetComponent(QuestStat).questSlot[a] = PlayerPrefs.GetInt("TempQuestslot" + a.ToString());
				a++;
			}
		}
		//Load Skill Slot
		a = 0;
		while (a <= 2) {
			respawn.GetComponent(SkillWindow).skill[a] = PlayerPrefs.GetInt("TempSkill" + a.ToString());
			a++;
		}
		respawn.GetComponent(SkillWindow).AssignAllSkill();

		Destroy(gameObject);
	}
}
