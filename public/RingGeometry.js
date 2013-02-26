



THREE.RingGeometry = function ( innerRadius, outerRadius, thetaSegments, phiSegments, thetaStart, thetaLength ) {

    THREE.Geometry.call( this );

    innerRadius = innerRadius || 25;
    outerRadius = outerRadius || 50;

    thetaStart = thetaStart !== undefined ? thetaStart : 0;
    thetaLength = thetaLength !== undefined ? thetaLength : Math.PI * 2;

    thetaSegments = thetaSegments !== undefined ? Math.max( 3, thetaSegments ) : 8;
    phiSegments = phiSegments !== undefined ? Math.max( 3, phiSegments ) : 8;

    var i, o, uvs = [], radius = innerRadius, radiusStep = ( ( outerRadius - innerRadius ) / phiSegments), e = ( ( 1+ Math.sqrt(5) ) / 2 );
    
    for( i = 0; i <= phiSegments; i++) {//concentric circles inside ring

        for( o = 0; o <= thetaSegments; o++) {//number of segments per ring

            var vertex = new THREE.Vector3();

            vertex.x = radius * Math.cos( thetaStart + o / thetaSegments * thetaLength );
            vertex.y = radius * Math.sin( thetaStart + o / thetaSegments * thetaLength );

            this.vertices.push( vertex );
            uvs.push( new THREE.Vector2( ( vertex.x / radius + 1 ) / 2, - ( vertex.y / radius + 1 ) / 2 + 1 ) );

            radius += radiusStep;
            
        }

//        thetaSegments = thetaSegments * e;
    }

    var n = new THREE.Vector3( 0, 0, -1 );
    
    for( i = 0; i < phiSegments; i++) {//concentric circles inside ring

        for( o = 0; o <= thetaSegments; o++) {//number of segments per ring

            var v1 = o;
            var v2 = o + thetaSegments ;
            var v3 = o + thetaSegments + 1 ;

            this.faces.push( new THREE.Face3( v1, v2, v3, [ n, n, n ] ) );
            this.faceVertexUvs[ 0 ].push( [ uvs[ v1 ], uvs[ v2 ], uvs[ v3 ] ]);
            
            v1 = o;
            v2 = o + 1;
            v3 = o + thetaSegments + 1 ;

            this.faces.push( new THREE.Face3( v1, v2, v3, [ n, n, n ] ) );
            this.faceVertexUvs[ 0 ].push( [ uvs[ v1 ], uvs[ v2 ], uvs[ v3 ] ]);

        }
    }
   
    this.computeCentroids();
    this.computeFaceNormals();

    this.boundingSphere = new THREE.Sphere( new THREE.Vector3(), radius ); 

};

THREE.RingGeometry.prototype = Object.create( THREE.Geometry.prototype );
