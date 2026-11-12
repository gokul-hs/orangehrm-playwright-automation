// creates random test data so every run uses a new employee

function randomText(length) {
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  let text = '';
  for (let i = 0; i < length; i++) {
    text += letters[Math.floor(Math.random() * letters.length)];
  }
  return text;
}

function randomNumber(length) {
  let num = '';
  for (let i = 0; i < length; i++) {
    num += Math.floor(Math.random() * 10);
  }
  return num;
}

function createEmployeeData() {
  return {
    firstName: 'Test' + randomText(5),
    lastName: 'User' + randomText(5),
    // employee id field allows max 10 characters
    employeeId: Date.now().toString().slice(-7) + randomNumber(3),
  };
}

function createEssUserData() {
  return {
    username: 'ess' + randomText(5) + randomNumber(3),
    password: 'Test@' + randomNumber(4) + randomText(3),
  };
}

module.exports = { randomText, createEmployeeData, createEssUserData };
