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



function generateRandomString() {
  randomString = '';
  let characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  for (let i = 0; i < 6; i++ ) {
    randomString += characters.charAt(Math.floor(Math.random() * 62));
  }
  return randomString;
}



app.get("/urls", (req, res) => {
  const templateVars = { 
    username: req.cookies["username"], ///////problem
    urls: urlDatabase 
  };

  res.render("urls_index", templateVars);
})

app.get("/urls/new", (req, res) => {
  const templateVars = { 
    username: req.cookies["username"],
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    username: req.cookies["username"],
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const templateVars = { 
  username: req.cookies["username"],
};
  res.render('urls_register', templateVars)
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
  console.log(req.body);  // Log the POST request body to the console
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

//login post
app.post('/login', (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
})

//logout post
app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
})





app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req,res) => {
  res.json(urlDatabase);
})

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

