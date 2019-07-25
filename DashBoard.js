const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
const knex = require('knex');
const csv = require('csv-parser')
const fs = require('fs')


const bcrypt = require('bcrypt-nodejs');

app.use(bodyParser.json());
app.use(cors());

const db = knex({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'postgres',
    password : '8553118283',
    database : 'smart-brain'
  }
});

/*app.get('/',(req,res) =>{
	db.select('*').from('login')
	.then(data =>{
		res.json(data);
	})
})*/

app.post('/signin',(req, res)=>{

	const {email, password} = req.body;
	db.select('email','hash').from('login')
	.where('email','=', email)
		.then(data =>{
			const isValid = bcrypt.compareSync(password,data[0].hash);
			if(isValid){
				return db.select('*').from('users')
					.where('email', '=', email)
					.then(user =>{
						res.json(user[0])
					})
					.catch(err => res.status(400).json("Unable to get user"))
				} else {
					 res.status(400).json("Wrong Credentials");
				}
		})
		.catch(err => res.status(400).json(err));
})



app.get('/home',(req, res)=>{
	const results=[];
	results.push(['Month','Sales'])
	fs.createReadStream('champagne.csv')
	  .pipe(csv( {header: false}))
	  .on('data', (data) =>{
	  	results.push([data.Month,Number(data.Sales)]);
	  })
	  .on('end', ()=>{
	  	res.json(results)
	  });

	
})

app.put('/predict',(req,res)=>{
	const {predict} = req.body;
	const spawn = require("child_process").spawn;
	const pythonProcess = spawn('python', ['./sales.py',Number(predict)]);
	pythonProcess.stdout.on('data', (data) => {
   		const results=[];
			results.push(['Month','Sales'])
			fs.createReadStream('export_dataframe.csv')
			  .pipe(csv( {header: false}))
			  .on('data', (data) =>{
			  	results.push([data.Month,Number(data.Sales)]);
			  })
			  .on('end', ()=>{
			  	res.json(results)

    })
 

	});
	

})


app.listen(3000, ()=>{
	console.log("attending port 3000");
})