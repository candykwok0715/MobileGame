#pragma strict
var itemShopSlot : int[] = new int[8];
var equipmentShopSlot : int[] = new int[8];
var button : Texture2D;
var database : GameObject;
private var player : GameObject;

private var menu : boolean = false;
private var shopMain : boolean = false;
private var shopItem : boolean = false;
private var shopEquip : boolean = false;
private var itemInven : boolean = false;
private var equipInven : boolean = false;
private var sellwindow : boolean = false;
private var buywindow : boolean = false;
private var buyerror : boolean = false;
private var buyErrorLog : String = "Not Enough Cash";

private var enter : boolean = false;
private var select : int = 0;

private var num : int = 1;
private var text : String = "1";

var skin1 : GUISkin;
var inventorySkin : GUISkin;

private var btn_sound : AudioSource;

function Update() {
	if (Input.GetKeyDown("e") && enter) {
		shopMain = true;
		OnOffMenu();
	}

}

//added on mouse down
function OnMouseDown() {
	if (enter) {
		btn_sound = GetComponent("AudioSource");
		if (btn_sound != null) {
			btn_sound.Play();
		}
		shopMain = true;
		OnOffMenu();
	}
}

function ShopBuy(id : int, slot : int, price : int, quan : int) {
	var dataItem : ItemData = database.GetComponent(ItemData);

	if (player.GetComponent(Inventory).cash < price) {
		//If not enough cash
		print(price);
		buyErrorLog = "Not Enough Cash";
		buyerror = true;
		return;
	}

	if (shopItem) {
		//Buy Usable Item
		var full : boolean = player.GetComponent(Inventory).AddItem(id, quan);
		if (full) {
			buyErrorLog = "Inventory Full";
			buyerror = true;
			return;
		}

	} else {
		//Buy Equipment
		full = player.GetComponent(Inventory).AddEquipment(id);
		if (full) {
			buyErrorLog = "Inventory Full";
			buyerror = true;
			return;
		}
	}

	//Remove Cash
	player.GetComponent(Inventory).cash -= price;

}

function ShopSell(id : int, slot : int, price : int, quan : int) {
	var dataItem : ItemData = database.GetComponent(ItemData);
	if (itemInven) {
		//Sell Usable Item
		if (quan >= player.GetComponent(Inventory).itemQuantity[slot]) {
			quan = player.GetComponent(Inventory).itemQuantity[slot];
		}
		player.GetComponent(Inventory).itemQuantity[slot] -= quan;
		if (player.GetComponent(Inventory).itemQuantity[slot] <= 0) {
			player.GetComponent(Inventory).itemSlot[slot] = 0;
			player.GetComponent(Inventory).itemQuantity[slot] = 0;
			player.GetComponent(Inventory).AutoSortItem();
		}
		//Add Cash
		player.GetComponent(Inventory).cash += price * quan;
	} else {
		//Sell Equipment
		player.GetComponent(Inventory).equipment[slot] = 0;
		player.GetComponent(Inventory).AutoSortEquipment();

		//Add Cash
		player.GetComponent(Inventory).cash += price * quan;
	}

}

