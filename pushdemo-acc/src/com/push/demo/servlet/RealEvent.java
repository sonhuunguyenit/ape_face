package com.push.demo.servlet;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

import com.push.demo.db.Db;
import com.push.demo.util.Cmd;
import com.push.demo.util.Constants;

public class RealEvent extends HttpServlet {

	private static final long serialVersionUID = 1L;
	
	public void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {

		JSONObject ret = new JSONObject();
		String desc = "ok";

			ret.put("desc", desc);
			ret.put("data", Db.realEventList);
			response.setContentType("text/html;charset=utf-8");
			PrintWriter out = response.getWriter();
			out.write(ret.toString());
			out.flush();
			out.close();

	}
}
