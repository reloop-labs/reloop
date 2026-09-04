// @vitest-environment jsdom

import { generateJSON } from "@tiptap/html";
import { describe, expect, it } from "vitest";
import { emailStarterKit } from "./email-starter-kit";
import {
	applyEmailColumnWidth,
	findEmailContainerTable,
	innerFullWidthBackground,
	stripEmailCentering,
} from "./strip-email-centering";

describe("stripEmailCentering", () => {
	it("does not turn table align=center into centered heading text", () => {
		const doc = new DOMParser().parseFromString(
			`<div data-type="container">
				<table align="center" role="presentation" style="max-width:640px">
					<tr>
						<td>
							<p style="font-size:56px;letter-spacing:-1.68px;color:#fff">Welcome to Dither</p>
						</td>
					</tr>
				</table>
			</div>`,
			"text/html",
		);

		stripEmailCentering(doc.body);

		const table = doc.querySelector("table");
		expect(table?.getAttribute("align")).toBeNull();
		expect(table?.style.marginLeft).toBe("auto");

		const json = JSON.stringify(
			generateJSON(doc.body.innerHTML, [emailStarterKit()] as never),
		);
		expect(json).not.toMatch(/"alignment"\s*:\s*"center"/);
		expect(json).toMatch(/font-size:\s*56px/i);
		expect(json).toMatch(/letter-spacing:\s*-1\.68px/i);
	});

	it("centers Arcane Start Exploring and does not leave table align=center", () => {
		const html = `
<div data-type="container">
  <table align="center" width="100%" style="background-color:rgb(249,249,237);text-align:center">
    <tr>
      <td style="padding:80px 40px">
        <p style="text-align:center">Join us on the journey</p>
        <table align="center" width="100%" style="margin-top:40px;text-align:center">
          <tr>
            <td>
              <a href="https://example.com/" style="color:rgb(48,6,16);text-decoration-line:none">Start Exploring →</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</div>`;
		const doc = new DOMParser().parseFromString(html, "text/html");
		stripEmailCentering(doc.body);

		expect(doc.querySelectorAll("table[align]")).toHaveLength(0);
		const cta = doc.querySelector("a");
		expect(cta?.closest("p")?.style.textAlign).toBe("center");

		const json = JSON.stringify(
			generateJSON(doc.body.innerHTML, [emailStarterKit()] as never),
		);
		expect(json).toContain("Start Exploring");
		expect(json).toMatch(/text-align:\s*center/i);
	});
});

const HALO_COLUMN = `
<div data-type="container" style="max-width:640px">
  <table width="100%" style="background-color:rgb(246,246,246);text-align:center">
    <tr>
      <td>
        <p style="text-align:center">Pick up where you left off</p>
        <a href="https://example.com/" style="display:inline-block;padding:12px 20px;border:1px solid #eee">Return to cart</a>
        <table align="center" width="100%" style="margin-top:2.5rem">
          <tr>
            <td>
              <a href="https://example.com/" style="display:inline-block;padding:12px 20px">Return to cart</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
  <table align="center" width="100%" style="text-align:center;background-color:rgb(255,255,255)">
    <tr>
      <td>
        <p style="font-size:13px">Halo is the AI ring on your finger.</p>
      </td>
    </tr>
  </table>
</div>
`;

