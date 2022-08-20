import { cosmiconfigSync } from 'cosmiconfig';

const explorer = cosmiconfigSync('genschema');
const config = explorer.search();

export default config;
