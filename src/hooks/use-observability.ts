"use client";

import {
	useObservabilityContext,
} from "@/providers/observability-provider";

export function useObservability() {
	return useObservabilityContext();
}

export function useObservabilityState() {
	const {
		enabled,
		open,
		setOpen,
	} = useObservabilityContext();

	return {
		enabled,
		open,
		setOpen,
	};
}

export function useThoughtDiagnostics() {
	const {
		snapshots,
	} = useObservabilityContext();

	return snapshots;
}