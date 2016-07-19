#pragma strict
private var motor : CharacterMotor;
var walkSpeed : float;
var sprintSpeed : float;
var canSprint : boolean = true;
private var sprint : boolean = false;
private var recover : boolean = false;
private var staminaRecover : float = 1.4;
private var useStamina : float = 0.04;

var staminaGauge : Texture2D;
var staminaBorder : Texture2D;

var maxStamina : float = 100.0;
var stamina : float = 100.0;

private var mJoystick : Joystick;
private var BtnRun : ButtonTouch;
private var BtnJump : ButtonTouch;
var NormalBG : Texture2D;
var PressedBG : Texture2D;

class MovementSound {
	var jumpVoice : AudioClip;
	var walkingSound : AudioClip;
}
var sound : MovementSound;

// Use this for initialization
function Awake() {
	motor = GetComponent(CharacterMotor);
	stamina = maxStamina;
}

function Start() {}

// Update is called once per frame
function Update() {
	var stat : Status = GetComponent(Status);
	if (stat.freeze) {
		motor.inputMoveDirection = Vector3(0, 0, 0);
		return;
	}
	if (Time.timeScale == 0.0) {
		return;
	}
	
	mJoystick = GameObject.FindWithTag("DirectionJoy").GetComponent("Joystick");
	BtnRun = GameObject.FindWithTag("ButtonRun").GetComponent("ButtonTouch");
	BtnJump = GameObject.FindWithTag("ButtonJump").GetComponent("ButtonTouch");
	
	if (BtnRun.flag){
		GameObject.FindWithTag("ButtonRunBG").guiTexture.texture = PressedBG;
	} else {
		GameObject.FindWithTag("ButtonRunBG").guiTexture.texture = NormalBG;
	}
	if (BtnJump.flag){
		GameObject.FindWithTag("ButtonJumpBG").guiTexture.texture = PressedBG;
	} else {
		GameObject.FindWithTag("ButtonJumpBG").guiTexture.texture = NormalBG;
	}

	//Cancel Sprint
	if (sprint && (mJoystick.position.y <= 0 || stamina <= 0 || !BtnRun.flag || Input.GetButtonDown("Fire1"))) {
		sprint = false;
		recover = true;
		motor.movement.maxForwardSpeed = walkSpeed;
		motor.movement.maxSidewaysSpeed = walkSpeed;
		StaminaRecover();
	}

	var controller : CharacterController = GetComponent(CharacterController);
	
	// Get the input vector from kayboard or analog stick
	// var directionVector : Vector3 = new Vector3(Input.GetAxis("Horizontal"), 0, Input.GetAxis("Vertical"));
	 var directionVector : Vector3 = new Vector3(0, 0, mJoystick.position.y);

	if (directionVector != Vector3.zero) {
		// Get the length of the directon vector and then normalize it
		// Dividing by the length is cheaper than normalizing when we already have the length anyway
		var directionLength : float = directionVector.magnitude;
		directionVector = directionVector / directionLength;

		// Make sure the length is no bigger than 1
		directionLength = Mathf.Min(1, directionLength);

		// Make the input vector more sensitive towards the extremes and less sensitive in the middle
		// This makes it easier to control slow speeds when using analog sticks
		directionLength = directionLength * directionLength;

		// Multiply the normalized direction vector by the modified length
		directionVector = directionVector * directionLength;
	}

	// Apply the direction to the CharacterMotor
	motor.inputMoveDirection = transform.rotation * directionVector;

	if (sprint) {
		motor.movement.maxForwardSpeed = sprintSpeed;
		motor.movement.maxSidewaysSpeed = sprintSpeed;
		return;
	}
	//Activate Sprint
	if (BtnRun.flag && mJoystick.position.y > 0.1 && (controller.collisionFlags & CollisionFlags.Below) != 0 && canSprint && stamina > 0) {
		sprint = true;
		Dasher();
	}

	if (Input.GetButtonDown("Jump") && sound.jumpVoice && motor.grounded) {
		audio.clip = sound.jumpVoice;
		audio.Play();
	}
	if (Input.GetAxis("Vertical") != 0 && sound.walkingSound && !audio.isPlaying || Input.GetAxis("Horizontal") != 0 && sound.walkingSound && !audio.isPlaying) {
		audio.clip = sound.walkingSound;
		audio.Play();
	}
	
	motor.inputJump = BtnJump.flag;
}

function OnGUI() {
	if (sprint || recover) {
		var staminaPercent : float = stamina * 100 / maxStamina * 3;
		GUI.DrawTexture(Rect((Screen.width / 2) - 150, Screen.height - 120, staminaPercent, 10), staminaGauge);
		GUI.DrawTexture(Rect((Screen.width / 2) - 153, Screen.height - 123, 306, 16), staminaBorder);
	}

}

function Dasher() {
	while (sprint) {
		yield WaitForSeconds(useStamina);
		if (stamina > 0) {
			stamina -= 1;
		} else {
			stamina = 0;
		}
	}

}

function StaminaRecover() {
	if (sprint || sprint && Input.GetKey(KeyCode.LeftShift) && stamina <= 0) {
		return;
	}
	yield WaitForSeconds(staminaRecover);
	while (!sprint) {
		yield WaitForSeconds(0.01);
		if (stamina < maxStamina && recover) {
			stamina += 5;
		} else {
			stamina = maxStamina;
			recover = false;
		}
	}
	//---------------
}

// Require a character controller to be attached to the same game object
@ script RequireComponent(CharacterMotor)
