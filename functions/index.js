const functions = require('firebase-functions');
const firebase = require('firebase-admin');
const express = require('express');
const app = express();

firebase.initializeApp(functions.config().firebase);

const authenticate = (req, res, next) => {
  const token = req.query.auth;

 firebase.auth().verifyIdToken(token).then(user => {
  req.user = user;
  next();
 }).catch(error => {
   res.status(403).send('Unauthorized');
 });
};


app.use(authenticate);

app.post('/fight/:monsterId', (req, res) => {
  console.log(req.params.monsterId);
  firebase.database().ref('monsters/' + req.params.monsterId).once('value', snapshot => {
    res.send({
      user: req.user,
      monsters: snapshot.val()
    })
  });
});

app.get('/me', (req, res) => {
  res.send(req.user);
});


exports.api = functions.https.onRequest(app);

exports.createProfile = functions.auth.user().onCreate(event => {
  const user = event.data;

  return firebase.database().ref(`profiles/${user.uid}`).set({
    level: 1,
    experience: 0,
    current_hitpoints: 100,
    max_hitpoints: 100,
    current_stamina: 100,
    max_stamina: 100,
    gold: 100,
    nickname: 'Andarilho Misterioso'
  })
});