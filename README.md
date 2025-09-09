# Chat Room - 聊天室全栈应用

这是一个基于 Next.js + TypeScript + Prisma 构建的实时聊天室应用，支持用户注册、登录、创建房间、发送消息等功能，并包含 root 用户权限管理。

## 技术栈

- **前端**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **后端**: Next.js API Routes
- **数据库**: SQLite (可切换到 PostgreSQL)
- **ORM**: Prisma
- **认证**: JWT + HTTP Cookies
- **数据获取**: SWR (实现实时更新)

## 项目结构

```
chat-room/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API 路由
│   │   │   ├── auth/          # 认证相关 API
│   │   │   ├── room/          # 房间相关 API
│   │   │   └── message/       # 消息相关 API
│   │   ├── chat/              # 聊天室页面
│   │   └── page.tsx           # 登录注册页面
│   ├── components/            # React 组件
│   │   ├── RoomEntry.tsx      # 房间条目组件
│   │   └── MessageItem.tsx    # 消息项组件
│   ├── contexts/              # React Context
│   │   └── AuthContext.tsx    # 认证上下文
│   ├── lib/                   # 工具函数
│   │   ├── auth.ts            # 认证工具
│   │   ├── fetcher.ts         # SWR fetcher 函数
│   │   └── prisma.ts          # Prisma 客户端
│   └── types/                 # TypeScript 类型定义
│       └── index.ts
├── prisma/
│   ├── schema.prisma          # 数据库模型
│   └── migrations/            # 数据库迁移文件
└── package.json
```

## 快速开始

### 本地开发

1. **克隆项目并安装依赖**:

   ```bash
   git clone <repository-url>
   cd chat-room
   npm install
   ```

2. **初始化数据库(不想弄也行, 可以看看之前的数据)**:

   ```bash
   npx prisma migrate dev --name init
   ```

3. **启动开发服务器**:

   ```bash
   npm run dev
   ```

4. 访问 http://localhost:3000

### Docker部署

我没做

## 主要功能说明

### 用户系统

- **首次注册的用户自动成为 root 用户**
- root 用户拥有删除任意房间和消息的权限
- 普通用户只能删除自己创建的房间和发送的消息

### 房间管理

- 用户可以创建新的聊天房间
- 房间创建者和 root 用户可以删除房间
- 右键点击房间可以删除（需要权限）

### 消息功能

- 实时消息发送和接收（每秒自动刷新）
- 消息发送者和 root 用户可以删除消息
- 右键点击消息可以删除（需要权限）

### 实时更新

- 使用 SWR 实现房间列表和消息的实时更新
- 每秒自动刷新数据，无需手动刷新页面

## API 接口

### 认证接口

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户登出
- `GET /api/auth/me` - 获取当前用户信息

### 房间接口

- `GET /api/room/list` - 获取房间列表
- `POST /api/room/add` - 创建房间
- `POST /api/room/delete` - 删除房间
- `GET /api/room/message/list` - 获取房间消息

### 消息接口

- `POST /api/message/add` - 发送消息
- `POST /api/message/delete` - 删除消息（root 用户权限）

## 环境变量

```env
# 数据库连接
DATABASE_URL="file:./dev.db"

# JWT 密钥
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# Next.js 配置
NEXTAUTH_SECRET="your-nextauth-secret-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

## 开发注意事项

没啥

## 部署指南

### 本地构建测试

```bash
npm run build
npm start
```
