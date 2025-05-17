package com.push.demo.util;

import com.push.demo.servlet.EmpServlet;
import sun.misc.BASE64Decoder;

import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;
import java.io.*;

public class AdmsPushUtil {

    /**
     * 读取数据流中的数据
     *
     * @param request
     * 请求对象
     * @return String 数据
     * @throws IOException
     */
    public String getStreamData(HttpServletRequest request) throws IOException
    {
        StringBuilder bufferData = new StringBuilder();
        BufferedReader br = null;
        try
        {
            //String admsUnicode = PropertiesUtil.getValue("adms.pushUnicode");
            String admsUnicode = "UTF-8";
            request.setCharacterEncoding(admsUnicode);
            br = new BufferedReader(new InputStreamReader(request.getInputStream(), admsUnicode));
            String inline = "";
            while ((inline = br.readLine()) != null)
            {
                bufferData.append(inline + "\r\n");
            }
        }
        finally
        {
            if (br != null)
            {
                br.close();
            }
        }
        return bufferData.toString().trim();
    }


    /**
     * 保存设备上传比对照片
     *
     * @author <a href=jeiffu.lee@zkteco.com>jeiffu.lee</a>
     * @since 2018年9月26日 下午5:14:24
     * @param pin
     * @param photoName
     * @param imgStr
     * @return
     */
    public static String generateBioPhoto(String pin, String photoName,String imgStr,ServletContext servletContext)
    {
        //对字节数组字符串进行Base64解码并生成图片
        if (imgStr == null || imgStr.equals("")) //图像数据为空
        {
            return "";
        }
        try
        {
            BASE64Decoder decoder = new BASE64Decoder();

            //比对照片保存的路径
            String realPath = servletContext.getRealPath(File.separator + "upload");
            //String personPhotoPath = "pers/photo/cropFace/" + pin + "/" + photoName;
            String personPhotoPath = "\\upload" + "\\" + photoName;
            //Base64解码
            byte[] b = decoder.decodeBuffer(imgStr);
            for (int i = 0; i < b.length; ++i)
            {
                if (b[i] < 0)
                {//调整异常数据
                    b[i] += 256;
                }
            }

            //生成jpeg图片
            File photoDir = new File(realPath);
            if (!photoDir.exists())
            {
                photoDir.mkdirs();
            }
            String imgFilePath = realPath + "\\" + photoName;//新生成的图片
            OutputStream out = new FileOutputStream(imgFilePath);
            out.write(b);
            out.flush();
            out.close();
            return personPhotoPath;
        }
        catch (Exception e)
        {
            return "";
        }
    }

}
