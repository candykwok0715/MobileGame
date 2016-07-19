#pragma strict
private var show : boolean = false;
private var itemMenu : boolean = true;
private var equipMenu : boolean = false;

var itemSlot : int[] = new int[16];
var itemQuantity : int[] = new int[16];
var equipment : int[] = new int[8];

var weaponEquip : int = 0;
var allowWeaponUnequip : boolean = false;
var armorEquip : int = 0;
var allowArmorUnequip : boolean = true;
var weapon : GameObject[] = new GameObject[1];

var player : GameObject;
var database : GameObject;
var fistPrefab : GameObject;
var InBtn : GameObject;

var cash : int = 500;

var skin : GUISkin;
private var windowRect : Rect = new Rect(240, 120, 320, 480);

private var btn_sound:AudioSource;
private var sound_used = false;

private var hover : String = "";
private var BtnItem : ButtonClick;

function Start() {
	if (!player) {
		player = this.gameObject;
	}
	var dataItem : ItemData = database.GetComponent(ItemData);
	//Reset Power of Current Weapon & Armor
	player.GetComponent(Status).addAtk = 0;
	player.GetComponent(Status).addDef = 0;
	player.GetComponent(Status).addMatk = 0;
	player.GetComponent(Status).addMdef = 0;
	player.GetComponent(Status).weaponAtk = 0;
	player.GetComponent(Status).weaponMatk = 0;
	//Set New Variable of Weapon
	player.GetComponent(Status).weaponAtk += dataItem.equipment[weaponEquip].attack;
	player.GetComponent(Status).addDef += dataItem.equipment[weaponEquip].defense;
	player.GetComponent(Status).weaponMatk += dataItem.equipment[weaponEquip].magicAttack;
	player.GetComponent(Status).addMdef += dataItem.equipment[weaponEquip].magicDefense;
	//Set New Variable of Armor
	player.GetComponent(Status).weaponAtk += dataItem.equipment[armorEquip].attack;
	player.GetComponent(Status).addDef += dataItem.equipment[armorEquip].defense;
	player.GetComponent(Status).weaponMatk += dataItem.equipment[armorEquip].magicAttack;
	player.GetComponent(Status).addMdef += dataItem.equipment[armorEquip].magicDefense;
	player.GetComponent(Status).CalculateStatus();

}

function Update() {
	BtnItem = GameObject.FindWithTag("ButtonItem").GetComponent("ButtonClick");
	if (BtnItem.flag) {
		show = true;
		ResetPosition();
		if(!sound_used){
			var sbtn_sound = GetComponents(AudioSource);
			btn_sound = sbtn_sound[0];
			if(btn_sound!=null){
				btn_sound.Play();
				sound_used = true;
			}
		}
	} else {
		sound_used = false;
		show = false;
	}
}

function UseItem(id : int) {
	var dataItem : ItemData = database.GetComponent(ItemData);
	player.GetComponent(Status).Heal(dataItem.usableItem[id].hpRecover, dataItem.usableItem[id].mpRecover);
	player.GetComponent(Status).atk += dataItem.usableItem[id].atkPlus;
	player.GetComponent(Status).def += dataItem.usableItem[id].defPlus;
	player.GetComponent(Status).matk += dataItem.usableItem[id].matkPlus;
	player.GetComponent(Status).mdef += dataItem.usableItem[id].mdefPlus;
	AutoSortItem();
}