describe("Halo / Studio paste centering and background", () => {
	it("keeps gray on the body section table, not the whole container or footer", () => {
		const cell = new DOMParser()
			.parseFromString(HALO_COLUMN, "text/html")
			.querySelector("div") as HTMLElement;
		expect(innerFullWidthBackground(cell)).toMatch(/rgb\(246,\s*246,\s*246\)/);

		const doc = new DOMParser().parseFromString(HALO_COLUMN, "text/html");
		stripEmailCentering(doc.body);

		const tables = Array.from(doc.querySelectorAll("table"));
		expect(tables[0]?.style.backgroundColor.replace(/\s/g, "")).toContain(
			"246,246,246",
		);
		expect(tables[0]?.style.textAlign).toBe("center");
		expect(tables.at(-1)?.style.backgroundColor.replace(/\s/g, "")).toContain(
			"255,255,255",
		);
		expect(doc.querySelector("div")?.style.backgroundColor).toBe("");
		expect(doc.querySelectorAll("table[align]")).toHaveLength(0);

		const jsonDoc = generateJSON(doc.body.innerHTML, [
			emailStarterKit(),
		] as never);
		const json = JSON.stringify(jsonDoc);
		const container = (
			jsonDoc as {
				content?: Array<{ type?: string; attrs?: { style?: string } }>;
			}
		).content?.find((node) => node.type === "container");
		expect(container?.attrs?.style ?? "").not.toMatch(/246/);
		expect(json).toMatch(/rgb\(246,\s*246,\s*246\)/);
		expect(json).toMatch(/text-align:\s*center/i);
		expect(json).toContain("Return to cart");
		expect(json).toContain("Halo is the AI ring");
	});

	it("wraps the lone footer/CTA link so TipTap does not left-align it", () => {
		const doc = new DOMParser().parseFromString(HALO_COLUMN, "text/html");
		stripEmailCentering(doc.body);
		const links = Array.from(doc.querySelectorAll("a"));
		const second = links[1];
		expect(second?.closest("p")?.style.textAlign).toBe("center");
	});
});

/** React Email Row/Column HTML from Studio order-confirmation (Halo Ring). */
const HALO_ORDER_LINES = `
<div data-type="container" style="max-width:640px">
  <table align="center" width="100%" style="text-align:center">
    <tr>
      <td>
        <table align="center" width="100%" style="max-width:420px">
          <tr>
            <td>
              <p>Your order has been placed</p>
              <p>Order #1234567890 is locked in—we're prepping your Halo rings for shipment and will email the moment they leave our warehouse.</p>
              <p>Tracking lands in your inbox as soon as the carrier scans the package.</p>
              <table align="center" width="100%">
                <tr>
                  <td>
                    <a href="https://example.com/" style="display:inline-block;padding:12px 20px;border:1px solid #eee">Track your order →</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
  <table align="center" width="100%" style="background-color:rgb(246,246,246);border-radius:8px">
    <tbody>
      <tr>
        <td data-id="__react-email-column" style="width:64px">
          <img alt="Halo Ring" width="48" height="48" />
        </td>
        <td data-id="__react-email-column">
          <p>Halo Ring 1</p>
          <p>x1</p>
        </td>
      </tr>
    </tbody>
  </table>
  <table align="center" width="100%">
    <tbody>
      <tr>
        <td data-id="__react-email-column"><p>Subtotal</p></td>
        <td data-id="__react-email-column" style="text-align:right"><p style="text-align:right">$198.00</p></td>
      </tr>
    </tbody>
  </table>
  <table align="center" width="100%">
    <tbody>
      <tr>
        <td data-id="__react-email-column"><p>Tax</p></td>
        <td data-id="__react-email-column" style="text-align:right"><p style="text-align:right">$16.00</p></td>
      </tr>
    </tbody>
  </table>
  <table align="center" width="100%">
    <tbody>
      <tr>
        <td data-id="__react-email-column"><p>Shipping</p></td>
        <td data-id="__react-email-column" style="text-align:right"><p style="text-align:right">$0.00</p></td>
      </tr>
    </tbody>
  </table>
  <table align="center" width="100%">
    <tbody>
      <tr>
        <td data-id="__react-email-column"><p>Total</p></td>
        <td data-id="__react-email-column" style="text-align:right"><p style="text-align:right">$214.00</p></td>
      </tr>
    </tbody>
  </table>
</div>
`;

