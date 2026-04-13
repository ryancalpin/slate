import type { AppMode } from '../../core/template/types'
interface Props { mode: AppMode }
export function CanvasView({ mode }: Props) {
  return <div className="p-8 text-gray-400">Canvas — mode: {mode} — coming in Task 8</div>
}
