import {
	DiagnosticGravityState,
	DiagnosticSignalStrength,
	DiagnosticTemporalState,
} from "./types";

function describeTemporalState(
	state: DiagnosticTemporalState,
): string {
	switch (state) {
		case "emerging":
			return "continuity is beginning to accumulate";

		case "stable":
			return "presence remains active and sustained";

		case "fading":
			return "continuity influence is softening";

		case "approaching-floor":
			return "memory gravity is nearing latent equilibrium";

		default:
			return "temporal continuity remains undefined";
	}
}

function describeSignalStrength(
	strength: DiagnosticSignalStrength,
): string {
	switch (strength) {
		case "weak":
			return "light semantic presence";

		case "moderate":
			return "noticeable continuity influence";

		case "strong":
			return "high semantic coherence";

		case "dominant":
			return "gravitationally central cognition";

		default:
			return "signal strength unresolved";
	}
}

export function buildGravityNarrative(
	gravity: DiagnosticGravityState,
): string {
	const temporalDescription = describeTemporalState(
		gravity.temporalState,
	);

	const signalDescription = describeSignalStrength(
		gravity.signalStrength,
	);

	return `${signalDescription} — ${temporalDescription}`;
}