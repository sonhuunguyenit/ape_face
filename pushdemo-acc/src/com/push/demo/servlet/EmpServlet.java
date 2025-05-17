package com.push.demo.servlet;

import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.push.demo.util.Cmd;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

import com.push.demo.db.Db;
import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;

public class EmpServlet extends HttpServlet {

	private static final long serialVersionUID = 1L;


	private static final String UPLOAD_DIRECTORY = "upload";


	private static final int MEMORY_THRESHOLD   = 1024 * 1024 * 3;  // 3MB
	private static final int MAX_FILE_SIZE      = 1024 * 1024 * 40; // 40MB
	private static final int MAX_REQUEST_SIZE   = 1024 * 1024 * 50; // 50MB

	public void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		JSONObject info = new JSONObject();
		JSONArray ja = new JSONArray();
		String ret = "ok";
		try{
			String type = request.getParameter("type");
			type = type == null ? "" : type;
			if(type.equals("0") || "".equals(type))//Add
			{
				DiskFileItemFactory factory = new DiskFileItemFactory();
				factory.setSizeThreshold(MEMORY_THRESHOLD);

				ServletFileUpload upload = new ServletFileUpload(factory);

				upload.setFileSizeMax(MAX_FILE_SIZE);

				upload.setSizeMax(MAX_REQUEST_SIZE);

				upload.setHeaderEncoding("UTF-8");

				String uploadPath = getServletContext().getRealPath("/") + File.separator + UPLOAD_DIRECTORY;

				File uploadDir = new File(uploadPath);
				if (!uploadDir.exists()) {
					uploadDir.mkdir();
				}

				Map<String,String> map=new HashMap<String,String>();

				try {
					@SuppressWarnings("unchecked")
					List<FileItem> formItems = upload.parseRequest(request);
					if (formItems != null && formItems.size() > 0) {
						for (FileItem item : formItems) {
							if (item.isFormField())
							{
								String name = item.getFieldName();
								String value = item.getString();
								map.put(name, value);
								// String value=map.get("key");
							}
							else
							{
								String fileName = new File(item.getName()).getName();
								String filePath = uploadPath + File.separator + fileName;
								File storeFile = new File(filePath);
								System.out.println(filePath);
								map.put("photoPath",File.separator + UPLOAD_DIRECTORY + File.separator + fileName);
								item.write(storeFile);

							}
						}
					}
				} catch (Exception ex) {
					request.setAttribute("Message",
							"Error: " + ex.getMessage());
				}
				System.out.println(map);

				String empPin = map.get("empPin");

				//String empPin = request.getParameter("empPin");
				if(null != empPin && empPin.trim().length()>0)
				{
					String empCard = request.getParameter("empCard");
					String empName = request.getParameter("empName");
					String empPwd = request.getParameter("empPwd");
					String empStartTime = request.getParameter("empStartTime");
					String empEndTime = request.getParameter("empEndTime");
					String empGroup = request.getParameter("empGroup");
					String empSuper = request.getParameter("empSuper");
					String empDisable = request.getParameter("empDisable");
					Map<String,String> emp = new HashMap<String, String>();
					emp.put("empPin", empPin);
					emp.put("empCard", empCard);
					emp.put("empName", empName);
					emp.put("empPwd", empPwd);
					emp.put("empStartTime", empStartTime);
					emp.put("empEndTime", empEndTime);
					emp.put("empGroup", empGroup);
					emp.put("empSuper", empSuper);
					emp.put("empDisable", empDisable);
					//Db.empMap.put(empPin, emp);
					Db.empMap.put(empPin, map);
				}
			}
			else if(type.equals("1"))
			{
				Map<String,Map<String, String>> empMap = Db.empMap;
				Set<String>  sets = empMap.keySet();
				for(String pin : sets)
				{
					Map<String, String> emp = empMap.get(pin);
					Set<String> keySet = emp.keySet();
					JSONObject t = new JSONObject();
					for(String key : keySet )
					{
						t.put(key, emp.get(key)+"");
					}
					t.put("id", pin);
					ja.add(t);
				}
				
			}
			else if(type.equals("2"))
			{
				String pin = request.getParameter("empPin");
				Db.empMap.remove(pin);
				Map<String,Map<String,Object>> devMap = Db.devMap;
				Set<String> set = devMap.keySet();
				for(String sn : set)
				{
					Map<String,Object> dev = devMap.get(sn);
					Cmd.addDevCmd(sn, "DATA DELETE userauthorize Pin=" + pin);
					Cmd.addDevCmd(sn, "DATA DELETE user Pin=" + pin);
					Cmd.addDevCmd(sn, "DATA DELETE biophoto PIN=" + pin);
				}
			}
		}catch (Exception e) {
			e.printStackTrace();
			ret = "error";
		}finally{
			info.put("ret", ret);
			info.put("data", ja);
			response.setContentType("text/html;charset=utf-8");
			PrintWriter out = response.getWriter();
			out.print(info.toString());
			out.flush();
			out.close();
		}
		
		
		
		
	}

}
