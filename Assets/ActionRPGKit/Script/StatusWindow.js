#pragma strict
private var show : boolean = false;
var titleStyle : GUIStyle;
var textStyle : GUIStyle;
var textStyle2 : GUIStyle;
var buttonStyle : GUIStyle;

//Icon for Buffs
var braveIcon : Texture2D;
var barrierIcon : Texture2D;
var faithIcon : Texture2D;
var magicBarrierIcon : Texture2D;

var skin : GUISkin;
private var windowRect : Rect = new Rect(180, 120, 340, 480);
private var BtnStatus : ButtonClick;

private var btn_sound : AudioSource;
private var sound_used = false;

function Update() {
	BtnStatus = GameObject.FindWithTag("ButtonStatus").GetComponent("ButtonClick");
	if (BtnStatus.flag) {
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
		show = false;
		sound_used = false;
	}
}

function OnGUI() {
	GUI.skin = skin;
	var stat : Status = GetComponent(Status);

	if (show) {
		windowRect = GUI.Window(0, windowRect, StatWindow, "Status", titleStyle);
	}

	//Show Buffs Icon
	if (stat.brave) {
		GUI.DrawTexture(new Rect(30, 140, 60, 60), braveIcon);
	}
	if (stat.barrier) {
		GUI.DrawTexture(new Rect(100, 140, 60, 60), barrierIcon);
	}
	if (stat.faith) {
		GUI.DrawTexture(new Rect(170, 140, 60, 60), faithIcon);
	}
	if (stat.mbarrier) {
		GUI.DrawTexture(new Rect(240, 140, 60, 60), magicBarrierIcon);
	}
}

function StatWindow(windowID : int) {
	var stat : Status = GetComponent(Status);
	//Close Window Button
	if (GUI.Button(new Rect(270, 0, 50, 50), "X", buttonStyle)) {
		show = false;
		BtnStatus.OnMouseDown();
	}
	var x : int = 30;
	var y : int = 120;
	var height : int = 40;
	var width : int = 200;
	var gap : int = 50;
	GUI.Label(new Rect(x, 60, width, height), "Level", textStyle);
	GUI.Label(new Rect(x, y + gap * 0, width, height), "STR", textStyle);
	GUI.Label(new Rect(x, y + gap * 1, width, height), "DEF", textStyle);
	GUI.Label(new Rect(x, y + gap * 2, width, height), "MATK", textStyle);
	GUI.Label(new Rect(x, y + gap * 3, width, height), "MDEF", textStyle);
	y = 340;
	gap = 40;
	GUI.Label(new Rect(x, y + gap * 0, width, height), "EXP", textStyle);
	GUI.Label(new Rect(x, y + gap * 1, width, height), "Next LV", textStyle);
	GUI.Label(new Rect(x, y + gap * 2, width, height), "Status Pts", textStyle);

	//Status
	var lv : int = stat.level;
	var atk : int = stat.atk;
	var def : int = stat.def;
	var matk : int = stat.matk;
	var mdef : int = stat.mdef;
	var exp : int = stat.exp;
	var next : int = stat.maxExp - exp;
	var stPoint : int = stat.statusPoint;
	x = 180;
	y = 120;
	gap = 50;
	width = 100;
	GUI.Label(new Rect(x, 60, width, height), lv.ToString(), textStyle2);
	GUI.Label(new Rect(x, y + gap * 0, width, height), atk.ToString(), textStyle2);
	GUI.Label(new Rect(x, y + gap * 1, width, height), def.ToString(), textStyle2);
	GUI.Label(new Rect(x, y + gap * 2, width, height), matk.ToString(), textStyle2);
	GUI.Label(new Rect(x, y + gap * 3, width, height), mdef.ToString(), textStyle2);
	y = 340;
	gap = 40;
	GUI.Label(new Rect(x, y + gap * 0, width, height), exp.ToString(), textStyle2);
	GUI.Label(new Rect(x, y + gap * 1, width, height), next.ToString(), textStyle2);
	GUI.Label(new Rect(x, y + gap * 2, width, height), stPoint.ToString(), textStyle2);

	x = 280;
	y = 120;
	gap = 50;
	if (GUI.Button(new Rect(x, y + gap * 0, height, height), "+", buttonStyle) && stPoint > 0) {
		GetComponent(Status).atk += 1;
		GetComponent(Status).statusPoint -= 1;
		GetComponent(Status).CalculateStatus();
	}
	if (GUI.Button(new Rect(x, y + gap * 1, height, height), "+", buttonStyle) && stPoint > 0) {
		GetComponent(Status).def += 1;
		GetComponent(Status).maxHealth += 5;
		GetComponent(Status).statusPoint -= 1;
		GetComponent(Status).CalculateStatus();
	}
	if (GUI.Button(new Rect(x, y + gap * 2, height, height), "+", buttonStyle) && stPoint > 0) {
		GetComponent(Status).matk += 1;
		GetComponent(Status).maxMana += 3;
		GetComponent(Status).statusPoint -= 1;
		GetComponent(Status).CalculateStatus();
	}
	if (GUI.Button(new Rect(x, y + gap * 3, height, height), "+", buttonStyle) && stPoint > 0) {
		GetComponent(Status).mdef += 1;
		GetComponent(Status).statusPoint -= 1;
		GetComponent(Status).CalculateStatus();
	}
	GUI.DragWindow(new Rect(0, 0, 10000, 10000));
}

function ResetPosition() {
	//Reset GUI Position when it out of Screen.
	if (windowRect.x >= Screen.width - 30 || windowRect.y >= Screen.height - 30 || windowRect.x <= -70 || windowRect.y <= -70) {
		windowRect = new Rect(180, 120, 340, 480);
	}
}

@ script RequireComponent(Status)
