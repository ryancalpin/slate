import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { pluginRegistry } from '../../core/plugin/registry'
import { loadPluginFromUrl } from '../../core/plugin/pluginLoader'
import type { ModulePlugin } from '../../core/plugin/types'

interface PluginCardProps {
  plugin: ModulePlugin
  isBuiltIn: boolean
  onUninstall: (id: string) => void
}

function PluginCard({ plugin, isBuiltIn, onUninstall }: PluginCardProps) {
  return (
    <div className="flex items-start justify-between gap-4 p-4 rounded-lg bg-[rgb(var(--color-surface-raised))] border border-gray-700">
      <div className="space-y-1 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-white">{plugin.meta.name}</span>
          <span className="text-xs text-gray-500">v{plugin.meta.version}</span>
          {isBuiltIn && (
            <span className="text-xs bg-blue-900 text-blue-300 rounded px-1.5 py-0.5">
              built-in
            </span>
          )}
        </div>
        <p className="text-sm text-gray-400">{plugin.meta.description}</p>
        <p className="text-xs text-gray-500">by {plugin.meta.author}</p>
        {plugin.meta.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {plugin.meta.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-gray-700 text-gray-300 rounded px-1.5 py-0.5"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {!isBuiltIn && (
        <button
          type="button"
          onClick={() => onUninstall(plugin.meta.id)}
          className="shrink-0 px-3 py-1.5 text-xs rounded bg-red-900/40 text-red-400 hover:bg-red-900/70 transition-colors border border-red-800"
        >
          Uninstall
        </button>
      )}
    </div>
  )
}

export function PluginManagerView() {
  const navigate = useNavigate()
  const [plugins, setPlugins] = useState<ModulePlugin[]>(() => pluginRegistry.getAll())
  const [installUrl, setInstallUrl] = useState('')
  const [installing, setInstalling] = useState(false)
  const [installError, setInstallError] = useState<string | null>(null)
  const [installSuccess, setInstallSuccess] = useState<string | null>(null)

  // Plugins without a pack are considered built-in
  const builtInIds = new Set(
    plugins.filter((p) => !p.meta.pack || p.meta.pack === '__builtin__').map((p) => p.meta.id),
  )

  // Group by pack
  const grouped: Record<string, ModulePlugin[]> = {}
  for (const plugin of plugins) {
    const pack = plugin.meta.pack ?? 'Core'
    if (!grouped[pack]) grouped[pack] = []
    grouped[pack].push(plugin)
  }

  const handleUninstall = useCallback((id: string) => {
    pluginRegistry.unregister(id)
    setPlugins(pluginRegistry.getAll())
  }, [])

  const handleInstallFromUrl = useCallback(async () => {
    if (!installUrl.trim()) return
    setInstalling(true)
    setInstallError(null)
    setInstallSuccess(null)
    try {
      const plugin = await loadPluginFromUrl(installUrl.trim())
      pluginRegistry.register(plugin)
      setPlugins(pluginRegistry.getAll())
      setInstallSuccess(`Successfully installed "${plugin.meta.name}"`)
      setInstallUrl('')
    } catch (err) {
      setInstallError(err instanceof Error ? err.message : 'Installation failed')
    } finally {
      setInstalling(false)
    }
  }, [installUrl])

  return (
    <div className="min-h-screen bg-[rgb(var(--color-surface))] p-6">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Plugin Manager</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {plugins.length} plugin{plugins.length !== 1 ? 's' : ''} installed
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            ← Back
          </button>
        </div>

        {/* Install from URL */}
        <div className="p-4 rounded-lg bg-[rgb(var(--color-surface-raised))] border border-gray-700 space-y-3">
          <h2 className="text-sm font-semibold text-white">Install from URL</h2>
          <p className="text-xs text-gray-400">
            Paste a raw GitHub URL to a <code className="text-gray-300">.ptplugin</code> ES module bundle.
          </p>
          <div className="flex gap-2">
            <input
              type="url"
              value={installUrl}
              onChange={(e) => setInstallUrl(e.target.value)}
              placeholder="https://raw.githubusercontent.com/..."
              className="flex-1 text-sm rounded bg-gray-800 border border-gray-600 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-DEFAULT"
              onKeyDown={(e) => { if (e.key === 'Enter') void handleInstallFromUrl() }}
            />
            <button
              type="button"
              onClick={handleInstallFromUrl}
              disabled={!installUrl.trim() || installing}
              className={clsx(
                'px-4 py-2 text-sm rounded font-medium transition-colors',
                installUrl.trim() && !installing
                  ? 'bg-accent-DEFAULT text-white hover:opacity-90'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed',
              )}
            >
              {installing ? 'Installing…' : 'Install'}
            </button>
          </div>
          {installError && (
            <p className="text-sm text-red-400">{installError}</p>
          )}
          {installSuccess && (
            <p className="text-sm text-green-400">{installSuccess}</p>
          )}
        </div>

        {/* Plugin groups */}
        {Object.entries(grouped).map(([pack, packPlugins]) => (
          <div key={pack} className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              {pack}
            </h2>
            <div className="space-y-2">
              {packPlugins.map((plugin) => (
                <PluginCard
                  key={plugin.meta.id}
                  plugin={plugin}
                  isBuiltIn={builtInIds.has(plugin.meta.id)}
                  onUninstall={handleUninstall}
                />
              ))}
            </div>
          </div>
        ))}

        {plugins.length === 0 && (
          <p className="text-center text-gray-500 py-10">No plugins installed.</p>
        )}
      </div>
    </div>
  )
}
