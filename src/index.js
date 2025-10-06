// App entry point
import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import bodyParser from "body-parser";
import cors from "cors";
import { typeDefs } from "./graphql/schema.js";
import { resolvers } from "./graphql/resolvers.js";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import client from 'prom-client';

dotenv.config();

// Connect DB
await connectDB();

// Express setup
const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);

// Sample REST route
app.get("/", (req, res) => {
  res.json({ message: "MiniMart API running 🚀" });
});

// Default metrics + custom histograms
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [50, 100, 300, 500, 1000, 2000]
});

// Middleware for metrics
app.use((req, res, next) => {
  const end = httpRequestDurationMicroseconds.startTimer();
  res.on('finish', () => {
    end({ method: req.method, route: req.path, status_code: res.statusCode });
  });
  next();
});

// Expose metrics
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

// Apollo setup with Express
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

await server.start();

app.use("/graphql", expressMiddleware(server));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`🚀 GraphQL ready at http://localhost:${PORT}/graphql`);
});
