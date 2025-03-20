const concurrently = require('concurrently');

concurrently([
  { 
    command: 'cd frontend && npm run build && npm run start',
    name: 'frontend',
    prefixColor: 'blue'
  },
  {
    command: 'cd backend && npm run build && npm run start',
    name: 'backend',
    prefixColor: 'green'
  }
]);