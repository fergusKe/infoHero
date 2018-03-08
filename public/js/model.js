$(function() {
	$(".fakeloader").fadeOut(500, function() {
    });
	uploadComponent();
});

function uploadComponent(){
	var $uploadDiv = $("#upload .footer");
	var $uploadForm = $("<button class=\"btn btn-primary\">上傳CSV</button><input type=\"file\" />");
	
	$uploadDiv.append( $uploadForm );

	$uploadDiv.find("input[type=\"file\"]").on("change", function(e){
		console.log("!!!1");
		var file = this.files[0];
		file = new File([file], file.name);
		
		var fd = new FormData();
		fd.append("csv", file);
		
		$(".fakeloader").fakeLoader({
        	bgColor:"#0296a9",
        	zIndex: '1001',
        	spinner:"spinner3"
    	});

		$.ajax({ 
			"url":"/infoHero_heatmap/controller/export_model.php",
			"data": fd,
			"dataType": "json",
			"type": "POST",
			"contentType": false,
    		"processData": false,
			"success": function(json){
				var status_code = json["status"];
				$(".fakeloader").fadeOut(500, function() {
        		});

				if( status_code != 200 ){
					console.log(json["message"]);
				}else{
					console.log(json["message"]);
					window.location = json["file_path"];
				}
				
			}
		});
    	
	});
	
	$("#upload button").on("click", function(){
		$("#upload input").trigger("click");
	})
}