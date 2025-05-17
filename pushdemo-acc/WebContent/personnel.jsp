<%@ page language="java" import="java.util.*" pageEncoding="utf-8"%>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
<head>
<title>My JSP 'index.jsp' starting page</title>
<meta http-equiv="pragma" content="no-cache">
<meta http-equiv="cache-control" content="no-cache">
<script type="text/javascript" src="./js/jquery.js"></script>
<script type="text/javascript" src="./js/jquery.easyui.min.js"></script>
	<script type="text/javascript" src="./js/jquery.form.js"></script>
<link rel="stylesheet" type="text/css" href="./css/base.css">
<link rel="stylesheet" type="text/css" href="./css/themes/default/easyui.css">
</head>
<body style="margin-left: 20px;margin-top: 20px">
	<div class="text">Edit</div>
	<div style="margin: 0;padding: 0">
		<form id="form1" method="post" enctype="multipart/form-data">
			<table width="900"  border="0" cellpadding="0"	cellspacing="0">
				<tbody>
					<tr>
						<td height="58" align="right"><div align="left" class="form_text">UserID</div></td>
						<td><input type="text" id="pin" name="empPin" class="form_input"></td>
						<td><div align="left" class="form_text">Name</div></td>
						<td><input type="text" id="name" name="empName" class="form_input"></td>
					</tr>
					<tr>
						<td height="58"><div align="left" class="form_text">Card Number</div></td>
						<td><input type="text" id="card" name="empCardNo" class="form_input"></td>
						<td><div align="left" class="form_text">Password</div></td>
						<td><input type="text" id="pwd" name="empPwd" class="form_input"></td>
					</tr>
					<tr >
						<td height="58"><div align="left" class="form_text">Start Time</div></td>
						<td><input type="text" id="startTime" name="startTime" class="easyui-datetimebox" style="width:300px; height:34px;	border:1px solid #c3c2c2;"></td>
						<td><div align="left" class="form_text">End Time</div></td>
						<td><input type="text" id="endTime" name="endTime" class="easyui-datetimebox" style="width:300px; height:34px; border:1px solid #c3c2c2;"></td>
					</tr>

					<tr >
						<td height="58"><div align="left" class="form_text">Photo</div></td>
						<td><input class="easyui-filebox" id="photo" name="photo" data-options="prompt:'Choose a file...'" style="width:100%"></td>
					</tr>

					<tr >


						<td colspan="2">
							<div align="left" class="form_text" style="width: 150px;float: left;margin-right: 40px" ><input name="issuper" type="checkbox" id="issuper">Superuser</div>
						</td>
					</tr>
					<tr >
						<td colspan="4" height="58px">
							<div name="Submit2"  onclick="saveEmp()" class="button" style="padding-left: 40px;width: 80px;padding-top: 5px;height: 29px;">Save</div>
							<%--<input type="submit" name="Submit2" value="Save" onclick="saveEmp()" class="button">--%>
						</td>
					</tr>
				</tbody>
			</table>
		</form>
	</div>

	<br><br><br>

	<div class="text">Person List</div><br>
	<table  cellpadding="0" cellspacing="0" class="list_table" id="table">
		<tr align="center" style="border-bottom:  thick dotted #ff0000;" bgcolor="grey" height="30px">
			<th class="table_head" width="80px">Name</th>
			<th class="table_head" width="80px">Pin</th>
			<th class="table_head" width="120px">Card Number</th>
			<th class="table_head" width="80px">Password</th>
			<th class="table_head" width="150px">Start Time</th>
			<th class="table_head" width="150px">End Time</th>
			<th class="table_head" width="100px">Superuser</th>
			<th class="table_head" width="80px">PhotoPath</th>
			<th class="table_head" width="80px">operation</th>
		</tr>
	</table>
