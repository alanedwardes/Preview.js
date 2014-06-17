/*
Preview.js - A small JavaScript library allowing previewing of screenshots and other media.
Copyright (C) 2007-2014 ShareX Developers

This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.

Optionally you can also view the license at <http://www.gnu.org/licenses/>.
*/
'use strict';

var PREVIEW = {};

PREVIEW.Image = 0;
PREVIEW.Video = 1;
PREVIEW.Other = 2;

PREVIEW.MouseNone = 0;
PREVIEW.MouseLeft = 1;
PREVIEW.MouseMiddle = 2;
PREVIEW.MouseRight = 3;

PREVIEW.KeyEscape = 27;

PREVIEW.Filter = {
	htmlEncode: function ( html ) {
		var span_node = document.createElement( 'span' );
		
		span_node.appendChild( document.createTextNode( html ) );
		
		return span_node.innerHTML;
	}
};

PREVIEW.Event = {
	listen: function ( element, event, callback ) {
		if ( !( 'addEventListener' in window ) ) {
			element.attachEvent( 'on' + event, callback );
		} else {
			element.addEventListener( event, callback, false );
		}
		return this;
	},
	
	ignore: function ( element, event ) {
		this.listen( element, event, function( e ) {
			e.preventDefault( );
			e.stopPropagation( );
			return false;
		} );
		return this;
	}
};

PREVIEW.Vector3 = function ( x, y, z ) {
	if ( arguments.length === 3 ) {
		this.set( arguments[ 0 ], arguments[ 1 ], arguments[ 2 ] );
	}
	return this;
};

PREVIEW.Vector3.prototype = {
	x: 0.0,	y: 0.0, z: 0.0,
	
	reset: function ( ) {
		this.set( 0.0, 0.0, 0.0 );
		return this;
	},
	
	set: function ( x, y, z ) {
		this.x = x, this.y = y, this.z = z;
		return this;
	}
};

PREVIEW.Media = function ( file ) {
	return this.set( file );
};

PREVIEW.Media.prototype = {
	file: undefined,
	element: undefined,
	
	set: function ( file ) {
		this.file = PREVIEW.Filter.htmlEncode( file );
		return this;
	},
	
	create: function ( ) {
		switch ( this.getMediaType( ) )
		{
			case PREVIEW.Image:
				this.createImageDomElement( ); break;
			case PREVIEW.Video:
				this.createVideoDomElement( ); break;
		};
		
		this.element.draggable = false;
		this.element.unselectable = true;
		PREVIEW.Event.ignore( this.element, 'dragstart' );
		PREVIEW.Event.ignore( this.element, 'selectstart' );
		
		this.element.id = 'preview ' + this.getFileExtension( );
		
		return this.element;
	},
	
	createImageDomElement: function ( ) {
		this.element = document.createElement( 'img' );
		this.element.src = this.file;
	},
	
	createVideoDomElement: function ( ) {
		this.element = document.createElement( 'video' );
		this.element.src = this.file;
		this.element.autoplay = true;
		this.element.loop = true;
		this.element.controls = true;
	},
	
	getFileExtension: function ( ) {
		return this.file.split( '.' ).slice( -1 )[ 0 ].toLowerCase( );
	},
	
	getMediaType: function ( ) {
		switch ( this.getFileExtension( ) ) {
			case 'png': case 'jpeg': case 'jpg': case 'gif': case 'bmp':
				return PREVIEW.Image;
			case 'webm': case 'mp4': case 'ogv':
				return PREVIEW.Video;
			default:
				return PREVIEW.Other;
		};
	}
};

PREVIEW.Stage = function ( stage_element, media_element, camera ) {
	return this.set( stage_element, media_element, camera );
};

PREVIEW.Stage.prototype = {
	stage_element: undefined,
	media_element: undefined,
	
	stage: undefined,
	media: undefined,
	
	camera: undefined,

	set: function ( stage_element, media_element, camera ) {
		this.stage_element = stage_element;
		this.media_element = media_element;
		this.camera = camera;
	},
	
	create: function ( ) {
		this.media = new Sprite3D( this.media_element );
		
		var s = this.stage_element.style;
		
		s[Sprite3D.prototype._browserPrefix+"Perspective"] = "800" + (Sprite3D.prototype._browserPrefix=="Moz"?"px":"");
		s[Sprite3D.prototype._browserPrefix+"PerspectiveOrigin"] = "center";
		s[Sprite3D.prototype._browserPrefix+"TransformOrigin"] = "0 0";
		s[Sprite3D.prototype._browserPrefix+"Transform"] = "translateZ(0px)";
		
		this.stage = new Sprite3D( this.stage_element );
		this.stage.addChild( this.media );
		
		var self = this;
		var mouse_pressed = PREVIEW.MouseNone;
		
		PREVIEW.Event.listen( window, 'keydown', function ( e ) {
			if ( e.keyCode === PREVIEW.KeyEscape ) {
				self.camera.reset( );
			}
			
			console.log( 'keydown' );
		} );
		
		PREVIEW.Event.listen( window, 'mousemove', function ( e ) {
			switch ( mouse_pressed ) {
				case PREVIEW.MouseMiddle:
					self.camera.rotate( ( self.stage_element.offsetHeight / 2 - e.clientY ) * 0.01, ( self.stage_element.offsetWidth / 2 - e.clientX ) * 0.01, 0);
					break;
				case PREVIEW.MouseLeft:
					self.camera.move( e.clientX, e.clientY );
					break;
			}
		} );
		PREVIEW.Event.listen( window, 'mousewheel', function ( e ) { self.camera.zoom(e.wheelDelta); } );
		PREVIEW.Event.listen( window, 'DOMMouseScroll', function ( e ) { self.camera.zoom(-e.detail * 40.0); } );
		
		PREVIEW.Event.listen( window, 'mouseup', function ( e ) { mouse_pressed = PREVIEW.MouseNone; } );
		PREVIEW.Event.listen( window, 'mousedown', function ( e ) { mouse_pressed = e.which; } );
	},
	
	update: function ( ) {
		this.camera.update( );
		
		this.media.setRegistrationPoint( - this.stage_element.offsetWidth / 2 + this.media_element.offsetWidth / 2, - this.stage_element.offsetHeight / 2 + this.media_element.offsetHeight / 2, 0);
		
		this.media.setPosition( this.camera.position.x.toFixed(2), this.camera.position.y.toFixed(2), this.camera.position.z.toFixed(2) );
		this.media.setRotation( this.camera.rotation.x.toFixed(2), this.camera.rotation.y.toFixed(2), this.camera.rotation.z.toFixed(2) );
		
		this.media.update( );
		this.stage.update( );
	}
};

PREVIEW.Camera = function ( ) { };
PREVIEW.Camera.prototype = {
	position: new PREVIEW.Vector3( ),
	rotation: new PREVIEW.Vector3( ),
	
	reset: function ( ) {
		this.position.reset( );
		this.rotation.reset( );
	},
	
	zoom: function ( amount ) {
		this.position.z += amount;
	},
	
	move: function ( x, y ) {
		this.position.x = x, this.position.y = y;
	},
	
	rotate: function ( x, y, z ) {
		return this.rotation.set( x, y, z );
	},

	update: function ( ) { }
};