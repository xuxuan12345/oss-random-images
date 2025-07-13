// 需要安装的依赖：ali-oss
const OSS = require('ali-oss');

export default async function handler(req, res) {
  // 配置OSS客户端（使用环境变量）
  const client = new OSS({
    region: process.env.OSS_REGION,
    accessKeyId: process.env.OSS_ACCESS_KEY_ID,
    accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
    bucket: 'my-coze-images1'
  });

  // 你的五个文件夹
  const folders = [
    'wuli/', 'yuwen/', 'shuxue/', 
    'yingyu/', 'dili/'
  ];

  try {
    const result = {};
    
    for (const folder of folders) {
      // 获取文件夹内所有文件
      const list = await client.list({
        prefix: folder,
        'max-keys': 100
      });

      // 过滤图片文件
      const images = (list.objects || []).filter(item => 
        item.name !== folder &&  // 排除文件夹本身
        /\.(jpg|jpeg|png|gif|webp)$/i.test(item.name)
      );

      // 随机选择一张图片
      if (images.length > 0) {
        const randomImage = images[Math.floor(Math.random() * images.length)];
        // 生成公开访问URL
        const folderName = folder.replace('/', '');
        result[folderName] = `https://my-coze-images1.${process.env.OSS_REGION}.aliyuncs.com/${randomImage.name}`;
      }
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ 
      error: '获取图片失败', 
      details: error.message 
    });
  }
}