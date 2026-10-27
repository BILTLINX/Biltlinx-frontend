import Image from "next/image";

/** One drawn piece of the illustration: its file under /onboarding-split/house, where it sits, and how far its stroke bleeds. */
interface Piece {
  file: string;
  inset: string;
  bleed?: string;
}

/** The building with the billboard (Figma node 1281:125249), laid out piece by piece exactly as the design has it. */
const PIECES: Piece[] = [
  { file: "de824", inset: "86.09% 5% 3.48% 5%" },
  { file: "9cf0f", inset: "90.43% 6.25% 9.57% 6.25%", bleed: "-1.06px -0.36%" },
  { file: "c0cab", inset: "43.48% 54.5% 10.87% 13%" },
  { file: "9f418", inset: "41.74% 55.5% 11.3% 12.5%", bleed: "-0.69% -0.59%" },
  { file: "7dc9f", inset: "39.13% 54% 58.26% 11%" },
  { file: "51723", inset: "46.96% 58.5% 40.87% 15.5%", bleed: "-2.14% -0.58%" },
  { file: "579ba", inset: "46.96% 76% 40.87% 24%", bleed: "0 -0.64px" },
  { file: "579ba", inset: "46.96% 67% 40.87% 33%", bleed: "0 -0.64px" },
  { file: "152dd", inset: "66.09% 58.5% 11.3% 30%", bleed: "-1.44% -1.63%" },
  { file: "3dc5f", inset: "66.09% 73.5% 17.39% 16%", bleed: "-1.58% -1.43%" },
  { file: "c6bfd", inset: "66.09% 78.75% 17.39% 21.25%", bleed: "0 -0.43px" },
  { file: "17994", inset: "28.26% 16.25% 10.87% 42.5%", bleed: "-0.54% -0.45%" },
  { file: "08213", inset: "23.91% 22.5% 47.83% 40%" },
  { file: "ce7a8", inset: "25.65% 23.5% 49.57% 41%" },
  { file: "db4f1", inset: "29.57% 26.5% 53.04% 44%", bleed: "-1.88% -0.64%" },
  { file: "b4cfa", inset: "29.57% 41.25% 53.04% 58.75%", bleed: "0 -0.64px" },
  { file: "8dca2", inset: "59.13% 21.25% 11.3% 50%", bleed: "-1.1% -0.65%" },
  { file: "39900", inset: "59.13% 35.5% 11.3% 64.5%", bleed: "0 -0.64px" },
  { file: "5be83", inset: "52.17% 53% 11.3% 45%" },
  { file: "a2419", inset: "72.17% 87.5% 15.65% 5.5%" },
  { file: "dbbed", inset: "68.7% 86.5% 20.87% 7.5%" },
  { file: "c02a5", inset: "81.74% 90% 10.43% 10%", bleed: "-6.94% -1.06px" },
  { file: "2c5b6", inset: "82.17% 53.25% 10% 42.25%" },
  { file: "1c64d", inset: "79.57% 50% 10% 44%" },
  { file: "da53f", inset: "66.96% 9.25% 17.39% 81.75%" },
  { file: "a0cee", inset: "64.35% 7.75% 23.48% 85.25%" },
  { file: "7b069", inset: "80.87% 13% 10.43% 87%", bleed: "-6.25% -1.06px" },
  { file: "443f2", inset: "77.39% 5% 13.91% 90%" },
  { file: "6ef2f", inset: "85.22% 7.5% 10.43% 92.5%", bleed: "-10% -0.85px" },
];

export function OnboardingHouseIllustration() {
  return (
    <div aria-hidden className="relative aspect-[340/195.5] w-full max-w-[340px] drop-shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
      {PIECES.map((piece, index) => {
        const picture = <Image src={`/onboarding-split/house/${piece.file}.svg`} alt="" fill className="max-w-none" />;
        return (
          <span key={index} className="absolute" style={{ inset: piece.inset }}>
            {piece.bleed ? (
              <span className="absolute" style={{ inset: piece.bleed }}>
                {picture}
              </span>
            ) : (
              picture
            )}
          </span>
        );
      })}
    </div>
  );
}