function EquipItem(id : int, slot : int) {
	if (id == 0) {
		return;
	}
	if (!player) {
		player = this.gameObject;
	}
	var dataItem : ItemData = database.GetComponent(ItemData);
	//Backup Your Current Equipment before Unequip
	var tempEquipment : int = 0;

	if (dataItem.equipment[id].EquipmentType == dataItem.equipment[id].EqType.Weapon) {
		//Weapon Type
		tempEquipment = weaponEquip;
		weaponEquip = id;
		if (dataItem.equipment[id].attackPrefab) {
			player.GetComponent(AttackTrigger).attackPrefab = dataItem.equipment[id].attackPrefab.transform;
		}
		//Change Weapon Mesh
		if (dataItem.equipment[id].model && weapon) {
			var allWeapon : int = weapon.length;
			var a : int = 0;
			if (allWeapon > 0 && dataItem.equipment[id].assignAllWeapon) {
				while (a < allWeapon && weapon[a]) {
					weapon[a].SetActiveRecursively(true);
					var wea : GameObject = Instantiate(dataItem.equipment[id].model, weapon[a].transform.position, weapon[a].transform.rotation);
					wea.transform.parent = weapon[a].transform.parent;
					Destroy(weapon[a].gameObject);
					weapon[a] = wea;
					a++;
				}
			} else if (allWeapon > 0) {
				while (a < allWeapon && weapon[a]) {
					if (a == 0) {
						weapon[a].SetActiveRecursively(true);
						wea = Instantiate(dataItem.equipment[id].model, weapon[a].transform.position, weapon[a].transform.rotation);
						wea.transform.parent = weapon[a].transform.parent;
						Destroy(weapon[a].gameObject);
						weapon[a] = wea;
					} else {
						weapon[a].SetActiveRecursively(false);
					}
					a++;
				}
			}
		}
	} else {
		//Armor Type
		tempEquipment = armorEquip;
		armorEquip = id;
	}
	if (slot <= equipment.Length) {
		equipment[slot] = 0;
	}
	//Assign Weapon Animation to PlayerAnimation Script
	AssignWeaponAnimation(id);
	//Reset Power of Current Weapon & Armor
	player.GetComponent(Status).addAtk = 0;
	player.GetComponent(Status).addDef = 0;
	player.GetComponent(Status).addMatk = 0;
	player.GetComponent(Status).addMdef = 0;
	player.GetComponent(Status).weaponAtk = 0;
	player.GetComponent(Status).weaponMatk = 0;
	//Set New Variable of Weapon
	player.GetComponent(Status).weaponAtk += dataItem.equipment[weaponEquip].attack;
	player.GetComponent(Status).addDef += dataItem.equipment[weaponEquip].defense;
	player.GetComponent(Status).weaponMatk += dataItem.equipment[weaponEquip].magicAttack;
	player.GetComponent(Status).addMdef += dataItem.equipment[weaponEquip].magicDefense;
	//Set New Variable of Armor
	player.GetComponent(Status).weaponAtk += dataItem.equipment[armorEquip].attack;
	player.GetComponent(Status).addDef += dataItem.equipment[armorEquip].defense;
	player.GetComponent(Status).weaponMatk += dataItem.equipment[armorEquip].magicAttack;
	player.GetComponent(Status).addMdef += dataItem.equipment[armorEquip].magicDefense;

	player.GetComponent(Status).CalculateStatus();
	AutoSortEquipment();
	AddEquipment(tempEquipment);

}

function RemoveWeaponMesh() {
	if (weapon) {
		var allWeapon : int = weapon.length;
		var a : int = 0;
		if (allWeapon > 0) {
			while (a < allWeapon && weapon[a]) {
				weapon[a].SetActiveRecursively(false);
				//Destroy(weapon[a].gameObject);
				a++;
			}
		}
	}
}

function UnEquip(id : int) {
	var dataItem : ItemData = database.GetComponent(ItemData);
	if (!player) {
		player = this.gameObject;
	}
	if (dataItem.equipment[id].model && weapon) {
		var full : boolean = AddEquipment(weaponEquip);
	} else {
		full = AddEquipment(armorEquip);
	}
	if (!full) {
		if (dataItem.equipment[id].model && weapon) {
			weaponEquip = 0;
			player.GetComponent(AttackTrigger).attackPrefab = fistPrefab.transform;
			if (weapon) {
				var allWeapon : int = weapon.length;
				var a : int = 0;
				if (allWeapon > 0) {
					while (a < allWeapon && weapon[a]) {
						weapon[a].SetActiveRecursively(false);
						//Destroy(weapon[a].gameObject);
						a++;
					}
				}
			}
		} else {
			armorEquip = 0;
		}
		//Reset Power of Current Weapon & Armor
		player.GetComponent(Status).addAtk = 0;
		player.GetComponent(Status).addDef = 0;
		player.GetComponent(Status).addMatk = 0;
		player.GetComponent(Status).addMdef = 0;
		player.GetComponent(Status).weaponAtk = 0;
		player.GetComponent(Status).weaponMatk = 0;
		//Set New Variable of Weapon
		player.GetComponent(Status).weaponAtk += dataItem.equipment[weaponEquip].attack;
		player.GetComponent(Status).addDef += dataItem.equipment[weaponEquip].defense;
		player.GetComponent(Status).weaponMatk += dataItem.equipment[weaponEquip].magicAttack;
		player.GetComponent(Status).addMdef += dataItem.equipment[weaponEquip].magicDefense;
		//Set New Variable of Armor
		player.GetComponent(Status).weaponAtk += dataItem.equipment[armorEquip].attack;
		player.GetComponent(Status).addDef += dataItem.equipment[armorEquip].defense;
		player.GetComponent(Status).weaponMatk += dataItem.equipment[armorEquip].magicAttack;
		player.GetComponent(Status).addMdef += dataItem.equipment[armorEquip].magicDefense;
	}
}

