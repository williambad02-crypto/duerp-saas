import { cn } from '@/lib/utils'

/**
 * Contour de la Bretagne avec ses points géographiques majeurs :
 * Pointe du Raz (W), Crozon, Roscoff (N), baie de Saint-Brieuc, Saint-Malo (NE),
 * côte sud avec Golfe du Morbihan et presqu'île de Quiberon, estuaire de la Loire (SE).
 * Le Morbihan est marqué par un point doré.
 *
 * Pour un contour topographique exact, déposer `public/marketing/bretagne.svg`
 * et utiliser <Image src="/marketing/bretagne.svg" /> à la place.
 */
export function BretagneOutline({
  className,
  withDot = true,
}: {
  className?: string
  withDot?: boolean
}) {
  return (
    <svg
      viewBox="0 0 600 340"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={cn(className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      {/* Contour principal, sens horaire depuis le NE */}
      <path
        d="
          M 510 78
          C 495 82, 478 82, 461 82
          L 436 88
          C 420 96, 408 110, 395 112
          C 378 116, 360 108, 345 118
          C 330 132, 318 112, 302 100
          C 280 88, 258 78, 235 78
          C 215 75, 195 76, 175 82
          C 158 85, 142 92, 128 100
          C 112 108, 98 112, 85 118
          C 70 126, 55 140, 42 155
          C 35 165, 28 175, 35 185
          C 50 192, 70 192, 85 188
          C 102 186, 118 188, 130 195
          C 150 202, 175 202, 200 198
          C 230 196, 258 198, 278 208
          C 290 220, 288 238, 280 252
          C 272 262, 278 270, 292 262
          C 305 252, 318 235, 330 225
          C 342 218, 355 222, 365 232
          C 378 242, 395 248, 412 246
          C 428 252, 445 258, 460 252
          C 478 245, 492 232, 502 215
          C 510 200, 515 182, 515 162
          C 513 142, 510 122, 510 100
          Z
        "
      />

      {/* Indication visuelle presqu'île de Quiberon (petite langue Sud) */}
      <path
        d="M 260 208 C 258 225, 255 245, 262 258 C 268 260, 272 248, 270 235"
        strokeWidth="1.3"
        opacity="0.75"
      />

      {/* Indication Golfe du Morbihan (concave) */}
      <path
        d="M 305 215 C 315 222, 328 218, 340 222"
        strokeWidth="1"
        opacity="0.55"
      />

      {/* Indication baie de Saint-Brieuc (côte nord concave) */}
      <path
        d="M 345 118 C 355 130, 370 135, 385 128"
        strokeWidth="1"
        opacity="0.55"
      />

      {/* Point Morbihan */}
      {withDot && (
        <g>
          <circle cx="315" cy="228" r="10" fill="currentColor" opacity="0.25" />
          <circle cx="315" cy="228" r="4.5" fill="currentColor" />
        </g>
      )}
    </svg>
  )
}
