-- use istatic;


# 用户表
#CREATE TABLE user (
#	id VARCHAR(32) PRIMARY KEY NOT NULL,
#	account VARCHAR(100) NOT NULL, # 账户
#	password VARCHAR(32) NOT NULL, # 密码
#	nickname VARCHAR(100), # 昵称
#	avatar VARCHAR(200), # 头像
#	create_time datetime NOT NULL DEFAULT NOW()
#);

# 项目表
CREATE TABLE project (
	id VARCHAR(32) PRIMARY KEY NOT NULL,
	project_name VARCHAR(100), # 项目名称
	create_time datetime NOT NULL DEFAULT NOW(),
	update_time datetime NOT NULL DEFAULT NOW()
);


# 图标表
CREATE TABLE icons (
	id VARCHAR(32) PRIMARY KEY NOT NULL,
	project_id VARCHAR(32),
	content TEXT, # 图标内容
	icon_name VARCHAR(50) NOT NULL, # 图标名称
	icon_desc VARCHAR(50),	# 图标描述
	namespace VARCHAR(50),	# 命名空间
	create_time datetime NOT NULL DEFAULT NOW(),
	update_time datetime NOT NULL DEFAULT NOW(),

	visible INT NOT NULL DEFAULT 1 # 是否显示 0 1
);

# 图标打包后的链接
CREATE TABLE link (
	id VARCHAR(32) PRIMARY KEY NOT NULL,
	project_id VARCHAR(32),
	css VARCHAR(150),
	js VARCHAR(150),
	create_time datetime NOT NULL DEFAULT NOW(),
	hash VARCHAR(100)
);

# 操作日志
#CREATE TABLE logs (
#	id VARCHAR(32) PRIMARY KEY NOT NULL,
#	classify INT NOT NULL,	# 分类： 0 项目，1 图标
#	type INT NOT NULL, # 操作类型：0 新增 1 删除 2 修改
#	target_id VARCHAR(32), # 操作目标的id
#	update_time datetime NOT NULL DEFAULT NOW() # 操作时间
#);

CREATE TABLE images (
	id VARCHAR(32) PRIMARY KEY NOT NULL,
	image_name VARCHAR(100),
	content LONGTEXT,
	create_time datetime NOT NULL DEFAULT NOW(),
	update_time datetime NOT NULL DEFAULT NOW(),
	visible INT NOT NULL DEFAULT 1
);

