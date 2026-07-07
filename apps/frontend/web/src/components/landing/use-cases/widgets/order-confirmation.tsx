"use client";

import { useState } from "react";
import { Icon } from "@reloop/ui/icon";

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
						: item
				)
				.filter((item) => item.quantity > 0)
		);
		setCheckoutDone(false);
	};

	const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
	const shipping = subtotal > 0 ? 5.0 : 0;
	const tax = parseFloat((subtotal * 0.08).toFixed(2));
	const total = parseFloat((subtotal + shipping + tax).toFixed(2));

	return (
		<div className="flex flex-col h-full min-h-[420px] bg-slate-950 rounded-2xl border border-white/10 overflow-hidden shadow-2xl font-sans text-left">
			{/* Header */}
			<div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-white/5">
				<div className="flex items-center gap-1.5">
					<span className="w-2.5 h-2.5 rounded-full bg-blue-500/80" />
					<span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
					<span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
					<span className="text-xs text-white/40 font-mono ml-2">ecommerce_receipt_pipeline.invoice</span>
				</div>
				<span className="text-[10px] text-blue-400 font-mono bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
					Checkout SMTP
				</span>
			</div>

			<div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
				{/* Left Side: Cart checkout */}
				<div className="bg-slate-900/40 p-4 rounded-xl border border-white/5 flex flex-col justify-between">
					<div className="flex flex-col gap-3">
						<h3 className="text-xs font-bold text-white/40 uppercase tracking-wider">Shopping Cart</h3>
						
						{cart.length === 0 ? (
							<div className="text-xs text-white/30 italic py-6 text-center">Your cart is empty. Add items to test receipt.</div>
						) : (
							<div className="flex flex-col gap-2.5">
								{cart.map((item) => (
									<div key={item.id} className="flex justify-between items-center bg-slate-950/60 p-2.5 rounded border border-white/5">
										<div>
											<div className="text-xs font-semibold text-white/80">{item.name}</div>
											<div className="text-[10px] text-white/40 mt-0.5">${item.price.toFixed(2)} each</div>
										</div>
										<div className="flex items-center gap-2">
											<button
												onClick={() => updateQty(item.id, -1)}
												className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold text-xs cursor-pointer"
											>
												-
											</button>
											<span className="text-xs font-mono text-white/80 w-4 text-center">{item.quantity}</span>
											<button
												onClick={() => updateQty(item.id, 1)}
												className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold text-xs cursor-pointer"
											>
												+
											</button>
										</div>
									</div>
								))}
							</div>
						)}
					</div>

					<div className="space-y-3 mt-4 pt-3 border-t border-white/5">
						<div className="flex justify-between text-[11px] text-white/50 font-mono">
							<span>Subtotal:</span>
							<span>${subtotal.toFixed(2)}</span>
						</div>
						<div className="flex justify-between text-[11px] text-white/50 font-mono">
							<span>Shipping:</span>
							<span>${shipping.toFixed(2)}</span>
						</div>
						<div className="flex justify-between text-[11px] text-white/50 font-mono">
							<span>Tax (8%):</span>
							<span>${tax.toFixed(2)}</span>
						</div>
						<div className="flex justify-between text-xs font-bold text-white border-t border-white/5 pt-2">
							<span>Total:</span>
							<span className="text-blue-400 font-mono">${total.toFixed(2)}</span>
						</div>

						<button
							onClick={() => setCheckoutDone(true)}
							disabled={subtotal === 0}
							className={`w-full py-2 rounded-lg font-semibold text-xs transition-all cursor-pointer ${
								subtotal === 0
									? "bg-slate-800 text-white/30 cursor-not-allowed border border-white/5"
									: "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 active:scale-95"
							}`}
						>
							🛒 Purchase & Send Receipt
						</button>
					</div>
				</div>

				{/* Right Side: Receipt Email Template Preview */}
				<div className="bg-slate-900 border border-white/5 rounded-xl p-3 flex flex-col justify-between">
					<div className="border border-white/5 bg-slate-950 rounded-lg p-3.5 flex-1 text-left flex flex-col gap-3.5 overflow-hidden">
						<div className="border-b border-white/5 pb-2 flex justify-between items-center">
							<span className="text-[9px] text-white/40 font-mono">SUBJECT: Reloop Shop Receipt #87291</span>
							{checkoutDone && (
								<span className="text-[8px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 font-mono">
									SENT
								</span>
							)}
						</div>

						{checkoutDone ? (
							<div className="flex-1 space-y-3.5 text-xs text-white/80 leading-relaxed overflow-y-auto">
								<div className="text-center py-1">
									<div className="font-bold text-white text-[13px]">Thank you for your order!</div>
									<div className="text-[9px] text-white/40 mt-0.5 font-mono">ORDER ID: #87291-RELOOP</div>
								</div>

								{/* Dynamic Line items in receipt email */}
								<div className="space-y-2 border-t border-b border-white/5 py-2">
									{cart.map((item) => (
										<div key={item.id} className="flex justify-between items-center text-[11px]">
											<span>
												{item.name} <strong className="text-white/40">x{item.quantity}</strong>
											</span>
											<span className="font-mono text-white/70">${(item.price * item.quantity).toFixed(2)}</span>
										</div>
									))}
								</div>

								{/* Invoice Total stack */}
								<div className="space-y-1 text-right">
									<div className="text-[10px] text-white/40">Subtotal: ${subtotal.toFixed(2)}</div>
									<div className="text-[10px] text-white/40">Tax (8%): ${tax.toFixed(2)}</div>
									<div className="text-[11px] font-bold text-white">Total Paid: ${total.toFixed(2)}</div>
								</div>
							</div>
						) : (
							<div className="flex-1 flex flex-col items-center justify-center text-center text-xs text-white/35 italic gap-1.5">
								<Icon name="Inbox" className="w-8 h-8 text-white/10" />
								<span>Click 'Purchase & Send Receipt' to generate and deliver your transactional invoice email.</span>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
