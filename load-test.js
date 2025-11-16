// simple-loadtest.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 100, // 100 virtual users
  duration: '3m', // 3 minutes
};

const BASE_URL = 'http://localhost:3000';

const searchFirstNames = ['Jam', 'Ma', 'Jo', 'Patric', 'Robe', 'Jennif', 'Micha', 'Lin', 'Willi', 'Elizabe', 'Jose', 'Jessica'];
const searchLastNames = ['Smi', 'Johns', 'Willia', 'Bro', 'Jon', 'Garc', 'Mill', 'Dav', 'Rodrigu', 'Martin', 'Hernandez'];

export default function () {
  const userId = Math.floor(Math.random() * 100_000) + 1;
  const getUserRes = http.get(`${BASE_URL}/users/${userId}`);

  check(getUserRes, {
    'GET users/:id status 200': (r) => r.status === 200,
  });

  const randomFirstNameIndex = Math.floor(Math.random() * searchFirstNames.length);
  const randomLastNameIndex = Math.floor(Math.random() * searchLastNames.length);

  const searchRes = http.get(`${BASE_URL}/users/search?firstName=${searchFirstNames[randomFirstNameIndex]}&lastName=${searchLastNames[randomLastNameIndex]}`);

  check(searchRes, {
    'GET /users/search status 200': (r) => r.status === 200,
  });

  sleep(0.5);
}