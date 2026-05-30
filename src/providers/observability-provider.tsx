"use client";

import {
	createContext,
	ReactNode,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";

import {
	useCognitionField,
} from "@/hooks/use-cognition-field";

import {
	assertObservabilityAccess,
	isObservabilityEnabled,
} from "@/lib/observability/guard";

import {
	deriveThoughtSnapshot,
} from "@/lib/observability/derive-snapshot";

import {
	ThoughtDiagnosticSnapshot,
} from "@/lib/observability/types";

import {
	ObservabilityPanel,
} from "@/components/observability/observability-panel";

interface ObservabilityContextValue {
	enabled: boolean;

	open: boolean;

	setOpen: (open: boolean) => void;

	snapshots: ThoughtDiagnosticSnapshot[];
}

const ObservabilityContext =
	createContext<ObservabilityContextValue | null>(
		null,
	);

interface ObservabilityProviderProps {
	children: ReactNode;
}

export function ObservabilityProvider({
	children,
}: ObservabilityProviderProps) {
	const enabled = useMemo(
		() => isObservabilityEnabled(),
		[],
	);

	const [open, setOpen] = useState(false);

	useEffect(() => {
		if (!enabled) {
			return;
		}

		function handleKeyDown(
			event: KeyboardEvent,
		) {
			const shouldToggle =
				event.shiftKey &&
				event.ctrlKey &&
				event.altKey &&
				event.key.toLowerCase() === "o";

			if (!shouldToggle) {
				return;
			}

			event.preventDefault();

			setOpen((current) => !current);
		}

		window.addEventListener(
			"keydown",
			handleKeyDown,
		);

		return () => {
			window.removeEventListener(
				"keydown",
				handleKeyDown,
			);
		};
	}, [enabled]);

	const cognitionField =
		useCognitionField();

	const snapshots = useMemo<
		ThoughtDiagnosticSnapshot[]
	>(() => {
		return cognitionField.threads.map(
			(thread) => {
				const gravity =
					cognitionField.memoryGravity
						.weights.get(
							thread.id,
						) ?? 0;

				const resurfacingIndex =
					cognitionField.memoryGravity
						.resurfacingOrder.indexOf(
							thread.id,
						);

				const integritySignal =
					cognitionField
						.semanticIntegrity
						.signals.get(
							thread.id,
						);

				return deriveThoughtSnapshot({
					thoughtId: thread.id,

					rawGravity: gravity,

					effectiveGravity:
						gravity,

					integrityScore:
					integritySignal?.signal ??
					0.5,

				integrityModulation:
					1,

				sessionDepth:
					cognitionField
						.continuitySession
						.continuityDepth,

			recurrenceStrength:
				
			Math.max(
					0,
					1 -
						resurfacingIndex /
							Math.max(
								1,
								cognitionField
									.threads
									.length,
							),
				),

			topologyDensity:
				Object.keys(
					cognitionField.threadRelationships ?? {},
				).length,

			createdAt:
				thread.lastTouched,

			relationships: [],
			
					resurfacingReasons:
						[
							{
								label:
									"semantic resurfacing",

								influence:
									gravity,

								description:
									"thread remains active within the continuity field",
							},
						],

					unresolved: {
						active:
							gravity > 0.7,

						tension:
							gravity > 0.7
								? 0.8
								: 0.2,

						resurfacingPressure:
							gravity,

						description:
							gravity > 0.7
								? "continuity tension continues resurfacing"
								: "continuity pressure remains stable",
					},
				});
			},
		);
	}, [cognitionField]);

	const value = useMemo(
		() => ({
			enabled,
			open,
			setOpen,
			snapshots,
		}),
		[enabled, open, snapshots],
	);

	return (
		<ObservabilityContext.Provider value={value}>
			{children}

			<ObservabilityPanel />
		</ObservabilityContext.Provider>
	);
}

export function useObservabilityContext() {
	assertObservabilityAccess();

	const context = useContext(
		ObservabilityContext,
	);

	if (!context) {
		throw new Error(
			"useObservabilityContext must be used within ObservabilityProvider.",
		);
	}

	return context;
}