const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')

app.set("view engine", "ejs");
app.use(cookieParser());//
app.use(express.json());//
app.use(express.urlencoded({ extended: false }));



const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}



function generateRandomString() {
  randomString = '';
  let characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  for (let i = 0; i < 6; i++) {
    randomString += characters.charAt(Math.floor(Math.random() * 62));
  }
  return randomString;
}

//Callback function to check if email has already been register
const checkForEmail = function(inputEmail, users){
  for(user in users){
    if(users[user].email === inputEmail){
      return true;
    }
  }
  return false;
  }



app.get("/urls", (req, res) => {
  let userID = req.cookies['user_id']
  let user = users[userID];
  const templateVars = {
    'user': user, ///////problem
    'urls': urlDatabase
  };
  console.log('UserObject', user);
  console.log('UserDatabase', users);
  res.render("urls_index", templateVars);
})

app.get("/urls/new", (req, res) => {
  let userID = req.cookies['user_id']
  let user = users[userID];
  const templateVars = {
    'user': user, ///////problem
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let userID = req.cookies['user_id']
  let user = users[userID];
  const templateVars = {
    'user': user,
    'shortURL': req.params.shortURL,
    'longURL': urlDatabase[req.params.shortURL]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  let userID = req.cookies['user_id']
  let user = users[userID];
  const templateVars = {
    'user': user, ///////problem
  };
  //console.log(users[req.body.id])
  res.render('urls_register', templateVars)
})

app.get("/login", (req, res) => {
  let userID = req.cookies['user_id']
  let user = users[userID];
  const templateVars = {
    'user': user, ///////problem
  };
  res.render('urls_login', templateVars)
})



//Returns shortURL for longURL and adds longURL
app.post("/urls", (req, res) => {
  if (req) {
    const newShortURL = generateRandomString();
    urlDatabase[newShortURL] = {
      longURL: req.body.longURL
    }
    res.redirect('/urls/' + newShortURL);
  }
  //console.log(req.body);  // Log the POST request body to the console
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});


//Delete
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
})

//Update
app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.updatedURL;
  res.redirect('/urls');
})

const findIdFromEmail = function(email, users) {
  for( let user in users) {
    if (users[user].email === email) {
      return users[user].id;
    }
  }
}


//login post
app.post('/login', (req, res) => {
  let emailInput = req.body.email;
  let passwordInput = req.body.password;

  //console.log("req.body:",(req.body.password));
  //console.log("emailinput:",(emailInput));
  //console.log(checkForEmail(emailInput, users));
  if(checkForEmail(emailInput, users)) {
    const idOfEmail = findIdFromEmail(emailInput, users)
    if(passwordInput === users[idOfEmail].password) {
      res.cookie('user_id', idOfEmail);
      res.redirect('/urls');
    } else {
      res.status(403).send('Error 403: Passwords don\'t match.')
    }
  } else {
    res.status(403).send('Error 403: No email found.')
  }
  
})

//logout post
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
})





//register
app.post('/register', (req, res) => {
  let emailInput = req.body.email;
  let passwordInput = req.body.password;

  if (!emailInput || !passwordInput) { //If no input
    res.status(400).send('Error 400: Enter email and password.');

  } else if (checkForEmail(emailInput, users)) {
    res.status(400).send('Error 400: This email already has an account. Log in with the correct password or please use another email.');

  } else {
    const newUserID = generateRandomString();
    users[newUserID] = {
      id: newUserID,
      email: req.body.email,
      password: req.body.password
    }
    console.log(users);
    res.cookie('user_id', newUserID)
    res.redirect('/urls')
  }
})





app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
})

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

