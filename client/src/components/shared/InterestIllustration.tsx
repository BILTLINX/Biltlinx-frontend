import Image from "next/image";

/**
 * The 3D artwork on an Interests card: Microsoft's Fluent Emoji (MIT licence, see
 * /3d/LICENSE-fluentui-emoji.txt): a file per interest id, named after it.
 */
export function InterestIllustration({ id }: { id: string }) {
  return <Image aria-hidden src={`/3d/${id}.png`} alt="" width={96} height={96} className="size-24 shrink-0 object-contain" />;
}