</body>
<script type="text/javascript">
	$(document).ready(function(){
		getEmp();
		//queryDevice();
		//queryCmd();
		//setInterval(queryCmd,2000);
	});
	
	
	function queryDevice(){
		$.post("deviceServlet",{},function(data){
			if(data.length > 0){
				var table = $("#table");
				var dataTrEle = $("#table tr:gt(1)");
				dataTrEle.remove();
				 		 
				var len = data.length;
				for(var i = 0; i < len; i++){
					table.append("<tr height=\"30px\" align=\"center\"  onmouseover=\"this.style.background=&#39;#e8eaeb&#39;;\" onmouseout=\"this.style.background=&#39;#FFFFFF&#39;\">" +
					"<td>" + data[i].sn + "</td>" +
					"<td>" + data[i].DeviceName + "</td>" +
					"<td>" + data[i].LockCount + "</td>" +
					"<td>" + data[i].registrycode + "</td>" +
					"<td>" + data[i].FirmVer + "</td>" +
					"<td>" + "<a href=\"javascript:executeCmd('openDoor','"+data[i].sn+"')\">OpenDoor</a>" + "</td>" +
					"</tr>");
				}	
			}
		},"json");
	}
	
	function saveEmp(){
		var pin = $("#pin").val();
		if(pin==""){
			$.messager.alert('Alert','pin is null','error');
			return;
		}
		var xname = $("#name").val();
		var card = $("#card").val();
		var pwd = $("#pwd").val();
		var startTime = $("#startTime").datebox("getValue");
		var endTime = $("#endTime").datebox("getValue");
		var group = $("#group").val();
		var is = $("#issuper:checked").length;
		var isSuper = $("#issuper:checked").length;
		var isDisable = $("#isdisable:checked").length;

		var options = {
			type:'POST',
			url:"empServlet",
			//data:formData,
			dataType:"json",
			processData:false,
			success:function(data){
				if(data!='')
				{
					if(data.ret== 'ok')
					{
						getEmp();
						$.messager.alert('Alert','Success');
						return;
					}
					else
					{
						$.messager.alert('Alert','failed','error');

					}
				}
			}
		};

		$("#form1").ajaxSubmit(options);
	}
	
	function getEmp()
	{
		$.post("empServlet",{"type":"1"},function(obj){
			if(obj!='')
			{
				if(obj.ret== 'ok')
				{
					var data = obj.data;
					var len = data.length;
					var table = $("#table");
					var dataTrEle = $("#table tr:gt(0)");
					dataTrEle.remove();
					for(var i = 0; i < len; i++)
					{
						table.append("<tr height=\"30px\" align=\"center\"  onmouseover=\"this.style.background=&#39;#e8eaeb&#39;;\" onmouseout=\"this.style.background=&#39;#FFFFFF&#39;\">" +
						"<td>&nbsp;" + data[i].empName + "&nbsp;</td>" +
						"<td>&nbsp;" + data[i].empPin + "&nbsp;</td>" +
						"<td>&nbsp;" + data[i].empCardNo + "&nbsp;</td>" +
						"<td>&nbsp;" + data[i].empPwd + "&nbsp;</td>" +
						"<td>&nbsp;" + data[i].startTime + "&nbsp;</td>" +
						"<td>&nbsp;" + data[i].endTime + "&nbsp;</td>" +
						"<td>&nbsp;" + data[i].issuper + "&nbsp;</td>" +

						"<td>&nbsp;" + data[i].photoPath + "&nbsp;</td>" +
						"<td>&nbsp;" + "<button onclick='delPerson("+data[i].empPin+")'>Delete</button>" + "&nbsp;</td>" +
						"</tr>");
					}
				}
			}
		},"json");
	}

	function delPerson(pin){
		$.post("empServlet",{
			 "type":"2",
			 "empPin":pin,
			},function(data){
				if(data!='')
				{
					if(data.ret== 'ok')
					{
						getEmp();
						return;
					}
					else
					{
						$.messager.alert('Alert','failed','error');
					}
				}
		},"json");
	}

</script>
</html>
