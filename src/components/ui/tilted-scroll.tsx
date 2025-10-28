import { cn } from "../../lib/utils"

interface TiltedScrollItem {
  id: string;
  text: string;
}

interface TiltedScrollProps {
  items?: TiltedScrollItem[];
  className?: string;
}

export function TiltedScroll({ 
  items = defaultItems,
  className 
}: TiltedScrollProps) {
  // Array of blue gradient combinations for variety
  const blueGradients = [
    "bg-gradient-to-br from-sky-100 to-blue-200 dark:from-sky-900/50 dark:to-blue-900/60 border-sky-300/60 dark:border-sky-400/40",
    "bg-gradient-to-br from-blue-100 to-sky-200 dark:from-blue-900/50 dark:to-sky-900/60 border-blue-300/60 dark:border-blue-400/40",
    "bg-gradient-to-br from-sky-200 to-blue-100 dark:from-sky-900/60 dark:to-blue-900/50 border-sky-400/60 dark:border-sky-500/40",
    "bg-gradient-to-br from-blue-200 to-sky-100 dark:from-blue-900/60 dark:to-sky-900/50 border-blue-400/60 dark:border-blue-500/40",
  ];

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="relative overflow-hidden [mask-composite:intersect] [mask-image:linear-gradient(to_right,transparent,black_5rem),linear-gradient(to_left,transparent,black_5rem),linear-gradient(to_bottom,transparent,black_5rem),linear-gradient(to_top,transparent,black_5rem)]">
        <div className="grid h-[250px] w-[300px] gap-5 animate-skew-scroll grid-cols-1">
          {items.map((item, index) => (
            <div
              key={item.id}
              className={cn(
                "group flex items-center gap-2 cursor-pointer rounded-md border p-4 shadow-md transition-all duration-300 ease-in-out hover:scale-105 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-xl",
                blueGradients[index % blueGradients.length]
              )}
            >
              <CheckCircleIcon className="h-6 w-6 mr-2 stroke-sky-500 dark:stroke-sky-400 transition-colors group-hover:stroke-blue-600 dark:group-hover:stroke-blue-300" />
              <p className="text-slate-700 dark:text-slate-300 transition-colors group-hover:text-slate-900 dark:group-hover:text-white font-medium">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function CheckCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

const defaultItems: TiltedScrollItem[] = [
  { id: "1", text: "Item 1" },
  { id: "2", text: "Item 2" },
  { id: "3", text: "Item 3" },
  { id: "4", text: "Item 4" },
  { id: "5", text: "Item 5" },
  { id: "6", text: "Item 6" },
  { id: "7", text: "Item 7" },
  { id: "8", text: "Item 8" },
]

