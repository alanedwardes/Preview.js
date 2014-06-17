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
	},
	
	ignore: function ( element, event ) {
		this.listen( element, event, function( e ) {
			e.preventDefault();
			e.stopPropagation();
			return false;
		} );
	}
};

PREVIEW.Point = function ( x, y ) {
	return this.set( x, y );
};

PREVIEW.Point.prototype = {
	x: 0.0,	y: 0.0,
	
	reset: function () {
		return this.set( 0.0, 0.0 );
	},
	
	set: function ( x, y ) {
		this.x = x, this.y = y;
	}
};

PREVIEW.Media = function ( file ) {
	return this.set( file );
};

PREVIEW.Media.prototype = {
	file: undefined,
	element: undefined,
	
	set: function ( file ) {
		this.file = PREVIEW.Filter.htmlEncode(file);
	},
	
	create: function () {
		switch ( this.getMediaType() )
		{
			case PREVIEW.Image:
				this.createImageDomElement(); break;
			case PREVIEW.Video:
				this.createVideoDomElement(); break;
		};
		
		this.element.draggable = false;
		this.element.unselectable = true;
		PREVIEW.Event.ignore( this.element, 'dragstart' );
		PREVIEW.Event.ignore( this.element, 'selectstart' );
		
		this.element.className = 'preview ' + this.getFileExtension();
		
		return this.element;
	},
	
	createImageDomElement: function () {
		this.element = document.createElement( 'img' );
		this.element.src = this.file;
	},
	
	createVideoDomElement: function () {
		this.element = document.createElement( 'video' );
		this.element.src = this.file;
		this.element.autoplay = true;
		this.element.loop = true;
		this.element.controls = true;
	},
	
	getFileExtension: function () {
		return this.file.split( '.' ).slice( -1 )[ 0 ].toLowerCase()
	},
	
	getMediaType: function () {
		switch ( this.getFileExtension() )
		{
			case 'png': case 'jpeg': case 'jpg': case 'gif': case 'bmp':
				return PREVIEW.Image;
			case 'webm': case 'mp4': case 'ogv':
				return PREVIEW.Video;
			default:
				return PREVIEW.Other;
		};
	}
};

PREVIEW.Stage = function ( stage_element, media_element ) {
	return this.set( stage_element, media_element );
};

PREVIEW.Stage.prototype = {
	stage_element: undefined,
	media_element: undefined,
	
	stage: undefined,
	media: undefined,

	set: function ( stage_element, media_element ) {
		this.stage_element = stage_element;
		this.media_element = media_element;
	},
	
	create: function () {
		this.media = new Sprite3D( this.media_element );
		
		this.stage = new Sprite3D( this.stage_element );
		this.stage.addChild( this.media );
		
		PREVIEW.Event.listen( window, 'keydown', this.keyDown );
		PREVIEW.Event.listen( window, 'mouseup', this.mouseUp );
		PREVIEW.Event.listen( window, 'mousedown', this.mouseDown );
		PREVIEW.Event.listen( window, 'mousemove', this.mouseMoved );
		PREVIEW.Event.listen( window, 'mousewheel', function ( e ) {
			e.wheelData /= 50;
			this.mouseMoved( e );
		} );
		
		PREVIEW.Event.listen( window, 'DOMMouseScroll', this.mouseWheel );
	},
	
	keyDown: function ( e ) {
		console.log('keyDown');
	},
	
	mouseUp: function ( e ) {
		console.log('mouseUp');
	},
	
	mouseDown: function ( e ) {
		console.log('mouseDown');
	},
	
	mouseMoved: function ( e ) {
		console.log('mouseMoved');
	},
	
	mouseWheel: function ( e ) {
		console.log('mouseWheel');
	},
	
	update: function () {
		
	}
};