const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || "YOUR_secret_key",
  mongoUri: 'mongodb+srv://kasiliwachiye:bOn2jiRwLfofMWuZ@cluster0.zoudst1.mongodb.net/?retryWrites=true&w=majority'
}

export default config