using UnityEngine;
using System.Collections;

public class ClipMap : MonoBehaviour {

	private float scaledPI;
	private int radius;
	public bool last = false;
	public bool visible = false;	
	public float theta;
	public Quaternion rotate;
	public int zoomLevel;
		
	
	public void Init (float _scaledPI, int _radius)
	{
		scaledPI = _scaledPI;
		radius = _radius;
	}
}
