import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
//import actc39 from 'eslint-plugin-async-context-tc39';

export default tseslint.config(
    { ignores: ['dist/'] },
    eslint.configs.recommended,
    tseslint.configs.recommended,
    //actc39.configs['flat/recommended'],
);