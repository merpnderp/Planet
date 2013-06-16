/**
 * @author Kaleb Murphy
 */

using UnityEngine;
using System.Collections;
using System.Collections.Generic;

public class RingGeometry  {

	
	static public Mesh CreateRingGeometry (int innerRadius, int outerRadius, int thetaSegments, int phiSegments, int thetaStart, int thetaLength)
	{
		Mesh mesh = new Mesh ();
		
		List<Vector3> vertices = new List<Vector3> ();	
		List<int> triangles = new List<int> ();	
		List<Vector3> normals = new List<Vector3> ();	
		
		outerRadius = outerRadius == 0 ? outerRadius : 50;
		thetaLength = thetaLength == 0 ? thetaLength : 50;
		
		thetaSegments = thetaSegments == 0 ? Mathf.Max (3, thetaSegments) : 8;
		phiSegments = phiSegments == 0 ? Mathf.Max (3, phiSegments) : 8;
		
		int i, o, radius = innerRadius, radiusStep = ((outerRadius - innerRadius) / phiSegments);

		List<Vector2> uvs = new List<Vector2> (); 
		
		for (i = 0; i <= phiSegments; i++) {// concentric circles inside ring
			
			for (o = 0; o <= thetaSegments; o++) {// number of segments per circle
			
				Vector3 vertex = new Vector3 ();
				float segment = thetaStart + o / thetaSegments * thetaLength;
				
				vertex.x = radius * Mathf.Cos (segment);
				vertex.y = radius * Mathf.Sin (segment);
				
				vertices.Add (vertex);
				normals.Add (-Vector3.forward);
				
				uvs.Add (new Vector2 ((vertex.x / radius + 1) / 2, - (vertex.y / radius + 1) / 2 + 1));
			}
			
			radius += radiusStep;
			
		}
		
	
		
		for (i = 0; i < phiSegments; i++) {
			
			int thetaSegment = i * thetaSegments;
			
			for (o = 0; o <= thetaSegments; o++) {

				int segment = o + thetaSegment;
				
				int v1 = segment + i;
				int v2 = segment + thetaSegments + i;
				int v3 = segment + thetaSegments + 1 + i;
				
				triangles.Add (v1);
				triangles.Add (v2);
				triangles.Add (v3);
				
				v1 = segment + i;
				v2 = segment + thetaSegments + i + 1;
				v3 = segment + 1 + i;
				
				triangles.Add (v1);
				triangles.Add (v2);
				triangles.Add (v3);
				
			}
			
		}
		
		mesh.vertices = vertices.ToArray ();	
		mesh.triangles = triangles.ToArray ();
		mesh.normals = normals.ToArray ();
		mesh.uv = uvs.ToArray ();	
		
		return mesh;
		
	}
}
