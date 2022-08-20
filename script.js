import { getSchemas } from './index.js';
import config from './config.js';

console.dir(await getSchemas(config.config));
