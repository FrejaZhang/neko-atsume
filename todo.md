接入微信云开发前需要做的配置
在 project.config.json 中将 appid 替换为你的小程序 AppID
在 app.js 中将 cloudEnvId 替换为你创建的云开发环境 ID
在微信开发者工具中部署两个云函数：refreshCats 和 initPlayer
在云数据库创建4个集合：players、inventory、scene_layout、catbook