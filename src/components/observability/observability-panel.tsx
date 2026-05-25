"use client";

import {
	useObservabilityState,
	useThoughtDiagnostics,
} from "@/hooks/use-observability";

export function ObservabilityPanel() {
	const {
		enabled,
		open,
	} = useObservabilityState();

	const diagnostics =
		useThoughtDiagnostics();

	if (!enabled || !open) {
		return null;
	}

	return (
		<div
			className="
				fixed inset-0 z-[120]
				flex justify-end
				bg-black/20
				backdrop-blur-sm
			"
		>
			<div
				className="
					h-full w-[420px]
					border-l border-white/10
					bg-neutral-950/90
					p-6
					backdrop-blur-xl
				"
			>
				<div className="space-y-2">
					<p
						className="
							text-[10px]
							uppercase tracking-[0.24em]
							text-white/40
						"
					>
						Cognitive observability
					</p>

					<h2
						className="
							text-lg font-medium
							text-white/90
						"
					>
						Continuity field inspection
					</h2>

					<p
						className="
							text-sm leading-relaxed
							text-white/50
						"
					>
						Internal diagnostic layer
						for observing cognition
						behavior and continuity
						structures.
					</p>
				</div>

				<div className="mt-8">
					{diagnostics.length === 0 ? (
						<div
							className="
								rounded-2xl
								border border-white/10
								bg-white/[0.03]
								p-4
							"
						>
							<p
								className="
									text-sm
									text-white/50
								"
							>
								No diagnostic
								snapshots available.
							</p>
						</div>
					) : (
						<div className="space-y-4">
							{diagnostics.map(
								(snapshot) => (
									<div
										key={
											snapshot.thoughtId
										}
										className="
											rounded-2xl
											border border-white/10
											bg-white/[0.03]
											p-4
										"
									>
										<p
											className="
												text-sm
												text-white/80
											"
										>
											{
												snapshot.thoughtId
											}
										</p>
									</div>
								),
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}