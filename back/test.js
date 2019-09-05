app.post("/api/exercise/new-user", function(req, res) {
	let user_name = req.body.username; //Gets the user_name from the body of the page.

	if (!user_name) { //User input is blank.
		res.json('Path `username` is required.');
	}

	findUserByName(user_name, function(err, data) { //Checks if user input is in database already.
		if (err) {
			res.json(err);
		}

		if (data != null) { //If not null then user input is in database already.
			res.json('Username already taken.');
		} else { //Else null then user input is new.
			
			createAndSaveUser(user_name, function(err, data) { //Creates and saves new person to database.
				if (err) {
					res.json(err);
				}
				res.json({ "username": user_name, "_id": data });
			});
		}
	});
});

var findUserByName = function(userName, done) { //Check the database if User exists.
	User.findOne({ username: userName }, (err, data) => {
		if (err) {
			done(err);
		}
		done(null, data);
	})
};

var createAndSaveUser = function(userName, done) { //Adds a new User.
	var randomID = makeid();

	var newUser = new User({ _id: randomID, username: userName });

	newUser.save(function(err, data) {
		if (err) return done(err)
		return done(null, randomID);
	});
}

function makeid() {
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	for (var i = 0; i < 9; i++)
		text += possible.charAt(Math.floor(Math.random() * possible.length));

	return text;
}