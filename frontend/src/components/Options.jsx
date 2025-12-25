import { Button } from "./ui/Button"
import {
  Brain,
  Sparkles,
  Zap,
  SquarePen
} from "lucide-react";

export const Options = ({ method }) => {
  return (
    <div
      className="space-y-4 w-full"
      onClick={method}
    >
      <Button
        variant="secondary"
        className="w-full rounded-2xl flex justify-start"
      >
        <span className="flex gap-2">
          <SquarePen className='w-5 h-5 text-neutral-300' />
          New Chat
        </span>
      </Button>
      <div className="rounded-xl border border-white/5 bg-white/5 shadow-xl">
        <div className="flex flex-col gap-2 p-3">
          <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Current Model</span>
          <span className="text-amber-300 flex items-center gap-2 rounded-lg border border-white/5 bg-black/40 px-3 py-2 text-xs">
            <Zap className="h-3 w-3 text-amber-400" />
            Gemini-2.5-flash
          </span>
        </div>
      </div>
    </div>
  )
}
