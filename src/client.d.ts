export interface Config {
	auth_required: boolean | undefined;
	auth_message: string;
	components: any[];
	css: string | null;
	dependencies: any[];
	dev_mode: boolean;
	enable_queue: boolean;
	layout: any;
	mode: "blocks" | "interface";
	root: string;
	theme: string;
	title: string;
	version: string;
	is_space: boolean;
	is_colab: boolean;
	show_api: boolean;
	stylesheets: string[];
	path: string;
}