import path from 'path';
import { PactV3, MatchersV3, SpecificationVersion } from '@pact-foundation/pact';

export const { eachLike, like } = MatchersV3;

export const provider = new PactV3({
  consumer: 'ts-redux-react-realworld-example-app',
  provider: 'realworld-openapi-spec',
  logLevel: 'warn',
  dir: path.resolve(process.cwd(), 'pacts'),
  spec: SpecificationVersion.SPECIFICATION_VERSION_V2,
});
