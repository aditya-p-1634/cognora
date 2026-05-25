import {
	DiagnosticGravityState,
	DiagnosticRelationshipSignal,
	DiagnosticResurfacingReason,
	DiagnosticSignalStrength,
	DiagnosticTemporalState,
	DiagnosticUnresolvedInfluence,
	ThoughtDiagnosticSnapshot,
} from "./types";

function deriveTemporalState(
	gravity: number,
): DiagnosticTemporalState {
	if (gravity >= 0.8) {
		return "stable";
	}

	if (gravity >= 0.45) {
		return "emerging";
	}

	if (gravity >= 0.2) {
		return "fading";
	}

	return "approaching-floor";
}

function deriveSignalStrength(
	integrityScore: number,
): DiagnosticSignalStrength {
	if (integrityScore >= 0.85) {
		return "dominant";
	}

	if (integrityScore >= 0.65) {
		return "strong";
	}

	if (integrityScore >= 0.35) {
		return "moderate";
	}

	return "weak";
}

export interface DeriveSnapshotInput {
	thoughtId: string;

	rawGravity: number;

	effectiveGravity: number;

	integrityScore: number;

	integrityModulation: number;

	sessionDepth: number;

	recurrenceStrength: number;

	topologyDensity: number;

	createdAt: string;

	lastActiveAt?: string;

	relationships?: DiagnosticRelationshipSignal[];

	resurfacingReasons?: DiagnosticResurfacingReason[];

	unresolved?: Partial<DiagnosticUnresolvedInfluence>;
}

export function deriveThoughtSnapshot(
	input: DeriveSnapshotInput,
): ThoughtDiagnosticSnapshot {
	const gravity: DiagnosticGravityState = {
		raw: input.rawGravity,

		effective: input.effectiveGravity,

		integrityModulation: input.integrityModulation,

		temporalState: deriveTemporalState(
			input.effectiveGravity,
		),

		signalStrength: deriveSignalStrength(
			input.integrityScore,
		),
	};

	return {
		thoughtId: input.thoughtId,

		gravity,

		unresolved: {
			active: input.unresolved?.active ?? false,

			tension: input.unresolved?.tension ?? 0,

			resurfacingPressure:
				input.unresolved?.resurfacingPressure ?? 0,

			description:
				input.unresolved?.description ??
				"continuity tension remains quiet",
		},

		relationships: input.relationships ?? [],

		resurfacingReasons:
			input.resurfacingReasons ?? [],

		semanticIntegrity: {
			score: input.integrityScore,

			description:
				input.integrityScore >= 0.75
					? "semantic coherence remains richly sustained"
					: input.integrityScore >= 0.45
						? "continuity structure remains moderately stable"
						: "semantic presence is becoming diffuse",
		},

		continuity: {
			sessionDepth: input.sessionDepth,

			recurrenceStrength:
				input.recurrenceStrength,

			topologyDensity:
				input.topologyDensity,
		},

		createdAt: input.createdAt,

		lastActiveAt: input.lastActiveAt,
	};
}