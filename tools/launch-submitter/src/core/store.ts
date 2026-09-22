import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { directorySchema, productSchema, type Directory, type Product } from "./types.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

export function toolRoot() {
	return ROOT;
}

export function productsDir() {
	return path.join(ROOT, "products");
}

export function directoriesDir() {
	return path.join(ROOT, "directories");
}

export function dataDir() {
	return path.join(ROOT, "data");
}

export function runsDir() {
	return path.join(ROOT, "data", "runs");
}

export function browserProfileDir() {
	return path.join(ROOT, "data", "browser-profile");
}

export async function listProducts(): Promise<Product[]> {
	const files = (await readdir(productsDir())).filter((f) => f.endsWith(".json"));
	const products: Product[] = [];
	for (const file of files) {
		const raw = JSON.parse(await readFile(path.join(productsDir(), file), "utf8"));
		products.push(productSchema.parse(raw));
	}
	return products.sort((a, b) => a.id.localeCompare(b.id));
}

export async function getProduct(productId: string): Promise<Product> {
	const file = path.join(productsDir(), `${productId}.json`);
	const raw = JSON.parse(await readFile(file, "utf8"));
	return productSchema.parse(raw);
}

export async function listDirectories(): Promise<Directory[]> {
	const files = (await readdir(directoriesDir())).filter(
		(f) => f.endsWith(".json") && !f.startsWith("_"),
	);
	const dirs: Directory[] = [];
	for (const file of files) {
		const raw = JSON.parse(await readFile(path.join(directoriesDir(), file), "utf8"));
		dirs.push(directorySchema.parse(raw));
	}
	return dirs.sort((a, b) => (b.domainRating ?? 0) - (a.domainRating ?? 0));
}

export async function getDirectory(directoryId: string): Promise<Directory> {
	const file = path.join(directoriesDir(), `${directoryId}.json`);
	const raw = JSON.parse(await readFile(file, "utf8"));
	return directorySchema.parse(raw);
}

export function resolveProductLogo(product: Product): string | undefined {
	if (!product.logoPath) return undefined;
	if (path.isAbsolute(product.logoPath)) return product.logoPath;
	return path.join(ROOT, product.logoPath.replace(/^\.\//, ""));
}
