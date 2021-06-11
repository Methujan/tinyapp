const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
const cookieSession = require('cookie-session')
const saltRounds = 10;
const bcrypt = require('bcryptjs');

app.set("view engine", "ejs");
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieSession({
  name: 'session',
  keys: ['key1'],
  maxAge: 24 * 60 * 60 * 1000
}))

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

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", saltRounds)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", saltRounds)
  }
}

const { generateRandomString, checkForEmail, findIdFromEmail, urlsForUser} = require('./helpers') 


// GET 
app.get('/', (req, res) => {
  let userID = req.session.user_id;

  if (userID) {
      res.redirect('/urls');
  } else {
      res.redirect('/login');
  }
})

app.get("/urls", (req, res) => {
  let userID = req.session.user_id;
  let user = users[userID];
  let userUrls = urlsForUser(userID, urlDatabase);
  const templateVars = {
    'userID': userID,
    'user': user, 
    'urls': urlDatabase,
    'userUrls': userUrls,
  };
  
  if (userID) {
    res.render("urls_index", templateVars);
  } else {
    res.status(403).send('Error: Login or Register to see your urls.');
  }
})


app.get("/urls/new", (req, res) => {
  let userID = req.session.user_id;
  let user = users[userID];
  const templateVars = {
    'user': user,
  };

  if (userID) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  let userID = req.session.user_id;
  let user = users[userID];
  let userUrls = urlsForUser(userID, urlDatabase);
  const templateVars = {
    'user': user,
    'shortURL': req.params.shortURL,
    'longURL': urlDatabase[req.params.shortURL].longURL
  };
  if (userID === urlDatabase[req.params.shortURL].userID) {
    res.render("urls_show", templateVars);
  } else {
    res.status(403).send('Error: Login or Register to see your own urls.');
  }
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  let userID = req.session.user_id;
  let user = users[userID];
  const templateVars = {
    'user': user, 
  };
 
  res.render('urls_register', templateVars);
})

app.get("/login", (req, res) => {
  let userID = req.session.user_id;
  let user = users[userID];
  let userUrls = urlsForUser(userID, urlDatabase);
  const templateVars = {
    'user': user, 
    'userID': userID, 
    'urls': urlDatabase,
    'userUrls': userUrls,
  };
  if (userID) {
    res.render('urls_index', templateVars);
  } else {
    res.render('urls_login', templateVars);
  }
})



// POST
app.post("/urls", (req, res) => {
  if (req) {
    const newShortURL = generateRandomString();
    let userID = req.session.user_id;

    urlDatabase[newShortURL] = {
      longURL: req.body.longURL,
      userID: userID
    }
    res.redirect('/urls/' + newShortURL);
  }
});

app.post('/urls/:shortURL/delete', (req, res) => { 
  const shortURL = req.params.shortURL;
  let userID = req.session.user_id;

  if (userID === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  }
})

app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  let userID = req.session.user_id;
 
  if (userID === urlDatabase[req.params.shortURL].userID) {
    urlDatabase[shortURL].longURL = req.body.updatedURL;
    res.redirect('/urls');
  }
})

app.post('/login', (req, res) => {
  let emailInput = req.body.email;
  let passwordInput = req.body.password;

  if (checkForEmail(emailInput, users)) {
    const idOfEmail = findIdFromEmail(emailInput, users);
    if (bcrypt.compareSync(passwordInput, users[idOfEmail].password)) {
      req.session.user_id = idOfEmail;
      res.redirect('/urls');
    } else {
      res.status(403).send('Error: Passwords don\'t match.');
    }
  } else {
    res.status(510).send('Error: No email found.');
  }
  
})

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/');
})

app.post('/register', (req, res) => {
  let emailInput = req.body.email;
  let passwordInput = req.body.password;
  let hashedPassword = bcrypt.hashSync(passwordInput, saltRounds);
  const newUserID = generateRandomString();

  if (!emailInput || !hashedPassword) {
    res.status(400).send('Error: Enter email and password.');
  } else if (checkForEmail(emailInput, users)) {
    res.status(409).send('Error: This email already has an account. Log in with the correct password or please use another email.');
  } else {
      users[newUserID] = {
        id: newUserID,
        email: req.body.email,
        password: hashedPassword
    }
    req.session.user_id = newUserID;
    res.redirect('/urls');
  }
})







app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



