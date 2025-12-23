import { Button } from "./ui/Button"
import {
  Brain,
  Sparkles,
  Zap
} from "lucide-react";

export const Options = ({ method }) => {
  return (
    <div
      className="space-y-4 w-full"
      onClick={method}
    >
      <Button
        variant="secondary"
        className="w-full justify-between rounded-2xl px-4 py-3"
      >
        <span className="flex items-center gap-2 mr-2">
          <Sparkles className="h-4 w-4 text-emerald-400" />
          New Chat
        </span>
        <Brain className="h-4 w-4 text-violet-300" />
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
