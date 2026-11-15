/**
 * 배경에 흩어진 보라(다크: 핑크) 사각형들. Figma "PC_background_object" / "Mobile_background_object" 기준.
 * 위치는 뷰포트 비율로 잡고, 천천히 떠다니는 애니메이션만 더했습니다 (reduced-motion 이면 정지).
 */
interface Shape {
  /** [left, top, size(px), radius(px)] */
  mobile: [string, string, number, number];
  pc: [string, string, number, number];
  light: string;
  dark: string;
  rotate: number;
  delay: number;
}

const SHAPES: Shape[] = [
  { mobile: ['31%', '81%', 187, 10], pc: ['28%', '56%', 205, 10], light: '#C34BF8', dark: '#E767B3', rotate: -18, delay: 0 },
  { mobile: ['71%', '84%', 24, 5], pc: ['73%', '75%', 24, 5], light: '#CC61F6', dark: '#CD64A2', rotate: 12, delay: 1.2 },
  { mobile: ['68%', '66%', 155, 15], pc: ['81%', '59%', 124, 15], light: '#CE68F5', dark: '#C865A1', rotate: 15, delay: 2.4 },
  { mobile: ['17%', '58%', 126, 20], pc: ['13%', '36%', 101, 20], light: '#D77DF2', dark: '#A95C89', rotate: -12, delay: 0.6 },
  { mobile: ['11%', '25%', 29, 8], pc: ['67%', '64%', 29, 8], light: '#F1C2E9', dark: '#8C5E78', rotate: 20, delay: 1.8 },
  { mobile: ['44%', '58%', 85, 8], pc: ['32%', '85%', 85, 8], light: '#BF74D5', dark: '#AE5E8E', rotate: 24, delay: 3 },
  { mobile: ['62%', '67%', 32, 5], pc: ['65%', '32%', 28, 5], light: '#D67DF1', dark: '#DD66AC', rotate: 8, delay: 0.9 },
];

const Square = ({ shape, box, className }: { shape: Shape; box: Shape['pc']; className: string }) => (
  <span
    className={`absolute animate-drift ${className}`}
    style={{ left: box[0], top: box[1], width: box[2], height: box[2], animationDelay: `${shape.delay}s` }}
  >
    <span
      className="block h-full w-full bg-[var(--light)] dark:bg-[var(--dark)]"
      style={{
        borderRadius: box[3],
        transform: `rotate(${shape.rotate}deg)`,
        ['--light' as string]: shape.light,
        ['--dark' as string]: shape.dark,
      }}
    />
  </span>
);

const Background = () => (
  <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
    {SHAPES.map((shape, i) => (
      <Square key={`m${i}`} shape={shape} box={shape.mobile} className="sm:hidden" />
    ))}
    {SHAPES.map((shape, i) => (
      <Square key={`d${i}`} shape={shape} box={shape.pc} className="hidden sm:block" />
    ))}
  </div>
);

export default Background;
