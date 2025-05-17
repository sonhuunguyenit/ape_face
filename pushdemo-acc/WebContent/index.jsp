<%@ page language="java" import="java.util.*" pageEncoding="utf-8"%>
<%
String path = request.getContextPath();
String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+path+"/";
%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
  <head>
    <base href="<%=basePath%>">
    
    <title>ZKTECO AC PUSH DEMO</title>
	<meta http-equiv="pragma" content="no-cache">
	<meta http-equiv="cache-control" content="no-cache">
	<meta http-equiv="expires" content="0">    
	<meta http-equiv="keywords" content="keyword1,keyword2,keyword3">
	<meta http-equiv="description" content="This is my page">
  </head>

<frameset rows="*,1" cols="276,*,1"  framespacing="0" frameborder="no" border="0">

	<frameset rows="60,*" cols="*" framespacing="0" frameborder="no" border="0">
		<frame src="./logo.jsp" name="logoFrame" scrolling="No" noresize="noresize" id="logoFrame" title="logoFrame">
		<frame src="./menu.jsp" name="menuFrame" scrolling="No" noresize="noresize" id="menuFrame" title="menuFrame">
	</frameset>

	<frameset rows="60,*" cols="*" framespacing="0" frameborder="no" border="0">
		<frame src="head.jsp" name="headFrame" scrolling="No" noresize="noresize" id="headFrame" title="headFrame">
		<frame src="device.jsp" name="mainFrame" id="mainFrame" title="mainFrame">
	</frameset>

</frameset>
<noframes></noframes>
</html>
