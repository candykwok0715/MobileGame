#pragma strict
var questId : int = 1;
var questData : GameObject;
private var finishProgress : int = 0;
var button : Texture2D;
var textWindow : Texture2D;
 @ HideInInspector
var enter : boolean = false;
private var showGui : boolean = false;
private var showError : boolean = false;
 @ HideInInspector
var s : int = 0;

private var player : GameObject;

var talkText : String[] = new String[3];
var ongoingQuestText : String[] = new String[1];
var finishQuestText : String[] = new String[1];
var alreadyFinishText : String[] = new String[1];
private var errorLog : String = "Quest Full...";

var textStyle : GUIStyle;
private var acceptQuest : boolean = false;
var trigger : boolean = true;
private var activateQuest : boolean = false;
private var textLength : int = 0;
var showText : String = "";
private var thisActive : boolean = false;
private var questFinish : boolean = false;

private var btn_sound : AudioSource;

function Start() {}

function Update() {
	if (Input.GetKeyDown("e") && enter && thisActive && !showError) {
		NextPage();
	}
}

//added on mouse down
function OnMouseDown() {
	if (enter && thisActive && !showError) {
		btn_sound = GetComponent("AudioSource");
		if (btn_sound != null) {
			btn_sound.Play();
		}
		NextPage();
	}
}

function NextPage() {
	//Check if it already finish
	var ongoing : int = player.GetComponent(QuestStat).CheckQuestProgress(questId);
	var finish : int = questData.GetComponent(QuestData).questData[questId].finishProgress;
	var qprogress : int = player.GetComponent(QuestStat).questProgress[questId];
	if (qprogress >= finish + 9) {
		textLength = alreadyFinishText.Length;
		if (s < textLength) {
			showText = alreadyFinishText[s];
		}
		s++;
		TalkOnly();
		print("Already Clear");
		return;
	}

	if (acceptQuest) {
		if (ongoing >= finish) { //Quest Complete
			textLength = finishQuestText.Length;
			if (s < textLength) {
				showText = finishQuestText[s];
			}
			s++;
			FinishQuest();
		} else { //Ongoing
			textLength = ongoingQuestText.Length;
			if (s < textLength) {
				showText = ongoingQuestText[s];
			}
			s++;
			TalkOnly();
		}
	} else {
		//Before Take the quest
		textLength = talkText.Length;
		if (s < textLength) {
			showText = talkText[s];
		}
		s++;
		TakeQuest();
	}
}

function TakeQuest() {
	if (s > textLength) {
		showGui = false;
		AcceptQuest();
		CloseTalk();
	} else {
		Talking();
	}
}

function TalkOnly() {
	if (s > textLength) {
		showGui = false;
		CloseTalk();
	} else {
		Talking();
	}
}

function FinishQuest() {
	if (s > textLength) {
		showGui = false;
		questData.GetComponent(QuestData).QuestClear(questId, player);
		player.GetComponent(QuestStat).Clear(questId);
		print("Clear");
		questFinish = true;
		CloseTalk();
	} else {
		Talking();
	}
}

function AcceptQuest() {
	var full : boolean = player.GetComponent(QuestStat).AddQuest(questId);
	if (full) {
		//Quest Full
		showError = true; //Show Quest Full Window
		yield WaitForSeconds(1);
		showError = false;

	} else {
		acceptQuest = player.GetComponent(QuestStat).CheckQuestSlot(questId);
	}
}

function CheckQuestCondition() {
	var quest : QuestData = questData.GetComponent(QuestData);
	var progress : int = player.GetComponent(QuestStat).CheckQuestProgress(questId);

	if (progress >= quest.questData[questId].finishProgress) {
		//Quest Clear
		quest.QuestClear(questId, player);
	}
}

function OnGUI() {
	if (!player) {
		return;
	}
	if (enter && !showGui && !showError) {
		GUI.DrawTexture(Rect(Screen.width / 2 - 130, Screen.height - 120, 260, 80), button);
	}
	var customButton : GUIStyle = new GUIStyle("button");
	customButton.fontSize = 30f;
	if (showError) {
		GUI.DrawTexture(Rect(80, Screen.height - 255, 615, 220), textWindow);
		GUI.Label(Rect(150, Screen.height - 220, 500, 200), errorLog, textStyle);
		if (GUI.Button(Rect(660, Screen.height - 100, 150, 50), "OK", customButton)) {
			if (btn_sound != null) {
				btn_sound.Play();
			}
			showError = false;
		}
	}
	if (showGui && !showError && s <= textLength) {
		GUI.DrawTexture(Rect(220, Screen.height - 255, 615, 220), textWindow);
		GUI.Label(Rect(250, Screen.height - 220, 500, 200), showText, textStyle);
		if (GUI.Button(Rect(660, Screen.height - 100, 150, 50), "Next", customButton)) {
			if (btn_sound != null) {
				btn_sound.Play();
			}
			NextPage();
		}
	}
}

function OnTriggerEnter(other : Collider) {
	if (!trigger) {
		return;
	}
	if (other.tag == "Player") {
		s = 0;
		player = other.gameObject;
		acceptQuest = player.GetComponent(QuestStat).CheckQuestSlot(questId);
		enter = true;
		thisActive = true;
	}
}

function OnTriggerExit(other : Collider) {
	if (!trigger) {
		return;
	}
	if (other.tag == "Player") {
		s = 0;
		enter = false;
		CloseTalk();
	}
	thisActive = false;
	showError = false;
}

function Talking() {
	if (!enter) {
		return;
	}
	Time.timeScale = 0.0;
	Screen.lockCursor = false;
	showGui = true;
}

function CloseTalk() {
	showGui = false;
	Time.timeScale = 1.0;
	Screen.lockCursor = true;
	s = 0;
}

function ActivateQuest(p : GameObject) : boolean {
	player = p;
	acceptQuest = player.GetComponent(QuestStat).CheckQuestSlot(questId);
	thisActive = false;
	trigger = false;
	NextPage();
	return questFinish;
}
