const concurrently = require('concurrently');

concurrently([
  { 
    command: 'cd frontend && npm run dev',
    name: 'frontend',
    prefixColor: 'blue'
  },
  {
    command: 'cd backend && npm run dev',
    name: 'backend',
    prefixColor: 'green'
  }
]);