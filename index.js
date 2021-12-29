import mongoose from 'mongoose';
import app from './app.js'
//set dotenv so run env file

mongoose.connect(`mongodb+srv://admin:admin@cluster0.avivc.mongodb.net/product?authSource=admin&replicaSet=atlas-akkcln-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true`, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connect Mongo successfully'))
    .catch(() => console.log(`Can't connect to Mongo`))

app.listen(5000, () => {
    console.log(`listening on port 5000`)
})
app.get('/', (req, res) => {
    res.send('hello')
})