using System;
using UnityEngine;

public class Utils
{
	static public float RadiansToDegrees (float r)
	{
		return r / Mathf.PI * 180;
	}

	static public float DegreesToRadians (float d)
	{
		return d * Mathf.PI / 180;
	}
}

