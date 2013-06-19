using UnityEngine;
using System.Collections;

public class Planet : MonoBehaviour
{

	static float halfPI = Mathf.PI / 2f;
	static float quarterPI = Mathf.PI / 4f;
	
//	public Camera camera;
	public int radius = 6353000;
	public int segments = 64;
	public int screenWidth = Screen.width;
	public int minHeight = 2;
	public float fov = 30f;
	public float smallestTheta;
	public ClipMap clipMapPrefab;
	public float ClipMapUpdateSpeed = .1f;
	
	private Camera playerCamera;
	private bool inited = false;
	private float vs; //minimum view angle
	private int clipMapCount;
	private ClipMap[] clipMaps;
	private float[] scaledPI;
	private float delta = 0;
	private float oldHeightLock = 0, oldPhiLock = 0, oldThetaLock = 0;
	
	// Use this for initialization
	public void Init (Camera _camera, int _radius, Vector3 _position, int _segments, int _fov)
	{
		playerCamera = GameObject.FindWithTag ("MainCamera").GetComponent<Camera>();
		
		fov = _fov == 0 ? _fov : fov;
		fov = (fov * Mathf.PI) / 180;// .0174532925f;//Convert to radians
		playerCamera = _camera != null ? _camera : playerCamera;	
		radius = _radius == 0 ? _radius : radius;
		Transform t = gameObject.GetComponent<Transform> ();	
		t.position = _position;
		segments = _segments == 0 ? _segments : segments;
		vs = Mathf.Tan (fov / screenWidth);	
		
		smallestTheta = smallestTheta != 0 ? smallestTheta : getMinTheta (radius, minHeight);
		setClipMapCount ();	
		
		initClipMaps ();
		
		inited = true;	
	}
	
	
	// Update is called once per frame
	public void Update ()
	{
		if (!inited)
			return;
		delta += Time.deltaTime;
		
		if (delta > ClipMapUpdateSpeed) {
			Transform t = gameObject.transform;
			t.position.Set (t.position.x, t.position.y, t.position.z - radius);
			Vector3 localCameraPosition = t.InverseTransformPoint (playerCamera.transform.position);	
			float cameraDistance = Vector3.Distance (t.position, playerCamera.transform.position) - radius;	
		
			float theta = getTheta (localCameraPosition);
			float phi = getPhi (localCameraPosition);
			
			float heightLock = getHeightLock (cameraDistance);
			float minTheta = getMinTheta (radius, heightLock);
			
			float phiLock = getPhiLock (minTheta, phi);

			float thetaLock = getThetaLock (minTheta, theta);

			//If the a locked location has changed, update the clipmaps
			if (oldHeightLock != heightLock || oldPhiLock != phiLock || oldThetaLock != thetaLock) {
				float maxTheta = getMaxTheta (radius, heightLock);
				
				Quaternion pq = Quaternion.AngleAxis (Utils.RadiansToDegrees (-phiLock), new Vector3 (0, 1, 0));
				Quaternion tq = Quaternion.AngleAxis (Utils.RadiansToDegrees ((Mathf.PI / 2) - thetaLock), new Vector3 (1, 0, 0));
		
				updateClipMaps (heightLock, pq * tq, minTheta, maxTheta);	
				
				oldHeightLock = heightLock;
				oldPhiLock = phiLock;
				oldThetaLock = thetaLock;
			}	
				
			t.position.Set (t.position.x, t.position.y, t.position.z + radius);
			delta = 0f;
		}
		
	}

	private void updateClipMaps (float heightLock, Quaternion rotation, float minTheta, float maxTheta)
	{
		
		for (var i = 0; i< clipMapCount; i++) {
			if (clipMaps [i].visible == false) {
				if (clipMaps [i].theta < maxTheta && clipMaps [i].theta > minTheta) {
					clipMaps [i].visible = true;
				}
			} else {
				if (clipMaps [i].theta < minTheta || clipMaps [i].theta > maxTheta) {
					clipMaps [i].visible = false;
					continue;
				}
			}
			if (clipMaps [i].visible) {
				clipMaps [i].rotate = rotation;
				if(i+1 == clipMapCount || clipMaps[i+1].theta < minTheta ){
		          clipMaps[i].last =  true;
		        }else{
    		      clipMaps[i].last =  false;
		        }
			}
		}
		
	}
	
