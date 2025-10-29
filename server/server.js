import express from 'express'
import "dotenv/config"
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js'

const app = express();
const PORT = process.env.PORT || 5000

await connectDB();

app.use(express.json());
app.use(express.urlencoded({extended:true}))

app.get('/', (req, res)=> {
   res.send("api working");
})

app.use('/api/users', userRoutes);

app.listen(PORT, (err) => {
   if(err) return console.log(err.message);
   console.log(`Server is running at PORT: ${PORT}`)
} )