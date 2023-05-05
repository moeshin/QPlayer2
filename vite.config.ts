import { defineConfig } from 'vite';

defineConfig({
    plugins: [],
    build: {
        target: 'es5',
        outDir: 'dist',
        minify: true,
        cssMinify: true,
        lib: {
            entry: 'src/js/QPlayer.ts',
            name: 'QPlayer',
            fileName: 'QPlayer',
            formats: ['es', 'umd'],
        },
        rollupOptions: {
            external: 'jquery'
        },
    }
});