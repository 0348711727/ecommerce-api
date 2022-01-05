import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import productRouter from "./routes/product.route.js";
import userRouter from "./routes/user.route.js"
import errorMiddleware from "./middleware/error.js"
import cookieParser from "cookie-parser";
dotenv.config();
const corsOptions = {
    origin: 'http://localhost:3000'
}
const app = express();
app.use(cors(corsOptions));
//parse content to json
app.use(express.json())
app.use(cookieParser());

app.use(express.urlencoded({ extended: true }))
//defined route product
app.use('/api/products', productRouter)
app.use('/api/user', userRouter)
//middleware for error
app.use(errorMiddleware)

export default app;