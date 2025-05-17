<%@ page language="java" import="java.util.*" pageEncoding="utf-8"%>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
<head>
<title>My JSP 'index.jsp' starting page</title>
<meta http-equiv="pragma" content="no-cache">
<meta http-equiv="cache-control" content="no-cache">
<link rel="stylesheet" type="text/css" href="./css/base.css">
<script type="text/javascript" src="./js/jquery.js"></script>
</head>
<body>
	<div class="text">Real-Time Monitoring</div><br>
    <table  border="1px"  cellpadding="0" cellspacing="0"  id="event_table" width="1000px" class="list_table">
    	<tr  align="center" style="border-bottom:  thick dotted #ff0000;" bgcolor="grey" height="30px">
    		<th width="150px">Device</th>
    		<th width="50px">Index(Record)</th>
    		<th width="100px">Pin</th>
    		<th width="150px">Card Number</th>
    		<th width="80px">In/Out</th>
    		<th width="200px">Time</th>
    		<th width="100px">Event Point</th>
    		<th width="150px">Event Type</th>
    		<th width="150px">Verification Type</th>
    		<th id="maskDetectionStatus" width="150px"></th>
    		<th id="tempDetectionStatus" width="150px"></th>
    	</tr>
    </table>
    <br/><br/>
</body>
<script type="text/javascript">
var i = 0;
var index = 0;
	 $(document).ready(function(){
		queryCmd();
		 i = 0;
		setInterval(queryCmd,1000);
	});
  	function queryCmd(){
  		$.post("realEvent",{},function(obj){
  			if(obj!='' && obj.desc == 'ok' && obj.data.length>0){
  				
  				var data = obj.data;

  				if(i == data.length && index != data[i-1].index){
  					i--;
  				}
  				
  				for( ; i < data.length; i++){
  					
  				var event = data[i];
  				
  				if(event.maskflag != undefined) {
					$('#maskDetectionStatus').html('Mask Flag');
					var maskDetector = "<td>" + event.maskflag + "</td>";
				} else {
					$("#maskDetectionStatus").css("display", "none");
				}
				
				if(event.temperature != undefined) {
					$('#tempDetectionStatus').html('Temperature Flag');
					var tempDetector = "<td>" + event.temperature + "</td>";
				} else {
					$("#tempDetectionStatus").css("display", "none");
				}
  				
  				
  				var table = $("#event_table");
  				var j=i+1;
  				var html="<tr align=\"left\"  height=\"30px\" align=\"left\"  onmouseover=\"this.style.background=&#39;#e8eaeb&#39;;\" onmouseout=\"this.style.background=&#39;#FFFFFF&#39;\">" +
		 			"<td >" + event.sn + "</td>" +
		 			"<td >" + j + "</td>" +
		 			"<td >" + event.pin + "</td>" +
		 			"<td >" + event.cardno + "</td>" +
		 			"<td >" + event.inoutstatus + "</td>" +
		 			"<td >" + event.time + "</td>" +
		 			"<td >" + event.eventaddr + "</td>" +
		 			"<td >" + event.event + "</td>" +
		 			"<td >" + event.verifytype + "</td>" +
		 			 maskDetector + tempDetector+
		 			"</tr>";
		 			
		 			index = event.index;
		 			table.append(html);
		 			
  				}
			} else {
				$("#maskDetectionStatus").css("display", "none");
				$("#tempDetectionStatus").css("display", "none");
			}
  		},"json");
  	}


</script>
</html>
