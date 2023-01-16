export function getAccessToken(userId: string | number, expires_in: number): string {
  let accessToken: string;
 var milliseconds = Math.floor((expires_in % 1000) / 100),
   seconds = Math.floor((expires_in / 1000) % 60),
   minutes = Math.floor((expires_in / (1000 * 60)) % 60),
   hours = Math.floor((expires_in / (1000 * 60 * 60)) % 24);


  var now = Date.now();
   var expireTime = new Date(expires_in);
 
  console.log(expireTime, 'line 6');
  console.log(hours + ':' + minutes + ':' + seconds + ':' + milliseconds);
  return accessToken;
}