function nodeContaining(
	node: {
		type?: string;
		attrs?: { style?: string; alignment?: string };
		content?: unknown[];
		text?: string;
	},
	text: string,
	type: string,
):
	| { type?: string; attrs?: { style?: string; alignment?: string } }
	| undefined {
	if (node.type === type && JSON.stringify(node).includes(text)) return node;
	for (const child of node.content ?? []) {
		if (child && typeof child === "object") {
			const found = nodeContaining(
				child as {
					type?: string;
					attrs?: { style?: string; alignment?: string };
					content?: unknown[];
				},
				text,
				type,
			);
			if (found) return found;
		}
	}
	return undefined;
}

describe("structural centering for any pasted email", () => {
	it("centers a nested max-width block and leaves a two-cell row start-aligned", () => {
		const doc = new DOMParser().parseFromString(
			`<div data-type="container" style="max-width:640px">
				<table align="center" width="100%" style="max-width:360px">
					<tr><td><p>Headline</p></td></tr>
				</table>
				<table align="center" width="100%">
					<tr>
						<td><p>Label</p></td>
						<td style="text-align:right"><p style="text-align:right">$10.00</p></td>
					</tr>
				</table>
			</div>`,
			"text/html",
		);
		stripEmailCentering(doc.body);

		const inner = Array.from(doc.querySelectorAll("table")).find((table) =>
			(table.getAttribute("style") || "").includes("360px"),
		);
		const row = Array.from(doc.querySelectorAll("table")).find((table) =>
			table.textContent?.includes("Label"),
		);
		expect(inner?.style.marginLeft).toBe("auto");
		expect(inner?.style.marginRight).toBe("auto");
		expect(row?.style.textAlign).not.toBe("center");
		expect(
			Array.from(doc.querySelectorAll("p")).find(
				(p) => p.textContent === "Label",
			)?.style.textAlign,
		).not.toBe("center");
	});

	it("does not invent text-align on a one-cell td that only has align=center", () => {
		const doc = new DOMParser().parseFromString(
			`<div data-type="container" style="max-width:640px">
				<table width="100%">
					<tr>
						<td align="center">
							<h1 style="font-size:56px;color:#fff">Meet a new way to work</h1>
							<a href="https://example.com/" style="display:inline-block;background:#fff;color:#000">Explore</a>
						</td>
					</tr>
				</table>
			</div>`,
			"text/html",
		);
		stripEmailCentering(doc.body);

		const heading = doc.querySelector("h1");
		const cell = doc.querySelector("td");
		expect(cell?.style.textAlign).not.toBe("center");
		expect(heading?.style.textAlign).not.toBe("center");
		expect(heading?.closest("p")?.style.textAlign).not.toBe("center");

		const json = JSON.stringify(
			generateJSON(doc.body.innerHTML, [emailStarterKit()] as never),
		);
		expect(json).not.toMatch(/"alignment"\s*:\s*"center"/);
		expect(json).toContain("Meet a new way to work");
	});

	it("keeps Column align=center as text-align in a two-cell row", () => {
		const doc = new DOMParser().parseFromString(
			`<table width="100%">
				<tr>
					<td align="center"><p>Centered col</p></td>
					<td><p>Start col</p></td>
				</tr>
			</table>`,
			"text/html",
		);
		stripEmailCentering(doc.body);
		const cells = Array.from(doc.querySelectorAll("td"));
		expect(cells[0]?.style.textAlign).toBe("center");
		expect(cells[1]?.style.textAlign).not.toBe("center");
	});

	it("leaves a lone button in a full-width section start-aligned", () => {
		const doc = new DOMParser().parseFromString(
			`<div data-type="container" style="max-width:640px">
				<table align="center" width="100%">
					<tr><td><p>Meet your next favorite feature</p></td></tr>
				</table>
				<table align="center" width="100%">
					<tr>
						<td>
							<a href="https://example.com/" style="display:inline-block;padding:12px 20px">Try it now</a>
						</td>
					</tr>
				</table>
			</div>`,
			"text/html",
		);
		stripEmailCentering(doc.body);

		const cta = Array.from(doc.querySelectorAll("a")).find(
			(a) => a.textContent === "Try it now",
		);
		expect(cta?.closest("p")?.style.textAlign).not.toBe("center");
		expect(cta?.closest("table")?.style.textAlign).not.toBe("center");
	});
});

