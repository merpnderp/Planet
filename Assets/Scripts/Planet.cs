using UnityEngine;
using System.Collections;

public class Planet : MonoBehaviour {

	static float halfPI = Mathf.PI / 2;
	static float quarterPI = Mathf.PI / 4;
	static float tau = Mathf.PI * 2;

	public Camera camera;
	public int radius = 6353000;
	public int segments = 64;
	public int screenWidth = Screen.width;	
	public int minHeight = 2;
	public float fov = 30f;
	public float smallestTheta;

	private ClipMap cm;
	private bool inited = false;
	private float vs; //minimum view angle
	private int clipMapCount;
	
	private ClipMap[] clipMaps;
	
	// Use this for initialization
	void Start ()
	{
		//If I don't use this, remove it.	
	}
	
	// Update is called once per frame
	void Update ()
	{
		if (!inited)
			return;
	}

	public void Init (Camera _camera, int _radius, Vector3 _position, int _segments, int _fov)
	{
		fov = _fov == 0 ? _fov : fov;
		fov = fov * .0174532925f;//Convert to radians
		camera = _camera != null ? _camera : camera;	
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
	private void initClipMaps ()
	{
		clipMaps = new ClipMap[clipMapCount];	
		float t = quarterPI;
		float scale;
		for (int i = 0; i < clipMapCount; i++) {
			clipMaps [i] = (ClipMap)Instantiate (cm);
			clipMaps[i].GetComponent<ClipMap>().test();
		}
		
		
	}	
	
	private void setClipMapCount ()
	{
		float theta = 100;
		while (theta > smallestTheta) {
			theta = (1 / Mathf.Pow (2, ++clipMapCount)) * Mathf.PI;
		}
	}
	
	private float getMinTheta( int _radius, int height ) { 
    	float lt = ( (height * vs) / _radius ) * segments;//multiply by segments because this is theta per triangle
	    lt = lt < quarterPI ? lt : quarterPI;
	    return lt < 0 ? smallestTheta : lt; 
	 }
	
}
