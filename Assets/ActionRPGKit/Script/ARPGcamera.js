#pragma strict
var target : Transform;
var camera_direction : Transform;
var player_direction : Transform;
var targetHeight : float = 1.2;
var distance : float = 4.0;
var maxDistance : float = 6;
var minDistance : float = 1.0;
var xSpeed : float = 1;
var ySpeed : float = 1;
var yMinLimit : float = -10;
var yMaxLimit : float = 70;
var zoomRate : float = 80;
var rotationDampening : float = 3.0;
var aim : Quaternion;
var aimAngle : float = 8;
var lockOn : boolean = false;
private var x : float = 0.0;
private var y : float = 0.0;

function Start() {
	if (!target) {
		target = GameObject.FindWithTag("Player").transform;
	}
	var angles : Vector3 = transform.eulerAngles;
	x = angles.y;
	y = angles.x;

	if (rigidbody)
		rigidbody.freezeRotation = true;
	Screen.lockCursor = false;
	
}

function LateUpdate() {
	if (!target)
		return;

	if (Time.timeScale == 0.0) {
		return;
	}
	
	var mJoystick : Joystick = GameObject.FindWithTag("CameraJoy").GetComponent("Joystick");
	var camJoystick : Joystick = GameObject.FindWithTag("DirectionJoy").GetComponent("Joystick");
	var mX : float = camJoystick.position.x;
	var mY : float = mJoystick.position.y;
	
	if (mX > 0.3 || mX < -0.3) {
		x += mX * xSpeed;
	}
	y -= mY * ySpeed;

	distance -= (Input.GetAxis("Mouse ScrollWheel") * Time.deltaTime) * zoomRate * Mathf.Abs(distance);
	distance = Mathf.Clamp(distance, minDistance, maxDistance);

	y = ClampAngle(y, yMinLimit, yMaxLimit);

	// Rotate Camera
	var rotation : Quaternion = Quaternion.Euler(y, x, 0);
	transform.rotation = rotation;
	aim = Quaternion.Euler(y - aimAngle, x, 0);

	//Rotate Target
	if (Input.GetButton("Fire1") || Input.GetButton("Fire2") || Input.GetAxis("Horizontal") != 0 || Input.GetAxis("Vertical") != 0 || lockOn) {
		target.transform.rotation = Quaternion.Euler(0, x, 0); ;
	}

	//Camera Position
	var position : Vector3 = target.position - (rotation * Vector3.forward * distance + Vector3(0, -targetHeight, 0));
	transform.position = position;

	var hit : RaycastHit;
	var trueTargetPosition : Vector3 = target.transform.position - Vector3(0, -targetHeight, 0);
	if (Physics.Linecast(trueTargetPosition, transform.position, hit)) {
		if (hit.transform.tag == "Wall") {
			var tempDistance : float = Vector3.Distance(trueTargetPosition, hit.point) - 0.28;

			position = target.position - (rotation * Vector3.forward * tempDistance + Vector3(0, -targetHeight, 0));
			transform.position = position;
		}

	}
}

static function ClampAngle(angle : float, min : float, max : float) {
	if (angle < -360)
		angle += 360;
	if (angle > 360)
		angle -= 360;
	return Mathf.Clamp(angle, min, max);

}
