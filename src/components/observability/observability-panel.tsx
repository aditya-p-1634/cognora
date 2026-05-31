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
										<div className="space-y-3">
											<p
												className="
													text-sm
													font-medium
													text-white/90
												"
											>
												{snapshot.thoughtId}
											</p>

											<div
												className="
													grid grid-cols-2 gap-2
													text-xs
													text-white/60
												"
											>
												<div>
													<span className="text-white/40">
														Gravity
													</span>
													<br />
													{snapshot.gravity.effective.toFixed(
														2,
													)}
												</div>

												<div>
													<span className="text-white/40">
														Integrity
													</span>
													<br />
													{snapshot.semanticIntegrity.score.toFixed(
														2,
													)}
												</div>

												<div>
													<span className="text-white/40">
														Signal
													</span>
													<br />
													{
														snapshot.gravity
															.signalStrength
													}
												</div>

												<div>
													<span className="text-white/40">
														State
													</span>
													<br />
													{
														snapshot.gravity
															.temporalState
													}
												</div>
											</div>

											<div
												className="
													border-t border-white/10
													pt-3
												"
											>
												<p
													className="
														text-xs
														text-white/50
													"
												>
													{
														snapshot.semanticIntegrity
															.description
													}
												</p>
											</div>
										</div>
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