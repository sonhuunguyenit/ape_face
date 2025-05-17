package com.push.demo.util;
import java.util.*;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.io.*;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.util.*;

public class cDemo {
	//System.out.println("Hello world!");
	public static void main(String[] args) {
		
		
		SimpleDateFormat sdf33 = new SimpleDateFormat("dd-M-yyyy hh:mm:ss");
		String dateString = "03-08-2020 15:15:32";
		Date date3 = null;
		try {
			date3 = sdf33.parse(dateString);
		} catch (ParseException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}
		   System.out.println("Given Time in milliseconds : "+date3.getTime());
	
    Calendar cd = Calendar.getInstance();
    cd.setTimeInMillis(date3.getTime());
          SimpleDateFormat gmtFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
          gmtFormat.setTimeZone(TimeZone.getTimeZone("GMT"));
          String str = gmtFormat.format(cd.getTime());

          SimpleDateFormat generalFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
          Date date = null;
		try {
			date = generalFormat.parse(str);
		} catch (ParseException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
          // å�–å¾—æ—¶åŒº
          Calendar cal = Calendar.getInstance();
          SimpleDateFormat sdf = new SimpleDateFormat("Z");
          System.out.println("date.getDate()"+date.getDate());
          
        /*  int time = ((date.getYear() - 2000) * 12 * 31 + date.getMonth() * 31
                  + (date.getDate() - 1)) * (24 * 60 * 60) + date.getHours() * 60
                  * 60 + date.getMinutes() * 60 + date.getSeconds();*/

          
          int time = ((date.getYear() - 100) * 12 * 31 +date.getMonth() * 31
                  + (date.getDate() - 1)) * (24 * 60 * 60) + date.getHours() * 60
                  * 60 + date.getMinutes() * 60 + date.getSeconds();
          System.out.println("time"+time);
	}
}
