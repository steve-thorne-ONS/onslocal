function highlightMap(details, validpostCode){	
	
    dojoConfig = {
       locale: "en",
       parseOnLoad: true	    	     
     };		
	        
       var map;

		require([    
		"esri/map", 
		"esri/dijit/HomeButton",		
		"dojo/parser", 
		"esri/geometry/Extent", 
		"esri/layers/FeatureLayer",  
		"esri/symbols/SimpleLineSymbol", 
		"esri/symbols/SimpleFillSymbol", 
		"esri/symbols/TextSymbol", 
		"esri/renderers/SimpleRenderer", 
		"esri/renderers/UniqueValueRenderer",		
		"dojo/_base/Color",
		"dojo/on",
		"dojo/dom",
		"esri/graphic",		
		"esri/lang",
		"dojo/number", 
		"dojo/dom-style", 
        "dijit/TooltipDialog", 
        "dijit/popup",
        "esri/tasks/query",
        "esri/tasks/QueryTask",
		"dojo/domReady!"		
		
		  ], function( 
		    Map, HomeButton, parser, Extent, FeatureLayer, SimpleLineSymbol, SimpleFillSymbol, TextSymbol,SimpleRenderer, UniqueValueRenderer, 
		    Color, on, dom, Graphic, esriLang, number, domStyle, TooltipDialog, dijitPopup, Query, QueryTask
		  ) 
		  { 
		
			var queryTask, query;
			parser.parse(); 
			detailsArray = details.split(":");
		
			var xmin_env      = parseInt(detailsArray[0]);
			var ymin_env      = parseInt(detailsArray[1]);
			var xmax_env      = parseInt(detailsArray[2]);
			var ymax_env      = parseInt(detailsArray[3]);
			var area          = detailsArray[4];
			var areaname      = detailsArray[5];
			var arealayername = detailsArray[6];
			var xCoord        = detailsArray[7];
			var yCoord        = detailsArray[8];
			var levelname     = detailsArray[9];
			var areacode      = detailsArray[10];		
						
			var postcode      = validpostCode;	
			
			var diff = xmax_env-xmin_env;
			newxmin  = xmin_env - diff;	
			var bbox = new esri.geometry.Extent({xmin:newxmin,ymin:ymin_env,xmax:xmax_env,ymax:ymax_env,spatialReference:{wkid:27700}});
			map = new Map("map", { 
			   extent: bbox,
			   slider:true,
			   showAttribution: false,
			   logo:false,
			   smartNavigation: false
			});	
			
			home = new HomeButton({
				map: map
			}, "HomeButton");
			home.startup();			
			
			esriConfig.defaults.io.corsEnabledServers.push("http://services.arcgisonline.com");
			esriConfig.defaults.io.corsEnabledServers.push("https://mapping.statistics.gov.uk");
			esriConfig.defaults.io.corsEnabledServers.push("http://js.arcgis.com");			
			esriConfig.defaults.io.corsEnabledServers.push("http://ajax.googleapis.com");	
			
			var dynamicMSLayer = new esri.layers.ArcGISDynamicMapServiceLayer("http://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer");      
			map.addLayer(dynamicMSLayer);         
			map.setExtent(bbox.expand(1.1)); 		
			
			map.on("load", function(){		         
			    var symbol = new esri.symbol.PictureMarkerSymbol({
			    "angle": 0,
			    "xoffset": 0,
			    "yoffset": 12,
			    "type": "esriPMS",
			    "url": "resources/images/map-marker-128.png",
			    "contentType": "image/png",
			    "width": 24,
			    "height": 24
			 });	        
				 map.graphics.add(new esri.Graphic(new esri.geometry.Point(xCoord, yCoord, new esri.SpatialReference({ wkid: 27700 })),symbol));
		   });				
					
		   
		   var defaultSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
                 new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                 new Color([229,78,22]),1),new Color([0,0,0,0]));  
		   
		   var highlightSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, 
			     new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([229,78,22]), 2), 
			     new Color([229,78,22,0.1]));		
		
		    if (levelname === "OA") {
		    	var dynamicLayer = "https://mapping.statistics.gov.uk/arcgis/rest/services/"+arealayername+"/featureServer/0";
		    	var featureLayer = new FeatureLayer(dynamicLayer, {outFields: [areacode]});
		    	//create renderer 
				var renderer = new UniqueValueRenderer(defaultSymbol, areacode);
		    }
		    else{			    	
		    	var dynamicLayer = "https://mapping.statistics.gov.uk/arcgis/rest/services/"+arealayername+"/featureServer/0";
		    	var featureLayer = new FeatureLayer(dynamicLayer, {outFields: [areaname]});
		    	//create renderer 
				var renderer = new UniqueValueRenderer(defaultSymbol, areaname);
		    }
		    
		    //add symbol for each possible value 
			renderer.addValue(area, 
			   new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
			   new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
			   new Color([229,78,22]),2),new Color([229,78,22, 0.45])));			
		
			featureLayer.setRenderer(renderer); 		
			
			map.addLayer(featureLayer);	
			
			map.infoWindow.resize(245,125);
		    
		    dialog = new TooltipDialog({
		       id: "tooltipDialog",
		       style: "position:  absolute; width: auto; font: normal normal normal 10pt Helvetica;z-index:100;"
		    });
		    dialog.startup();		 
		    
	        //listen for when the onMouseOver event fires on the countiesGraphicsLayer
	        //when fired, create a new graphic with the geometry from the event.graphic and add it to the maps graphics layer		   
		    var t;
		    featureLayer.on("mouse-over", function(evt){
		      map.setMapCursor("pointer");		      
		      
	          if (levelname === "OA") {
	        	   t = "<b>${"+ areacode + "}</b>";
	          }
	          else {
	        	   t = "<b>${"+ areaname + "}</b>";
	          }	 	          
	          
	          var content = esriLang.substitute(evt.graphic.attributes,t);
	          var highlightGraphic = new Graphic(evt.graphic.geometry,highlightSymbol);	         
	          map.graphics.add(highlightGraphic);
	          
	          dialog.setContent(content);

	          domStyle.set(dialog.domNode, "opacity", 0.85);
	         
	          dijitPopup.open({
	            popup: dialog, 
	            x: evt.pageX,
	            y: evt.pageY
	          });
	        });
	    
	        function closeDialog() {
	          map.graphics.clear();
	          map.setMapCursor("default"); 
	          dijitPopup.close(dialog);
	          var symbol = new esri.symbol.PictureMarkerSymbol({
				 "angle": 0,
				 "xoffset": 0,
				 "yoffset": 12,
				 "type": "esriPMS",
				 "url": "resources/images/map-marker-128.png",
				 "contentType": "image/png",
				 "width": 24,
				 "height": 24
			  });	        
			  map.graphics.add(new esri.Graphic(new esri.geometry.Point(xCoord, yCoord, new esri.SpatialReference({ wkid: 27700 })),symbol));			   			
	        } 
	        
	        var myClick = map.on("click", executeQueryTask);
	        var myDblclick = on(map, "dbl-click", executeQueryTask);
	        
	        function executeQueryTask(evt){	 
	        	
        	  queryTask = new QueryTask(dynamicLayer);
        	
        	  query = new Query();	        	
        	  query.returnGeometry = true;
        	  query.outFields = [areacode];
        	  query.geometry = evt.mapPoint;
        	  var tol = map.extent.getWidth()/map.width * 5;
	          var x = evt.mapPoint.x;
	          var y = evt.mapPoint.y;
	          var queryExtent = new esri.geometry.Extent(x-tol,y-tol,x+tol,y+tol,evt.mapPoint.spatialReference);
	        	
	          alert(queryExtent.toSource());
        	  alert("geom" + query.geometry.toSource());
        	 
        	  queryTask.execute(query,showResults);	
        	
        	  function showResults(featureSet){        		
        		var resultFeatures = featureSet.features;
        		for (var i=0, il=resultFeatures.length; i<il; i++){
        			extCode = resultFeatures[i].attributes[areacode];         			
        		}        		 
            	 selectMap(queryExtent,extCode,arealayername,areacode,areaname);
	          }        
	        }
			
	        map.on("load", function(){ 				
			   map.disableMapNavigation();
			   map.disableKeyboardNavigation();
			   map.enablePan();
			   map.disableRubberBandZoom();
			   map.enableScrollWheelZoom();
			   map.graphics.enableMouseEvents();
		       map.graphics.on("mouse-out", closeDialog);
		       map.on("mouse-drag-end", closeDialog);
		   }); 
		});		
	}