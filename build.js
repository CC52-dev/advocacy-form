const concurrently = require('concurrently');

concurrently([
  { 
    command: 'cd frontend && npm run build',
    name: 'frontend',
    prefixColor: 'blue'
  },
  {
    command: 'cd backend && npm run build',
    name: 'backend',
    prefixColor: 'green'
  }
]);