/**
 * Our serializer renders a button node as a one-cell React Email Row/Column
 * around `<a class="button">` (plus Outlook spacer spans). The Button
 * extension only parses `a[data-id="react-email-button"]`, so pasting our own
 * output or editing it in the code view turned every button into a plain
 * table with a link. Rebuild the button markup the schema understands.
 */
export function restoreComposedButtons(root: HTMLElement): void {
	const cells = root.querySelectorAll<HTMLTableCellElement>(
		'td[data-id="__react-email-column"]',
	);
	for (const cell of Array.from(cells)) {
		const [link, ...rest] = Array.from(cell.children);
		if (rest.length > 0 || !(link instanceof HTMLAnchorElement)) continue;
		if (!isComposedButton(link)) continue;
		const table = cell.closest("table");
		if (!table || table.querySelectorAll("td").length !== 1) continue;

		const button = root.ownerDocument.createElement("a");
		button.setAttribute("data-id", "react-email-button");
		button.setAttribute("href", link.getAttribute("href") ?? "#");
		button.setAttribute("class", link.getAttribute("class") || "button");
		button.setAttribute("alignment", cell.getAttribute("align") || "left");
		const style = link.getAttribute("style");
		if (style) button.setAttribute("style", style);

		// The label lives in the span that has text; the others only hold
		// conditional Outlook comments.
		const label = Array.from(link.querySelectorAll("span")).find(
			(span) => span.textContent?.trim() && !span.querySelector("span"),
		);
		button.innerHTML = label ? label.innerHTML : (link.textContent ?? "");
		table.replaceWith(button);
	}
}

function isComposedButton(link: HTMLAnchorElement): boolean {
	const cls = link.getAttribute("class") ?? "";
	const style = link.getAttribute("style") ?? "";
	return /(?:^|\s)button(?:\s|$)/.test(cls) || /mso-padding-alt/i.test(style);
}
