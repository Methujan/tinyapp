const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
const cookieSession = require('cookie-session')

app.set("view engine", "ejs");
app.use(cookieParser());//
app.use(express.json());//
app.use(express.urlencoded({ extended: false }));


const urlDatabase = {
  b6UTxQ: { 
    longURL: "https://www.tsn.ca", 
    userID: "aJ48lW" 
  },
  i3BoGr: { 
    longURL: "https://www.google.ca", 
    userID: "aJ48lW" 
  }
};

//const urlDatabase = {
//  "b2xVn2": "http://www.lighthouselabs.ca",
//  "9sm5xK": "http://www.google.com"
//};

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

  //Finds the ID from given email
const findIdFromEmail = function(email, users) {
  for( let user in users) {
    if (users[user].email === email) {
      return users[user].id;
    }
  }
}

const urlsForUser = function(id) {
  let userUrlDatabase = {};
  for(let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      userUrlDatabase[url] = urlDatabase[url];
    }
  }
  return userUrlDatabase;
}
//Add get for '/' -> Homepage
app.get('/', (req, res) => {
  let userID = req.cookies['user_id']
  if(userID){
    res.redirect('/urls');
  } else {
    res.redirect('/login')
  }
})

app.get("/urls", (req, res) => {
  let userID = req.cookies['user_id']
  console.log('userID',userID)
  let user = users[userID];
  let userUrls = urlsForUser(userID);
  console.log('urlDatabase',urlDatabase);
  console.log('userUrls',userUrls);
  const templateVars = {
    'user': user, 
    'urls': urlDatabase,
    userUrls,
  };
  //console.log('UserObject', user);
  //console.log('UserDatabase', users);
  if(userID) {
    res.render("urls_index", templateVars);
  } else {
    res.status(400).send('Error 400: Login or Register to see your urls.')
  }
})


//If someone isn't logged in, redirect them to the login page
//res.redirect("/login")
app.get("/urls/new", (req, res) => {
  let userID = req.cookies['user_id']
  let user = users[userID];
  const templateVars = {
    'user': user,
  };

  if(userID) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  let userID = req.cookies['user_id']
  let user = users[userID];
  const templateVars = {
    'user': user,
    'shortURL': req.params.shortURL,
    'longURL': urlDatabase[req.params.shortURL].longURL
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  let userID = req.cookies['user_id']
  let user = users[userID];
  const templateVars = {
    'user': user, 
  };
 
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
    const userID = req.cookies['user_id'];
    urlDatabase[newShortURL] = {
      longURL: req.body.longURL,
      userID: userID
    }
    res.redirect('/urls/' + newShortURL);
  }
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

//Delete
app.post('/urls/:shortURL/delete', (req, res) => { // require and use method override, change delete in EJS Template 
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
})

//Update
app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL].longURL = req.body.updatedURL;
  res.redirect('/urls');
})

//login post
app.post('/login', (req, res) => {
  let emailInput = req.body.email;
  let passwordInput = req.body.password;
  if (checkForEmail(emailInput, users)) {
    const idOfEmail = findIdFromEmail(emailInput, users)
    if (passwordInput === users[idOfEmail].password) {
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




/*
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

  //Finds the ID from given email
const findIdFromEmail = function(email, users) {
  for( let user in users) {
    if (users[user].email === email) {
      return users[user].id;
    }
  }
}



app.get("/urls", (req, res) => {
  let userID = req.cookies['user_id']
  let user = users[userID];
  const templateVars = {
    'user': user, 
    'urls': urlDatabase
  };
  console.log('UserObject', user);
  console.log('UserDatabase', users);
  res.render("urls_index", templateVars);
})


//If someone isn't logged in, redirect them to the login page
//res.redirect("/login")
app.get("/urls/new", (req, res) => {
  let userID = req.cookies['user_id']
  let user = users[userID];
  const templateVars = {
    'user': user,
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
    'user': user, 
  };
 
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
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});


//Delete
app.post('/urls/:shortURL/delete', (req, res) => { // require and use method override, change delete in EJS Template 
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




//login post
app.post('/login', (req, res) => {
  let emailInput = req.body.email;
  let passwordInput = req.body.password;
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
*/
