import express from 'express'
import cors from 'cors'
import "dotenv/config"
import connectDB from './config/db.js';
import connectCloudinary from './config/cloudinary.js';
import userRoutes from './routes/userRoutes.js'
import pharmacyRoutes from './routes/pharmacyRoutes.js'
import labRoutes from './routes/labRoutes.js'
import doctorRoutes from './routes/doctorRoutes.js'
import scanReport from "./routes/scanReport.js";
import indexRoutes from './routes/indexRoutes.js'

const app = express();
const PORT = process.env.PORT || 5000

await connectDB();
await connectCloudinary();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({extended:true}))

app.use(cors());
app.get('/', (req, res)=> {
   res.send("api working");
})

app.use('/api', indexRoutes);
app.use('/api/users', userRoutes);
app.use('/api/pharmacy', pharmacyRoutes);
app.use('/api/lab', labRoutes);
app.use('/api/doctor', doctorRoutes);
app.use("/uploads", express.static("uploads"));

app.use("/api/scanreport", scanReport);

app.listen(PORT, (err) => {
   if(err) return console.log(err.message);
   console.log(`Server is running at PORT: ${PORT}`)
} )