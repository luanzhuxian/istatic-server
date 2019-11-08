CREATE DATABASE pl_icon;

use pl_icon;


# 用户表
CREATE TABLE user (
	id VARCHAR(32) PRIMARY KEY NOT NULL,
	account VARCHAR(100) NOT NULL, # 账户
	password VARCHAR(32) NOT NULL, # 密码
	nickname VARCHAR(100), # 昵称
	avatar VARCHAR(200), # 头像
	create_time datetime NOT NULL DEFAULT NOW()
);

# 项目表
CREATE TABLE project (
	id VARCHAR(32) PRIMARY KEY NOT NULL,
	project_name VARCHAR(100), # 项目名称
	name VARCHAR(100), # 真实姓名
	create_time datetime NOT NULL DEFAULT NOW(),
	update_time datetime NOT NULL DEFAULT NOW()
);


# 图标表
CREATE TABLE icons (
	id VARCHAR(32) PRIMARY KEY NOT NULL,
	content TEXT, # 图标内容
	icon_name VARCHAR(50) NOT NULL, # 图标名称
	icon_desc VARCHAR(50) # 图标描述
);

# 图标打包后的链接
CREATE TABLE link (
 id VARCHAR(32) PRIMARY KEY NOT NULL,
 css VARCHAR(150),
 js VARCHAR(150)
)
