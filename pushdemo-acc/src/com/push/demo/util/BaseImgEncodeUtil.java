/*
 * Project Name: zksecurity-vid
 * File Name: VidImgEncodeUtil.java
 * Copyright: Copyright(C) 1985-2014 ZKTeco Inc. All rights reserved.
 */
package com.push.demo.util;

import java.awt.Color;
import java.awt.Graphics;
import java.awt.Image;
import java.awt.image.BufferedImage;
import java.awt.image.ConvolveOp;
import java.awt.image.Kernel;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;

import javax.swing.ImageIcon;


import sun.misc.BASE64Encoder;

import com.sun.image.codec.jpeg.JPEGCodec;
import com.sun.image.codec.jpeg.JPEGEncodeParam;
import com.sun.image.codec.jpeg.JPEGImageEncoder;

/**
 * 
 * @author <a href=mailto:tyler.feng@zkteco.com>fengkai</a>
 * @version 0.0.1
 */
@SuppressWarnings("restriction")
public class BaseImgEncodeUtil
{

	/**
	 * Encoding pictures in Base64 format
	 * 
	 * @author <a href=mailto:tyler.feng@zkteco.com>fengkai</a>
	 * @param filePath
	 * @return String
	 */
	public static String encodeBase64(String filePath)
	{
		InputStream in = null;
		String imgBase64Str = null;
		try
		{
			File file = new File(filePath);
			if (file.exists())
			{
				in = new FileInputStream(file);
				byte[] data = new byte[in.available()];//Read image byte array
				in.read(data);
				imgBase64Str = new BASE64Encoder().encode(data);//Returns the byte array string encoded by Base64
			}
		}
		catch (IOException e)
		{
			e.printStackTrace();
		}
		finally
		{
			try
			{
				if (in != null)
				{
					in.close();
				}
			}
			catch (Exception e2)
			{
				e2.printStackTrace();
			}
		}
		return imgBase64Str;
	}

	/**
	 * High-quality equal-scale creation of thumbnails
	 * @author juvenile
	 * @param originalFile
	 * @param resizedFile
	 * @param newWidth
	 * @param quality
	 * @throws IOException
	 */
	public static void createZoomImage(File originalFile, File resizedFile,
								int newWidth, float quality) throws IOException
	{

		if (quality > 1)
		{
			throw new IllegalArgumentException(
					"Quality has to be between 0 and 1");
		}

		ImageIcon ii = new ImageIcon(originalFile.getCanonicalPath());
		Image i = ii.getImage();
		Image resizedImage = null;

		int iWidth = i.getWidth(null);
		int iHeight = i.getHeight(null);

		if (iWidth > iHeight)
		{
			resizedImage = i.getScaledInstance(newWidth, (newWidth * iHeight)
															/ iWidth, Image.SCALE_SMOOTH);
		}
		else
		{
			resizedImage = i.getScaledInstance((newWidth * iWidth) / iHeight,
					newWidth, Image.SCALE_SMOOTH);
		}

		// This code ensures that all the pixels in the image are loaded.  
		Image temp = new ImageIcon(resizedImage).getImage();

		// Create the buffered image.  
		BufferedImage bufferedImage = new BufferedImage(temp.getWidth(null),
				temp.getHeight(null), BufferedImage.TYPE_INT_RGB);

		// Copy image to buffered image.  
		Graphics g = bufferedImage.createGraphics();

		// Clear background and paint the image.  
		g.setColor(Color.white);
		g.fillRect(0, 0, temp.getWidth(null), temp.getHeight(null));
		g.drawImage(temp, 0, 0, null);
		g.dispose();

		// Soften.  
		float softenFactor = 0.05f;
		float[] softenArray = {0, softenFactor, 0, softenFactor,
								1 - (softenFactor * 4), softenFactor, 0, softenFactor, 0};
		Kernel kernel = new Kernel(3, 3, softenArray);
		ConvolveOp cOp = new ConvolveOp(kernel, ConvolveOp.EDGE_NO_OP, null);
		bufferedImage = cOp.filter(bufferedImage, null);

		// Write the jpeg to a file.  
		FileOutputStream out = new FileOutputStream(resizedFile);

		// Encodes image as a JPEG data stream  
		JPEGImageEncoder encoder = JPEGCodec.createJPEGEncoder(out);

		JPEGEncodeParam param = encoder
				.getDefaultJPEGEncodeParam(bufferedImage);

		param.setQuality(quality, true);

		encoder.setJPEGEncodeParam(param);
		encoder.encode(bufferedImage);
		
		g=null;
		out.close();
		out=null;
		bufferedImage.flush();
		bufferedImage = null;
		encoder=null;
	}
}
