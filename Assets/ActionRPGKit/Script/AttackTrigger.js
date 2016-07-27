#pragma strict
var mainModel : GameObject;
var attackPoint : Transform;
var attackPrefab : Transform;
enum whileAtk {
	MeleeFwd = 0,
	Immobile = 1,
	WalkFree = 2
}
var whileAttack : whileAtk = whileAtk.MeleeFwd;
var upperBody : Transform;
private var mixingAnim : boolean = false;

var skillPrefab : Transform[] = new Transform[3];

private var atkDelay : boolean = false;
var freeze : boolean = false;

var attackSpeed : float = 0.15;
private var nextFire : float = 0.0;
var atkDelay1 : float = 0.1;
var skillDelay : float = 0.3;

var attackCombo : AnimationClip[] = new AnimationClip[3];
var attackAnimationSpeed : float = 1.0;
var skillAnimation : AnimationClip[] = new AnimationClip[3];
var skillAnimationSpeed : float = 1.0;
var manaCost : int[] = new int[3];
private var hurt : AnimationClip;

private var meleefwd : boolean = false;
private var isCasting : boolean = false;

private var c : int = 0;
private var conCombo : int = 0;

var Maincam : Transform;
var MaincamPrefab : GameObject;
var attackPointPrefab : GameObject;

private var str : int = 0;
private var matk : int = 0;

var aimIcon : Texture2D;
var aimIconSize : int = 40;

private var flinch : boolean = false;
private var skillEquip : int = 0;
private var knock : Vector3 = Vector3.zero;

private var BtnAttack : ButtonTouch;
private var BtnMagic : ButtonTouch;
var AttackIcon : Texture2D;
var AttackIconPressed : Texture2D;
var NormalBG : Texture2D;
var PressedBG : Texture2D;

class AtkSound {
	var attackComboVoice : AudioClip[] = new AudioClip[3];
	var magicCastVoice : AudioClip;
	var hurtVoice : AudioClip;
}
var sound : AtkSound;

function Awake() {
	gameObject.tag = "Player";
	if (!Maincam) {
		var newCam : GameObject = GameObject.FindWithTag("MainCamera");
		if (!newCam) {
			newCam = Instantiate(MaincamPrefab, transform.position, transform.rotation);
		}
		Maincam = newCam.transform;
	}

	if (!mainModel) {
		mainModel = this.gameObject;
	}
	//Assign This mainModel to Status Script
	GetComponent(Status).mainModel = mainModel;
	//Check if Main Camera does not attached ARPGcamera Script. Destroy it and spawn New Camera from MainCamPrefab
	if (Maincam) {
		var checkCam : ARPGcamera = Maincam.GetComponent(ARPGcamera);
		if (!checkCam) {
			Destroy(Maincam.gameObject);
			newCam = Instantiate(MaincamPrefab, transform.position, transform.rotation);
			Maincam = newCam.transform;
		}
		Maincam.GetComponent(ARPGcamera).target = this.transform;
	} else {
		newCam = Instantiate(MaincamPrefab, transform.position, transform.rotation);
		Maincam = newCam.transform;
	}
	str = GetComponent(Status).addAtk;
	matk = GetComponent(Status).addMatk;
	//Set All Attack Animation'sLayer to 15
	var animationSize : int = attackCombo.length;
	var a : int = 0;
	if (animationSize > 0) {
		while (a < animationSize && attackCombo[a]) {
			mainModel.animation[attackCombo[a].name].layer = 15;
			a++;
		}
	}

	animationSize = skillAnimation.length;
	a = 0;
	//Set All Skill Animation'sLayer to 16
	if (animationSize > 0) {
		while (a < animationSize && skillAnimation[a]) {
			mainModel.animation[skillAnimation[a].name].layer = 16;
			mainModel.animation[skillAnimation[a].name].speed = skillAnimationSpeed;
			a++;
		}
	}

	//Spawn new Attack Point if you didn't assign it.
	if (!attackPoint) {
		if (!attackPointPrefab) {
			print("Please assign Attack Point");
			freeze = true;
			return;
		}
		var newAtkPoint : GameObject = Instantiate(attackPointPrefab, transform.position, transform.rotation);
		newAtkPoint.transform.parent = this.transform;
		attackPoint = newAtkPoint.transform;
	}
	hurt = GetComponent(PlayerAnimation).hurt;
}

function Update() {
	var stat : Status = GetComponent(Status);
	if (freeze || atkDelay || Time.timeScale == 0.0 || stat.freeze) {
		return;
	}
	var controller : CharacterController = GetComponent(CharacterController);
	if (flinch) {
		controller.Move(knock * 6 * Time.deltaTime);
		return;
	}

	if (meleefwd) {
		var lui : Vector3 = transform.TransformDirection(Vector3.forward);
		controller.Move(lui * 5 * Time.deltaTime);
	}
	attackPoint.transform.rotation = Maincam.GetComponent(ARPGcamera).aim;
	var bulletShootout : Transform;
	
	//Normal Trigger
	BtnAttack = GameObject.FindWithTag("ButtonAttack").GetComponent("ButtonTouch");
	BtnMagic = GameObject.FindWithTag("ButtonMagic").GetComponent("ButtonTouch");
	
	if (BtnAttack.flag){
		GameObject.FindWithTag("ButtonAttack").guiTexture.texture = AttackIconPressed;
	} else {
		GameObject.FindWithTag("ButtonAttack").guiTexture.texture = AttackIcon;
	}
	if (BtnMagic.flag){
		GameObject.FindWithTag("ButtonMagicBG").guiTexture.texture = PressedBG;
	} else {
		GameObject.FindWithTag("ButtonMagicBG").guiTexture.texture = NormalBG;
	}
	
	if (BtnAttack.flag && Time.time > nextFire && !isCasting) {
		if (Time.time > (nextFire + 0.5)) {
			c = 0;
		}
		//Attack Combo
		if (attackCombo.Length >= 1) {
			conCombo++;
			AttackCombo();
		}
	}
	
	//Magic
	if (BtnMagic.flag && Time.time > nextFire && !isCasting && skillPrefab[skillEquip] && !stat.silence) {
		MagicSkill(skillEquip);
	}
	if (Input.GetKeyDown("1") && !isCasting && skillPrefab[0]) {
		skillEquip = 0;
	}
	if (Input.GetKeyDown("2") && !isCasting && skillPrefab[1]) {
		skillEquip = 1;
	}
	if (Input.GetKeyDown("3") && !isCasting && skillPrefab[2]) {
		skillEquip = 2;
	}
}

