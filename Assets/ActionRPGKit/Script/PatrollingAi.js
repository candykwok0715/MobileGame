#pragma strict
var speed : float = 4.0;
private var ai : AIset;
private var state : int = 0; //0 = Idle , 1 = Moving.
private var movingAnimation : AnimationClip;
private var idleAnimation : AnimationClip;
private var mainModel : GameObject;

var idleDuration : float = 2.0;
var moveDuration : float = 3.0;

private var wait : float = 0;

function Start () {
	ai	=	GetComponent(AIset);
	mainModel = GetComponent(AIset).mainModel;
	if(!mainModel){
		mainModel = this.gameObject;
	}
	movingAnimation = ai.movingAnimation;
	idleAnimation = ai.idleAnimation;
}

function Update () {
		if(ai.followState == AIState.Idle){
			if(state == 1){//Moving
				var controller : CharacterController = GetComponent(CharacterController);
				var forward : Vector3 = transform.TransformDirection(Vector3.forward);
     			controller.Move(forward * speed * Time.deltaTime);
     		}
     		//----------------------------
			  	if(wait >= idleDuration && state == 0){
			  		//Set to Moving Mode.
			       	RandomTurning();
			     }
			     if(wait >= moveDuration && state == 1){
			     	//Set to Idle Mode.
			     	if(idleAnimation){
			       		mainModel.animation.CrossFade(idleAnimation.name, 0.2f);
			       	}
			       	wait = 0;
			       	state = 0;
			     }
			      	wait += Time.deltaTime;
			 //-----------------------------
     	}

}

function RandomTurning(){
		var dir : float = Random.Range(0 , 360);
		transform.eulerAngles.y = dir;
		if(movingAnimation){
			    mainModel.animation.CrossFade(movingAnimation.name, 0.2f);
		}
		wait = 0; // Reset wait time.
		state = 1; // Change State to Move.

}

@script RequireComponent (AIset)