describe("Halo order-confirmation product and totals alignment", () => {
	it("keeps Halo Ring 1 left of the image cell and totals labels left / amounts right", () => {
		const doc = new DOMParser().parseFromString(HALO_ORDER_LINES, "text/html");
		stripEmailCentering(doc.body);

		const productTable = Array.from(doc.querySelectorAll("table")).find(
			(table) => table.textContent?.includes("Halo Ring 1"),
		);
		const subtotalTable = Array.from(doc.querySelectorAll("table")).find(
			(table) => table.textContent?.includes("Subtotal"),
		);
		const heroTable = Array.from(doc.querySelectorAll("table")).find((table) =>
			(table.getAttribute("style") || "").includes("420px"),
		);

		expect(heroTable?.style.marginLeft).toBe("auto");
		expect(heroTable?.style.marginRight).toBe("auto");
		expect(heroTable?.getAttribute("align")).toBeNull();
		expect(productTable?.style.textAlign).not.toBe("center");
		expect(subtotalTable?.style.textAlign).not.toBe("center");
		expect(
			Array.from(doc.querySelectorAll("p")).find(
				(p) => p.textContent === "Halo Ring 1",
			)?.style.textAlign,
		).not.toBe("center");
		expect(
			Array.from(doc.querySelectorAll("p")).find(
				(p) => p.textContent === "Subtotal",
			)?.style.textAlign,
		).not.toBe("center");
		expect(
			Array.from(doc.querySelectorAll("p")).find(
				(p) => p.textContent === "$198.00",
			)?.style.textAlign,
		).toBe("right");
		expect(doc.querySelector("a")?.closest("p")?.style.textAlign).toBe(
			"center",
		);

		const jsonDoc = generateJSON(doc.body.innerHTML, [
			emailStarterKit(),
		] as never);
		const productPara = nodeContaining(jsonDoc, "Halo Ring 1", "paragraph");
		const subtotalPara = nodeContaining(jsonDoc, "Subtotal", "paragraph");
		const amountPara = nodeContaining(jsonDoc, "$198.00", "paragraph");
		const productJsonTable = nodeContaining(jsonDoc, "Halo Ring 1", "table");
		const subtotalJsonTable = nodeContaining(jsonDoc, "Subtotal", "table");

		expect(productPara?.attrs?.alignment).not.toBe("center");
		expect(productPara?.attrs?.style ?? "").not.toMatch(
			/text-align:\s*center/i,
		);
		expect(subtotalPara?.attrs?.alignment).not.toBe("center");
		expect(subtotalPara?.attrs?.style ?? "").not.toMatch(
			/text-align:\s*center/i,
		);
		expect(productJsonTable?.attrs?.alignment).not.toBe("center");
		expect(subtotalJsonTable?.attrs?.alignment).not.toBe("center");
		expect(amountPara?.attrs?.style ?? "").toMatch(/text-align:\s*right/i);
		expect(JSON.stringify(jsonDoc)).toMatch(/max-width:\s*420px/i);
		expect(JSON.stringify(jsonDoc)).toMatch(/margin-left:\s*auto/i);
	});
});

