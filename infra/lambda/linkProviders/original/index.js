const AWS = require('aws-sdk')
const cognito = new AWS.CognitoIdentityServiceProvider()
const backendClientIds = {
    'eu-central-1_MeIKYtqcU': '7iebegmsmfjo336uckdfu4pmcq', // development
    'eu-central-1_WK7ijcvLY': '1n34slc62ov0odjcqg446fg7i3', // production
    'eu-central-1_phnHtgeoA': '7sgdcblh275ccb7gpeq1e80krl' // staging 
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

exports.handler = (event, context, callback) => {
  console.log('exports.handler - event: ');
  console.log(event);
  
  if(!event.triggerSource.includes('ExternalProvider')) return callback(null, event);;
  if(!event.request.userAttributes.hasOwnProperty("email")) return callback(null, event);;
  
  getUsersAndLink(event.userPoolId, event.request.userAttributes.email, event);
  
  callback(null, event);
};
 

function getUsersAndLink(userPoolId, email, event) {
  const params = {
    UserPoolId: userPoolId,
    AttributesToGet: ['sub','email','cognito:user_status'],
    Filter: "email = \"" + email + "\""
  }

  cognito.listUsers(params, (err, data) => {
    if (err) {
      console.log('getUsersAndLink - err - cognito.listUsers:');
      console.log(err, err.stack);
      return;
    }

    console.log('getUsersAndLink - cognito.listUsers:');
    console.log(data);
    linkUsers(data, event);
  });
}

function linkUsers(usersData, event) {
  if(usersData != null &&
     usersData.Users != null &&
     usersData.Users.length > 0) {

    for (let i = 0; i < usersData.Users.length; i++) {
        const user = usersData.Users[i]
        if(!user) {
            console.log("linkUsers: UserData was NULL or Empty")
            continue;
        };
      
        if(user.UserStatus === 'FORCE_CHANGE_PASSWORD') {
          console.log('linkUser - found pending invitation, change password');
          // If user has never logged in via temporary password, set a random one
          // user is than able to reset its password to login via username & password
          const password =getPassword();
          const params = {
              Password: password,
              UserPoolId: event.userPoolId,
              Username: user.Username,
              Permanent: true
          }
          
          cognito.adminSetUserPassword(params, function (err, data) {
            if (err) {
              console.log('linkUser - err - cognito.adminLinkProviderForUser:');
              console.log(err, err.stack);
              return
            }
        
            console.log('linkUser - cognito.adminLinkProviderForUser:');
            console.log(data);
            linkUser(user.Username, event);
          })
        } else if(user.UserStatus === 'CONFIRMED') {
          linkUser(user.Username, event);
        };
      }
    }
}
 
function linkUser(username, event) {
  // Social Provider username is structured: {Provider_Name}_username.
  const sourceSet = event.userName.split("_");
  const providerName = capitalize(sourceSet[0]);
  const sourceValue = sourceSet[1];

  const destinationValue = username;
  console.log('destinationValue: ' + destinationValue);
  console.log('sourceValue: ' + sourceValue);
  
  // Email Found and CONFIRMED (not EXTERNAL_PROVIDER)
  const params = {
    DestinationUser: { 
      ProviderAttributeValue: destinationValue,
      ProviderName: 'Cognito'
    },
    SourceUser: { 
      ProviderAttributeName: 'Cognito_Subject',
      ProviderAttributeValue: sourceValue,
      ProviderName: providerName,
    },
    UserPoolId: event.userPoolId
  };
  
  cognito.adminLinkProviderForUser(params, function(err, data) {
    if (err) {
      console.log('linkUser - err - cognito.adminLinkProviderForUser:');
      console.log(err, err.stack);
      return
    }

    console.log('linkUser - cognito.adminLinkProviderForUser:');
    console.log(data);
  });
}
 
function getPassword() {
  return 'Aa!'+Math.random().toString(36).slice(-8);
}