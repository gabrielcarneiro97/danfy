export { version } from '../../package.json';
export const api = process.env.NODE_ENV === 'production' ? 'https://api.danfy.online:8080/danfy' : 'http://localhost:8080/api';
// export const api = 'https://api.danfy.online:8080/danfy';

export const apiv2 = process.env.NODE_ENV === 'production' ? 'https://g6juzgbot2.execute-api.us-east-2.amazonaws.com' : 'http://localhost:8080';
// export const apiv2 = 'https://g6juzgbot2.execute-api.us-east-2.amazonaws.com';
