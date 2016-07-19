#pragma strict
var player : GameObject;
var database : GameObject;

var skill : int[] = new int[3];
var skillListSlot : int[] = new int[9];

private var show : boolean = false;
private var skillSelect : int = 0;
private var BtnSkill : ButtonClick;
private var skillIcon : GUITexture;

private var btn_sound : AudioSource;
private var sound_used = false;

private var windowRect : Rect = new Rect(160, 160, 380, 380);

function Start() {
	if (!player) {
		player = this.gameObject;
	}
	//AssignAllSkill();
}

function Update() {
	var dataItem : SkillData = database.GetComponent(SkillData);

	skillIcon = GameObject.FindWithTag("ButtonMagic").guiTexture;
	BtnSkill = GameObject.FindWithTag("ButtonSkill").GetComponent("ButtonClick");

	if (BtnSkill.flag) {
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

function OnGUI() {
	if (show) {
		var customWindow : GUIStyle = new GUIStyle("window");
		customWindow.fontSize = 30f;
		windowRect = GUI.Window(2, windowRect, SkillWindow, "Skill", customWindow);
	}
}

function SkillWindow(windowID : int) {
	var dataItem : SkillData = database.GetComponent(SkillData);
	var customButton : GUIStyle = new GUIStyle("button");
	customButton.fontSize = 30f;
	if (GUI.Button(Rect(340, 0, 40, 40), "X", customButton)) {
		show = false;
		BtnSkill.OnMouseDown();
	}

	//Skill List
	if (GUI.Button(Rect(50, 55, 80, 80), dataItem.skill[skillListSlot[0]].icon)) {
		AssignSkill(skillSelect, 0);
		skillIcon.guiTexture.texture = dataItem.skill[skillListSlot[0]].icon;
	}
	if (GUI.Button(Rect(150, 55, 80, 80), dataItem.skill[skillListSlot[1]].icon)) {
		AssignSkill(skillSelect, 1);
		skillIcon.guiTexture.texture = dataItem.skill[skillListSlot[1]].icon;
	}
	if (GUI.Button(Rect(250, 55, 80, 80), dataItem.skill[skillListSlot[2]].icon)) {
		AssignSkill(skillSelect, 2);
		skillIcon.guiTexture.texture = dataItem.skill[skillListSlot[2]].icon;
	}
	if (GUI.Button(Rect(50, 155, 80, 80), dataItem.skill[skillListSlot[3]].icon)) {
		AssignSkill(skillSelect, 3);
		skillIcon.guiTexture.texture = dataItem.skill[skillListSlot[3]].icon;
	}
	if (GUI.Button(Rect(150, 155, 80, 80), dataItem.skill[skillListSlot[4]].icon)) {
		AssignSkill(skillSelect, 4);
		skillIcon.guiTexture.texture = dataItem.skill[skillListSlot[4]].icon;
	}
	if (GUI.Button(Rect(250, 155, 80, 80), dataItem.skill[skillListSlot[5]].icon)) {
		AssignSkill(skillSelect, 5);
		skillIcon.guiTexture.texture = dataItem.skill[skillListSlot[5]].icon;
	}
	if (GUI.Button(Rect(50, 255, 80, 80), dataItem.skill[skillListSlot[6]].icon)) {
		AssignSkill(skillSelect, 6);
		skillIcon.guiTexture.texture = dataItem.skill[skillListSlot[6]].icon;
	}
	if (GUI.Button(Rect(150, 255, 80, 80), dataItem.skill[skillListSlot[7]].icon)) {
		AssignSkill(skillSelect, 7);
		skillIcon.guiTexture.texture = dataItem.skill[skillListSlot[7]].icon;
	}
	if (GUI.Button(Rect(250, 255, 80, 80), dataItem.skill[skillListSlot[8]].icon)) {
		AssignSkill(skillSelect, 8);
		skillIcon.guiTexture.texture = dataItem.skill[skillListSlot[8]].icon;
	}
	GUI.DragWindow(new Rect(0, 0, 10000, 10000));
}

function AssignSkill(id : int, sk : int) {
	var dataSkill : SkillData = database.GetComponent(SkillData);
	player.GetComponent(AttackTrigger).manaCost[id] = dataSkill.skill[skillListSlot[sk]].manaCost;
	player.GetComponent(AttackTrigger).skillPrefab[id] = dataSkill.skill[skillListSlot[sk]].skillPrefab;
	player.GetComponent(AttackTrigger).skillAnimation[id] = dataSkill.skill[skillListSlot[sk]].skillAnimation;

	if (dataSkill.skill[skillListSlot[sk]].skillAnimation) {
		player.GetComponent(AttackTrigger).mainModel.animation[dataSkill.skill[skillListSlot[sk]].skillAnimation.name].layer = 16;
	}

	skill[id] = skillListSlot[sk];
}

function AssignAllSkill() {
	if (!player) {
		player = this.gameObject;
	}
	var n : int = 0;
	var dataSkill : SkillData = database.GetComponent(SkillData);
	while (n <= 2) {
		player.GetComponent(AttackTrigger).manaCost[n] = dataSkill.skill[skill[n]].manaCost;
		player.GetComponent(AttackTrigger).skillPrefab[n] = dataSkill.skill[skill[n]].skillPrefab;
		player.GetComponent(AttackTrigger).skillAnimation[n] = dataSkill.skill[skill[n]].skillAnimation;
		if (dataSkill.skill[skill[n]].skillAnimation) {
			player.GetComponent(AttackTrigger).mainModel.animation[dataSkill.skill[skill[n]].skillAnimation.name].layer = 16;
		}
		n++;
	}
}

function ResetPosition() {
	//Reset GUI Position when it out of Screen.
	if (windowRect.x >= Screen.width - 30 || windowRect.y >= Screen.height - 30 || windowRect.x <= -70 || windowRect.y <= -70) {
		windowRect = new Rect(160, 160, 380, 380);
	}
}