function OnGUI() {
	if (!player) {
		return;
	}
	var customBox : GUIStyle = new GUIStyle("box");
	customBox.fontSize = 30f;
	var customButton : GUIStyle = new GUIStyle("button");
	customButton.fontSize = 30f;
	var customLable : GUIStyle = new GUIStyle("label");
	customLable.fontSize = 30f;
	var customText : GUIStyle = new GUIStyle("textview");
	customText.fontSize = 30f;
	var dataItem : ItemData = database.GetComponent(ItemData);
	var itemQuantity : int[] = player.GetComponent(Inventory).itemQuantity;
	var cash : int = player.GetComponent(Inventory).cash;
	var itemSlot : int[] = player.GetComponent(Inventory).itemSlot;
	var equipment : int[] = player.GetComponent(Inventory).equipment;

	GUI.skin = skin1;

	if (enter && !menu) {
		GUI.DrawTexture(Rect(Screen.width / 2 - 130, Screen.height - 120, 260, 80), button);
	}

	//Shop Main Menu
	if (menu && shopMain) {
		GUI.Box(new Rect(Screen.width / 2 - 125, Screen.height / 2 - 150, 250, 200), "Shop", customBox);
		if (GUI.Button(new Rect(Screen.width / 2 - 95, Screen.height / 2 - 90, 190, 50), "Buy", customButton)) {
			shopItem = true;
			shopMain = false;
		}
		if (GUI.Button(new Rect(Screen.width / 2 - 95, Screen.height / 2 - 30, 190, 50), "Sell", customButton)) {
			itemInven = true;
			shopMain = false;
		}
		if (GUI.Button(new Rect(Screen.width / 2 + 75, Screen.height / 2 - 150, 50, 50), "X", customButton)) {
			OnOffMenu();
		}
	}

	var i : int = 0;
	var x : int = 0;
	var y : int = 0;
	var posX : int = 260;
	var posY : int = 250;
	var gapX : int = 70;
	var gapY : int = 70;

	if (menu && itemInven && !sellwindow) {
		GUI.Box(Rect(240, 120, 320, 480), "Items", customBox);
		//Close Window Button
		if (GUI.Button(Rect(520, 120, 40, 40), "X", customButton)) {
			OnOffMenu();
		}

		for (y = 0; y < 4; y++) {
			for (x = 0; x < 4; x++) {
				if (GUI.Button(Rect(posX + gapX * x, posY + gapY * y, 60, 60), GUIContent(dataItem.usableItem[itemSlot[i]].icon, dataItem.usableItem[itemSlot[i]].itemName + "\n" + dataItem.usableItem[itemSlot[i]].description), customButton)) {
					select = i;
					sellwindow = true;
				}
				if (itemQuantity[i] > 0) {
					GUI.Label(Rect(posX + gapX * x, posY + gapY * y - 5, 40, 40), itemQuantity[i].ToString(), customLable); //Quantity
				}
				i++;
			}
		}

		GUI.Box(Rect(260, 165, 270, 75), GUI.tooltip, customBox);
		GUI.Label(Rect(260, 540, 150, 50), "$ " + cash.ToString(), customLable);
		if (GUI.Button(Rect(150, 245, 90, 80), "Item", customButton)) {
			//Switch to Item Tab
		}
		if (GUI.Button(Rect(150, 365, 90, 80), "Equip", customButton)) {
			//Switch to Equipment Tab
			equipInven = true;
			itemInven = false;
		}
	}

	if (menu && equipInven && !sellwindow) {
		GUI.Box(Rect(240, 120, 320, 480), "Equipment", customBox);
		//Close Window Button
		if (GUI.Button(Rect(520, 120, 40, 40), "X", customButton)) {
			OnOffMenu();
		}

		i = 0;
		x = 0;
		y = 0;
		for (y = 0; y < 2; y++) {
			for (x = 0; x < 4; x++) {
				if (GUI.Button(Rect(posX + gapX * x, posY + gapY * y, 60, 60), GUIContent(dataItem.equipment[equipment[i]].icon, dataItem.equipment[equipment[i]].itemName + "\n" + dataItem.equipment[equipment[i]].description))) {
					select = i;
					sellwindow = true;
				}
				i++;
			}
		}

		GUI.Box(Rect(260, 165, 270, 75), GUI.tooltip, customBox);
		GUI.Label(Rect(260, 540, 150, 50), "$ " + cash.ToString(), customLable);
		if (GUI.Button(Rect(150, 245, 90, 80), "Item", customButton)) {
			//Switch to Item Tab
			itemInven = true;
			equipInven = false;
		}
		if (GUI.Button(Rect(150, 365, 90, 80), "Equip", customButton)) {
			//Switch to Equipment Tab
		}
	}

	//---------------Sell Item Confirm Window------------------
	if (sellwindow) {
		if (itemInven) {
			if (itemSlot[select] == 0) {
				sellwindow = false;
			}
			GUI.Box(Rect(Screen.width / 2 - 125, Screen.height / 2 - 200, 250, 250), "Sell Price " + dataItem.usableItem[itemSlot[select]].price / 2, customBox);

			//------------------Quantity--------------
			text = GUI.TextField(new Rect(Screen.width / 2 + 40, Screen.height / 2 - 135, 50, 50), num.ToString(), 2, customText);
			GUI.Label(Rect(Screen.width / 2 - 95, Screen.height / 2 - 140, 190, 50), "Quantity", customLable);
			var temp : int = 0;
			if (int.TryParse(text, temp)) {
				//num = Mathf.Clamp(0, out temp);
				num = temp;
			} else if (text == "") {
				num = 0;
			}
			//-----------------------------------

		} else {
			if (equipment[select] == 0) {
				sellwindow = false;
			}
			GUI.Box(Rect(Screen.width / 2 - 125, Screen.height / 2 - 150, 250, 200), "Sell Price " + dataItem.equipment[equipment[select]].price / 2, customBox);
		}
		if (GUI.Button(Rect(Screen.width / 2 - 95, Screen.height / 2 - 90, 190, 50), "Sell", customButton)) {
			if (itemInven) {
				//Sell Usable Item
				if (num > 0) {
					//buywindow = false;
					ShopSell(itemSlot[select], select, dataItem.usableItem[itemSlot[select]].price / 2, num);
					sellwindow = false;
				}
			} else {
				//Sell Equipment
				ShopSell(equipment[select], select, dataItem.equipment[equipment[select]].price / 2, 1);
				sellwindow = false;
			}
		}
		if (GUI.Button(Rect(Screen.width / 2 - 95, Screen.height / 2 - 30, 190, 50), "Cancel", customButton)) {
			sellwindow = false;
		}
	}

	//
	// Buy
	//

	//-----------Buy Usable Item---------------------
	if (menu && shopItem && !buywindow && !buyerror) {
		GUI.Box(Rect(240, 120, 320, 480), "Shop", customBox);
		//Close Window Button
		if (GUI.Button(Rect(520, 120, 40, 40), "X", customButton)) {
			OnOffMenu();
		}

		i = 0;
		x = 0;
		y = 0;
		for (y = 0; y < 2; y++) {
			for (x = 0; x < 4; x++) {
				if (GUI.Button(Rect(posX + gapX * x, posY + gapY * y, 60, 60), GUIContent(dataItem.usableItem[itemShopSlot[i]].icon, dataItem.usableItem[itemShopSlot[i]].itemName + "\n" + dataItem.usableItem[itemShopSlot[i]].description))) {
					select = i;
					buywindow = true;
				}
				i++;
			}
		}

		GUI.Box(Rect(260, 165, 270, 75), GUI.tooltip, customBox);
		GUI.Label(Rect(260, 540, 150, 50), "$ " + cash.ToString(), customLable);
		if (GUI.Button(Rect(150, 245, 90, 80), "Item", customButton)) {
			//Switch to Item Tab
		}
		if (GUI.Button(Rect(150, 365, 90, 80), "Equip", customButton)) {
			//Switch to Equipment Tab
			shopEquip = true;
			shopItem = false;
		}
	}

	//-----------Buy Equipment Item---------------------
	if (menu && shopEquip && !buywindow && !buyerror) {
		GUI.Box(Rect(240, 120, 320, 480), "Shop", customBox);
		//Close Window Button
		if (GUI.Button(Rect(520, 120, 40, 40), "X", customButton)) {
			OnOffMenu();
		}

		i = 0;
		x = 0;
		y = 0;
		for (y = 0; y < 2; y++) {
			for (x = 0; x < 4; x++) {
				if (GUI.Button(Rect(posX + gapX * x, posY + gapY * y, 50, 50), GUIContent(dataItem.equipment[equipmentShopSlot[i]].icon, dataItem.equipment[equipmentShopSlot[i]].itemName + "\n" + dataItem.equipment[equipmentShopSlot[i]].description))) {
					select = i;
					buywindow = true;
				}
				i++;
			}
		}

		GUI.Box(Rect(260, 165, 270, 75), GUI.tooltip, customBox);
		GUI.Label(Rect(260, 540, 150, 50), "$ " + cash.ToString(), customLable);
		if (GUI.Button(Rect(150, 245, 90, 80), "Item", customButton)) {
			//Switch to Item Tab
			shopItem = true;
			shopEquip = false;
		}
		if (GUI.Button(Rect(150, 365, 90, 80), "Equip", customButton)) {
			//Switch to Equipment Tab
		}
	}

	//---------------Buy Item Confirm Window------------------
	if (buywindow) {
		if (shopItem) {
			if (itemShopSlot[select] == 0) {
				buywindow = false;
			}
			GUI.Box(Rect(Screen.width / 2 - 125, Screen.height / 2 - 200, 250, 250), "Price " + dataItem.usableItem[itemShopSlot[select]].price, customBox);
			//------------------Quantity--------------
			text = GUI.TextField(new Rect(Screen.width / 2 + 40, Screen.height / 2 - 135, 50, 50), num.ToString(), 2, customText);
			GUI.Label(Rect(Screen.width / 2 - 95, Screen.height / 2 - 140, 190, 50), "Quantity", customLable);
			temp = 0;
			if (int.TryParse(text, temp)) {
				//num = Mathf.Clamp(0, out temp);
				num = temp;
			} else if (text == "") {
				num = 0;
			}
			//-----------------------------------
		} else {
			if (equipmentShopSlot[select] == 0) {
				buywindow = false;
			}
			GUI.Box(Rect(Screen.width / 2 - 125, Screen.height / 2 - 150, 250, 200), "Price " + dataItem.equipment[equipmentShopSlot[select]].price, customBox);
		}
		if (GUI.Button(Rect(Screen.width / 2 - 95, Screen.height / 2 - 90, 190, 50), "Buy", customButton)) {
			if (shopItem) {
				//Sell Usable Item
				if (num > 0) {
					ShopBuy(itemShopSlot[select], select, dataItem.usableItem[itemShopSlot[select]].price * num, num);
					buywindow = false;
				}
			} else {
				//Sell Equipment
				ShopBuy(equipmentShopSlot[select], select, dataItem.equipment[equipmentShopSlot[select]].price, 1);
				buywindow = false;
			}
		}
		if (GUI.Button(Rect(Screen.width / 2 - 95, Screen.height / 2 - 30, 190, 50), "Cancel", customButton)) {
			buywindow = false;
		}
	}
	//Error When Buying
	if (buyerror) {
		GUI.Box(Rect(Screen.width / 2 - 125, Screen.height / 2 - 150, 250, 200), buyErrorLog, customBox);
		if (GUI.Button(Rect(Screen.width / 2 - 95, Screen.height / 2 - 30, 190, 50), "OK", customButton)) {
			buyerror = false;
		}
	}
}

function OnTriggerEnter(other : Collider) {
	if (other.gameObject.tag == "Player") {
		var inven : Inventory = other.GetComponent(Inventory);
		if (inven) {
			player = other.gameObject;
			enter = true;
		}
	}
}

function OnTriggerExit(other : Collider) {
	//if (other.gameObject.tag == "Player") {
	if (other.gameObject == player) {
		enter = false;
	}
}

function OnOffMenu() {
	//Freeze Time Scale to 0 if Window is Showing
	if (!menu && Time.timeScale != 0.0) {
		menu = true;
		itemInven = false;
		shopItem = false;
		shopEquip = false;
		equipInven = false;
		sellwindow = false;
		buywindow = false;
		buyerror = false;
		//shopMain = false;
		Time.timeScale = 0.0;
		Screen.lockCursor = false;
	} else if (menu) {
		menu = false;
		Time.timeScale = 1.0;
		Screen.lockCursor = true;
	}
}
