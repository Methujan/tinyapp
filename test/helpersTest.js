const { assert } = require('chai');

const { getUserByEmail, generateRandomString, checkForEmail, findIdFromEmail } = require('../helpers.js');

const testUsers = {
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
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    assert.equal(user, expectedOutput)
  });

  it('should return a length of 6 for the randomized string', function() {
    const actual = generateRandomString()
    const expectedOutput = 6; 
    assert.equal(actual.length, expectedOutput)
  });
  
  it('should return true if inputted email is in the database', function() {
    const actual = checkForEmail("user@example.com", testUsers)
    const expectedOutput = true;
    assert.equal(actual, expectedOutput)
  });

  it('should return ID given the email', function() {
    const actual = findIdFromEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    assert.equal(actual, expectedOutput)
  });


});
