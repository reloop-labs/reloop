"use client";

import { Icon } from "@reloop/ui/icon";
import { useState } from "react";

type CartItem = {
	id: string;
	name: string;
	price: number;
	quantity: number;
};

export default function OrderConfirmationWidget() {
	const [cart, setCart] = useState<CartItem[]>([
		{ id: "1", name: "Reloop Core Hoodie", price: 49.0, quantity: 1 },
		{ id: "2", name: "Developer Sticker Pack", price: 6.0, quantity: 2 },
	]);
	const [checkoutDone, setCheckoutDone] = useState(false);

	const updateQty = (id: string, delta: number) => {
		setCart(
			cart
				.map((item) =>
					item.id === id
						? { ...item, quantity: Math.max(0, item.quantity + delta) }
						: item,
				)
				.filter((item) => item.quantity > 0),
		);
		setCheckoutDone(false);
	};

	const subtotal = cart.reduce(
		(sum, item) => sum + item.price * item.quantity,
		0,
	);
	const shipping = subtotal > 0 ? 5.0 : 0;
	const tax = Number.parseFloat((subtotal * 0.08).toFixed(2));
	const total = Number.parseFloat((subtotal + shipping + tax).toFixed(2));

	return (
		<div className="flex h-full min-h-[420px] flex-col overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 text-left font-sans shadow-lg dark:border-white/10 dark:bg-slate-950 dark:shadow-2xl">
			{/* Header */}
			<div className="flex items-center justify-between border-stroke-soft-200 border-b bg-bg-weak-50 px-4 py-3 dark:border-white/5 dark:bg-slate-900">
				<div className="flex items-center gap-1.5">
					<span className="h-2.5 w-2.5 rounded-full bg-blue-500/80" />
					<span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
					<span className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
					<span className="ml-2 font-mono text-text-sub-600 text-xs dark:text-white/40">
						ecommerce_receipt_pipeline.invoice
					</span>
				</div>
				<span className="rounded border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 font-mono text-[10px] text-blue-600 dark:text-blue-400">
					Checkout SMTP
				</span>
			</div>

			<div className="grid flex-1 grid-cols-1 gap-4 p-4 md:grid-cols-2">
				{/* Left Side: Cart checkout */}
				<div className="flex flex-col justify-between rounded-xl border border-stroke-soft-200 bg-bg-weak-50/60 p-4 dark:border-white/5 dark:bg-slate-900/40">
					<div className="flex flex-col gap-3">
						<h3 className="font-bold text-text-sub-600 text-xs uppercase tracking-wider dark:text-white/40">
							Shopping Cart
						</h3>

						{cart.length === 0 ? (
							<div className="py-6 text-center text-text-soft-400 text-xs italic dark:text-white/30">
								Your cart is empty. Add items to test receipt.
							</div>
						) : (
							<div className="flex flex-col gap-2.5">
								{cart.map((item) => (
									<div
										key={item.id}
										className="flex items-center justify-between rounded border border-stroke-soft-200 bg-bg-weak-50/60 p-2.5 dark:border-white/5 dark:bg-slate-950/60"
									>
										<div>
											<div className="font-semibold text-text-strong-950 text-xs dark:text-white/80">
												{item.name}
											</div>
											<div className="mt-0.5 text-[10px] text-text-sub-600 dark:text-white/40">
												${item.price.toFixed(2)} each
											</div>
										</div>
										<div className="flex items-center gap-2">
											<button
												onClick={() => updateQty(item.id, -1)}
												className="flex h-5 w-5 cursor-pointer items-center justify-center rounded bg-stroke-soft-200 font-bold text-text-strong-950 text-xs hover:bg-stroke-sub-300 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
											>
												-
											</button>
											<span className="w-4 text-center font-mono text-text-strong-950 text-xs dark:text-white/80">
												{item.quantity}
											</span>
											<button
												onClick={() => updateQty(item.id, 1)}
												className="flex h-5 w-5 cursor-pointer items-center justify-center rounded bg-stroke-soft-200 font-bold text-text-strong-950 text-xs hover:bg-stroke-sub-300 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
											>
												+
											</button>
										</div>
									</div>
								))}
							</div>
						)}
					</div>

					<div className="mt-4 space-y-3 border-stroke-soft-200 border-t pt-3 dark:border-white/5">
						<div className="flex justify-between font-mono text-[11px] text-text-sub-600 dark:text-white/50">
							<span>Subtotal:</span>
							<span>${subtotal.toFixed(2)}</span>
						</div>
						<div className="flex justify-between font-mono text-[11px] text-text-sub-600 dark:text-white/50">
							<span>Shipping:</span>
							<span>${shipping.toFixed(2)}</span>
						</div>
						<div className="flex justify-between font-mono text-[11px] text-text-sub-600 dark:text-white/50">
							<span>Tax (8%):</span>
							<span>${tax.toFixed(2)}</span>
						</div>
						<div className="flex justify-between border-stroke-soft-200 border-t pt-2 font-bold text-text-strong-950 text-xs dark:border-white/5 dark:text-white">
							<span>Total:</span>
							<span className="font-mono text-blue-600 dark:text-blue-400">
								${total.toFixed(2)}
							</span>
						</div>

						<button
							onClick={() => setCheckoutDone(true)}
							disabled={subtotal === 0}
							className={`w-full cursor-pointer rounded-lg py-2 font-semibold text-xs transition-all ${
								subtotal === 0
									? "cursor-not-allowed border border-stroke-soft-200 bg-stroke-soft-200 text-text-soft-400 dark:border-white/5 dark:bg-slate-800 dark:text-white/30"
									: "bg-blue-600 text-white shadow-blue-600/20 shadow-lg hover:bg-blue-500 active:scale-95"
							}`}
						>
							🛒 Purchase & Send Receipt
						</button>
					</div>
				</div>

				{/* Right Side: Receipt Email Template Preview */}
				<div className="flex flex-col justify-between rounded-xl border border-stroke-soft-200 bg-bg-weak-50 p-3 dark:border-white/5 dark:bg-slate-900">
					<div className="flex flex-1 flex-col gap-3.5 overflow-hidden rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-3.5 text-left dark:border-white/5 dark:bg-slate-950">
						<div className="flex items-center justify-between border-stroke-soft-200 border-b pb-2 dark:border-white/5">
							<span className="font-mono text-[9px] text-text-sub-600 dark:text-white/40">
								SUBJECT: Reloop Shop Receipt #87291
							</span>
							{checkoutDone && (
								<span className="rounded border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[8px] text-emerald-600 dark:text-emerald-400">
									SENT
								</span>
							)}
						</div>

						{checkoutDone ? (
							<div className="flex-1 space-y-3.5 overflow-y-auto text-text-strong-950 text-xs leading-relaxed dark:text-white/80">
								<div className="py-1 text-center">
									<div className="font-bold text-[13px] text-text-strong-950 dark:text-white">
										Thank you for your order!
									</div>
									<div className="mt-0.5 font-mono text-[9px] text-text-sub-600 dark:text-white/40">
										ORDER ID: #87291-RELOOP
									</div>
								</div>

								{/* Dynamic Line items in receipt email */}
								<div className="space-y-2 border-stroke-soft-200 border-t border-b py-2 dark:border-white/5">
									{cart.map((item) => (
										<div
											key={item.id}
											className="flex items-center justify-between text-[11px]"
										>
											<span>
												{item.name}{" "}
												<strong className="text-text-sub-600 dark:text-white/40">
													x{item.quantity}
												</strong>
											</span>
											<span className="font-mono text-text-sub-600 dark:text-white/70">
												${(item.price * item.quantity).toFixed(2)}
											</span>
										</div>
									))}
								</div>

								{/* Invoice Total stack */}
								<div className="space-y-1 text-right">
									<div className="text-[10px] text-text-sub-600 dark:text-white/40">
										Subtotal: ${subtotal.toFixed(2)}
									</div>
									<div className="text-[10px] text-text-sub-600 dark:text-white/40">
										Tax (8%): ${tax.toFixed(2)}
									</div>
									<div className="font-bold text-[11px] text-text-strong-950 dark:text-white">
										Total Paid: ${total.toFixed(2)}
									</div>
								</div>
							</div>
						) : (
							<div className="flex flex-1 flex-col items-center justify-center gap-1.5 text-center text-text-soft-400 text-xs italic dark:text-white/35">
								<Icon
									name="Inbox"
									className="h-8 w-8 text-text-soft-400/40 dark:text-white/10"
								/>
								<span>
									Click 'Purchase & Send Receipt' to generate and deliver your
									transactional invoice email.
								</span>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
