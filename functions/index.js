const functions = require('firebase-functions');
const admin = require('firebase-admin');
const serviceAccount = require('./accountKey.json');
const request = require('request');

const geoLocationUrl = 'https://maps.googleapis.com/maps/api/geocode/json?address={0}&key=AIzaSyD3nEftRSfw5VLt1BR9ypUn6LCRLwLKeYM';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://avalon-connects.firebaseio.com',
});

exports.validateAddress = functions.database.ref('accounts/{userId}/addressToValidate')
  .onWrite(event => new Promise((resolve, reject) => {
    if (event.data.exists()) {
      const userRef = admin.database().ref(`accounts/${event.params.userId}`);
      userRef.child('geoLocationStatus').set({ status: 'pending' });
      const address = event.data.val();
      const url = geoLocationUrl.replace('{0}', `${address.street}, ${address.zip}`);
      request(url, (error, response, body) => {
        if (error) {
          userRef.child('geoLocationStatus').set({ status: 'failed', message: 'unknown' });
          userRef.child('addressToValidate').set(null);
          reject(new Error(error));
          throw new Error(error);
        } else {
          const fullResult = JSON.parse(body);
          console.log('geo location result', fullResult);
          if (fullResult.results.length !== 1) {
            if (fullResult.results.length === 0) {
              userRef.child('geoLocationStatus').set({
                status: 'failed',
                message: 'bad-address',
                result: fullResult,
              });
              userRef.child('addressToValidate').set(null);
              reject();
            } else {
              userRef.child('geoLocationStatus').set({
                status: 'failed',
                message: 'multiple-matches',
              });
              userRef.child('addressToValidate').set(null);
              reject();
            }
          } else {
            userRef.child('geoLocation').set(fullResult.results[0].geometry.location);
            userRef.child('geoLocationStatus').set({ status: 'success' });
            userRef.child('addressToValidate').set(null);
            resolve();
          }
        }
      });
    } else {
      resolve();
    }
  }));
