# Gen Schema

Generate JSON Schema definitions from a PostgreSQL database

## Configuration

`.genschemarc.js`

```
module.exports = {
  baseUrl: 'https://genschema.com',
  schemaVersion: 'http://json-schema.org/draft-07/schema#',
  db: {
    database: 'db',
    user: 'system'
  },
  schemas: [
    {
      name: 'public',
      renames: {},
      ignores: ['ignore', 'these', 'tables']
    }
  ]
};
```

## Usage

```js
import { getSchemas } from '@shotero/gen-schema';

console.dir(await getSchemas());
```
