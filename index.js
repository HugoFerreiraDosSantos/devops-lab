const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

var db = mysql.createConnection(  //Connection string for the database
{
host: "localhost",
user: "root",
password: "",
database: "zoo",
port: "3306"
});

//Function to send a query to the database 
function sendToDb(query, res) {
    db.query(query, function(err, result, fields) {
        if (err) throw err;
        res.send(JSON.stringify(result));
    });
}

//Function to filter the query
function filter(req,query,condition){
	//Add the WHERE conditions to the query string 
    for (var index in condition){ 
        if (condition[index] in req.query){
            if (query.indexOf("WHERE") < 0) query += " WHERE";
            else query += " AND";
            query += " " + condition[index] + " = " + req.query[condition[index]];
        }
    }
	//Sort the results of the query
    if ("sort" in req.query){
        var sort = req.query["sort"].split(",");
        query += " ORDER BY";
        for (var index in sort) {
            query += " " + sort[index].substr(1);
            if (sort[index].substr(0, 1) == "-") query += " DESC,";
            else query += " ASC,";
        }
        query = query.slice(0, -1);
    }
	//Display only the asked fields
    if ("fields" in req.query) query = query.replace("*", req.query["fields"]); //Filter using the fields
    //Limit the number of answers in the result
	if ("limit" in req.query) {
		
        query += " LIMIT " + req.query["limit"];
        if ("offset" in req.query) query += " OFFSET " + req.query["offset"];
    }
    return query;
}

//Middleware used as a firewall using an apikey
app.use(function(req, res, next){
	//If the user enters a key 
    if ("key" in req.query) {
		//We verify if the key is correct
        let query = "SELECT * FROM users WHERE apikey=?";
        db.query(query,req.query["key"], function(err, result, fields){
            if (err) throw err;
			//If the key is correct
            if (result.length > 0) {
				//Create a table of conditions (columns' name of each database's table)
                req.new_cond = { "animals" :["id","name","breed","food_per_day","birthday","entry_date","id_cage"], "cages" :["id","name","description","area"], "food" :["id","name","id_animal","quantity"], "staff" :["id","firstname","lastname","wage"] };
                //Create a table of foreign keys in each database's table
				req.new_foreign = {"animals" : { "cages" : ["id_cage","id"],"food" : ["id","id_animal"]},"food" : {"animals" :["id_animal","id"]},"cages" : {"animals" : ["id","id_cage"]}};
                //This variable will contains the constructed query
                req.new_query = "";
                next();
            }
			//If the key is incorrect sends a 403 error
            else res.status(403).send("Access denied");
        });
    }
    else res.status(403).send("Access denied"); //If the user doesn't enter a key send a 403 error
});

//Function which creates the query for the PUT, POST and DELETE methods
function create_route(req,res){
	if (req.method =="POST") req.new_query = "INSERT INTO " + req.params.route + " ("+ Object.keys(req.body).join(",") + ") VALUES('"+Object.values(req.body).join("','") + "')";
	if (req.params.length == 2 && req.method =="DELETE") req.new_query = " WHERE id = " + req.params.id;
	if (req.method =="DELETE") req.new_query = "DELETE FROM " + req.params.route + req.new_query;
	//For the app.put we recuperate the req.body variable and we delete the undesirable symbols using replace and the regex
	if (req.method == "PUT")req.new_query = "UPDATE " + req.params.route + " SET " + JSON.stringify(req.body).replace(/:/g,"='").replace(/\{|\}|"/g,"").replace(/,/g,"',") +"' WHERE id = " + req.params.id;
	//Send the query to the database
	sendToDb(req.new_query,res);
}

//Display the number of days left to feed each animals
app.get('/food-stats',function(req,res){
	req.new_query = "SELECT animals.name AS id,IF(animals.food_per_day=0,0,food.quantity/animals.food_per_day) AS days_left FROM animals JOIN food ON animals.id = food.id_animal";
    sendToDb(req.new_query,res);
});

//GET first level
app.get("/:route",base = function (req,res){
	//Create the query
    if(req.new_query.indexOf("JOIN")<0) req.new_select = req.params.route 
	else  req.new_select = req.params.route2;
	req.new_query = "SELECT " + req.new_select + ".* FROM " + req.params.route + req.new_query;
    //Filter the query
	req.new_query = filter(req,req.new_query,req.new_cond[req.params.route].concat(req.new_cond[req.params.route2]));
    //Sends it to the database
	sendToDb(req.new_query,res);
});

//GET second level
app.get("/:route/:id",base_id = function (req,res){
	//Create the WHERE condition with the id
    req.new_query = " WHERE id = " + req.params.id + req.new_query;
	//Call the first level
    base(req,res);
});

//GET third level
app.get("/:route/:id/:route2",base_id_route = function (req,res){
	//Create the JOIN and the WHERE condition with the id
    req.new_query = " INNER JOIN " + req.params.route2 + " ON " + req.params.route + "." + req.new_foreign[req.params.route][req.params.route2][0] + " = " + req.params.route2 + "." + req.new_foreign[req.params.route][req.params.route2][1]+" WHERE " + req.params.route + ".id = " + req.params.id + req.new_query;
    //Call the first level
	base(req,res);
});

//GET fourth level
app.get("/:route/:id/:route2/:id2",function (req,res){
	//Add to the query the second WHERE CONDITION using id2
    req.new_query = " AND " + req.params.route2 + "." + req.new_foreign[req.params.route][req.params.route2][1] + " = " + req.params.id2;
    base_id_route(req,res);
});

//DELETE : the action of this route is done in create_route
app.delete('/:route', create_route);

//DELETE ... WHERE ... : the action of this route is done in create_route
app.delete('/:route/:id', create_route);

//POST : the action of this route is done in create_route
app.post('/:route', create_route);

//PUT : the action of this route is done in create_route
app.put('/:route/:id', create_route);

//Listen the port 3000
app.listen(3000, function() {
    console.log('App listening on port 3000!');
});