import axios from 'axios';
import { provider, like } from './apiPactProvider';
import { User } from '../../types/user';
import { getTags, getUser } from '../conduit';

// https://stackoverflow.com/questions/67876713/pact-io-getting-missing-requests-error-and-error-cross-origin-http-localhost
axios.defaults.adapter = require('axios/lib/adapters/http');

const tagsResponse = {
  tags: ['reactjs', 'angularjs'],
};

const tUser: User = {
  email: 'jake@jake.jake',
  token: 'jwt.token.here',
  username: 'jake',
  bio: 'I work at statefarm',
  image: 'https://i.stack.imgur.com/xHWG8.jpg',
};

const userResponse = {
  user: tUser,
};

const authToken = {
  Authorization: 'Token xxxxxx.yyyyyyy.zzzzzz',
};

describe('API Pact tests', () => {
  describe('getting all tags', () => {
    test('tags exist', async () => {
      // set up Pact interactions
      await provider.addInteraction({
        states: [{ description: 'tags exist' }],
        uponReceiving: 'get all tags',
        withRequest: {
          method: 'GET',
          path: '/tags',
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: like(tagsResponse),
        },
      });

      await provider.executeTest(async (mockService) => {
        // settings.baseApiUrl = mockService.url
        axios.defaults.baseURL = mockService.url;
        // const api = new API(mockService.url);

        // make request to Pact mock server
        const tags = await getTags();

        expect(tags).toStrictEqual(tagsResponse);
      });
    });
  });

  describe('getting current user', () => {
    test('user exists', async () => {
      // set up Pact interactions
      await provider.addInteraction({
        states: [{ description: 'user has logged in' }],
        uponReceiving: 'get user',
        withRequest: {
          method: 'GET',
          path: '/user',
          headers: authToken,
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: like(userResponse),
        },
      });

      await provider.executeTest(async (mockService) => {
        // settings.baseApiUrl = mockService.url
        axios.defaults.baseURL = mockService.url;
        axios.defaults.headers.Authorization = authToken.Authorization;

        // const api = new API(mockService.url);

        // make request to Pact mock server
        const user = await getUser();

        expect(user).toStrictEqual(tUser);
      });
    });
  });
});