function OnGUI() {
	GUI.skin = skin;
	var customWindow : GUIStyle = new GUIStyle("window");
	customWindow.fontSize = 30f;
	var customButton : GUIStyle = new GUIStyle("button");
	customButton.fontSize = 25f;
	if (show && itemMenu) {
		windowRect = GUI.Window(1, windowRect, ItemWindow, "Items", customWindow);
	}
	if (show && equipMenu) {
		windowRect = GUI.Window(1, windowRect, ItemWindow, "Equipment", customWindow);
	}

	if (show) {
		if (GUI.Button(new Rect(windowRect.x - 90, windowRect.y + 105, 90, 80), "Item", customButton)) {
			//Switch to Item Tab
			itemMenu = true;
			equipMenu = false;
		}
		if (GUI.Button(new Rect(windowRect.x - 90, windowRect.y + 225, 90, 80), "Equip", customButton)) {
			//Switch to Equipment Tab
			equipMenu = true;
			itemMenu = false;
		}
	}
	//hover = GUI.tooltip;
}

//-----------Item Window-------------
function ItemWindow(windowID : int) {
	var dataItem : ItemData = database.GetComponent(ItemData);
	var customButton : GUIStyle = new GUIStyle("button");
	customButton.fontSize = 30f;
	var customLable : GUIStyle = new GUIStyle("label");
	customLable.fontSize = 30f;
	var customBox : GUIStyle = new GUIStyle("box");
	customBox.fontSize = 30f;
	if (show && itemMenu) {
		//Close Window Button
		if (GUI.Button(new Rect(280, 0, 40, 40), "X", customButton)) {
			show = false;
			BtnItem.OnMouseDown();
		}
		//Items Slot
		var i : int = 0;
		var x : int = 0;
		var y : int = 0;
		var posX : int = 20;
		var posY : int = 150;
		var gapX : int = 70;
		var gapY : int = 70;
		for (y = 0; y < 4; y++) {
			for (x = 0; x < 4; x++) {
				if (GUI.Button(new Rect(posX + gapX * x, posY + gapY * y, 60, 60), new GUIContent(dataItem.usableItem[itemSlot[i]].icon, dataItem.usableItem[itemSlot[i]].itemName + "\n" + dataItem.usableItem[itemSlot[i]].description))) {
					UseItem(itemSlot[i]);
					if (itemQuantity[i] > 0) {
						itemQuantity[i]--;
					}
					if (itemQuantity[i] <= 0) {
						itemSlot[i] = 0;
						itemQuantity[i] = 0;
						AutoSortItem();
					}
				}
				if (itemQuantity[i] > 0) {
					GUI.Label(new Rect(posX + gapX * x, posY + gapY * y - 5, 40, 40), itemQuantity[i].ToString(), customLable); //Quantity
				}
				i++;
			}
		}
	}

	//Equipment Slot
	if (show && equipMenu) {
		//Close Window Button
		if (GUI.Button(new Rect(280, 0, 40, 40), "X", customButton)) {
			show = false;
			BtnItem.OnMouseDown();
		}
		//Weapon
		GUI.Label(new Rect(20, 140, 150, 50), "Weapon", customLable);
		if (GUI.Button(new Rect(140, 140, 60, 60), new GUIContent(dataItem.equipment[weaponEquip].icon, dataItem.equipment[weaponEquip].itemName + "\n" + dataItem.equipment[weaponEquip].description))) {
			if (!allowWeaponUnequip || weaponEquip == 0) {
				return;
			}
			UnEquip(weaponEquip);
		}
		//Armor
		GUI.Label(new Rect(20, 210, 150, 50), "Armor", customLable);
		if (GUI.Button(new Rect(140, 210, 60, 60), new GUIContent(dataItem.equipment[armorEquip].icon, dataItem.equipment[armorEquip].itemName + "\n" + dataItem.equipment[armorEquip].description))) {
			if (!allowArmorUnequip || armorEquip == 0) {
				return;
			}
			UnEquip(armorEquip);
		}
		
		//--------Equipment Slot---------
		i = 0;
		x = 0;
		y = 0;
		posX = 20;
		posY = 290;
		gapX = 70;
		gapY = 70;
		for (y = 0; y < 2; y++) {
			for (x = 0; x < 4; x++) {
				if (GUI.Button(new Rect(posX + gapX * x, posY + gapY * y, 60, 60), new GUIContent(dataItem.equipment[equipment[i]].icon, dataItem.equipment[equipment[i]].itemName + "\n" + dataItem.equipment[equipment[i]].description))) {
					EquipItem(equipment[i], i);
				}
				i++;
			}
		}
	}
	GUI.Box(new Rect(20, 45, 270, 75), GUI.tooltip, customBox);
	GUI.Label(new Rect(20, 420, 150, 50), "$ " + cash.ToString(), customLable);
	GUI.DragWindow(new Rect(0, 0, 10000, 10000));
}

