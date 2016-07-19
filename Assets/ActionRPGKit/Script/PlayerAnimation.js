#pragma strict
public var runMaxAnimationSpeed : float = 1.0;
public var backMaxAnimationSpeed : float = 1.0;
public var sprintAnimationSpeed : float = 1.5;

private var player : GameObject;
private var mainModel : GameObject;

var idle : AnimationClip;
var run : AnimationClip;
var right : AnimationClip;
var left : AnimationClip;
var back : AnimationClip;
var jump : AnimationClip;
var hurt : AnimationClip;

private var mJoystick : Joystick;

function Start() {
	if (!player) {
		player = this.gameObject;
	}
	mainModel = GetComponent(AttackTrigger).mainModel;
	if (!mainModel) {
		mainModel = this.gameObject;
	}

	mainModel.animation[run.name].speed = runMaxAnimationSpeed;
	mainModel.animation[right.name].speed = runMaxAnimationSpeed;
	mainModel.animation[left.name].speed = runMaxAnimationSpeed;
	mainModel.animation[back.name].speed = backMaxAnimationSpeed;

	mainModel.animation[jump.name].wrapMode = WrapMode.ClampForever;

	if (hurt) {
		mainModel.animation[hurt.name].layer = 5;
	}

}

function Update() {
	mJoystick = GameObject.FindWithTag("DirectionJoy").GetComponent("Joystick");
	if (mJoystick != null) {
		var controller : CharacterController = player.GetComponent(CharacterController);
		if ((controller.collisionFlags & CollisionFlags.Below) != 0) {
			if (mJoystick.position.x > 0.4)
				mainModel.animation.CrossFade(right.name);
			else if (mJoystick.position.x < -0.4)
				mainModel.animation.CrossFade(left.name);
			else if (mJoystick.position.y > 0.1)
				mainModel.animation.CrossFade(run.name);
			else if (mJoystick.position.y < -0.1)
				mainModel.animation.CrossFade(back.name);
			else
				mainModel.animation.CrossFade(idle.name);
		} else {
			mainModel.animation.CrossFade(jump.name);
		}
	}
}

function AnimationSpeedSet() {
	mainModel = GetComponent(AttackTrigger).mainModel;
	if (!mainModel) {
		mainModel = this.gameObject;
	}
	mainModel.animation[run.name].speed = runMaxAnimationSpeed;
	mainModel.animation[right.name].speed = runMaxAnimationSpeed;
	mainModel.animation[left.name].speed = runMaxAnimationSpeed;
	mainModel.animation[back.name].speed = backMaxAnimationSpeed;
}
