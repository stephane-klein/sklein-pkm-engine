import adapter from "@sveltejs/adapter-node";
import preprocess from "svelte-preprocess";

const config = {
    preprocess:[
        preprocess({
            postcss: true
        })
    ],
	kit: {
		adapter: adapter()
	}
};

export default config;