function OnGUI() {
	GUI.DrawTexture(Rect(Screen.width / 2 - 16, Screen.height / 2 - 90, aimIconSize, aimIconSize), aimIcon);
}

function AttackCombo() {
	if (!attackCombo[c]) {
		print("Please assign attack animation in Attack Combo");
		return;
	}
	str = GetComponent(Status).addAtk;
	matk = GetComponent(Status).addMatk;
	var bulletShootout : Transform;
	isCasting = true;
	// If Melee Dash
	if (whileAttack == whileAtk.MeleeFwd) {
		GetComponent(CharacterMotor).canControl = false;
		MeleeDash();
	}
	// If Immobile
	if (whileAttack == whileAtk.Immobile) {
		GetComponent(CharacterMotor).canControl = false;
	}
	if (sound.attackComboVoice.Length > c && sound.attackComboVoice[c]) {
		audio.clip = sound.attackComboVoice[c];
		audio.Play();
	}
	while (conCombo > 0) {
		if (c >= 1) {
			mainModel.animation.PlayQueued(attackCombo[c].name, QueueMode.PlayNow).speed = attackAnimationSpeed;
		} else {
			mainModel.animation.PlayQueued(attackCombo[c].name, QueueMode.PlayNow).speed = attackAnimationSpeed;
		}

		var wait : float = mainModel.animation[attackCombo[c].name].length;

		yield WaitForSeconds(atkDelay1);
		c++;

		nextFire = Time.time + attackSpeed;
		bulletShootout = Instantiate(attackPrefab, attackPoint.transform.position, attackPoint.transform.rotation);
		bulletShootout.GetComponent(BulletStatus).Setting(str, matk, "Player", this.gameObject);
		conCombo -= 1;

		if (c >= attackCombo.Length) {
			c = 0;
			atkDelay = true;
			yield WaitForSeconds(wait);
			atkDelay = false;
		} else {
			yield WaitForSeconds(attackSpeed);
		}

	}

	//yield WaitForSeconds(attackSpeed);
	isCasting = false;
	GetComponent(CharacterMotor).canControl = true;
}

function MeleeDash() {
	meleefwd = true;
	yield WaitForSeconds(0.2);
	meleefwd = false;

}

function MagicSkill(skillID : int) {
	if (!skillAnimation[skillID]) {
		print("Please assign skill animation in Skill Animation");
		return;
	}
	str = GetComponent(Status).addAtk;
	matk = GetComponent(Status).addMatk;

	if (GetComponent(Status).mana < manaCost[skillID] || GetComponent(Status).silence) {
		return;
	}
	if (sound.magicCastVoice) {
		audio.clip = sound.magicCastVoice;
		audio.Play();
	}
	isCasting = true;
	GetComponent(CharacterMotor).canControl = false;
	mainModel.animation.Play(skillAnimation[skillID].name);

	nextFire = Time.time + skillDelay;
	Maincam.GetComponent(ARPGcamera).lockOn = true;
	var bulletShootout : Transform;

	var wait : float = mainModel.animation[skillAnimation[skillID].name].length - 0.3;
	yield WaitForSeconds(wait);
	Maincam.GetComponent(ARPGcamera).lockOn = false;
	bulletShootout = Instantiate(skillPrefab[skillID], attackPoint.transform.position, attackPoint.transform.rotation);
	bulletShootout.GetComponent(BulletStatus).Setting(str, matk, "Player", this.gameObject);
	yield WaitForSeconds(skillDelay);
	isCasting = false;
	GetComponent(CharacterMotor).canControl = true;
	GetComponent(Status).mana -= manaCost[skillID];
}

function Flinch(dir : Vector3) {
	knock = dir;
	if (sound.hurtVoice && GetComponent(Status).health >= 1) {
		audio.clip = sound.hurtVoice;
		audio.Play();
	}
	GetComponent(CharacterMotor).canControl = false;
	KnockBack();
	mainModel.animation.PlayQueued(hurt.name, QueueMode.PlayNow);
	GetComponent(CharacterMotor).canControl = true;
}

function KnockBack() {
	flinch = true;
	yield WaitForSeconds(0.2);
	flinch = false;
}

 @ script RequireComponent(Status)
 @ script RequireComponent(StatusWindow)
 @ script RequireComponent(HealthBar)
 @ script RequireComponent(PlayerAnimation)
 @ script RequireComponent(PlayerInputController)
 @ script RequireComponent(CharacterMotor)
 @ script RequireComponent(Inventory)
 @ script RequireComponent(QuestStat)
@ script RequireComponent(SkillWindow)
