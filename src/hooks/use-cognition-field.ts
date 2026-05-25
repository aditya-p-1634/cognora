"use client";

import {
	useWorkspace,
} from "@/providers/workspace-provider";

export function useCognitionField() {
	const {
		capturedThreads,
		memoryGravity,
		semanticIntegrity,
		continuityIntelligence,
		threadRelationships,
		selectedThreadId,
		continuitySession,
	} = useWorkspace();

	return {
		threads: capturedThreads,

		selectedThreadId,

		memoryGravity,

		semanticIntegrity,

		continuityIntelligence,

		threadRelationships,

		continuitySession,
	};
}