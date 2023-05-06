import { defineConfig } from 'vite';

// noinspection JSUnusedGlobalSymbols
export default defineConfig({
    plugins: [],
    build: {
        target: 'es6',
        outDir: 'dist',
        minify: true,
        cssMinify: true,
        lib: {
            entry: 'src/QPlayer.ts',
            name: 'QPlayer',
            fileName: 'QPlayer',
            formats: ['es', 'umd'],
        },
    }
});