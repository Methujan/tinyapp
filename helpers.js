const getUserByEmail = function(email, database) {
  for( let user in database) {
    if (users[user].email === email) {
      return user;
    }
  }
}

module.exports = { getUserByEmail }