function AddItem(id : int, quan : int) : boolean {
	var full : boolean = false;
	var geta : boolean = false;

	var pt : int = 0;
	while (pt < itemSlot.Length && !geta) {
		if (itemSlot[pt] == id) {
			itemQuantity[pt] += quan;
			geta = true;
		} else if (itemSlot[pt] == 0) {
			itemSlot[pt] = id;
			itemQuantity[pt] = quan;
			geta = true;
		} else {
			pt++;
			if (pt >= itemSlot.Length) {
				full = true;
				print("Full");
			}
		}

	}
	return full;
}

function AddEquipment(id : int) : boolean {
	var full : boolean = false;
	var geta : boolean = false;

	var pt : int = 0;
	while (pt < equipment.Length && !geta) {
		if (equipment[pt] == 0) {
			equipment[pt] = id;
			geta = true;
		} else {
			pt++;
			if (pt >= equipment.Length) {
				full = true;
				print("Full");
			}
		}
	}
	return full;

}
//------------AutoSort----------
function AutoSortItem() {
	var pt : int = 0;
	var nextp : int = 0;
	var clearr : boolean = false;
	while (pt < itemSlot.Length) {
		if (itemSlot[pt] == 0) {
			nextp = pt + 1;
			while (nextp < itemSlot.Length && !clearr) {
				if (itemSlot[nextp] > 0) {
					//Fine Next Item and Set
					itemSlot[pt] = itemSlot[nextp];
					itemQuantity[pt] = itemQuantity[nextp];
					itemSlot[nextp] = 0;
					itemQuantity[nextp] = 0;
					clearr = true;
				} else {
					nextp++;
				}
			}
			//Continue New Loop
			clearr = false;
			pt++;
		} else {
			pt++;
		}
	}
}

function AutoSortEquipment() {
	var pt : int = 0;
	var nextp : int = 0;
	var clearr : boolean = false;
	while (pt < equipment.Length) {
		if (equipment[pt] == 0) {
			nextp = pt + 1;
			while (nextp < equipment.Length && !clearr) {
				if (equipment[nextp] > 0) {
					//Fine Next Item and Set
					equipment[pt] = equipment[nextp];
					equipment[nextp] = 0;
					clearr = true;
				} else {
					nextp++;
				}
			}
			//Continue New Loop
			clearr = false;
			pt++;
		} else {
			pt++;
		}
	}
}

function AssignWeaponAnimation(id : int) {
	var dataItem : ItemData = database.GetComponent(ItemData);
	var playerAnim : PlayerAnimation = player.GetComponent(PlayerAnimation);

	//Assign All Attack Combo Animation of the weapon from Database
	if (dataItem.equipment[id].attackCombo && dataItem.equipment[id].EquipmentType == dataItem.equipment[id].EqType.Weapon) {
		var allPrefab : int = dataItem.equipment[id].attackCombo.length;
		player.GetComponent(AttackTrigger).attackCombo = new AnimationClip[allPrefab];

		var a : int = 0;
		if (allPrefab > 0) {
			while (a < allPrefab) {
				player.GetComponent(AttackTrigger).attackCombo[a] = dataItem.equipment[id].attackCombo[a];
				player.GetComponent(AttackTrigger).mainModel.animation[dataItem.equipment[id].attackCombo[a].name].layer = 15;
				a++;
			}
		}
		player.GetComponent(AttackTrigger).whileAttack = parseInt(dataItem.equipment[id].whileAttack);
		//Assign Attack Speed
		player.GetComponent(AttackTrigger).attackSpeed = dataItem.equipment[id].attackSpeed;
		player.GetComponent(AttackTrigger).atkDelay1 = dataItem.equipment[id].attackDelay;
	}

	if (dataItem.equipment[id].idleAnimation) {
		player.GetComponent(PlayerAnimation).idle = dataItem.equipment[id].idleAnimation;
	}
	if (dataItem.equipment[id].runAnimation) {
		playerAnim.run = dataItem.equipment[id].runAnimation;
	}
	if (dataItem.equipment[id].rightAnimation) {
		playerAnim.right = dataItem.equipment[id].rightAnimation;
	}
	if (dataItem.equipment[id].leftAnimation) {
		playerAnim.left = dataItem.equipment[id].leftAnimation;
	}
	if (dataItem.equipment[id].backAnimation) {
		playerAnim.back = dataItem.equipment[id].backAnimation;
	}
	if (dataItem.equipment[id].jumpAnimation) {
		player.GetComponent(PlayerAnimation).jump = dataItem.equipment[id].jumpAnimation;
	}
	playerAnim.AnimationSpeedSet();

}

function ResetPosition() {
	//Reset GUI Position when it out of Screen.
	if (windowRect.x >= Screen.width - 30 || windowRect.y >= Screen.height - 30 || windowRect.x <= -70 || windowRect.y <= -70) {
		windowRect = new Rect(240, 120, 320, 480);
	}
}
