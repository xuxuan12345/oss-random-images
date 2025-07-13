import OSS from 'ali-oss';

export default async function handler(req, res) {
  // 配置 OSS 客户端
  const client = new OSS({
    region: process.env.OSS_REGION,
    accessKeyId: process.env.OSS_ACCESS_KEY_ID,
    accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
    bucket: 'my-coze-images1'
  });

  // 学科文件夹列表
  const folders = [
    'wuli/', 'yuwen/', 'shuxue/', 
    'yingyu/', 'dili/'
  ];

  try {
    const results = {};
    
    for (const folder of folders) {
      // 列出文件夹内所有文件
      const list = await client.list({
        prefix: folder,
        'max-keys': 1000
      });

      // 过滤出图片文件（排除文件夹本身）
      const images = (list.objects || []).filter(item => 
        item.name !== folder && 
        /\.(jpe?g|png|gif|webp|bmp)$/i.test(item.name)
      );

      // 随机选择一张图片
      if (images.length > 0) {
        const randomIndex = Math.floor(Math.random() * images.length);
        const image = images[randomIndex];
        
        // 生成公开访问 URL
        const folderName = folder.replace('/', '');
        results[folderName] = `https://my-coze-images1.${process.env.OSS_REGION}.aliyuncs.com/${image.name}`;
      } else {
        results[folder.replace('/', '')] = null;
      }
    }

    // 返回结果
    res.status(200).json({
      success: true,
      message: '图片获取成功',
      data: results
    });
    
  } catch (error) {
    // 错误处理
    console.error('OSS访问错误:', error);
    res.status(500).json({
      success: false,
      message: '图片获取失败',
      error: error.message,
      details: {
        region: process.env.OSS_REGION,
        bucket: 'my-coze-images1'
      }
    });
  }
}