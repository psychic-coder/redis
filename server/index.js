import express from "express";
import { getProductDetails, getProducts } from "./api/products.js";
import { Redis } from "ioredis";
import { getCachedData, rateLimiter } from "./middleware/redis.js";

//we got the below details from the redis cloud console
// const client = createClient({
//     password: '9PRF9Yga6TZAjXqLBu7SL9b1ouRimS8N',
//     socket: {
//         host: 'redis-15478.c305.ap-south-1-1.ec2.redns.redis-cloud.com',
//         port: 15478
//     }
// });

const app = express();
app.use(express.json());

export const redis = new Redis({
  host: "redis-15478.c305.ap-south-1-1.ec2.redns.redis-cloud.com",
  port: 15478,
  password: "9PRF9Yga6TZAjXqLBu7SL9b1ouRimS8N",
});

redis.on("connect", () => {
  console.log("Redis connected");
});



app.get("/",rateLimiter({
  limit:10,
  timer:60,
  key:"home"
}) ,async (req, res) => {


  res.send(`Hello, World!`);
});

//setting up the redis
app.get("/products",rateLimiter(
  {limit:10,
  timer:60,
  key:"products"}
),getCachedData("products"), async (req, res) => {
  const products = await getProducts();
  await redis.setex("products", 20, JSON.stringify(products.products));

  res.json({
    products,
  });
});






app.get("/product/:id", async (req, res) => {
  const id = req.params.id;
  const key = `product:${id}`;
  let product = await redis.get(key);
  if (product) {
    return res.json({
      product: JSON.parse(product),
    });
  }

  product = await getProductDetails(id);
  await redis.set(key, JSON.stringify(product));

  res.json({
    product,
  });
});

app.get("/order/:id", async (req, res) => {
  const productId = req.params.id;
  const key = `product:${productId}`;

  //any mutation tom database
  //like creating a new order
  //reducing the product stock in database

  await redis.del(key);

  return res.json({
    message: `Order placed successfully, product id:${productId} is ordered `,
  });
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
