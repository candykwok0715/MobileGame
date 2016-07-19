#pragma strict
var questDataBase : GameObject;

var questProgress : int[] = new int[20];
var questSlot : int[] = new int[5];

private var hover : String = "";
private var show : boolean = false;
private var BtnQuest : ButtonClick;

private var btn_sound : AudioSource;
private var sound_used = false;

private var windowRect : Rect = new Rect(200, 140, 300, 450);

function Start() {
	var quest : QuestData = questDataBase.GetComponent(QuestData);
	// If Array Length of questProgress Variable < QuestData.Length
	if (questProgress.Length < quest.questData.Length) {
		questProgress = new int[quest.questData.Length];
	}
}

function Update() {
	BtnQuest = GameObject.FindWithTag("ButtonQuest").GetComponent("ButtonClick");
	if (BtnQuest.flag) {
		show = true;
		ResetPosition();
		if (!sound_used) {
			var sbtn_sound = GetComponents(AudioSource);
			btn_sound = sbtn_sound[0];
			if (btn_sound != null) {
				btn_sound.Play();
				sound_used = true;
			}
		}
	} else {
		sound_used = false;
		show = false;
	}
}

function AddQuest(id : int) : boolean {
	var full : boolean = false;
	var geta : boolean = false;

	var pt = 0;
	while (pt < questSlot.Length && !geta) {
		if (questSlot[pt] == id) {
			print("You Already Accept this Quest");
			geta = true;

		} else if (questSlot[pt] == 0) {
			questSlot[pt] = id;
			geta = true;
		} else {
			pt++;
			if (pt >= questSlot.Length) {
				full = true;
				print("Full");
			}
		}
	}
	return full;
}

function SortQuest() {
	var pt = 0;
	var nextp = 0;
	var clearr : boolean = false;
	while (pt < questSlot.Length) {
		if (questSlot[pt] == 0) {
			nextp = pt + 1;
			while (nextp < questSlot.Length && !clearr) {
				if (questSlot[nextp] > 0) {
					//Fine Next Slot and Set
					questSlot[pt] = questSlot[nextp];
					questSlot[nextp] = 0;
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

function OnGUI() {
	if (show) {
		var customWindow : GUIStyle = new GUIStyle("window");
		customWindow.fontSize = 30f;
		windowRect = GUI.Window(3, windowRect, QuestWindow, "Quest Log", customWindow);
	}
}

function QuestWindow(windowID : int) {
	var data : QuestData = questDataBase.GetComponent(QuestData);
	var customButton : GUIStyle = new GUIStyle("button");
	customButton.fontSize = 20f;
	var customLable : GUIStyle = new GUIStyle("label");
	customLable.fontSize = 20f;
	//Close Window Button
	if (GUI.Button(Rect(260, 0, 40, 40), "X", customButton)) {
		show = false;
		BtnQuest.OnMouseDown();
	}
	var i : int = 0;
	var posX : int = 10;
	var posY : int = 40;
	var gapY : int = 65;
	for (i = 0; i < 5; i++) {
		if (questSlot[i] > 0) {
			//Quest Name
			GUI.Label(Rect(posX, posY + gapY * i, 280, 40), data.questData[questSlot[i]].questName, customLable);
			//Quest Info + Progress
			GUI.Label(Rect(posX, posY + gapY * i + 25, 280, 40), data.questData[questSlot[i]].description + " (" + questProgress[questSlot[i]].ToString() + " / " + data.questData[questSlot[i]].finishProgress + ")", customLable);
			//Cancel Quest
			if (GUI.Button(Rect(posX + 205, posY + gapY * i + 10 , 85, 35), "Cancel", customButton)) {
				questProgress[questSlot[i]] = 0;
				questSlot[i] = 0;
				SortQuest();
			}
		}
	}
	GUI.DragWindow(new Rect(0, 0, 10000, 10000));
}

function Progress(id : int) {
	//Check for You have a quest ID match to one of Quest Slot
	for (var n = 0; n < questSlot.Length; n++) {
		if (questSlot[n] == id && id != 0) {
			var data : QuestData = questDataBase.GetComponent(QuestData);
			// Check If The Progress of this quest < Finish Progress then increase 1 of Quest Progress Variable
			if (questProgress[id] < data.questData[questSlot[n]].finishProgress) {
				questProgress[id] += 1;
			}
			print("Quest Slot =" + n);
		}
	}
}

function CheckQuestSlot(id : int) : boolean {
	//Check for You have a quest ID match to one of Quest Slot
	var exist : boolean = false;
	for (var n = 0; n < questSlot.Length; n++) {
		if (questSlot[n] == id && id != 0) {
			//You Have this quest in the slot
			exist = true;
		}
	}
	return exist;
}

function CheckQuestProgress(id : int) : int {
	//Check for You have a quest ID match to one of Quest Slot
	var qProgress : int = 0;
	for (var n = 0; n < questSlot.Length; n++) {
		if (questSlot[n] == id && id != 0) {
			//You Have this quest in the slot
			qProgress = questProgress[id];
		}
	}
	return qProgress;
}

function Clear(id : int) {
	//Check for You have a quest ID match to one of Quest Slot
	for (var n = 0; n < questSlot.Length; n++) {
		if (questSlot[n] == id && id != 0) {
			var data : QuestData = questDataBase.GetComponent(QuestData);
			questProgress[id] += 10;
			questSlot[n] = 0;
			SortQuest();
			print("Quest Slot =" + n);
		}
	}
}

function ResetPosition() {
	//Reset GUI Position when it out of Screen.
	if (windowRect.x >= Screen.width - 30 || windowRect.y >= Screen.height - 30 || windowRect.x <= -70 || windowRect.y <= -70) {
		windowRect = new Rect(200, 150, 300, 400);
	}
}
