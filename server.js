
var express = require("express");
var bodyParser = require("body-parser");
var morgan = require("morgan");
var ejs = require("ejs");
var mongoose = require("mongoose");
var engine = require("ejs-mate");
var fileupload = require("express-fileupload");
var path = require("path")


var app = express();

mongoose.connect("mongodb://root:Asd1234@ds259528.mlab.com:59528/pinterestnodejs",function(err){
	if(err){
		console.log(err);
	}else{
		console.log("The database connection is established");
	}
});

//middleware
app.use(fileupload());
app.use(express.static(__dirname));
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(__dirname + '/public'));
app.engine("ejs",engine);
app.set("view engine","ejs");
var Pin = require("./models/pin")
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended:true
}));
app.use(morgan("dev"));


app.get("/pins/create",function(req,res,next){
	res.render("pins/create");
});

app.post("/pins/create",function(req,res,next){
	
	var pin = new Pin();
	//console.log("The value is" + req.files.sampleFile);

	pin.title = req.body.title;
	pin.desc = req.body.desc;
	pin.username = req.body.username;
	//pin.path = req.body.path;
	pin.isSave = false;

	if(!req.files){
		return json("error");
	}

	let sampleFile = req.files.sampleFile;

	let fileName = Math.random().toString(26).slice(2) + ".jpg";
	let path = "./public/files/" + fileName;
	pin.path = "/files/" + fileName;

	sampleFile.mv(path,function(err){
		if(err){
			return res.status(500).send(err)
		}
	})

	pin.save(function(err){
		if(err) throw err;
		res.redirect("/pins/index");
	})
});

app.get("/pins/index", function(req,res,next){
	Pin.find({},function(err,pins){
		// console.log("The pins are as followed" + pins)
		res.render("pins/index",{pins:pins})
	})
});

app.get("/pins/edit/:id", function(req,res,next){
	Pin.findOne({_id:req.params.id},function(err,foundPin){
		if(!err){
		res.render("pins/edit",{pin:foundPin});
		}
	});
});

app.post("/pins/edit/:id", function(req,res,next){
	Pin.findOne({_id:req.params.id},function(err,foundPin){
		if(!err){
			if(foundPin){
				if(req.body.title) foundPin.title=req.body.title;
				if(req.body.desc) foundPin.desc=req.body.desc;

				foundPin.save(function(err){
					if(err) return next(err)

					res.redirect("/pins/details/" + foundPin._id)
				})
			}
		}
	});
});

app.get("/pins/pins-save/:id", function(req,res,next){
	Pin.findOne({_id:req.params.id},function(err,foundPin){
		if(!err){
			if(foundPin){
				foundPin.isSave = !(foundPin.isSave)

				foundPin.save(function(err){
					if(err) return next(err)
					res.redirect("/pins/details/" + foundPin._id)
				})
			}
		}
	});
});

app.get("/pins/saved-pins",function(req,res,next){
	Pin.find({"isSave": true}, function(err,pins){
		res.render("pins/index", {pins:pins})
	})
})

app.post("/pins/pins-save/:id", function(req,res,next){
	Pin.findOne({_id:req.params.id},function(err,foundPin){
		if(!err){
		res.render("pins/edit",{pin:foundPin});
		}
	});
});

app.get("/pins/delete/:id", function(req,res,next){
	
	Pin.find({_id:req.params.id}).deleteMany().exec(function(err,foundPin){
		res.redirect("/pins/index");
	});
});

app.get("/pins/details/:id", function(req,res,next){
	
	Pin.findOne({_id:req.params.id},function(err,foundPin){
		if(!err){
		res.render("pins/details",{pin:foundPin});
		}
	});
});

app.get("/pins/pins-search", function(req,res,next){
	Pin.find({title:{$regex: req.query['search'],$options:'i'}},function(err,pins){
		res.render("pins/index",{pins:pins});
	})
})

app.get("/",function(req,res,next){
	res.redirect("/pins/index");
});


app.listen(80,function(err){
	console.log("The app is connected to port 9000")
});