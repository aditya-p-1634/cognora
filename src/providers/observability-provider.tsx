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
	assertObservabilityAccess,
	isObservabilityEnabled,
} from "@/lib/observability/guard";

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

	const snapshots = useMemo<
		ThoughtDiagnosticSnapshot[]
	>(() => {
		return [];
	}, []);

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