describe("findEmailContainerTable", () => {
	it("picks the widest ~640px column and ignores inner 490px heading tables", () => {
		const doc = new DOMParser().parseFromString(
			`<table align="center" style="max-width:640px;background-color:#131313">
				<tr><td>
					<table align="center" style="max-width:640px;background-color:rgb(19,19,19)">
						<tr><td>
							<table align="left" style="max-width:490px">
								<tr><td><p>Welcome to Dither</p></td></tr>
							</table>
							<p>Invite your team</p>
						</td></tr>
					</table>
				</td></tr>
			</table>`,
			"text/html",
		);

		const found = findEmailContainerTable(doc.body);
		expect(found?.getAttribute("style")).toMatch(
			/#131313|rgb\(19,\s*19,\s*19\)/,
		);
		expect(found?.textContent).toContain("Invite your team");
	});

	it("treats max-width in em as CSS pixels so a 37.5em container stays the column", () => {
		const doc = new DOMParser().parseFromString(
			`<table style="max-width:37.5em;background-color:rgb(19,19,19)">
				<tr><td>
					<table style="max-width:560px;background-color:#fff">
						<tr><td><p>Inner card</p></td></tr>
					</table>
				</td></tr>
			</table>`,
			"text/html",
		);
		const found = findEmailContainerTable(doc.body);
		expect(found?.getAttribute("style")).toMatch(/37\.5em/);
		expect(found?.getAttribute("style")).toMatch(/19,\s*19,\s*19/);
	});

	it("does not replace a 640px wrapper with an inner 560px card", () => {
		const doc = new DOMParser().parseFromString(
			`<table style="max-width:640px;background-color:rgb(246,246,246)">
				<tr><td>
					<p>Why your finger is the best place for AI</p>
					<table style="max-width:560px;background-color:#fff;border-radius:8px">
						<tr><td>
							<p>Intelligence that doesn't demand attention.</p>
							<a>Shop Halo</a>
						</td></tr>
					</table>
				</td></tr>
			</table>`,
			"text/html",
		);

		const found = findEmailContainerTable(doc.body);
		expect(found?.getAttribute("style")).toMatch(/640px/);
		expect(found?.textContent).toContain("Why your finger");
		expect(found?.textContent).toContain("Shop Halo");
	});
});

describe("applyEmailColumnWidth", () => {
	it("keeps source max-width in em so width:100% cannot fill the editor", () => {
		const doc = new DOMParser().parseFromString(
			`<table width="100%" style="width:100%;max-width:37.5em">
				<tr><td style="width:100%">Hi Alan</td></tr>
			</table>`,
			"text/html",
		);
		const table = doc.querySelector("table");
		expect(table).toBeTruthy();
		const el = doc.createElement("div");
		el.style.cssText = table?.getAttribute("style") || "";
		applyEmailColumnWidth(el, table as Element);

		expect(el.style.maxWidth).toBe("37.5em");
		expect(el.style.width).toBe("100%");

		const json = JSON.stringify(
			generateJSON(
				`<div data-type="container" class="node-container" style="${el.getAttribute("style")}">Hi Alan</div>`,
				[emailStarterKit()] as never,
			),
		);
		expect(json).toMatch(/max-width:\s*37\.5em/i);
	});

	it("turns a numeric width attribute into max-width px", () => {
		const doc = new DOMParser().parseFromString(
			`<table width="600" style="width:100%"><tr><td>Hi</td></tr></table>`,
			"text/html",
		);
		const table = doc.querySelector("table");
		expect(table).toBeTruthy();
		const el = doc.createElement("div");
		el.style.cssText = table?.getAttribute("style") || "";
		applyEmailColumnWidth(el, table as Element);

		expect(el.style.maxWidth).toBe("600px");
		expect(el.style.width).toBe("100%");
	});

	it("does not keep fluid height from the wrapper table", () => {
		const doc = new DOMParser().parseFromString(
			`<table style="width:100%;max-width:600px;height:100%"><tr><td>Hi</td></tr></table>`,
			"text/html",
		);
		const table = doc.querySelector("table");
		expect(table).toBeTruthy();
		const el = doc.createElement("div");
		el.style.cssText = table?.getAttribute("style") || "";
		applyEmailColumnWidth(el, table as Element);

		expect(el.style.maxWidth).toBe("600px");
		expect(el.style.height).toBe("");
	});
});
