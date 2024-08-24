import adapter from "@sveltejs/adapter-node";
import { sveltePreprocess } from 'svelte-preprocess';

const config = {
    preprocess: sveltePreprocess({
            postcss: true
        })
    ,
    kit: {
		adapter: adapter()
	}
};

export default config;
