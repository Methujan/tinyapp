const getUserByEmail = function(email, database) {
  for( let user in database) {
    if (users[user].email === email) {
      return user;
    }
  }
}

const generateRandomString = function() {
  randomString = '';
  let characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  for (let i = 0; i < 6; i++) {
    randomString += characters.charAt(Math.floor(Math.random() * 62));
  }
  return randomString;
}


const checkForEmail = function(inputEmail, users){
  for(user in users){
    if(users[user].email === inputEmail){
      return true;
    }
  }
  return false;
  }

const findIdFromEmail = function(email, users) {
  for( let user in users) {
    if (users[user].email === email) {
      return users[user].id;
    }
  }
}

const urlsForUser = function(id, urlDatabase) {
  let userUrlDatabase = {};
  for(let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      userUrlDatabase[url] = urlDatabase[url];
    }
  }
  return userUrlDatabase;
}
module.exports = { getUserByEmail, generateRandomString, checkForEmail, findIdFromEmail, urlsForUser }