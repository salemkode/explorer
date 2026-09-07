import { createRouter, createWebHistory } from "vue-router";

export const createAppRouter = () =>
	createRouter({
		history: createWebHistory(import.meta.env.BASE_URL),
		routes: [
			{
				path: "/",
				name: "index",
				component: () => import("~/pages/index.vue"),
			},
			{
				path: "/address/:address",
				component: () => import("~/pages/address/[address].vue"),
			},
			{
				path: "/block/:slug",
				component: () => import("~/pages/block/[slug].vue"),
			},
			{
				path: "/tx/:txid",
				component: () => import("~/pages/tx/[txid].vue"),
			},
			{
				path: "/token/:category",
				component: () => import("~/pages/token/[category].vue"),
			},
			{
				path: "/converter",
				component: () => import("~/pages/converter.vue"),
			},
			{
				path: "/doctor",
				component: () => import("~/pages/doctor.vue"),
			},
			{
				path: "/registers",
				component: () => import("~/pages/registers/index.vue"),
			},
			{
				path: "/settings",
				component: () => import("~/pages/settings/index.vue"),
			},
			{
				path: "/:pathMatch(.*)*",
				name: "not-found",
				component: () => import("~/pages/NotFound.vue"),
			},
		],
	});
