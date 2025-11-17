// simple-loadtest.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 100, // 100 virtual users
  duration: '3m', // 3 minutes
};

const BASE_URL = 'http://localhost:3000';

function get3RandomLetters() {
  const randomLength = Math.floor(Math.random() * 4) + 2;
  const letters = Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ').sort(() => 0.5 - Math.random()).slice(0, randomLength).join('')

  return letters.charAt(0).toUpperCase() + letters.slice(1).toLowerCase();
}

export default function () {
  const userId = Math.floor(Math.random() * 1_000_000) + 1;
  const getUserRes = http.get(`${BASE_URL}/users/${userId}`);

  check(getUserRes, {
    'GET users/:id status 200': (r) => r.status === 200,
  });

  const randomFirstNamePrefix = get3RandomLetters();
  const randomLastNamePrefix = get3RandomLetters();

  const searchRes = http.get(`${BASE_URL}/users/search?firstName=${randomFirstNamePrefix}&lastName=${randomLastNamePrefix}`);

  check(searchRes, {
    'GET /users/search status 200': (r) => r.status === 200,
  });

  sleep(0.2);
}