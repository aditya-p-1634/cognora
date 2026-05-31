"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { design } from "@/config/design";

interface ContinuitySpineProps {
	hasThreadSelection: boolean;
	selectedThreadId: string | null;

	relatedCount: number;

	hasRelatedThoughts: boolean;
}

export function ContinuitySpine({
	hasThreadSelection,
	selectedThreadId,

	relatedCount,

	hasRelatedThoughts,
}: ContinuitySpineProps) {
	return (
		<div
			className="pointer-events-none absolute inset-y-0 left-[7px] w-px"
			aria-hidden
		>
			<motion.div
				className={cn(
					"absolute inset-0 w-px continuity-spine",
					hasThreadSelection &&
						"continuity-spine-emphasis",
				)}
				animate={{
					opacity: hasThreadSelection
						? 1
						: 0.68,
				}}
				transition={{
					duration:
						design.motion.spatial,
					ease:
						design.motion.calm,
				}}
			/>

			{hasRelatedThoughts && (
				<motion.div
					className="
						absolute
						inset-x-[-4px]
						top-0
						bottom-0
						w-[9px]
						continuity-spine-field-active
					"
					animate={{
						opacity: [
							0.2 +
								Math.min(
									0.4,
									relatedCount *
										0.1,
								),
							0.35 +
								Math.min(
									0.4,
									relatedCount *
										0.1,
								),
							0.2 +
								Math.min(
									0.4,
									relatedCount *
										0.1,
								),
						],
					}}
					transition={{
						duration: 6,
						repeat:
							Infinity,
						ease:
							"easeInOut",
					}}
				/>
			)}

			{hasThreadSelection && (
				<motion.div
					key={`spine-wave-${selectedThreadId}-${relatedCount}`}
					className="absolute inset-x-0 top-0 h-full w-px continuity-spine-propagation"
					initial={{
						opacity: 0.55,
						scaleY: 0.12,
					}}
					animate={{
						opacity: 0,
						scaleY: 1,
					}}
					transition={{
						duration:
							design.motion
								.spatial *
							1.4,
						ease:
							design.motion
								.calm,
					}}
					style={{
						transformOrigin:
							"top center",
					}}
				/>
			)}

			<motion.div
				className="absolute inset-x-[-2px] top-2 bottom-16 w-[5px] continuity-spine-aura"
				animate={{
					opacity:
						hasThreadSelection
							? [
									0.35,
									0.55,
									0.35,
							  ]
							: 0.2,
				}}
				transition={
					hasThreadSelection
						? {
								duration:
									4.2,
								repeat:
									Infinity,
								ease:
									"easeInOut",
						  }
						: {
								duration:
									design
										.motion
										.spatial,
								ease:
									design
										.motion
										.calm,
						  }
				}
			/>
		</div>
	);
}