	private void initClipMaps ()
	{
		
		clipMaps = new ClipMap[clipMapCount];	
		float t = quarterPI;
		float scale;
		scaledPI = new float[clipMapCount];
		
		for (int i = 0; i < clipMapCount; i++) {
			scale = (1 / Mathf.Pow (2, i + 1));
			scaledPI [i] = Mathf.PI / 2 * scale;
			clipMaps [i] = (ClipMap)Instantiate (clipMapPrefab);
			clipMaps [i].Init (scaledPI [i], radius);
			clipMaps [i].theta = t;
			t /= 2f;
		}
		
	}
	
	private void setClipMapCount ()
	{
		float theta = 100;
		while (theta > smallestTheta) {
			theta = (1 / Mathf.Pow (2, ++clipMapCount)) * Mathf.PI;
		}
	}

	private float getHeightLock (float height)
	{
		float max = 30, midpoint = Mathf.Round (max / 2f), step = midpoint;
		float heightLock = 2;
		
		while (true) {
			step = Mathf.Round (step / 2);
			step = step == 0 ? 1 : step;
			heightLock = Mathf.Pow (2, midpoint);

			if (height < 2) {//If we have a negative height, whups
				heightLock = 2;
				break;
			}

			if (height >= heightLock) {
				if (midpoint >= max || height < Mathf.Pow (2, midpoint + 1)) {
					break;
				} else {
					midpoint += step;
				}
			} else {
				midpoint -= step;
			}
		}	
		return heightLock;	
	}

	private float getMinTheta (float _radius, float height)
	{ 
		float lt = ((height * vs) / _radius) * segments;//multiply by segments because this is theta per triangle
		lt = lt < quarterPI ? lt : quarterPI;
		return lt < 0 ? smallestTheta : lt; 
	}

	private float getMaxTheta (float radius, float height)
	{
		float mt = Mathf.Acos (radius / (radius + height));
		return mt < halfPI ? mt : halfPI;	
	}
	
	private float getThetaLock (float minTheta, float theta)
	{
		float max = Mathf.PI / minTheta, midpoint = max / 2, step = midpoint, thetaLock;
		while (true) {
			step = step / 2f;
			step = step == 0f ? 1f : step;

			thetaLock = minTheta * midpoint;

			if (theta >= thetaLock) {
				if (theta < minTheta * (midpoint + 1)) {
					break;
				} else {
					midpoint += step;
				}
			} else {
				midpoint -= step;
			}
		}
		return thetaLock;
	}
	
	private float getTheta (Vector3 v)
	{
		//q =tan-1(y/(z2+x2)1/2)
		return Mathf.PI / 2f - Mathf.Atan (v.y / Mathf.Pow ((v.z * v.z + v.x * v.x), .5f));
	}

	private float getPhi (Vector3 v)
	{
		//f = tan-1(x/z).
		float phi = Mathf.Atan (v.x / v.z);
		//Now adjust for special cases
		if (v.x < 0 && v.z < 0) {
			phi -= Mathf.PI;
		} else if (v.z < 0) {
			phi += Mathf.PI;
		}
		return phi;	
	}

	private float getPhiLock (float minTheta, float phi)
	{
		float max = Mathf.PI * 2 / minTheta, midpoint = max / 2, step = midpoint, tphi = phi + Mathf.PI, phiLock;
		while (true) {
			step = step / 2;
			step = step == 0 ? 1 : step;

			phiLock = minTheta * midpoint;

			if (tphi >= phiLock) {
				if (tphi < minTheta * (midpoint + 1)) {
					break;
				} else {
					midpoint += step;
				}
			} else {
				midpoint -= step;
			}
		}
		phiLock -= Mathf.PI;	
		return phiLock;
	}
}
