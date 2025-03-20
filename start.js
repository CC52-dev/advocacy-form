const concurrently = require('concurrently');

concurrently([
  { 
    command: 'cd frontend && npm run start',
    name: 'frontend',
    prefixColor: 'blue'
  },
  {
    command: 'cd backend && npm run start',
    name: 'backend',
    prefixColor: 'green'
  }
]);